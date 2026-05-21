/* ═══════════════════════════════════════════
   NAVIGATION — navigation.js
═══════════════════════════════════════════ */

function switchPane(pane) {
  document.querySelectorAll('.form-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(pane + 'Pane').classList.add('active');
}

/* Scroll suave a secciones del landing */
function landingScrollTo(target) {
  const map = {
    hero:     'secHero',
    features: 'secFeatures',
    how:      'secHow',
    team:     'secTeam',
  };
  const id       = map[target] || target;
  const el       = document.getElementById(id);
  const scroller = document.getElementById('landingScroll');
  if (el && scroller) {
    scroller.scrollTo({ top: el.offsetTop - 10, behavior: 'smooth' });
  }
}

function switchSection(btn) {
  document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const sec = btn.dataset.sec;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec' + cap(sec)).classList.add('active');

  const titles = {
    home:        ['Dashboard',  'Resumen de tu actividad'],
    marketplace: ['Marketplace','Descubre y ofrece servicios'],
    social:      ['Social Feed','Conecta con la comunidad'],
    tasks:       ['Mis Gigs',   'Tus intercambios activos'],
    profile:     ['Mi Perfil',  'Información y trayectoria'],
  };
  const [title, sub] = titles[sec] || ['', ''];
  document.getElementById('secTitle').textContent = title;
  document.getElementById('secSub').textContent   = sub;

  if (sec === 'marketplace') renderMarketplace();
  if (sec === 'social')      renderFeed();
  if (sec === 'profile')     renderProfile();
  if (sec === 'tasks')       renderTasks();
}
