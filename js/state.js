/* ═══════════════════════════════════════════
   STATE, DB & UTILS — state.js
═══════════════════════════════════════════ */

// ── Simulated DB (localStorage) ──
const DB = {
  users: JSON.parse(localStorage.getItem('ss_users') || '[]'),
  save()          { localStorage.setItem('ss_users', JSON.stringify(this.users)); },
  find(code, pass){ return this.users.find(u => u.code === code && u.password === pass); },
  findByCode(code){ return this.users.find(u => u.code === code); },
  update(user)    {
    const idx = this.users.findIndex(u => u.code === user.code);
    if (idx !== -1) { this.users[idx] = user; this.save(); }
  }
};

// ── Session ──
let currentUser = JSON.parse(localStorage.getItem('ss_current') || 'null');

function saveSession(user) {
  currentUser = user;
  localStorage.setItem('ss_current', JSON.stringify(user));
}
function clearSession() {
  currentUser = null;
  localStorage.removeItem('ss_current');
}

// ── Helpers ──
function getInitials(name) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
