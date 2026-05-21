/* ═══════════════════════════════════════════
   THEME & LIVE COUNTERS — theme.js
═══════════════════════════════════════════ */

// ── Dark / Light toggle ──
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('themeIcon').textContent = isDark ? '🌙' : '☀️';
  if (typeof chartLine !== 'undefined' && chartLine) updateCharts();
}

// ── Live badge visibility ──
function updateLiveBadge(screen) {
  document.getElementById('liveBadge').classList.toggle('show', screen === 'dashboard');
}

// ── Randomly update "online" counters ──
function startLiveCounters() {
  setInterval(() => {
    const v1 = 520 + Math.floor(Math.random() * 10);
    const v2 = 15  + Math.floor(Math.random() * 8);
    document.getElementById('liveCount').textContent     = v1;
    document.getElementById('liveExchanges').textContent = v2;
    const sb = document.getElementById('sbLiveCount');
    if (sb) sb.textContent = v1;
  }, 3500);
}

// ── Animate stat counters in the hero ──
function animateCounters() {
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = target === 95 ? '+' : '+';
    let current  = 0;
    const inc    = target / 60;
    const timer  = setInterval(() => {
      current += inc;
      if (current >= target) {
        el.textContent = target + suffix;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current) + suffix;
      }
    }, 16);
  });
}
