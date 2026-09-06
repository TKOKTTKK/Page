const https = require("https");
const WebSocket = require("ws");

// ── 拉黑列表使用独立的 JSONBin Bin（在 Render 环境变量中配置）
// 环境变量：BAN_BIN_ID = 拉黑专用 Bin ID（可以与担保交易共用同一 API_KEY）
// 如果没有 BAN_BIN_ID，则降级为内存存储（重启后丢失）
const API_KEY    = process.env.JSONBIN_API_KEY;
const BAN_BIN_ID = process.env.BAN_BIN_ID;

// ── 拉黑列表内存缓存（格式：{ visitorId: { visitorId, bannedAt, reason } }）
let banCache = null;

const BARK_KEY  = process.env.BARK_KEY || "a7TwmrfWu7jK2ASRxkiXDB";
const ADMIN_URL = "https://1-4h5.pages.dev";
let history = [];
const knownUsers = new Set();

// ─────────────────────────────────────────────────────────
//  拉黑列表专用 JSONBin 读写（独立 Bin）
//  若未配置 BAN_BIN_ID，则使用内存 Map（重启丢失，仅开发用）
// ─────────────────────────────────────────────────────────
async function banGet() {
  // 已有缓存直接返回
  if (banCache !== null) return banCache;

  // 未配置 BAN_BIN_ID → 降级内存存储
  if (!BAN_BIN_ID) {
    banCache = {};
    return banCache;
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.jsonbin.io",
      path: `/v3/b/${BAN_BIN_ID}/latest`,
      method: "GET",
      headers: { "X-Master-Key": API_KEY }
    };
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", chunk => (body += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          banCache = json.record || {};
          resolve(banCache);
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function banPut(data) {
  banCache = data;

  // 未配置 BAN_BIN_ID → 只更新内存，不持久化
  if (!BAN_BIN_ID) return;

  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const options = {
      hostname: "api.jsonbin.io",
      path: `/v3/b/${BAN_BIN_ID}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        "X-Master-Key": API_KEY
      }
    };
    const req = https.request(options, (res) => {
      let resp = "";
      res.on("data", chunk => (resp += chunk));
      res.on("end", () => resolve());
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─────────────────────────────────────────────────────────
//  拉黑 REST API
// ─────────────────────────────────────────────────────────
function registerRoutes(app) {

  // ── GET /check-ban?visitorId=xxx — 前端页面加载时查询是否被拉黑
  app.get("/check-ban", async (req, res) => {
    const { visitorId } = req.query;
    if (!visitorId) return res.status(400).json({ error: "缺少 visitorId" });
    try {
      const db = await banGet();
      const banned = !!db[visitorId];
      res.json({ banned, visitorId });
    } catch (e) {
      console.error("GET /check-ban error:", e);
      res.status(500).json({ error: "服务器错误" });
    }
  });

  // ── POST /ban — 拉黑用户（客服端调用）
  // body: { visitorId: string, reason?: string }
  app.post("/ban", async (req, res) => {
    const { visitorId, reason } = req.body;
    if (!visitorId) return res.status(400).json({ error: "缺少 visitorId" });
    try {
      const db = await banGet();
      db[visitorId] = {
        visitorId,
        bannedAt: Date.now(),
        reason: reason || "无备注"
      };
      await banPut(db);
      console.log(`[拉黑] ${visitorId} - ${reason || "无备注"}`);
      res.json({ ok: true, visitorId });
    } catch (e) {
      console.error("POST /ban error:", e);
      res.status(500).json({ error: "服务器错误" });
    }
  });

  // ── POST /unban — 解除拉黑（客服端调用）
  // body: { visitorId: string }
  app.post("/unban", async (req, res) => {
    const { visitorId } = req.body;
    if (!visitorId) return res.status(400).json({ error: "缺少 visitorId" });
    try {
      const db = await banGet();
      if (!db[visitorId]) return res.status(404).json({ error: "该用户未被拉黑" });
      delete db[visitorId];
      await banPut(db);
      console.log(`[解黑] ${visitorId}`);
      res.json({ ok: true, visitorId });
    } catch (e) {
      console.error("POST /unban error:", e);
      res.status(500).json({ error: "服务器错误" });
    }
  });

  // ── GET /ban-list — 获取完整拉黑列表（客服端管理页使用）
  app.get("/ban-list", async (req, res) => {
    try {
      const db = await banGet();
      const list = Object.values(db).sort((a, b) => b.bannedAt - a.bannedAt);
      res.json({ ok: true, list });
    } catch (e) {
      console.error("GET /ban-list error:", e);
      res.status(500).json({ error: "服务器错误" });
    }
  });
}

// ─────────────────────────────────────────────────────────
//  Bark 推送通知
// ─────────────────────────────────────────────────────────
function sendBarkNotification() {
  const title = encodeURIComponent("新咨询提醒");
  const body  = encodeURIComponent("收到来自客户的新消息，请查看");
  const url   = `https://api.day.app/${BARK_KEY}/${title}/${body}?url=${encodeURIComponent(ADMIN_URL)}&group=客服`;
  https.get(url, (res) => {
    res.on("data", () => {});
    res.on("end", () => { console.log("Bark 推送已发送"); });
  }).on("error", (err) => { console.error("Bark 推送失败:", err.message); });
}

// ─────────────────────────────────────────────────────────
//  WebSocket 聊天服务（含拉黑验证）
// ─────────────────────────────────────────────────────────
function attachWebSocket(server) {
  const wss = new WebSocket.Server({
    server,
    maxPayload: 10 * 1024 * 1024
  });

  wss.on("connection", (ws) => {
    ws.isAlive = true;
    console.log("新客户端已连接");
    ws.send(JSON.stringify({ type: "history", data: history }));
    ws.on("pong", () => { ws.isAlive = true; });

    ws.on("message", async (raw) => {
      try {
        const data = JSON.parse(raw);

        // ── 应用层心跳：客户端发 ping，立即回 pong ─────────────
        // 用于客户端（尤其 iOS Safari 后台冻结后）主动探测连接是否
        // 已经失效；不写入 history，不广播，只回给发送者本人。
        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
          return;
        }
        // ── 心跳处理结束 ─────────────────────────────────────

        // ── 拉黑验证：仅对非管理员消息进行后端校验 ──────────
        if (data.from !== "admin") {
          // visitorId 由前端 FingerprintJS 生成，附在每条消息中
          const vid = data.visitorId || data.from;
          const banDb = await banGet();
          if (banDb[vid]) {
            // 被拉黑用户：向其发送系统提示，拒绝转发消息
            ws.send(JSON.stringify({
              type: "banned",
              message: "当前账号已被限制使用"
            }));
            console.log(`[拦截] 被拉黑用户 ${vid} 尝试发送消息`);
            return; // 不继续处理
          }
        }
        // ── 拉黑验证结束 ─────────────────────────────────────

        const packet = {
          from:       String(data.from).toLowerCase().trim(),
          to:         String(data.to).toLowerCase().trim(),
          text:       data.text,
          type:       data.type || "text",
          location:   data.location || null,
          visitorId:  data.visitorId || null, // ── 新增：透传指纹 ID
          time:       new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          id:         "msg_" + Date.now() + Math.random().toString(36).substr(2, 4)
        };

        history.push(packet);
        if (history.length > 100) history.shift();
        console.log(`[转发] ${packet.from} -> ${packet.to} (${packet.type})${packet.location ? ' 📍' + packet.location : ''}${packet.visitorId ? ' 🔑' + packet.visitorId.substring(0,8) : ''}`);

        if (packet.from !== "admin" && !knownUsers.has(packet.from)) {
          knownUsers.add(packet.from);
          setTimeout(() => {
            const autoReply = {
              from: "admin", to: packet.from,
              text: "稍等", type: "text",
              location: null,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              id: "auto_" + Date.now()
            };
            history.push(autoReply);
            if (history.length > 100) history.shift();
            wss.clients.forEach((c) => {
              if (c.readyState === WebSocket.OPEN)
                c.send(JSON.stringify({ type: "new", data: autoReply }));
            });
          }, 3000);
        }

        if (packet.to === "admin" && packet.from !== "admin") {
          sendBarkNotification();
        }

        wss.clients.forEach((c) => {
          if (c.readyState === WebSocket.OPEN)
            c.send(JSON.stringify({ type: "new", data: packet }));
        });
      } catch (e) {
        console.error("消息解析失败:", e);
      }
    });

    ws.on("close", () => { console.log("客户端已断开"); });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => { clearInterval(interval); });

  return wss;
}

module.exports = {
  registerRoutes,
  attachWebSocket,
  banGet, // 供健康检查等复用
};