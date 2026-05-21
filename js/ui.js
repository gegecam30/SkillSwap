/* ═══════════════════════════════════════════
   UI FEATURES — ui.js
   Notificaciones, Logros, Onboarding, Demo
═══════════════════════════════════════════ */

// ─────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────
function pushNotif(icon, title, msg, bgColor) {
  const stack = document.getElementById('notifStack');
  const n     = document.createElement('div');
  n.className = 'notif';
  n.innerHTML = `
    <div class="notif-icon" style="background:${bgColor || 'var(--p-purple)'};font-size:22px;">${icon}</div>
    <div class="notif-body">
      <div class="notif-title">${title}</div>
      <div class="notif-msg">${msg}</div>
    </div>
    <button class="notif-close"
      onclick="this.parentElement.classList.remove('show');
               setTimeout(()=>this.parentElement.remove(),300);">✕</button>`;
  stack.appendChild(n);
  requestAnimationFrame(() => requestAnimationFrame(() => n.classList.add('show')));
  setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 400); }, 4500);
}

// ─────────────────────────────────────────
// ACHIEVEMENTS + CONFETTI
// ─────────────────────────────────────────
function showAchievement(emoji, title, sub) {
  document.getElementById('achieveEmoji').textContent = emoji;
  document.getElementById('achieveTitle').textContent = title;
  document.getElementById('achieveSub').textContent   = sub;
  document.getElementById('achievementOverlay').classList.add('show');
  launchConfetti();
}

function closeAchievement() {
  document.getElementById('achievementOverlay').classList.remove('show');
}

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx    = canvas.getContext('2d');
  const colors = ['#A78BFA','#EC4899','#60A5FA','#34D399','#F59E0B','#F97316'];
  const pieces = Array.from({ length: 120 }, () => ({
    x:    Math.random() * canvas.width,
    y:    -10,
    r:    Math.random() * 8 + 3,
    c:    colors[Math.floor(Math.random() * colors.length)],
    vx:   (Math.random() - 0.5) * 4,
    vy:   Math.random() * 3 + 2,
    rot:  Math.random() * 360,
    vrot: (Math.random() - 0.5) * 8,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
      p.x += p.vx; p.y += p.vy;
      p.rot += p.vrot; p.vy += 0.05;
    });
    if (++frame < 120) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

// ─────────────────────────────────────────
// ONBOARDING TOUR
// ─────────────────────────────────────────
let onboardStep = 0;

function startOnboarding() {
  onboardStep = 0;
  document.getElementById('onboardOverlay').style.display = 'block';
  renderOnboardStep();
}

function renderOnboardStep() {
  const step      = ONBOARD_STEPS[onboardStep];
  const el        = document.querySelector(step.el);
  if (!el) { endOnboarding(); return; }

  const rect      = el.getBoundingClientRect();
  const pad       = 12;
  const spotlight = document.getElementById('onboardSpotlight');
  spotlight.style.left   = (rect.left   - pad) + 'px';
  spotlight.style.top    = (rect.top    - pad) + 'px';
  spotlight.style.width  = (rect.width  + pad * 2) + 'px';
  spotlight.style.height = (rect.height + pad * 2) + 'px';

  document.getElementById('onboardStep').textContent  = `Paso ${onboardStep + 1} de ${ONBOARD_STEPS.length}`;
  document.getElementById('onboardTitle').textContent = step.title;
  document.getElementById('onboardDesc').textContent  = step.desc;

  // Position tip intelligently
  const tip   = document.getElementById('onboardTip');
  const tipW  = 300, tipH = 200;
  let   tx    = rect.left, ty = rect.bottom + 20;
  if (ty + tipH > window.innerHeight) ty = rect.top - tipH - 20;
  if (tx + tipW > window.innerWidth)  tx = window.innerWidth - tipW - 20;
  tip.style.left = Math.max(12, tx) + 'px';
  tip.style.top  = Math.max(12, ty) + 'px';

  // Progress dots
  document.getElementById('onboardDots').innerHTML =
    ONBOARD_STEPS.map((_, i) =>
      `<div class="onboard-dot${i === onboardStep ? ' active' : ''}"></div>`
    ).join('');

  document.querySelector('.btn-onboard-next').textContent =
    onboardStep === ONBOARD_STEPS.length - 1 ? '¡Entendido! ✓' : 'Siguiente →';
}

function nextOnboardStep() {
  if (onboardStep >= ONBOARD_STEPS.length - 1) { endOnboarding(); return; }
  onboardStep++;
  renderOnboardStep();
}

function endOnboarding() {
  document.getElementById('onboardOverlay').style.display = 'none';
}

// ─────────────────────────────────────────
// DEMO MODE
// ─────────────────────────────────────────
let demoInterval = null;
let demoIdx      = 0;

function startDemo() {
  if (demoInterval) return;
  document.getElementById('demoBanner').classList.add('show');
  pushNotif('▶️', 'Modo Demo activado', 'Simulando actividad de usuarios en tiempo real...', '#E9D5FF');
  demoIdx = 0;

  demoInterval = setInterval(() => {
    const n = DEMO_NOTIFS[demoIdx % DEMO_NOTIFS.length];
    pushNotif(...n);
    demoIdx++;

    // Simulate credit gain every 4 notifs
    if (demoIdx % 4 === 0 && window.currentUser) {
      window.currentUser.credits += Math.floor(Math.random() * 20 + 5);
      const wbEl = document.getElementById('wbCredits');
      if (wbEl) wbEl.textContent = window.currentUser.credits;
      
      if (typeof chartLine !== 'undefined' && chartLine) {
        chartLine.data.datasets[0].data.push(window.currentUser.credits);
        chartLine.data.datasets[0].data.shift();
        chartLine.data.labels.push('');
        chartLine.data.labels.shift();
        chartLine.update('active');
      }
    }
  }, 2800);
}

function stopDemo() {
  if (demoInterval) { clearInterval(demoInterval); demoInterval = null; }
  document.getElementById('demoBanner').classList.remove('show');
}

// Called from landing "Ver Demo" button
function showDemo() {
  goTo('auth', 'register');
  setTimeout(() => pushNotif('🎬', 'Modo Demo', 'Regístrate para ver el dashboard en acción.', '#E9D5FF'), 600);
}

// ─────────────────────────────────────────
// TILT EFFECT (glassmorphism cards)
// ─────────────────────────────────────────
function initTiltEffect() {
  document.addEventListener('mousemove', e => {
    document.querySelectorAll('.svc-card, .s-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
        const rx = ((y - rect.height / 2) / rect.height) * 8;
        const ry = ((rect.width / 2 - x) / rect.width)  * 8;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      } else {
        card.style.transform = '';
      }
    });
  });
}
