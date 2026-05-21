/* ═══════════════════════════════════════════
   NAVIGATION — navigation.js
═══════════════════════════════════════════ */

function switchPane(pane) {
  document.querySelectorAll('.form-pane').forEach(p => p.classList.remove('active'));
  const targetPane = document.getElementById(pane + 'Pane');
  if(targetPane) targetPane.classList.add('active');
}

function landingScrollTo(section) {
  let targetId = '';
  if (section === 'features') targetId = 'secFeatures';
  if (section === 'team') targetId = 'secTeam';
  if (section === 'how') targetId = 'secHow';

  const el = document.getElementById(targetId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

function switchSection(btn) {
  document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const sec = btn.dataset.sec;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const targetSec = document.getElementById('sec' + sec.charAt(0).toUpperCase() + sec.slice(1));
  if(targetSec) targetSec.classList.add('active');

  const titles = {
    home:        ['Dashboard',  'Resumen de tu actividad'],
    marketplace: ['Marketplace','Descubre y ofrece servicios'],
    social:      ['Social Feed','Conecta con la comunidad'],
    tasks:       ['Mis Gigs',   'Tus intercambios activos'],
    profile:     ['Mi Perfil',  'Información y trayectoria'],
  };

  const [title, sub] = titles[sec] || ['', ''];
  const elTitle = document.getElementById('secTitle');
  const elSub = document.getElementById('secSub');
  if(elTitle) elTitle.textContent = title;
  if(elSub) elSub.textContent = sub;

  if (sec === 'marketplace' && typeof renderMarketplace === 'function') renderMarketplace();
  if (sec === 'tasks' && typeof renderTasks === 'function') renderTasks();
  if (sec === 'social' && typeof renderFeed === 'function') renderFeed();
}

/* Reemplaza o añade esta función al final de tu navigation.js */
// js/navigation.js
function goTo(screenId, pane) {
  // 1. Ocultar todas las pantallas y limpiar activaciones
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });

  // 2. Activar la pantalla destino
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('active');
    screen.style.display = 'flex'; // Forzamos el display
  }

  // 3. Activar el panel específico (Login o Register)
  if (screenId === 'auth') {
    // Si no se especifica panel, forzamos 'login'
    switchPane(pane || 'login'); 
  }
}

function switchPane(pane) {
  // Ocultar todos los paneles
  document.querySelectorAll('.form-pane').forEach(p => p.classList.remove('active'));
  
  // Activar el deseado
  const target = document.getElementById(pane + 'Pane');
  if (target) {
    target.classList.add('active');
    target.style.display = 'block'; // Forzamos visibilidad
  }
}