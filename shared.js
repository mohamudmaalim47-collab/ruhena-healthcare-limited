// ── FIREBASE CONFIG ──────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyADdtp6PX3o7JlOTzrL7cSvBEBtI794kCM",
  authDomain: "ruhena.firebaseapp.com",
  projectId: "ruhena",
  storageBucket: "ruhena.firebasestorage.app",
  messagingSenderId: "42209543036",
  appId: "1:42209543036:web:43d230afe12883935d1af9",
  measurementId: "G-M2PVRPF2XV"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ── HELPERS ────────────────────────────────────────────────────
function parseVal(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  const n = Number(val);
  if (!isNaN(n) && val !== '') return n;
  return val;
}
function parseQs(qs) {
  const p = new URLSearchParams(qs || '');
  const filters = [], order = []; let limit = 0, isCount = false;
  for (const [k, v] of p) {
    if (k === 'order') { const [f, d] = v.split('.'); order.push({ field: f, dir: d === 'desc' ? 'desc' : 'asc' }); }
    else if (k === 'limit') limit = parseInt(v);
    else if (k === 'select' && v === 'count') isCount = true;
    else { const dot = v.indexOf('.'); if (dot > 0) filters.push({ field: k, op: v.slice(0, dot), val: parseVal(v.slice(dot + 1)) }); }
  }
  return { filters, order, limit, isCount };
}
function buildQuery(table, qs) {
  const { filters, order, limit } = parseQs(qs);
  let ref = db.collection(table);
  filters.forEach(f => {
    switch (f.op) {
      case 'eq': ref = ref.where(f.field, '==', f.val); break;
      case 'neq': ref = ref.where(f.field, '!=', f.val); break;
      case 'gt': ref = ref.where(f.field, '>', f.val); break;
      case 'gte': ref = ref.where(f.field, '>=', f.val); break;
      case 'lt': ref = ref.where(f.field, '<', f.val); break;
      case 'lte': ref = ref.where(f.field, '<=', f.val); break;
      case 'like': 
        const p = (f.val || '').replace(/\*/g, '');
        ref = ref.where(f.field, '>=', p).where(f.field, '<=', p + '\uf8ff'); break;
    }
  });
  order.forEach(o => ref = ref.orderBy(o.field, o.dir));
  if (limit) ref = ref.limit(limit);
  return ref.get();
}
async function sbFetch(path, method = 'GET', body = null) {
  const [base, qs] = path.split('?');
  const table = base;
  if (method === 'POST') {
    const id = body && body.id ? body.id : uid();
    await db.collection(table).doc(String(id)).set({ ...(body || {}), id: String(id) });
    return [{ ...(body || {}), id: String(id) }];
  }
  if (method === 'PATCH') {
    const id = (qs || '').replace(/^id=eq\./, '');
    if (id) { await db.collection(table).doc(id).update(body); return [{ ...body, id }]; }
    return [];
  }
  if (method === 'DELETE') {
    const param = qs || '';
    if (param.startsWith('id=eq.')) {
      await db.collection(table).doc(param.replace('id=eq.', '')).delete();
    } else if (param.startsWith('id=neq.')) {
      const snap = await db.collection(table).get();
      if (!snap.empty) { const b = db.batch(); snap.docs.forEach(d => b.delete(d.ref)); await b.commit(); }
    }
    return [];
  }
  const { isCount } = parseQs(qs);
  const snap = await buildQuery(table, qs);
  if (snap.empty) return [];
  if (isCount) return [{ count: snap.size }];
  return snap.docs.map(d => d.data());
}
async function sbInsert(table, row) { return sbFetch(table, 'POST', row); }
async function sbUpdate(table, id, data) { return sbFetch(table + '?id=eq.' + id, 'PATCH', data); }
async function sbDelete(table, id) { return sbFetch(table + '?id=eq.' + id, 'DELETE'); }

// ── AUTH — Firebase Email/Password ────────────────────────────
async function loginWithEmail(email, password) {
  const cred = await auth.signInWithEmailAndPassword(email, password);
  const userDoc = await db.collection('users').doc(cred.user.uid).get();
  if (!userDoc.exists) throw new Error('User profile not found');
  const profile = userDoc.data();
  if (!profile.active) throw new Error('Account is disabled');
  return { id: cred.user.uid, email: cred.user.email, ...profile };
}
async function createAuthUser(email, password, profile) {
  const res = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + firebaseConfig.apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to create user');
  await db.collection('users').doc(data.localId).set({ id: data.localId, email, ...profile, created_at: new Date().toISOString() });
  return data.localId;
}
function getCurrentUser() { return auth.currentUser; }
async function signOut() {
  await auth.signOut();
  sessionStorage.removeItem('rhl_session');
  window.location.href = 'index.html';
}
async function checkHasUsers() {
  const snap = await db.collection('users').limit(1).get();
  return !snap.empty;
}

auth.onAuthStateChanged(user => {
  if (user) {
    const existing = getSession();
    if (!existing) {
      db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists) {
          const p = doc.data();
          setSession({ id: user.uid, name: p.name, email: user.email, role: p.role });
        }
      });
    }
  }
});

// ── SESSION ───────────────────────────────────────────────────
function getSession() {
  try { return JSON.parse(sessionStorage.getItem('rhl_session')); }
  catch { return null; }
}
function setSession(user) {
  sessionStorage.setItem('rhl_session', JSON.stringify({
    id: user.id, name: user.name, email: user.email, role: user.role
  }));
}
function requireAuth() {
  const s = getSession();
  if (!s) { window.location.href = 'index.html'; return null; }
  return s;
}
function isOwner() { const s = getSession(); return s && (s.role === 'owner' || s.role === 'admin'); }
function isSalesperson() { const s = getSession(); return s && (s.role === 'salesperson' || s.role === 'sales'); }
function logout() {
  auth.signOut().catch(() => {});
  sessionStorage.removeItem('rhl_session');
  window.location.href = 'index.html';
}

// ── UTILS ─────────────────────────────────────────────────────
function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
function fmtKSh(n) { const num = Number(n || 0); if (num >= 1000000) return 'KSh ' + (num / 1000000).toFixed(1) + 'M'; return 'KSh ' + num.toLocaleString('en-KE', { minimumFractionDigits: 0 }); }
function fmtDate(d) { if (!d) return '—'; const dt = new Date(d + 'T00:00:00'); return dt.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function monthStr() { return new Date().toISOString().slice(0, 7); }

// ── TOAST ─────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const colors = { success: 'linear-gradient(135deg,#00d68f,#00b377)', error: 'linear-gradient(135deg,#ff4757,#e84057)', warning: 'linear-gradient(135deg,#ffa502,#e6930a)', info: 'linear-gradient(135deg,#2979ff,#1a56db)' };
  document.querySelectorAll('.rhl-toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'rhl-toast';
  t.style.cssText = `position:fixed;bottom:24px;right:24px;padding:14px 20px;border-radius:10px;background:${colors[type]};color:#fff;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,0.4);animation:slideIn .3s ease;max-width:340px;display:flex;align-items:center;gap:10px;cursor:pointer;`;
  t.innerHTML = `<span style="font-size:16px">${icons[type]}</span><span>${msg}</span>`;
  t.onclick = () => t.remove();
  document.body.appendChild(t);
  setTimeout(() => { if (t.parentNode) { t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300); } }, 3500);
}

// ── LOADER ────────────────────────────────────────────────────
function showLoader(msg = 'Loading...') {
  let el = document.getElementById('_rhl_loader');
  if (!el) {
    el = document.createElement('div'); el.id = '_rhl_loader';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(10,13,20,0.75);backdrop-filter:blur(4px);z-index:9998;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;';
    el.innerHTML = `<div style="width:44px;height:44px;border:3px solid #232d45;border-top-color:#00d68f;border-radius:50%;animation:spin .7s linear infinite;"></div><div id="_rhl_loader_msg" style="color:#8892b0;font-family:'Inter',sans-serif;font-size:14px;">${msg}</div>`;
    document.body.appendChild(el);
  } else { const m = document.getElementById('_rhl_loader_msg'); if (m) m.textContent = msg; el.style.display = 'flex'; }
}
function hideLoader() { const el = document.getElementById('_rhl_loader'); if (el) el.style.display = 'none'; }

// ── THEME ─────────────────────────────────────────────────────
function applyTheme() {
  if (localStorage.getItem('rhl_theme') === 'dark') {
    document.body.classList.add('dark-mode');
    document.querySelectorAll('.theme-btn').forEach(b => { if (b.tagName === 'BUTTON') b.textContent = '☀️'; });
  }
}
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  document.querySelectorAll('.theme-btn').forEach(b => { if (b.tagName === 'BUTTON') b.textContent = isDark ? '☀️' : '🌙'; });
  localStorage.setItem('rhl_theme', isDark ? 'dark' : 'light');
}

// ── DRAWER NAV ────────────────────────────────────────────────
function buildDrawerNav(activePage) {
  const s = getSession();
  if (!s) return;

  const pages = [
    { id: 'dashboard',     icon: '<i class="bi bi-speedometer2"></i>', label: 'Dashboard',     href: 'dashboard.html' },
    { id: 'pos',           icon: '<i class="bi bi-cash-coin"></i>',    label: 'POS',           href: 'pos.html' },
    { id: 'sales',         icon: '<i class="bi bi-receipt"></i>',      label: 'Sales',         href: 'sales.html' },
    { id: 'inventory',     icon: '<i class="bi bi-box-seam"></i>',     label: 'Inventory',     href: 'inventory.html' },
    { id: 'prescriptions', icon: '<i class="bi bi-file-text"></i>',    label: 'Prescriptions', href: 'prescriptions.html' },
    { id: 'receipts',      icon: '<i class="bi bi-receipt-cutoff"></i>', label: 'Receipts',   href: 'receipts.html' },
    { id: 'orders',        icon: '<i class="bi bi-truck"></i>',        label: 'Orders',        href: 'orders.html' },
    { id: 'suppliers',     icon: '<i class="bi bi-buildings"></i>',    label: 'Suppliers',     href: 'suppliers.html' },
    { id: 'debts',         icon: '<i class="bi bi-credit-card"></i>',  label: 'Debts',         href: 'debts.html' },
    { id: 'insurance',     icon: '<i class="bi bi-hospital"></i>',     label: 'Insurance',     href: 'insurance.html' },
    { id: 'b2b',           icon: '<i class="bi bi-building"></i>',     label: 'B2B',           href: 'b2b.html' },
    { id: 'expenses',      icon: '<i class="bi bi-cash-stack"></i>',   label: 'Expenses',      href: 'expenses.html' },
    { id: 'reports',       icon: '<i class="bi bi-bar-chart-line-fill"></i>', label: 'Reports', href: 'reports.html' },
    { id: 'analytics',     icon: '<i class="bi bi-graph-up-arrow"></i>', label: 'Analytics',  href: 'analytics.html' },
  ];
  const ownerPages = [
    { id: 'users',     icon: '<i class="bi bi-people"></i>',      label: 'Users',     href: 'users.html' },
    { id: 'branches',  icon: '<i class="bi bi-shop"></i>',        label: 'Branches',  href: 'branches.html' },
    { id: 'shifts',    icon: '<i class="bi bi-clock-history"></i>', label: 'Shifts',  href: 'shifts.html' },
    { id: 'settings',  icon: '<i class="bi bi-gear"></i>',         label: 'Settings', href: 'settings.html' },
  ];

  const navEl = document.getElementById('drawer-nav');
  const avatarEl = document.getElementById('drawer-avatar');
  const nameEl = document.getElementById('drawer-name');
  const roleEl = document.getElementById('drawer-role');

  if (avatarEl) avatarEl.textContent = s.name.charAt(0).toUpperCase();
  if (nameEl) nameEl.textContent = s.name;
  if (roleEl) roleEl.textContent = isOwner() ? 'Owner / Admin' : 'Sales Staff';

  if (!navEl) return;

  let html = '<div class="drawer-nav-group">';
  pages.forEach(p => {
    const isActive = p.id === activePage;
    html += `<a class="drawer-nav-item${isActive ? ' active' : ''}" href="${p.href}"><span class="nav-icon">${p.icon}</span>${p.label}</a>`;
  });
  html += '</div>';

  if (isOwner()) {
    html += '<div class="drawer-nav-divider"></div><div class="drawer-nav-group">';
    ownerPages.forEach(p => {
      const isActive = p.id === activePage;
      html += `<a class="drawer-nav-item${isActive ? ' active' : ''}" href="${p.href}"><span class="nav-icon">${p.icon}</span>${p.label}</a>`;
    });
    html += '</div>';
  }
  navEl.innerHTML = html;

  // Badge on topbar
  const badge = document.getElementById('role-badge');
  if (badge) { badge.textContent = s.name; badge.className = 'role-badge ' + (isOwner() ? 'admin' : 'sales'); }

  // Date
  const dateEl = document.getElementById('topbar-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

// ── DRAWER TOGGLE ──
function toggleDrawer() {
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (drawer) drawer.classList.toggle('open');
  if (overlay) overlay.classList.toggle('visible');
}
function closeDrawer() {
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('visible');
}

// ── MODALS ────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
document.addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open')); });
