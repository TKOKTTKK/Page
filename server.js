<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
    <title>在线客服</title>

    <!-- ── FingerprintJS 免费开源版（CDN，无需注册）──────── -->
    <script>
      // 使用 @fingerprintjs/fingerprintjs 开源版 v4（esm bundle via jsDelivr）
      // 加载后调用 initFp()
    </script>

    <style>
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { 
            margin: 0; padding: 0; height: 100dvh; width: 100vw; 
            background: #ededed; font-family: -apple-system, sans-serif; 
            display: flex; flex-direction: column; overflow: hidden; position: fixed; 
        }

        #header-wrapper {
            background: #ededed; border-bottom: 1px solid #dcdcdc;
            padding-top: env(safe-area-inset-top); flex-shrink: 0; z-index: 10;
        }
        #header { height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; font-size: 17px; font-weight: 500; }
        .head-icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        #status-bar { width: 100%; text-align: center; color: #b2b2b2; font-size: 12px; padding: 2px 0; transition: color 0.3s; }

        #chat { 
            flex: 1; 
            overflow-y: auto; 
            -webkit-overflow-scrolling: touch; 
            background: #ededed;
            position: relative;
        }

        #chat-inner { 
            padding: 12px; 
            min-height: calc(100% + 1px); 
            display: flex; 
            flex-direction: column; 
        }

        .msg-row { margin-bottom: 16px; display: flex; align-items: flex-start; flex-shrink: 0; }
        .msg-row.me { flex-direction: row-reverse; }
        
        .avatar { width: 40px; height: 40px; border-radius: 4px; background: #fff; flex-shrink: 0; background-size: cover; }
        .me .avatar { margin-left: 12px; background-image: url('https://dummyimage.com/100/95ec69/fff&text=我'); }
        .visitor .avatar { margin-right: 12px; background-image: url('data:image/jpeg;base64,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'); background-position: center; }
        .bubble-txt { position: relative; padding: 10px 14px; font-size: 16px; line-height: 1.5; border-radius: 6px; max-width: calc(100% - 110px); word-wrap: break-word; min-height: 40px; }
        .visitor .bubble-txt { background: #fff; color: #000; }
        .visitor .bubble-txt::before { content: ""; position: absolute; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-right: 8px solid #fff; left: -8px; top: 14px; }
        .me .bubble-txt { background: #95ec69; color: #000; }
        .me .bubble-txt::before { content: ""; position: absolute; border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 8px solid #95ec69; right: -8px; top: 14px; }

        .bubble-txt a { color: #1677FF; text-decoration: underline; word-break: break-all; }
        .me .bubble-txt a { color: #0a5fd1; }

        .msg-img-wrap { max-width: 160px; margin: 0; }
        .msg-img { width: 100%; border-radius: 4px; cursor: pointer; display: block; border: 0.5px solid #dcdcdc; }

        #footer { 
            background: #f7f7f7; border-top: 1px solid #dcdcdc; 
            padding: 8px 12px calc(8px + env(safe-area-inset-bottom)); 
            display: flex; align-items: flex-end; gap: 10px; flex-shrink: 0; z-index: 10;
        }
        .btn-plus { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; margin-bottom: 2px; }
        textarea { flex: 1; min-height: 38px; max-height: 120px; border: none; background: #fff; border-radius: 6px; padding: 8px 12px; font-size: 16px; outline: none; resize: none; -webkit-appearance: none; caret-color: #07c160; }
        .btn-send { background: #07c160; color: #fff; border: none; border-radius: 4px; padding: 0 15px; height: 36px; font-size: 15px; cursor: pointer; flex-shrink: 0; margin-bottom: 1px; }

        /* ── 拉黑状态遮罩 ── */
        #ban-overlay {
            display: none;
            position: fixed; inset: 0; z-index: 300;
            background: rgba(237,237,237,0.97);
            flex-direction: column;
            align-items: center; justify-content: center;
            gap: 16px;
            padding: 40px 30px;
            text-align: center;
        }
        #ban-overlay.show { display: flex; }
        #ban-overlay svg { opacity: 0.35; }
        #ban-overlay .ban-title { font-size: 18px; font-weight: 600; color: #333; }
        #ban-overlay .ban-sub { font-size: 14px; color: #999; line-height: 1.6; }

        /* ── 禁用状态样式 ── */
        textarea:disabled { background: #f0f0f0; color: #b2b2b2; }
        .btn-send:disabled { background: #b2b2b2; cursor: not-allowed; }
        .btn-plus-disabled { opacity: 0.35; pointer-events: none; }

        #toast {
            position: fixed; top: calc(60px + env(safe-area-inset-top)); left: 50%; transform: translateX(-50%);
            background: rgba(0,0,0,0.72); color: #fff; padding: 7px 18px;
            border-radius: 20px; font-size: 14px; z-index: 200;
            opacity: 0; transition: opacity 0.2s; pointer-events: none; white-space: nowrap;
        }
        #toast.show { opacity: 1; }

        #img-viewer { position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index: 100; display: none; align-items: center; justify-content: center; }
        #img-viewer img { max-width: 100%; max-height: 100%; object-fit: contain; }
    </style>
</head>
<body>

<!-- ── 拉黑提示遮罩（被拉黑时全屏显示）── -->
<div id="ban-overlay">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
    </svg>
    <div class="ban-title">当前网页已被封禁</div>
    <div class="ban-sub">当前网页因违反规范已被封禁，<br>无法继续浏览查看</div>
</div>

<div id="header-wrapper">
    <div id="header">
        <div class="head-icon" onclick="history.back()"><svg viewBox="0 0 24 24" width="22" height="22" stroke="#111" stroke-width="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg></div>
        <div>客服-可可</div>
        <div class="head-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="#111"><circle cx="5" cy="12" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle></svg></div>
    </div>
    <div id="status-bar">正在连接...</div>
</div>

<div id="chat" onclick="dismissKeyboard()">
    <div id="chat-inner"></div>
</div>

<div id="footer">
    <div class="btn-plus" id="btn-plus" onclick="document.getElementById('file-ipt').click()">
        <svg viewBox="0 0 24 24" width="30" height="30" stroke="#333" stroke-width="1.2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
    </div>
    <input type="file" id="file-ipt" accept="image/*" style="display:none">
    <textarea id="ipt" rows="1" placeholder="发送消息..."></textarea>
    <button class="btn-send" id="btn-send" onclick="sendMsg()">发送</button>
</div>

<div id="toast"></div>
<div id="img-viewer" onclick="this.style.display='none'"><img src="" id="viewer-img"></div>

<!-- ══════════════════════════════════════════════════════════
     FingerprintJS 开源版 v4（免费，无需注册，稳定指纹）
     CDN: https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@4/dist/fp.min.js
     ══════════════════════════════════════════════════════════ -->
<script>
// ── 后端地址（与 WebSocket 保持一致）──────────────────────
const SERVER_BASE = 'https://page-c4hm.onrender.com';

// ── 全局状态 ─────────────────────────────────────────────
let myId = '';          // WebSocket 展示用 ID（随机短串，保持现有逻辑）
let myVisitorId = '';   // FingerprintJS 设备指纹（用于拉黑验证）
let myLocation = null;  // IP 定位字符串
let ws;
let isBanned = false;   // 是否被拉黑

const chatContainer = document.getElementById('chat');
const chatInner = document.getElementById('chat-inner');
const iptBox = document.getElementById('ipt');
const fileIpt = document.getElementById('file-ipt');
const statusBar = document.getElementById('status-bar');
const btnPlus = document.getElementById('btn-plus');
const btnSend = document.getElementById('btn-send');

// ══════════════════════════════════════════════════════════
// ① 初始化 FingerprintJS，获取稳定设备指纹
//    fingerprintJS 会综合 canvas、音频、字体、时区、插件等
//    多个特征，生成稳定的 visitorId，同设备刷新不变。
// ══════════════════════════════════════════════════════════
function initFp() {
    return new Promise((resolve) => {
        // 动态加载 FingerprintJS 脚本
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@4/dist/fp.min.js';
        script.onload = async () => {
            try {
                const fp = await FingerprintJS.load();
                const result = await fp.get();
                resolve(result.visitorId);
            } catch (e) {
                console.warn('FingerprintJS 失败，降级使用本地存储ID', e);
                resolve(null);
            }
        };
        script.onerror = () => {
            console.warn('FingerprintJS 脚本加载失败，降级使用本地存储ID');
            resolve(null);
        };
        document.head.appendChild(script);
    });
}

// ── 生成兜底 ID（FingerprintJS 不可用时使用，存 localStorage）
function getFallbackId() {
    const KEY = 'wx_visitor_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
        // 组合多个浏览器特征，提高稳定性
        const ua = navigator.userAgent;
        const lang = navigator.language || '';
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
        const raw = ua + lang + tz + screen;
        // 简单哈希
        let hash = 0;
        for (let i = 0; i < raw.length; i++) {
            hash = ((hash << 5) - hash) + raw.charCodeAt(i);
            hash |= 0;
        }
        id = 'fb_' + Math.abs(hash).toString(36) + Math.random().toString(36).substr(2, 4);
        localStorage.setItem(KEY, id);
    }
    return id;
}

// ══════════════════════════════════════════════════════════
// ② 拉黑检测：向后端 /check-ban 查询当前 visitorId
// ══════════════════════════════════════════════════════════
async function checkBan(visitorId) {
    try {
        const resp = await fetch(`${SERVER_BASE}/check-ban?visitorId=${encodeURIComponent(visitorId)}`);
        const data = await resp.json();
        return data.banned === true;
    } catch (e) {
        console.warn('拉黑检测请求失败，默认放行', e);
        return false; // 接口失败时不阻断用户（宁放过，不误杀）
    }
}

// ── 显示拉黑遮罩，禁用输入区域 ─────────────────────────
function applyBanUI() {
    isBanned = true;
    document.getElementById('ban-overlay').classList.add('show');
    iptBox.disabled = true;
    btnSend.disabled = true;
    btnPlus.classList.add('btn-plus-disabled');
    fileIpt.disabled = true;
}

// ══════════════════════════════════════════════════════════
// ③ 页面启动流程：先获取指纹 → 检测拉黑 → 建立 WebSocket
// ══════════════════════════════════════════════════════════
async function startup() {
    // 现有的展示用短 ID（保持原有逻辑不变）
    myId = (localStorage.getItem('wx_uid') || 'u' + Math.random().toString(36).substr(2,4).toLowerCase());
    localStorage.setItem('wx_uid', myId);

    // 获取设备指纹
    const fpId = await initFp();
    myVisitorId = fpId || getFallbackId();
    console.log('[指纹]', myVisitorId.substring(0, 12) + '...');

    // 查询是否被拉黑
    const banned = await checkBan(myVisitorId);
    if (banned) {
        applyBanUI();
        return; // 被拉黑：不建立 WebSocket，直接停止
    }

    // 未被拉黑：正常启动 IP 定位和 WebSocket
    startLocate();
    requestAnimationFrame(connect);
}

// ══════════════════════════════════════════════════════════
// 腾讯地图 IP 定位（原有逻辑不变）
// ══════════════════════════════════════════════════════════
const LBS_KEY = 'UXBBZ-RELWI-JJXG2-5YBRI-XPWW3-D3FIJ';

function startLocate() {
    window._chatLbsCb = function(res) {
        if (res.status === 0 && res.result) {
            const ad = res.result.ad_info;
            const city = ad.city || '';
            const district = ad.district || '';
            if (city && district && city !== district) {
                myLocation = city + '·' + district;
            } else {
                myLocation = district || city || null;
            }
        }
        const s = document.getElementById('_chat-lbs-script');
        if (s) s.remove();
        delete window._chatLbsCb;
    };
    const script = document.createElement('script');
    script.id = '_chat-lbs-script';
    script.src = 'https://apis.map.qq.com/ws/location/v1/ip?key=' + LBS_KEY + '&output=jsonp&callback=_chatLbsCb';
    script.onerror = function() { this.remove(); delete window._chatLbsCb; };
    document.body.appendChild(script);
    setTimeout(function() {
        const s = document.getElementById('_chat-lbs-script');
        if (s) { s.remove(); delete window._chatLbsCb; }
    }, 4000);
}

// ── 链接渲染（原有逻辑不变）──────────────────────────────
function renderTextWithLinks(text) {
    if (!text) return '';
    let s = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        (_, label, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`);
    s = s.replace(/(https?:\/\/[^\s\u4e00-\u9fa5，。！？、；：""''【】《》（）&<>]+)/g, url => {
        const clean = url.replace(/[.,!?;:'")\]]+$/, '');
        return `<a href="${clean}" target="_blank" rel="noopener noreferrer">${clean}</a>`;
    });
    return s;
}

fileIpt.addEventListener('change', function () {
    directSendImg(this);
});

// ── Toast 提示 ──────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

function isConnected() {
    return ws && ws.readyState === WebSocket.OPEN;
}

function connect() {
    ws = new WebSocket('wss://page-c4hm.onrender.com'); 
    
    ws.onopen = () => {
        statusBar.innerText = "已连接";
        statusBar.style.color = "#b2b2b2";
    };
    
    ws.onclose = () => { 
        statusBar.innerText = "重连中..."; 
        statusBar.style.color = "#fa5151";
        setTimeout(connect, 3000); 
    };
    
    ws.onmessage = (e) => {
        const res = JSON.parse(e.data);

        // ── 后端返回拉黑通知（双重验证：前端被绕过时后端再次拦截）──
        if (res.type === "banned") {
            applyBanUI();
            return;
        }

        if (res.type === "typing" && res.to === myId) {
            statusBar.innerText = "客服正在输入...";
            statusBar.style.color = "#07c160";
            return; 
        }

        if (statusBar.innerText.includes("输入")) {
            statusBar.innerText = "已连接";
            statusBar.style.color = "#b2b2b2";
        }

        if (res.type === "history") chatInner.innerHTML = "";
        const list = res.type === "history" ? res.data : [res.data];
        list.forEach(m => {
            if (String(m.from).toLowerCase() === myId || String(m.to).toLowerCase() === myId) renderMsg(m);
        });
    };
}

function renderMsg(m) {
    const isMe = String(m.from).toLowerCase() === myId;
    const div = document.createElement('div');
    div.className = 'msg-row' + (isMe ? ' me' : ' visitor');
    
    const ava = document.createElement('div');
    ava.className = 'avatar';
    div.appendChild(ava);

    if (m.type === 'img') {
        const wrap = document.createElement('div');
        wrap.className = 'msg-img-wrap';
        const img = document.createElement('img');
        img.className = 'msg-img';
        img.src = m.text;
        img.onload = () => scrollToBottom();
        img.onclick = (e) => { e.stopPropagation(); showFullImage(m.text); };
        wrap.appendChild(img);
        div.appendChild(wrap);
    } else {
        const txt = document.createElement('div');
        txt.className = 'bubble-txt';
        txt.innerHTML = renderTextWithLinks(m.text);
        div.appendChild(txt);
    }

    chatInner.appendChild(div);
    scrollToBottom();
}

function dismissKeyboard() { iptBox.blur(); }

iptBox.addEventListener('focus', () => {
    setTimeout(scrollToBottom, 300);
});

function directSendImg(el) {
    const file = el.files[0];
    el.value = '';

    if (!file) return;
    if (isBanned) { showToast('当前账号已被限制使用'); return; }
    if (!isConnected()) { showToast('发送失败，网络未连接'); return; }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
            const maxWidth = 1000;
            let width = img.width, height = img.height;
            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            
            if (isConnected()) {
                // ── 发送时附带 visitorId（后端二次校验用）──
                ws.send(JSON.stringify({
                    from: myId,
                    to: 'admin',
                    text: compressedBase64,
                    type: 'img',
                    location: myLocation,
                    visitorId: myVisitorId  // ← 新增
                }));
            } else {
                showToast('发送失败，请重试');
            }
        };
    };
    reader.readAsDataURL(file);
}

function showFullImage(src) {
    document.getElementById('viewer-img').src = src;
    document.getElementById('img-viewer').style.display = 'flex';
}

function sendMsg() {
    const text = iptBox.value.trim();
    if (!text) return;
    if (isBanned) { showToast('当前账号已被限制使用'); return; }
    if (!isConnected()) { showToast('发送失败，网络未连接'); return; }

    try {
        // ── 发送时附带 visitorId（后端二次校验用）──
        ws.send(JSON.stringify({
            from: myId,
            to: 'admin',
            text: text,
            type: 'text',
            location: myLocation,
            visitorId: myVisitorId  // ← 新增
        }));
        iptBox.value = '';
        iptBox.style.height = '38px';
        scrollToBottom();
    } catch (err) {
        showToast('发送失败，请重试');
    }
}

function scrollToBottom() {
    if (!chatContainer) return;
    chatContainer.scrollTop = chatContainer.scrollHeight;
    setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
}

iptBox.onkeydown = (e) => { 
    if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } 
};

iptBox.oninput = function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
    scrollToBottom();
};

// ── 启动！（替换原有的 requestAnimationFrame(connect) ）──
startup();
</script>

</body>
</html>