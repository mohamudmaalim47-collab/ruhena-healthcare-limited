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
  if (!r.ok) { const e = await r.text(); throw new Error(e); }
  const txt = await r.text();
  return txt ? JSON.parse(txt) : [];
}

async function sbGet(table, extra = '') {
  return sbFetch(table + '?order=added_at.desc&limit=2000' + extra);
}
async function sbInsert(table, row) { return sbFetch(table, 'POST', row); }
async function sbUpdate(table, id, data) { return sbFetch(table + '?id=eq.' + id, 'PATCH', data); }
async function sbDelete(table, id) { return sbFetch(table + '?id=eq.' + id, 'DELETE'); }

// ── SESSION ───────────────────────────────────────────────────
const PINS = { salesperson: 'Ruhena@2030', owner1: 'Abuu@2025', owner2: 'Bush@2020' };

function getSession() {
  try { return JSON.parse(sessionStorage.getItem('rhl_session')); } catch { return null; }
}
function setSession(role, name) {
  sessionStorage.setItem('rhl_session', JSON.stringify({ role, name }));
}
function requireAuth() {
  const s = getSession();
  if (!s) { window.location.href = 'index.html'; return null; }
  return s;
}
function isOwner() {
  const s = getSession();
  return s && (s.role === 'owner1' || s.role === 'owner2');
}
function logout() {
  sessionStorage.removeItem('rhl_session');
  window.location.href = 'index.html';
}

// ── UTILS ─────────────────────────────────────────────────────
function uid() { return Date.now() + Math.random().toString(36).slice(2, 6); }
function fmtKSh(n) { return 'KSh ' + Number(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 }); }
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function monthStr() { return new Date().toISOString().slice(0, 7); }

// ── TOAST NOTIFICATIONS ───────────────────────────────────────
function toast(msg, type = 'success') {
  const colors = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b' };
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:8px;
    background:${colors[type]};color:#fff;font-family:'Outfit',sans-serif;font-size:14px;
    font-weight:500;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.3);
    animation:slideIn .3s ease;max-width:320px;`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
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

// ── NAV BUILDER ───────────────────────────────────────────────
function buildNav(activePage) {
  const s = getSession();
  if (!s) return;
  const pages = [
    { id: 'dashboard', label: '📊 Dashboard', href: 'dashboard.html' },
    { id: 'sales', label: '💰 Daily Sales', href: 'sales.html' },
    { id: 'debts', label: '💳 Debts', href: 'debts.html' },
    { id: 'inventory', label: '📦 Inventory', href: 'inventory.html' },
    { id: 'orders', label: '🚚 Orders', href: 'orders.html' },
    { id: 'b2b', label: '🏢 B2B', href: 'b2b.html' },
    { id: 'expenses', label: '💸 Expenses', href: 'expenses.html' },
    { id: 'reports', label: '📈 Reports', href: 'reports.html' },
  ];
  const navEl = document.getElementById('nav-tabs');
  if (!navEl) return;
  navEl.innerHTML = pages.map(p =>
    `<a class="nav-tab${p.id === activePage ? ' active' : ''}" href="${p.href}">${p.label}</a>`
  ).join('');
  const badge = document.getElementById('role-badge');
  if (badge) {
    badge.textContent = s.name;
    badge.className = 'role-badge ' + (isOwner() ? 'role-owner' : 'role-salesperson');
  }
  const dateEl = document.getElementById('topbar-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

// ── MODAL HELPERS ─────────────────────────────────────────────
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});
