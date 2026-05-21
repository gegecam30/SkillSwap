/* js/navigation.js
   REGLA: Este archivo define goTo, switchPane y switchSection.
   NO duplicar estas funciones en ningún otro archivo ni en el boot del HTML.
*/

// ── Ir a una pantalla ──
function goTo(screenId, pane) {
  // 1. Ocultar todas
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
  });

  // 2. Activar la destino
  const screen = document.getElementById(screenId);
  if (!screen) { console.error('Screen no encontrada:', screenId); return; }
  screen.classList.add('active');

  // 3. Lógica por pantalla
  if (screenId === 'auth') {
    // Apagar el botón de Nuevo Ticket en esta pantalla
    const fab = document.getElementById('fabTicket');
    if (fab) fab.classList.add('hidden');
    
    switchPane(pane || 'login');
  }
  if (screenId === 'dashboard') {
    initDashboard();
    updateLiveBadge(true);
    const fab = document.getElementById('fabTicket');
    if (fab) fab.classList.remove('hidden');
    const badge = document.getElementById('gigsCount');
    if (badge) badge.textContent = activeGigs.filter(g => g.status !== 'done').length || 0;
  }
  if (screenId === 'landing') {
    updateLiveBadge(false);
    const fab = document.getElementById('fabTicket');
    if (fab) fab.classList.add('hidden');
  }
}

// ── Cambiar entre Login / Register ──
function switchPane(pane) {
  document.querySelectorAll('.form-pane').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pane + 'Pane');
  if (target) target.classList.add('active');
}

// ── Scroll suave dentro del landing ──
function landingScrollTo(section) {
  const map = { features:'secFeatures', how:'secHow', team:'secTeam' };
  const el  = document.getElementById(map[section] || section);
  if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
}

// ── Cambiar sección en el dashboard ──
function switchSection(btn) {
  document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const sec = btn.dataset.sec;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('sec' + sec.charAt(0).toUpperCase() + sec.slice(1));
  if (target) target.classList.add('active');

  const titles = {
    home:        ['Dashboard',  'Resumen de tu actividad'],
    marketplace: ['Marketplace','Descubre y ofrece servicios'],
    social:      ['Social Feed','Conecta con la comunidad'],
    tasks:       ['Mis Gigs',   'Tus intercambios activos'],
    profile:     ['Mi Perfil',  'Información y trayectoria'],
  };
  const [title, sub] = titles[sec] || ['', ''];
  const elTitle = document.getElementById('secTitle');
  const elSub   = document.getElementById('secSub');
  if (elTitle) elTitle.textContent = title;
  if (elSub)   elSub.textContent   = sub;

  if (sec === 'marketplace' && typeof renderMarketplace === 'function') renderMarketplace();
  if (sec === 'social'      && typeof renderFeed        === 'function') renderFeed();
  if (sec === 'tasks'       && typeof renderTasks       === 'function') renderTasks();
  if (sec === 'profile'     && typeof renderProfile     === 'function') renderProfile();
}
