/* ═══════════════════════════════════════════
   DASHBOARD — dashboard.js
═══════════════════════════════════════════ */

let chartLine  = null;
let chartDough = null;

// ── Init dashboard after login ──
function initDashboard() {
  if (!currentUser) { goTo('auth', 'login'); return; }
  const u  = currentUser;
  const av = AVATARS[u.avatar || 0];

  // Header chip
  document.getElementById('chipAv').textContent        = av.icon;
  document.getElementById('chipAv').style.background   = av.bg;
  document.getElementById('chipName').textContent      = u.name;
  document.getElementById('chipCode').textContent      = u.code;

  // Welcome banner
  document.getElementById('wbTitle').textContent   = `¡Hola, ${u.name.split(' ')[0]}! 👋`;
  document.getElementById('wbCredits').textContent = u.credits;

  // Stats
  document.getElementById('statRating').textContent = u.rating.toFixed(1);
  document.getElementById('statDone').textContent   = u.completedTasks;

  // Skills tags
  const sw = document.getElementById('dashSkills');
  sw.innerHTML = '';
  u.skills.forEach(s => {
    const t = document.createElement('span');
    t.className   = 's-tag';
    t.textContent = s;
    sw.appendChild(t);
  });

  setTimeout(initCharts, 100);
  updateLiveBadge('dashboard');
}

// ── Charts ──
function getChartColors() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    grid: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    text: dark ? '#A0A0C0' : '#737373',
  };
}

function initCharts() {
  const c    = getChartColors();
  const ctxL = document.getElementById('chartLine');
  const ctxD = document.getElementById('chartDough');
  if (!ctxL || !ctxD) return;

  if (chartLine)  { chartLine.destroy();  chartLine  = null; }
  if (chartDough) { chartDough.destroy(); chartDough = null; }

  chartLine = new Chart(ctxL, {
    type: 'line',
    data: {
      labels: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],
      datasets: [{
        label: 'Créditos',
        data: [100, 115, 108, 130, 125, 145, 160],
        borderColor: '#A78BFA',
        backgroundColor: 'rgba(167,139,250,0.12)',
        fill: true, tension: 0.4,
        pointBackgroundColor: '#A78BFA',
        pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: c.grid }, ticks: { color: c.text } },
        y: { grid: { color: c.grid }, ticks: { color: c.text } },
      },
    },
  });

  const skills = currentUser ? currentUser.skills.slice(0, 4) : ['Diseño','Código','Marketing','Otros'];
  chartDough = new Chart(ctxD, {
    type: 'doughnut',
    data: {
      labels: skills,
      datasets: [{
        data: skills.map(() => Math.floor(Math.random() * 30 + 10)),
        backgroundColor: [
          'rgba(167,139,250,0.8)', 'rgba(96,165,250,0.8)',
          'rgba(52,211,153,0.8)',  'rgba(245,158,11,0.8)',
        ],
        borderWidth: 0, hoverOffset: 8,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: c.text, padding: 12, font: { size: 12 } } },
      },
    },
  });
}

function updateCharts() { setTimeout(initCharts, 100); }

// ── Marketplace ──
function renderMarketplace() {
  const grid = document.getElementById('mktGrid');
  grid.innerHTML = '';
  SERVICES.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'svc-card';
    card.style.animationDelay = (i * 0.07) + 's';
    card.innerHTML = `
      <div class="svc-head">
        <div class="svc-av" style="background:${s.bg}">${s.initials}</div>
        <div>
          <div class="svc-name">${s.name}</div>
          <div class="svc-stars">⭐ ${s.rating}</div>
        </div>
      </div>
      <div class="svc-title">${s.title}</div>
      <div class="svc-desc">${s.desc}</div>
      <div class="svc-tags">${s.tags.map(t => `<span class="svc-tag">${t}</span>`).join('')}</div>
      <div class="svc-foot">
        <div class="svc-price">${s.price} CH</div>
        <button class="btn btn-primary btn-sm" onclick="requestService('${s.name}',${s.price})">Solicitar</button>
      </div>`;
    grid.appendChild(card);
  });
}

function requestService(name, price) {
  if (!currentUser) return;
  if (currentUser.credits < price) {
    pushNotif('⚠️', 'Sin créditos', 'No tienes suficientes créditos CH.', '#FEF3C7');
    return;
  }
  currentUser.credits -= price;
  DB.update(currentUser);
  saveSession(currentUser);
  document.getElementById('wbCredits').textContent = currentUser.credits;
  pushNotif('🤝', 'Solicitud enviada', `Tu solicitud a ${name} fue enviada. Los ${price} CH están en escrow.`, '#D1FAE5');
}

// ── Social Feed ──
function renderFeed() {
  const list = document.getElementById('feedList');
  list.innerHTML = '';
  POSTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'post-card';
    const ach = p.achievement
      ? `<div class="post-achievement">
           <div class="post-achievement-icon">${p.achievement.icon}</div>
           <div class="post-achievement-text">${p.achievement.text}</div>
         </div>`
      : '';
    card.innerHTML = `
      <div class="post-head">
        <div class="post-av" style="background:${p.bg}">${p.av}</div>
        <div>
          <div class="post-author">${p.author}</div>
          <div class="post-role">${p.role}</div>
        </div>
        <div class="post-time">${p.time}</div>
      </div>
      <div class="post-body">${p.body}</div>
      ${ach}
      <div class="post-actions">
        <button class="post-action" onclick="likePost(this,${p.likes})">❤️ <span>${p.likes}</span></button>
        <button class="post-action">💬 ${p.comments} comentarios</button>
        <button class="post-action">↗️ Compartir</button>
      </div>`;
    list.appendChild(card);
  });
}

function likePost(btn, current) {
  const span = btn.querySelector('span');
  if (btn.dataset.liked) {
    span.textContent = current;
    delete btn.dataset.liked;
  } else {
    span.textContent = current + 1;
    btn.dataset.liked = '1';
  }
}

// ── Profile ──
function renderProfile() {
  if (!currentUser) return;
  const u  = currentUser;
  const av = AVATARS[u.avatar || 0];

  document.getElementById('profAv').textContent      = av.icon;
  document.getElementById('profAv').style.background = av.bg;
  document.getElementById('profName').textContent    = u.name;
  document.getElementById('profCode').textContent    = u.code;
  document.getElementById('profCreds').textContent   = u.credits;
  document.getElementById('profDone').textContent    = u.completedTasks;

  document.getElementById('profSkills').innerHTML =
    u.skills.map(s => `<span class="s-tag">${s}</span>`).join('');

  document.getElementById('tlList').innerHTML =
    TIMELINE.map(t => `
      <div class="tl-item">
        <div class="tl-dot">${t.icon}</div>
        <div class="tl-content">
          <div class="tl-event">${t.event}</div>
          <div class="tl-date">${t.date}</div>
          ${t.badge ? `<span class="tl-badge">${t.badge}</span>` : ''}
        </div>
      </div>`).join('');
}
