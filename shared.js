// ── SUPABASE CONFIG ──────────────────────────────────────────
const SB_URL = 'https://chgqixqriqqriwbrmogm.supabase.co';
const SB_KEY = 'sb_publishable_2XECwfPm0YXJoQXb6ITuzQ_o6sBY10a';

async function sbFetch(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SB_KEY,
      'Authorization': 'Bearer ' + SB_KEY,
      'Prefer': 'return=representation'
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(SB_URL + '/rest/v1/' + path, opts);
  if (!r.ok) {
    const e = await r.text();
    console.error('Supabase error on ' + path + ':', e);
    throw new Error(e);
  }
  const txt = await r.text();
  return txt ? JSON.parse(txt) : [];
}

async function sbInsert(table, row) { return sbFetch(table, 'POST', row); }
async function sbUpdate(table, id, data) { return sbFetch(table + '?id=eq.' + id, 'PATCH', data); }
async function sbDelete(table, id) { return sbFetch(table + '?id=eq.' + id, 'DELETE'); }

// ── AUTH — reads from Supabase users table ────────────────────
async function loginWithPin(username, pin) {
  const rows = await sbFetch(
    'users?username=eq.' + encodeURIComponent(username.trim()) +
    '&active=eq.true&limit=1'
  );
  if (!rows.length) return null;
  const user = rows[0];
  // Compare PIN directly (plain text — simple pharmacy system)
  if (user.pin !== pin.trim()) return null;
  return user; // { id, name, username, role, active }
}

async function checkHasUsers() {
  const rows = await sbFetch('users?limit=1');
  return rows.length > 0;
}

// ── SESSION ───────────────────────────────────────────────────
function getSession() {
  try { return JSON.parse(sessionStorage.getItem('rhl_session')); }
  catch { return null; }
}
function setSession(user) {
  sessionStorage.setItem('rhl_session', JSON.stringify({
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role
  }));
}
function requireAuth() {
  const s = getSession();
  if (!s) { window.location.href = '/index.html'; return null; }
  return s;
}
function isOwner() {
  const s = getSession();
  return s && s.role === 'owner';
}
function isSalesperson() {
  const s = getSession();
  return s && s.role === 'salesperson';
}
function logout() {
  sessionStorage.removeItem('rhl_session');
  window.location.href = '/index.html';
}

// ── UTILS ─────────────────────────────────────────────────────
function uid() { return Date.now() + Math.random().toString(36).slice(2, 6); }
function fmtKSh(n) {
  const num = Number(n || 0);
  if (num >= 1000000) return 'KSh ' + (num / 1000000).toFixed(1) + 'M';
  return 'KSh ' + num.toLocaleString('en-KE', { minimumFractionDigits: 0 });
}
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function monthStr() { return new Date().toISOString().slice(0, 7); }

// ── TOAST ─────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const colors = {
    success: 'linear-gradient(135deg,#00d68f,#00b377)',
    error: 'linear-gradient(135deg,#ff4757,#e84057)',
    warning: 'linear-gradient(135deg,#ffa502,#e6930a)',
    info: 'linear-gradient(135deg,#2979ff,#1a56db)'
  };
  document.querySelectorAll('.rhl-toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'rhl-toast';
  t.style.cssText = `position:fixed;bottom:24px;right:24px;padding:14px 20px;border-radius:10px;
    background:${colors[type]};color:#fff;font-family:'Inter',sans-serif;font-size:13px;
    font-weight:600;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,0.4);
    animation:slideIn .3s ease;max-width:340px;display:flex;align-items:center;gap:10px;cursor:pointer;`;
  t.innerHTML = `<span style="font-size:16px">${icons[type]}</span><span>${msg}</span>`;
  t.onclick = () => t.remove();
  document.body.appendChild(t);
  setTimeout(() => { if (t.parentNode) { t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300); } }, 3500);
}

// ── LOADER ────────────────────────────────────────────────────
function showLoader(msg = 'Loading...') {
  let el = document.getElementById('_rhl_loader');
  if (!el) {
    el = document.createElement('div');
    el.id = '_rhl_loader';
    el.style.cssText = `position:fixed;inset:0;background:rgba(10,13,20,0.75);backdrop-filter:blur(4px);
      z-index:9998;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;`;
    el.innerHTML = `<div style="width:44px;height:44px;border:3px solid #232d45;border-top-color:#00d68f;border-radius:50%;animation:spin .7s linear infinite;"></div>
      <div id="_rhl_loader_msg" style="color:#8892b0;font-family:'Inter',sans-serif;font-size:14px;">${msg}</div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
    document.body.appendChild(el);
  } else {
    const m = document.getElementById('_rhl_loader_msg');
    if (m) m.textContent = msg;
    el.style.display = 'flex';
  }
}
function hideLoader() {
  const el = document.getElementById('_rhl_loader');
  if (el) el.style.display = 'none';
}

// ── THEME ─────────────────────────────────────────────────────
function applyTheme() {
  if (localStorage.getItem('rhl_theme') === 'light') {
    document.body.classList.add('light-mode');
    document.querySelectorAll('.theme-btn').forEach(b => b.textContent = '☀️');
  }
}
function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  document.querySelectorAll('.theme-btn').forEach(b => b.textContent = isLight ? '☀️' : '🌙');
  localStorage.setItem('rhl_theme', isLight ? 'light' : 'dark');
}

// ── NAV ───────────────────────────────────────────────────────
function buildNav(activePage) {
  const s = getSession();
  if (!s) return;
  const pages = [
    { id: 'dashboard', label: '📊 Dashboard', href: '/dashboard.html' },
    { id: 'sales',     label: '💰 Sales',     href: '/sales.html' },
    { id: 'debts',     label: '💳 Debts',     href: '/debts.html' },
    { id: 'inventory', label: '📦 Inventory', href: '/inventory.html' },
    { id: 'orders',    label: '🚚 Orders',    href: '/orders.html' },
    { id: 'b2b',       label: '🏢 B2B',       href: '/b2b.html' },
    { id: 'expenses',  label: '💸 Expenses',  href: '/expenses.html' },
    { id: 'reports',   label: '📈 Reports',   href: '/reports.html' },
  ];
  // Owners also see user management
  if (isOwner()) {
    pages.push({ id: 'users', label: '👥 Users', href: '/users.html' });
  }
  const navEl = document.getElementById('nav-tabs');
  if (navEl) navEl.innerHTML = pages.map(p =>
    `<a class="nav-tab${p.id === activePage ? ' active' : ''}" href="${p.href}">${p.label}</a>`
  ).join('');
  const badge = document.getElementById('role-badge');
  if (badge) {
    badge.textContent = s.name;
    badge.className = 'role-badge ' + (isOwner() ? 'role-owner' : 'role-salesperson');
  }
  const dateEl = document.getElementById('topbar-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-KE', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
  });
}

// ── MODALS ────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape')
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});
