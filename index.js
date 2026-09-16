
// =========================================================
// SUPABASE CONFIG
// =========================================================
const SB_URL = 'https://owlurxlregswlewdsxjg.supabase.co';
const SB_KEY = 'sb_publishable_I70OTp27BPia3G70OOI2Gw_G33-C-cZ';
const SB_HEADERS = {
  'apikey': SB_KEY,
  'Authorization': 'Bearer ' + SB_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function sbFetch(path, options = {}) {
  const url = SB_URL + '/rest/v1/' + path;
  const opts = { headers: SB_HEADERS, ...options };
  if (opts.body && typeof opts.body === 'object') opts.body = JSON.stringify(opts.body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Supabase error: ' + res.status + ' - ' + err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// =========================================================
// WARNING OVERLAY (muncul tiap masuk)
// =========================================================
(function initWarning(){
  const overlay = document.getElementById('warningOverlay');
  const btn = document.getElementById('warnContinueBtn');
  const btnText = document.getElementById('warnBtnText');
  const cd = document.getElementById('warnCountdown');
  const joinBtn = document.getElementById('warnJoinBtn');
  const joinText = document.getElementById('warnJoinText');

  // Visit counter: show on 1st, 4th, 7th... (every 3 visits)
  let visits = parseInt(localStorage.getItem('kaze_warn_visits') || '0', 10) + 1;
  localStorage.setItem('kaze_warn_visits', String(visits));
  const shouldShow = ((visits - 1) % 3) === 0;

  if (!shouldShow) {
    overlay.style.display = 'none';
    return;
  }

  overlay.style.display = 'flex';
  let joined = false;
  let t = 5;
  joinText.textContent = 'Join Saluran (' + t + 's)';
  cd.textContent = '✦ Tunggu ' + t + ' detik lalu join saluran ✦';

  const iv = setInterval(() => {
    t--;
    if (t > 0) {
      joinText.textContent = 'Join Saluran (' + t + 's)';
      cd.textContent = '✦ Tunggu ' + t + ' detik lalu join saluran ✦';
    } else {
      clearInterval(iv);
      joinBtn.style.pointerEvents = 'auto';
      joinBtn.style.opacity = '1';
      joinText.textContent = 'Join Saluran Admin';
      cd.textContent = '✦ Klik Join Saluran dulu ✦';
    }
  }, 1000);

  joinBtn.addEventListener('click', () => {
    joined = true;
    btn.disabled = false;
    btnText.textContent = 'Lanjutkan';
    cd.textContent = '✦ Sudah join, bisa lanjut sekarang ✦';
  });

  btn.addEventListener('click', () => {
    if (!joined) return;
    overlay.classList.add('hide');
    setTimeout(() => overlay.style.display = 'none', 600);
  });
})();

// =========================================================
// PARTICLES (loader)
// =========================================================
// (loader tetap sederhana)

// =========================================================
// THEME FROM SUPABASE
// =========================================================
async function loadTheme() {
  try {
    const data = await sbFetch('kaze_settings?select=theme,bg_video_url,home_video_url,wa_channel&id=eq.1');
    if (data && data[0]) {
      const s = data[0];
      if (s.theme) applyTheme(s.theme);
      if (s.bg_video_url) updateBackgroundVideo(s.bg_video_url);
      if (s.home_video_url) updateHomeVideoSrc(s.home_video_url);
      if (s.wa_channel) {
        const wa = document.getElementById('waChannelBtn');
        if (wa) wa.href = s.wa_channel;
      }
    }
  } catch(e) { console.warn('Theme load error:', e.message); }
}

function applyTheme(t) {
  const root = document.documentElement;
  if (t.primary) root.style.setProperty('--primary', t.primary);
  if (t.primary_dark) root.style.setProperty('--primary-dark', t.primary_dark);
  if (t.primary_light) root.style.setProperty('--primary-light', t.primary_light);
  if (t.bg_body) root.style.setProperty('--bg-body', t.bg_body);
  if (t.bg_card) root.style.setProperty('--bg-card', t.bg_card);
  if (t.text_primary) root.style.setProperty('--text-primary', t.text_primary);
  if (t.text_muted) root.style.setProperty('--text-muted', t.text_muted);
  if (t.border) root.style.setProperty('--border', t.border);
  if (t.shadow) root.style.setProperty('--shadow', t.shadow);
  if (t.glow) root.style.setProperty('--glow', t.glow);
}

function updateBackgroundVideo(url) {
  const v = document.getElementById('bgVideo');
  if (v) { v.src = url; v.load(); v.play().catch(()=>{}); }
}

function updateHomeVideoSrc(url) {
  const v = document.getElementById('homeVideo');
  if (v) {
    const s = v.querySelector('source');
    if (s) s.src = url;
    v.load();
    v.play().catch(()=>{});
  }
}

function toggleSpecialTheme() {
  loadTheme();
  toast('✦ Tema di-refresh ✦');
}

// =========================================================
// MUSIC
// =========================================================
let musicUrls = ['https://c.termai.cc/v139/dhV3.mp4', 'https://c.termai.cc/v131/H4vF9D.mp4'];
let currentMusicIndex = 0;

function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  const btn = document.getElementById('musicToggleBtn');
  const viz = document.getElementById('musicVisualizer');
  if (audio.paused) {
    audio.play().catch(()=>toast('Gagal memutar musik.'));
    btn.innerHTML = '<i class="fas fa-stop"></i>';
    viz.classList.add('active');
  } else {
    audio.pause();
    audio.currentTime = 0;
    btn.innerHTML = '<i class="fas fa-music"></i>';
    viz.classList.remove('active');
  }
}

function changeMusic() {
  const audio = document.getElementById('bgMusic');
  currentMusicIndex = (currentMusicIndex + 1) % musicUrls.length;
  audio.src = musicUrls[currentMusicIndex];
  audio.load();
  if (!audio.paused) audio.play().catch(()=>{});
  toast('Ganti lagu: ' + (currentMusicIndex + 1));
}

// =========================================================
// AUTH (localStorage) — username only
// =========================================================
function getUsers() {
  try { return JSON.parse(localStorage.getItem('kaze_users') || '{}'); } catch { return {}; }
}
function saveUsers(u) { localStorage.setItem('kaze_users', JSON.stringify(u)); }

function doLogin() {
  let u = document.getElementById('loginUser').value.trim();
  if (!u) return toast('Isi username dulu!');
  let users = getUsers();
  if (!users[u]) {
    users[u] = { role: 'member' };
    saveUsers(users);
  }
  localStorage.setItem('kaze_session', u);
  enterApp(u);
}

function doLogout() {
  localStorage.removeItem('kaze_session');
  toast('Logout berhasil');
  document.getElementById('appWrap').classList.remove('active');
  document.getElementById('authPage').classList.remove('hidden');
}

function checkAuth() {
  let session = localStorage.getItem('kaze_session');
  if (session) enterApp(session);
  else document.getElementById('authPage').classList.remove('hidden');
}

// =========================================================
// LOADER INIT
// =========================================================
window.addEventListener('load', () => {
  loadTheme();
  setTimeout(() => {
    document.getElementById('loader').classList.add('hide');
    checkAuth();
  }, 2200);
  setInterval(loadTheme, 5000);
  setInterval(pollChatReplies, 5000);
});

function toast(msg) {
  let t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._hide);
  t._hide = setTimeout(() => t.classList.remove('show'), 3000);
}

// =========================================================
// AVATAR
// =========================================================
function loadAvatarPhoto(username) {
  const photo = localStorage.getItem('kaze_avatar_' + username);
  const avatarImg = document.getElementById('profAvatarImg');
  const placeholder = document.getElementById('profAvatarPlaceholder');
  const logoIcon = document.getElementById('logoIcon');
  const sbAvatar = document.getElementById('sbAvatar');
  if (photo) {
    avatarImg.style.display = 'block';
    avatarImg.src = photo;
    placeholder.style.display = 'none';
    logoIcon.innerHTML = `<img src="${photo}" alt="Avatar">`;
    logoIcon.style.background = 'none';
    sbAvatar.innerHTML = `<img src="${photo}" alt="Avatar">`;
  } else {
    avatarImg.style.display = 'none';
    placeholder.style.display = 'inline';
    logoIcon.innerHTML = '<i class="fas fa-crown"></i>';
    logoIcon.style.background = '';
    const initial = username ? username.charAt(0).toUpperCase() : 'K';
    sbAvatar.innerHTML = `<span id="sbAvatarText">${initial}</span>`;
    sbAvatar.style.background = '';
  }
}

function saveAvatarPhoto(file) {
  const session = localStorage.getItem('kaze_session');
  if (!session) return;
  if (!file.type.startsWith('image/')) return toast('File harus berupa gambar!');
  if (file.size > 2 * 1024 * 1024) return toast('Ukuran foto maksimal 2MB!');
  const reader = new FileReader();
  reader.onload = (e) => {
    localStorage.setItem('kaze_avatar_' + session, e.target.result);
    loadAvatarPhoto(session);
    toast('Foto profil berhasil diubah!');
  };
  reader.readAsDataURL(file);
}

(function initAvatar(){
  const c = document.getElementById('profAvatarContainer');
  const f = document.getElementById('avatarFileInput');
  if (!c || !f) return;
  c.addEventListener('click', () => f.click());
  f.addEventListener('change', () => { if (f.files[0]) saveAvatarPhoto(f.files[0]); });
  c.addEventListener('dragover', e => { e.preventDefault(); c.style.borderColor = 'var(--primary)'; });
  c.addEventListener('dragleave', () => { c.style.borderColor = ''; });
  c.addEventListener('drop', e => {
    e.preventDefault();
    c.style.borderColor = '';
    if (e.dataTransfer.files[0]) saveAvatarPhoto(e.dataTransfer.files[0]);
  });
})();

// =========================================================
// CHANGE USERNAME / PASSWORD
// =========================================================
function changeUsername() {
  const n = document.getElementById('newUsernameInput').value.trim();
  const s = localStorage.getItem('kaze_session');
  if (!s) return;
  if (!n) return toast('Isi username baru!');
  if (n === s) return toast('Username baru sama dengan yang lama!');
  let users = getUsers();
  if (users[n]) return toast('Username sudah dipakai!');
  users[n] = users[s];
  delete users[s];
  saveUsers(users);
  const av = localStorage.getItem('kaze_avatar_' + s);
  if (av) { localStorage.setItem('kaze_avatar_' + n, av); localStorage.removeItem('kaze_avatar_' + s); }
  localStorage.setItem('kaze_session', n);
  toast('Username berhasil diubah!');
  document.getElementById('newUsernameInput').value = '';
  enterApp(n);
}



// =========================================================
// ENTER APP
// =========================================================
function enterApp(username) {
  document.getElementById('authPage').classList.add('hidden');
  document.getElementById('appWrap').classList.add('active');

  const users = getUsers();
  const role = (users[username]?.role || 'member').toUpperCase();
  const roleDisplay = '✦ ' + role + ' ✦';

  document.getElementById('devUser').textContent = username;
  document.getElementById('sbName').textContent = username;
  document.getElementById('sbRole').textContent = roleDisplay;
  document.getElementById('profName').textContent = username;
  document.getElementById('profRole').textContent = roleDisplay;
  document.getElementById('profRoleValue').textContent = roleDisplay;
  document.getElementById('devRole').textContent = roleDisplay;

  let initial = username.charAt(0).toUpperCase();
  document.getElementById('profAvatarPlaceholder').textContent = initial;
  loadAvatarPhoto(username);
  updateDeviceInfo();
  showPage('homePage');
  loadToolsAndRender();
  loadChatMessages();
}

function updateDeviceInfo() {
  let ua = navigator.userAgent;
  let device = 'Desktop';
  if (/Android/i.test(ua)) device = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) device = 'iOS';
  else if (/Windows/i.test(ua)) device = 'Windows';
  else if (/Mac/i.test(ua)) device = 'macOS';
  else if (/Linux/i.test(ua)) device = 'Linux';
  document.getElementById('devDevice').textContent = device;
  document.getElementById('profDevice').textContent = device;
  if (navigator.getBattery) {
    navigator.getBattery().then(b => {
      let lvl = Math.round(b.level * 100);
      let text = lvl + '% ' + (b.charging ? '⚡' : '');
      document.getElementById('devBattery').textContent = text;
      document.getElementById('profBattery').textContent = text;
    }).catch(()=>{});
  }
}

// =========================================================
// PREVIEW
// =========================================================
function openPreview(url, title) {
  const o = document.getElementById('previewOverlay');
  const f = document.getElementById('previewFrame');
  const t = document.getElementById('previewTitle');
  o.classList.add('active');
  document.body.style.overflow = 'hidden';
  t.textContent = title || 'Loading...';
  f.src = url;
}
function closePreview() {
  const o = document.getElementById('previewOverlay');
  const f = document.getElementById('previewFrame');
  o.classList.remove('active');
  document.body.style.overflow = 'auto';
  setTimeout(() => f.src = 'about:blank', 300);
}

// =========================================================
// CHAT (Supabase)
// =========================================================
async function loadChatMessages() {
  const username = localStorage.getItem('kaze_session');
  if (!username) return;
  const container = document.getElementById('chatMessages');
  try {
    const msgs = await sbFetch(`kaze_chats?select=*&username=eq.${encodeURIComponent(username)}&order=created_at.asc`);
    if (!msgs || msgs.length === 0) {
      container.innerHTML = `<div class="chat-empty"><i class="fas fa-comment-dots"></i>Kirim pesan ke admin. Balasan akan muncul di sini.</div>`;
    } else {
      container.innerHTML = msgs.map(m => {
        const isUser = m.sender === 'user';
        return `<div class="chat-msg ${isUser ? 'user' : 'admin'}">
          <span class="sender">${isUser ? 'USER' : '👑 Admin'}</span>
          <div class="text">${escapeHtml(m.text)}</div>
          <span class="time">${new Date(m.created_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span>
        </div>`;
      }).join('');
      container.scrollTop = container.scrollHeight;
    }
    const limit = getChatLimit(username);
    document.getElementById('chatLimit').textContent = 'Sisa chat: ' + limit;
    document.getElementById('chatInput').disabled = limit <= 0;
    document.getElementById('chatSendBtn').disabled = limit <= 0;
  } catch(e) {
    container.innerHTML = `<div class="chat-empty"><i class="fas fa-exclamation-triangle"></i>Gagal load chat</div>`;
  }
}

function getChatLimit(u) {
  try {
    const d = JSON.parse(localStorage.getItem('kaze_chat_limits') || '{}');
    return d[u] !== undefined ? d[u] : 5;
  } catch { return 5; }
}
function setChatLimit(u, l) {
  try {
    const d = JSON.parse(localStorage.getItem('kaze_chat_limits') || '{}');
    d[u] = l;
    localStorage.setItem('kaze_chat_limits', JSON.stringify(d));
  } catch {}
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  const username = localStorage.getItem('kaze_session');
  if (!text) return toast('Tulis pesan dulu!');
  if (!username) return toast('Login dulu!');
  const limit = getChatLimit(username);
  if (limit <= 0) return toast('⚠️ Limit chat habis!');

  try {
    await sbFetch('kaze_chats', {
      method: 'POST',
      body: { username, sender: 'user', text, is_read: false }
    });
    setChatLimit(username, limit - 1);
    input.value = '';
    loadChatMessages();
    toast('✅ Pesan terkirim!');
  } catch(e) {
    toast('❌ Gagal kirim: ' + e.message);
  }
}

async function pollChatReplies() {
  const username = localStorage.getItem('kaze_session');
  if (!username) return;
  if (!document.getElementById('chatPage').classList.contains('active')) return;
  try {
    const msgs = await sbFetch(`kaze_chats?select=id&username=eq.${encodeURIComponent(username)}`);
    if (msgs && msgs.length > 0) {
      const lastCount = parseInt(localStorage.getItem('kaze_chat_count_' + username) || '0');
      if (msgs.length > lastCount) {
        if (lastCount > 0) setChatLimit(username, 5);
        localStorage.setItem('kaze_chat_count_' + username, String(msgs.length));
        loadChatMessages();
      }
    }
  } catch(e) {}
}

// =========================================================
// TOOLS (Supabase)
// =========================================================
let allToolsCache = [];

async function loadToolsAndRender() {
  try {
    const tools = await sbFetch('kaze_tools?select=*&order=sort_order.asc,created_at.asc');
    allToolsCache = tools || [];
    renderPopular();
    renderCategory('all');
  } catch(e) {
    console.warn('Load tools error:', e.message);
  }
}

function renderPopular() {
  const popular = allToolsCache.slice(0, 6);
  renderGrid('popularGrid', popular);
}

function getToolsByCategory(cat) {
  if (cat === 'all') return allToolsCache;
  if (cat === 'request') return allToolsCache.filter(t => t.category === 'request' || t.is_request);
  return allToolsCache.filter(t => t.category === cat);
}

function getCategoryIcon(cat) {
  const map = {
    downloader: 'fa-download',
    maker: 'fa-wand-magic-sparkles',
    tools: 'fa-screwdriver-wrench',
    external: 'fa-link',
    extra: 'fa-plus-circle',
    xvip: 'fa-crown',
    telegram: 'fa-robot',
    request: 'fa-lightbulb'
  };
  return map[cat] || 'fa-tool';
}

const MAINTENANCE_IDS = ['instagram','tiktok','youtube','qr','anonychat','pinkvoid','handtrack','enhancer'];

function renderGrid(containerId, items) {
  const c = document.getElementById(containerId);
  if (!c) return;
  if (!items || items.length === 0) {
    c.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted);font-size:0.8rem;">
      <i class="fas fa-box-open" style="font-size:24px;display:block;margin-bottom:8px;color:var(--primary);"></i>Belum ada tools.
    </div>`;
    return;
  }
  c.innerHTML = items.map(item => {
    const isMaint = item.is_maintenance || MAINTENANCE_IDS.includes(item.id);
    const badge = isMaint ? '<span class="badge-maint">MAINTENANCE</span>'
      : (item.badge ? `<span class="badge${item.is_request ? '-new' : ''}">${escapeHtml(item.badge)}</span>` : '');
    const icon = getCategoryIcon(item.category);
    return `<div class="tools-card" onclick="handleToolClick('${item.id}')">
      <div class="icon"><i class="fas ${icon}"></i></div>
      <h4>${escapeHtml(item.name)}</h4>
      <p>${escapeHtml(item.description || '')}</p>
      ${badge}
      <div class="arrow"><i class="fas fa-arrow-right"></i></div>
    </div>`;
  }).join('');
}

function renderCategory(cat) {
  const container = document.getElementById('toolsContainer');
  if (!container) return;
  const items = getToolsByCategory(cat);
  const titles = { all:'Semua Tools', downloader:'Downloader', maker:'Maker', tools:'Tools', external:'External Tools', extra:'Extra Tools', xvip:'✦ PREMIUM TOOLS ✦', telegram:'Tools dari Telegram', request:'Request Tools' };
  const icons = { all:'fa-th-large', downloader:'fa-download', maker:'fa-wand-magic-sparkles', tools:'fa-screwdriver-wrench', external:'fa-link', extra:'fa-plus-circle', xvip:'fa-crown', telegram:'fa-robot', request:'fa-lightbulb' };
  container.innerHTML = `<div class="section-title">
    <i class="fas ${icons[cat]||'fa-th-large'}" style="color:var(--primary);"></i> ${titles[cat]||'Tools'} (${items.length})
    <span class="line"></span>
  </div><div class="tools-grid" id="categoryGrid"></div>`;
  renderGrid('categoryGrid', items);
  document.querySelectorAll('.category-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.category === cat);
  });
}

function handleToolClick(id) {
  const tool = allToolsCache.find(t => t.id === id);
  if (!tool) return;
  const isMaint = tool.is_maintenance || MAINTENANCE_IDS.includes(tool.id);
  if (isMaint) {
    toast('🔧 ' + tool.name + ' sedang MAINTENANCE');
    return;
  }
  if (tool.url && tool.url.trim()) {
    openPreview(tool.url, tool.name);
    return;
  }
  // tool internal (IQC, BRAT, dll)
  showTool(tool);
}

// =========================================================
// TOOL VIEWER — UI DIPERBAIKI
// =========================================================
function showTool(tool) {
  const viewer = document.getElementById('toolViewer');
  const body = document.getElementById('toolViewerBody');
  viewer.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderToolUI(body, tool);
}

function closeTool() {
  document.getElementById('toolViewer').classList.remove('active');
  document.body.style.overflow = 'auto';
}

function renderToolUI(body, tool) {
  const id = tool.id;
  const icon = getCategoryIcon(tool.category);
  body.innerHTML = `<h2><i class="fas ${icon}"></i> ${escapeHtml(tool.name)}</h2>
    <p style="color:var(--text-muted);font-size:13px;margin-bottom:14px;">${escapeHtml(tool.description || '')}</p>
    <div id="toolInputArea"></div>
    <div class="tool-ui-result" id="toolResult"></div>`;

  const area = document.getElementById('toolInputArea');

  if (id === 'iqc') {
    area.innerHTML = `
      <div class="tool-ui-info"><i class="fas fa-info-circle"></i> Isi data di bawah untuk generate tampilan <strong>IQC</strong> (iPhone Quote Chat)</div>
      <label class="tool-ui-label">Teks Pesan</label>
      <textarea class="tool-ui-textarea" id="iqcText" placeholder="Contoh: Halo, apa kabar?"></textarea>
      <div class="tool-ui-row">
        <div><label class="tool-ui-label">Jam</label><input type="text" class="tool-ui-input" id="iqcTime" value="12:30"></div>
        <div><label class="tool-ui-label">Baterai %</label><input type="number" class="tool-ui-input" id="iqcBatt" value="65" min="1" max="100"></div>
      </div>
      <label class="tool-ui-label">Provider</label>
      <select class="tool-ui-select" id="iqcProvider">
        <option value="Axis">Axis</option><option value="Telkomsel">Telkomsel</option>
        <option value="Indosat">Indosat</option><option value="XL">XL</option>
        <option value="Tri">Tri</option><option value="Smartfren">Smartfren</option>
      </select>
      <button class="tool-ui-btn" onclick="runIqc()"><i class="fas fa-play"></i> Generate IQC</button>`;
  }
  else if (id === 'brat') {
    area.innerHTML = `
      <div class="tool-ui-info"><i class="fas fa-info-circle"></i> Ketik teks, pilih style, lalu generate gambar <strong>BRAT</strong>.</div>
      <label class="tool-ui-label">Teks</label>
      <textarea class="tool-ui-textarea" id="bratText" placeholder="Contoh: Kaze Senpai"></textarea>
      <div class="tool-ui-row">
        <div><label class="tool-ui-label">Warna BG</label><input type="color" class="tool-ui-input" id="bratBg" value="#ffffff" style="height:46px;padding:4px;"></div>
        <div><label class="tool-ui-label">Warna Teks</label><input type="color" class="tool-ui-input" id="bratFg" value="#000000" style="height:46px;padding:4px;"></div>
      </div>
      <label class="tool-ui-label">Ukuran Font</label>
      <input type="range" id="bratSize" min="30" max="90" value="48" style="width:100%;margin-bottom:12px;">
      <button class="tool-ui-btn" onclick="runBrat()"><i class="fas fa-play"></i> Generate BRAT</button>`;
  }
  else if (id === 'fakeig') {
    area.innerHTML = `
      <div class="tool-ui-info"><i class="fas fa-info-circle"></i> Buat screenshot fake Instagram post.</div>
      <label class="tool-ui-label">Username</label>
      <input type="text" class="tool-ui-input" id="igUser" placeholder="kaze_senpai">
      <label class="tool-ui-label">Caption</label>
      <textarea class="tool-ui-textarea" id="igCaption" placeholder="Caption postingan..."></textarea>
      <label class="tool-ui-label">Jumlah Like</label>
      <input type="text" class="tool-ui-input" id="igLikes" value="1.234">
      <button class="tool-ui-btn" onclick="runFakeIg()"><i class="fas fa-play"></i> Generate Fake IG</button>`;
  }
  else if (id === 'qr') {
    area.innerHTML = `
      <div class="tool-ui-info"><i class="fas fa-info-circle"></i> Buat QR Code dari teks atau URL apa aja.</div>
      <label class="tool-ui-label">Teks / URL</label>
      <input type="text" class="tool-ui-input" id="qrText" placeholder="https://example.com">
      <label class="tool-ui-label">Ukuran</label>
      <select class="tool-ui-select" id="qrSize">
        <option value="200">Kecil (200px)</option>
        <option value="400" selected>Sedang (400px)</option>
        <option value="600">Besar (600px)</option>
      </select>
      <button class="tool-ui-btn" onclick="runQr()"><i class="fas fa-play"></i> Generate QR</button>`;
  }
  else if (id === 'calc') {
    area.innerHTML = `
      <div class="tool-ui-info"><i class="fas fa-info-circle"></i> Kalkulator canggih — bisa +, -, *, /, %, pangkat (**), dll.</div>
      <label class="tool-ui-label">Ekspresi</label>
      <input type="text" class="tool-ui-input" id="calcInput" placeholder="Contoh: (12 + 8) * 3 / 2">
      <div class="tool-ui-row">
        <button class="tool-ui-btn secondary" onclick="calcInsert('+')">+</button>
        <button class="tool-ui-btn secondary" onclick="calcInsert('-')">-</button>
        <button class="tool-ui-btn secondary" onclick="calcInsert('*')">×</button>
        <button class="tool-ui-btn secondary" onclick="calcInsert('/')">÷</button>
      </div>
      <button class="tool-ui-btn" onclick="runCalc()"><i class="fas fa-equals"></i> Hitung</button>`;
  }
  else if (id === 'pwgen') {
    area.innerHTML = `
      <div class="tool-ui-info"><i class="fas fa-info-circle"></i> Generate password aman & random.</div>
      <label class="tool-ui-label">Panjang Password</label>
      <input type="range" id="pwLen" min="6" max="64" value="16" style="width:100%;margin-bottom:6px;">
      <div style="text-align:center;color:var(--primary-light);font-weight:700;margin-bottom:12px;" id="pwLenVal">16 karakter</div>
      <label class="tool-ui-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" id="pwUpper" checked> Huruf Besar</label>
      <label class="tool-ui-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" id="pwLower" checked> Huruf Kecil</label>
      <label class="tool-ui-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" id="pwNum" checked> Angka</label>
      <label class="tool-ui-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" id="pwSym" checked> Simbol</label>
      <button class="tool-ui-btn" onclick="runPwGen()" style="margin-top:12px;"><i class="fas fa-key"></i> Generate Password</button>`;
    setTimeout(() => {
      const r = document.getElementById('pwLen');
      r.addEventListener('input', () => document.getElementById('pwLenVal').textContent = r.value + ' karakter');
    }, 50);
  }
  else if (id === 'morse') {
    area.innerHTML = `
      <div class="tool-ui-info"><i class="fas fa-info-circle"></i> Konversi teks ↔ kode morse.</div>
      <div class="tool-tabs">
        <button class="tool-tab active" id="morseTabEnc" onclick="morseMode('enc')">Teks → Morse</button>
        <button class="tool-tab" id="morseTabDec" onclick="morseMode('dec')">Morse → Teks</button>
      </div>
      <label class="tool-ui-label" id="morseLabel">Teks Biasa</label>
      <textarea class="tool-ui-textarea" id="morseInput" placeholder="Contoh: HALO DUNIA"></textarea>
      <button class="tool-ui-btn" onclick="runMorse()"><i class="fas fa-exchange-alt"></i> Konversi</button>`;
  }
  else {
    area.innerHTML = `<div class="tool-ui-info"><i class="fas fa-tools"></i> Tool <strong>${escapeHtml(tool.name)}</strong> sedang dalam pengembangan.</div>`;
  }
}

// ============ TOOL RUNNERS ============
function showResult(html) {
  const r = document.getElementById('toolResult');
  r.classList.add('show');
  r.innerHTML = html;
}

function runIqc() {
  const text = document.getElementById('iqcText').value.trim();
  if (!text) return toast('Isi teks dulu!');
  const time = document.getElementById('iqcTime').value || '12:30';
  const batt = document.getElementById('iqcBatt').value || 65;
  const provider = document.getElementById('iqcProvider').value;
  const canvas = document.createElement('canvas');
  canvas.width = 720; canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0,0,0,1280);
  grad.addColorStop(0,'#0f172a'); grad.addColorStop(1,'#1e293b');
  ctx.fillStyle = grad; ctx.fillRect(0,0,720,1280);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(0,0,720,100);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 32px Poppins, Arial';
  ctx.textAlign = 'center'; ctx.fillText(time, 360, 50);
  ctx.font = '20px Poppins, Arial'; ctx.fillStyle = '#94a3b8';
  ctx.fillText(provider + ' • ' + batt + '%', 360, 80);
  ctx.fillStyle = '#2563eb'; ctx.beginPath();
  ctx.roundRect(60, 200, 600, 400, 30); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '28px Poppins, Arial';
  ctx.textAlign = 'left';
  wrapText(ctx, text, 100, 260, 520, 40);
  showResult(`<img src="${canvas.toDataURL('image/png')}">
    <a href="${canvas.toDataURL('image/png')}" download="iqc_${Date.now()}.png">
      <button class="tool-ui-btn secondary"><i class="fas fa-download"></i> Download</button>
    </a>`);
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + ' ';
    if (ctx.measureText(test).width > maxW && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineH;
    } else line = test;
  }
  ctx.fillText(line, x, y);
}

function runBrat() {
  const text = document.getElementById('bratText').value.trim();
  if (!text) return toast('Isi teks dulu!');
  const bg = document.getElementById('bratBg').value;
  const fg = document.getElementById('bratFg').value;
  const size = parseInt(document.getElementById('bratSize').value) || 48;
  const canvas = document.createElement('canvas');
  canvas.width = 600; canvas.height = 600;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0,0,600,600);
  ctx.fillStyle = fg; ctx.font = 'bold ' + size + 'px Poppins, Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const words = text.split(' ');
  const lines = []; let i = 0;
  while (i < words.length) {
    let line = '';
    while (i < words.length && (line + words[i]).length < 16) {
      line += (line ? ' ' : '') + words[i]; i++;
    }
    if (line) lines.push(line);
  }
  let y = 300 - (lines.length - 1) * (size * 0.6);
  lines.forEach(l => { ctx.fillText(l, 300, y); y += size * 1.2; });
  showResult(`<img src="${canvas.toDataURL('image/png')}">
    <a href="${canvas.toDataURL('image/png')}" download="brat_${Date.now()}.png">
      <button class="tool-ui-btn secondary"><i class="fas fa-download"></i> Download</button>
    </a>`);
}

function runFakeIg() {
  const user = document.getElementById('igUser').value.trim() || 'user';
  const caption = document.getElementById('igCaption').value.trim() || '...';
  const likes = document.getElementById('igLikes').value || '0';
  const canvas = document.createElement('canvas');
  canvas.width = 600; canvas.height = 750;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,600,750);
  ctx.fillStyle = '#000'; ctx.fillRect(0,0,600,70);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Poppins, Arial';
  ctx.fillText('Instagram', 30, 45);
  ctx.fillStyle = '#000'; ctx.font = 'bold 22px Poppins, Arial';
  ctx.fillText(user, 30, 115);
  ctx.fillStyle = '#dbdbdb'; ctx.fillRect(0, 130, 600, 400);
  ctx.fillStyle = '#888'; ctx.font = '20px Poppins, Arial';
  ctx.textAlign = 'center'; ctx.fillText('[ Foto Postingan ]', 300, 340);
  ctx.textAlign = 'left'; ctx.fillStyle = '#000';
  ctx.font = 'bold 22px Poppins, Arial';
  ctx.fillText('❤ ' + likes + ' likes', 30, 570);
  ctx.font = '20px Poppins, Arial';
  ctx.fillStyle = '#333';
  ctx.fillText(user + '  ', 30, 610);
  ctx.fillStyle = '#666';
  wrapText(ctx, caption, 30, 640, 540, 26);
  showResult(`<img src="${canvas.toDataURL('image/png')}">
    <a href="${canvas.toDataURL('image/png')}" download="fakeig_${Date.now()}.png">
      <button class="tool-ui-btn secondary"><i class="fas fa-download"></i> Download</button>
    </a>`);
}

function runQr() {
  const text = document.getElementById('qrText').value.trim();
  if (!text) return toast('Isi teks dulu!');
  const size = document.getElementById('qrSize').value || 400;
  const url = `https://quickchart.io/qr?text=${encodeURIComponent(text)}&size=${size}`;
  showResult(`<img src="${url}" crossorigin="anonymous">
    <a href="${url}" target="_blank">
      <button class="tool-ui-btn secondary"><i class="fas fa-download"></i> Buka / Download</button>
    </a>`);
}

function calcInsert(t) {
  const i = document.getElementById('calcInput');
  i.value += t;
  i.focus();
}

function runCalc() {
  const input = document.getElementById('calcInput').value.trim();
  if (!input) return toast('Isi ekspresi dulu!');
  try {
    const res = Function('"use strict"; return (' + input + ')')();
    showResult(`<div style="text-align:center;padding:20px;font-size:32px;font-weight:900;color:var(--primary-light);font-family:'Orbitron',monospace;">= ${res}</div>`);
  } catch(e) {
    showResult(`<div style="color:#dc2626;text-align:center;padding:20px;">❌ Format tidak valid</div>`);
  }
}

function runPwGen() {
  const len = parseInt(document.getElementById('pwLen').value);
  const up = document.getElementById('pwUpper').checked;
  const lo = document.getElementById('pwLower').checked;
  const nu = document.getElementById('pwNum').checked;
  const sy = document.getElementById('pwSym').checked;
  let pool = '';
  if (up) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lo) pool += 'abcdefghijklmnopqrstuvwxyz';
  if (nu) pool += '0123456789';
  if (sy) pool += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!pool) return toast('Pilih minimal 1 tipe karakter!');
  let out = '';
  for (let i = 0; i < len; i++) out += pool.charAt(Math.floor(Math.random() * pool.length));
  showResult(`<input type="text" class="tool-ui-input" readonly value="${out}" style="text-align:center;font-family:monospace;font-size:16px;">
    <button class="tool-ui-btn secondary" onclick="navigator.clipboard.writeText('${out}');toast('Disalin!');"><i class="fas fa-copy"></i> Salin</button>`);
}

let morseModeType = 'enc';
function morseMode(m) {
  morseModeType = m;
  document.getElementById('morseTabEnc').classList.toggle('active', m === 'enc');
  document.getElementById('morseTabDec').classList.toggle('active', m === 'dec');
  document.getElementById('morseLabel').textContent = m === 'enc' ? 'Teks Biasa' : 'Kode Morse';
  document.getElementById('morseInput').placeholder = m === 'enc' ? 'Contoh: HALO DUNIA' : 'Contoh: .... .- .-.. --- / -.. ..- -. .. .-';
}

const MORSE_DICT = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','0':'-----',' ':'/'};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE_DICT).map(([k,v])=>[v,k]));

function runMorse() {
  const input = document.getElementById('morseInput').value.trim();
  if (!input) return toast('Isi input dulu!');
  let out = '';
  if (morseModeType === 'enc') {
    out = input.toUpperCase().split('').map(c => MORSE_DICT[c] || c).join(' ');
  } else {
    out = input.split(/\s+/).map(c => MORSE_REV[c] || '').join('');
  }
  showResult(`<div style="padding:16px;background:rgba(0,0,0,0.2);border-radius:10px;font-family:monospace;font-size:16px;color:var(--primary-light);word-wrap:break-word;">${escapeHtml(out)}</div>
    <button class="tool-ui-btn secondary" onclick="navigator.clipboard.writeText('${out.replace(/'/g,"\\'")}');toast('Disalin!');"><i class="fas fa-copy"></i> Salin</button>`);
}

// =========================================================
// REQUEST
// =========================================================
async function submitRequest() {
  const name = document.getElementById('reqName').value.trim();
  const desc = document.getElementById('reqDesc').value.trim();
  const url = document.getElementById('reqUrl').value.trim();
  const cat = document.getElementById('reqCategory').value;
  if (!name) return toast('Nama website wajib!');
  if (!url) return toast('URL webview wajib!');
  if (!/^https?:\/\//.test(url)) return toast('URL harus http:// atau https://');
  const user = localStorage.getItem('kaze_session') || 'anonymous';
  try {
    await sbFetch('kaze_requests', {
      method: 'POST',
      body: { name, description: desc, url, category: cat, status: 'pending', requester: user }
    });
    toast('✅ Request terkirim! Tunggu admin accept.');
    document.getElementById('reqName').value = '';
    document.getElementById('reqDesc').value = '';
    document.getElementById('reqUrl').value = '';
  } catch(e) {
    toast('❌ Gagal kirim: ' + e.message);
  }
}

// =========================================================
// NAV
// =========================================================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.bottom-nav .nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.bottom-nav .nav-item[data-page="${id}"]`)?.classList.add('active');
  document.querySelectorAll('.sidebar .sb-item').forEach(s => s.classList.remove('active'));
  document.querySelector(`.sidebar .sb-item[data-page="${id}"]`)?.classList.add('active');
  document.querySelectorAll('.header-nav a').forEach(a => a.classList.remove('active'));
  const map = { homePage:'navHome', toolsPage:'navTools', profilePage:'navProfile', chatPage:'navChat' };
  if (map[id]) document.getElementById(map[id])?.classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sbOverlay').classList.remove('show');
  if (id === 'homePage') renderPopular();
  if (id === 'chatPage') loadChatMessages();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sbOverlay').classList.toggle('show');
}

document.querySelectorAll('.sidebar .sb-item[data-page]').forEach(el => {
  el.addEventListener('click', function() { showPage(this.dataset.page); });
});
document.querySelectorAll('.bottom-nav .nav-item[data-page]').forEach(el => {
  el.addEventListener('click', function() { showPage(this.dataset.page); });
});
document.getElementById('sbOverlay').addEventListener('click', toggleSidebar);

document.querySelectorAll('.category-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    renderCategory(this.dataset.category);
    document.getElementById('searchInput').value = '';
  });
});

document.getElementById('searchInput').addEventListener('input', function() {
  const q = this.value.toLowerCase().trim();
  document.querySelectorAll('.tools-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(q) ? 'flex' : 'none';
  });
});

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('searchInput').focus();
  }
  if (e.key === 'Escape') {
    if (document.getElementById('previewOverlay').classList.contains('active')) closePreview();
    else closeTool();
  }
});

document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
document.getElementById('chatInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') sendChatMessage();
});

document.getElementById('toolViewer').addEventListener('click', function(e) {
  if (e.target === this) closeTool();
});

// INFO
function openInfo() {
  document.getElementById('infoOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeInfo() {
  document.getElementById('infoOverlay').classList.remove('active');
  document.body.style.overflow = '';
}
document.getElementById('infoOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeInfo();
});

// =========================================================
// UTILITY
// =========================================================
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[s] || s);
}

// =========================================================
// ANTI INSPECT
// =========================================================
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', function(e) {
  const k = e.key;
  const blocked = k === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(k.toUpperCase())) ||
    (e.ctrlKey && k.toUpperCase() === 'U') ||
    (e.metaKey && e.altKey && ['I','J','C'].includes(k.toUpperCase()));
  if (blocked) { e.preventDefault(); e.stopPropagation(); }
}, true);

console.log('✦ All Tools Kaze Online ✦');
