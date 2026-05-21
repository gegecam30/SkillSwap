/* ═══════════════════════════════════════════
   DASHBOARD — dashboard.js (VERSIÓN FINAL LIMPIA + FILTROS)
═══════════════════════════════════════════ */

let chartLine  = null;
let chartDough = null;
window.allNetworkPosts = []; // Memoria global para los filtros del feed

// ── Init dashboard ──
// ── Init dashboard ──
async function initDashboard() {
  const sessionString = localStorage.getItem('currentUser');
  if (!sessionString) { 
    goTo('auth', 'login'); 
    return; 
  }
  
  const session = JSON.parse(sessionString);
  const userId = session.id;

  try {
    const response = await fetch(`${API}/profile/${userId}`);
    const result = await response.json();

    if (result.success) {
      const p = result.profile;
      
      window.currentUser = {
        id: userId,
        name: p.display_name || p.full_name || 'Estudiante',
        code: p.university_code || p.uni_code || 'U----------',
        credits: p.balance !== undefined ? p.balance : 0,
        skills: p.skills || [],
        rating: 5.0,
        completedTasks: 0,
        completedMissions: session.completedMissions || [],
        // ── AQUÍ EL CAMBIO: Leemos directamente la ruta desde Supabase ──
        avatarUrl: p.avatar_url || 'img/Avatar1.png'
      };

      localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
      const u = window.currentUser;

      // ── Inyectamos la imagen directamente en el chip del Header ──
      const elChipAv = document.getElementById('chipAv');
      if (elChipAv) {
        elChipAv.innerHTML = `<img src="${u.avatarUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
      }
      
      if(document.getElementById('chipName')) document.getElementById('chipName').textContent = u.name.split(' ')[0];
      if(document.getElementById('chipCode')) document.getElementById('chipCode').textContent = u.code;

      if(document.getElementById('wbTitle')) document.getElementById('wbTitle').textContent = `¡Hola, ${u.name.split(' ')[0]}! 👋`;
      if(document.getElementById('wbCredits')) document.getElementById('wbCredits').textContent = u.credits;
      if(document.getElementById('statRating')) document.getElementById('statRating').textContent = u.rating.toFixed(1);
      if(document.getElementById('statDone')) document.getElementById('statDone').textContent = u.completedTasks;

      const sw = document.getElementById('dashSkills');
      if (sw) {
        sw.innerHTML = '';
        if (u.skills && u.skills.length > 0) {
          u.skills.forEach(s => {
            const t = document.createElement('span');
            t.className = 's-tag';
            t.textContent = s;
            sw.appendChild(t);
          });
        } else {
          sw.innerHTML = '<span style="color:var(--text3);font-size:12px;">Sin habilidades</span>';
        }
      }

      updateSidebarBadge('tasks', 0);
      setTimeout(initCharts, 100);
      
      // Llamamos a la sincronización real
      syncPlatformStats(userId);
      
    } else {
      if(typeof pushNotif === 'function') pushNotif('❌', 'Error', 'No se pudo cargar el perfil', '#ff2a6d');
    }
  } catch (error) {
    if(typeof pushNotif === 'function') pushNotif('🔌', 'Conexión', 'El servidor no responde', '#ff2a6d');
  }
}

// ── NUEVA FUNCIÓN: Sincronizador de Estadísticas Reales ──
async function syncPlatformStats(userId) {
  try {
    const res = await fetch(`${API}/platform/stats/${userId}`);
    const data = await res.json();
    
    if(data.success) {
      // Actualizamos los widgets de la cabecera (Header superior)
      if(document.getElementById('liveCount')) document.getElementById('liveCount').textContent = data.online;
      if(document.getElementById('sbLiveCount')) document.getElementById('sbLiveCount').textContent = data.online;
      if(document.getElementById('liveExchanges')) document.getElementById('liveExchanges').textContent = data.exchanges;
      
      // Actualizamos la tarjeta de "Conexiones" en el dashboard
      if(document.getElementById('statConnections')) document.getElementById('statConnections').textContent = data.connections;
    }
  } catch (e) {
    console.error("No se pudieron cargar las estadísticas de la plataforma.");
  }
}

// ── Helpers ──
function updateSidebarBadge(sectionName, count) {
  const badge = document.querySelector(`[data-sec="${sectionName}"] .sb-badge`);
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none'; 
  }
}

// ── Charts ──
const CYAN = '#00e5ff'; const CYAN_FILL = 'rgba(0,229,255,0.08)'; const GRID_COLOR = 'rgba(0,229,255,0.06)'; const TICK_COLOR = '#4a7a8a';
const glowPlugin = { id: 'glowLine', beforeDatasetDraw(chart) { chart.ctx.save(); chart.ctx.shadowColor = CYAN; chart.ctx.shadowBlur = 12; }, afterDatasetDraw(chart) { chart.ctx.restore(); } };

function initCharts() {
  const ctxL = document.getElementById('chartLine'); const ctxD = document.getElementById('chartDough');
  if (!ctxL || !ctxD) return;
  if (chartLine) { chartLine.destroy(); chartLine = null; }
  if (chartDough) { chartDough.destroy(); chartDough = null; }

  const base = window.currentUser?.credits ?? 100;
  const data = [base]; 
  
  chartLine = new Chart(ctxL, {
    type: 'line', plugins: [glowPlugin],
    data: { labels: ['Hoy'], datasets: [{ label: 'Créditos CH', data, borderColor: CYAN, backgroundColor: CYAN_FILL, fill: true, tension: 0.42, borderWidth: 2, pointBackgroundColor: CYAN, pointRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR } } } }
  });

  const skills = window.currentUser?.skills?.length ? window.currentUser.skills.slice(0, 4) : ['Sin Skills'];
  chartDough = new Chart(ctxD, {
    type: 'doughnut',
    data: { labels: skills, datasets: [{ data: skills.map(() => 10), backgroundColor: ['#00e5ff', 'rgba(0,229,255,0.65)', 'rgba(0,188,212,0.85)', '#8e2cf9'], borderColor: '#050a0d', borderWidth: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom', labels: { color: TICK_COLOR } } } }
  });
}
function updateCharts() { setTimeout(initCharts, 100); }

// ── Marketplace ──
async function renderMarketplace() {
  const grid = document.getElementById('mktGrid');
  if(!grid) return;
  grid.innerHTML = '<div style="color:var(--cyan); padding:20px; font-family:\'JetBrains Mono\';">Cargando la red... <span class="cursor-blink"></span></div>';

  try {
    const response = await fetch(`${API}/services/`);
    const result = await response.json();

    if (result.success) {
      grid.innerHTML = ''; 
      updateSidebarBadge('marketplace', result.services.length);
      
      if (result.services.length === 0) {
        grid.innerHTML = '<div style="color:var(--text3); padding:20px;">No hay servicios disponibles en este momento.</div>';
        return;
      }

      result.services.forEach((s, i) => {
        const card = document.createElement('div');
        card.className = 'svc-card';
        card.style.animationDelay = (i * 0.07) + 's';
        
        if (s.provider_id === 'system') {
          card.style.border = '1px solid #ff2a6d';
          card.style.boxShadow = '0 0 15px rgba(255,42,109,0.1)';
        }

        const tagsHtml = s.tags.map(t => `<span class="svc-tag">${t}</span>`).join('');
        const isBusco = s.title.startsWith('[BUSCO]');
        const isCompleted = window.currentUser?.completedMissions?.includes(s.id);
        const btnStyle = isCompleted ? 'background:var(--surface2); color:var(--text3); border:none; cursor:not-allowed;' : (isBusco ? 'background:linear-gradient(135deg, #F59E0B, #F97316); border:none;' : '');
        const btnText  = isCompleted ? 'Completada ✅' : (s.price === 0 ? '▶ Iniciar Misión' : (isBusco ? 'Aceptar Trabajo' : 'Solicitar'));

        card.innerHTML = `
          <div class="svc-head">
            <div class="svc-av" style="background:${s.bg}">${s.initials}</div>
            <div>
              <div class="svc-name" style="${s.provider_id === 'system' ? 'color:#ff2a6d;' : ''}">${s.provider_name}</div>
              <div class="svc-stars">⭐ 5.0</div>
            </div>
          </div>
          <div class="svc-title" style="${isBusco ? 'color:#F59E0B;' : ''}">${s.title}</div>
          <div class="svc-desc">${s.description}</div>
          <div class="svc-tags">${tagsHtml}</div>
          <div class="svc-foot">
            <div class="svc-price" style="${s.price === 0 ? 'color:#ff2a6d; font-weight:bold;' : ''}">${s.price === 0 ? 'GRATIS' : s.price + ' CH'}</div>
            <button class="btn btn-primary btn-sm" style="${btnStyle}" ${isCompleted ? 'disabled' : ''} 
                    onclick="requestService('${s.id}', '${s.provider_id}', '${s.title.replace(/'/g, "\\'")}', ${s.price})">${btnText}</button>
          </div>`;
        grid.appendChild(card);
      });
    }
  } catch (error) {
    grid.innerHTML = '<div style="color:#ff2a6d; padding:20px;">Sin conexión al servidor central.</div>';
  }
}

async function requestService(serviceId, providerId, title, price) {
  if (!window.currentUser) return;

  if (price === 0 || providerId === 'system') {
    if (!window.currentUser.completedMissions) window.currentUser.completedMissions = [];
    if (window.currentUser.completedMissions.includes(serviceId)) {
       if(typeof pushNotif === 'function') pushNotif('⚠️', 'Aviso', 'Ya reclamaste esta recompensa.', '#FEF3C7');
       return;
    }

    if (serviceId === 'mission-002') {
      const socialBtn = document.querySelector('[data-sec="social"]');
      if (socialBtn) {
        switchSection(socialBtn);
        if(typeof pushNotif === 'function') pushNotif('📱', 'Misión Activa', '¡Escribe y publica tu primer post para ganar 20 CH!', '#A78BFA');
      }
      return; 
    }

    const recompensa = 20;
    try {
      const response = await fetch(`${API}/profile/reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: window.currentUser.id, amount: recompensa })
      });
      const result = await response.json();

      if (!result.error) {
        window.currentUser.credits = result.new_balance;
        window.currentUser.completedMissions.push(serviceId);
        localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
        if(document.getElementById('wbCredits')) document.getElementById('wbCredits').textContent = window.currentUser.credits;
        if(typeof pushNotif === 'function') pushNotif('🏆', 'Misión Completada', `¡Has ganado +${recompensa} CH!`, '#00e5ff');
        updateCharts();
        renderMarketplace();
      }
    } catch (e) {}
    return;
  }

  const isBusco = title.startsWith('[BUSCO]');

  if (!isBusco && window.currentUser.credits < price) {
    if(typeof pushNotif === 'function') pushNotif('⚠️', 'Sin créditos', 'No tienes suficientes CH.', '#ff2a6d');
    return;
  }

  try {
    const payload = isBusco ? {
      sender_id: providerId, // El que pide el trabajo paga
      receiver_id: window.currentUser.id, // Yo acepto, yo cobro
      service_id: serviceId,
      amount: price
    } : {
      sender_id: window.currentUser.id, // Yo solicito, yo pago
      receiver_id: providerId, // El experto cobra
      service_id: serviceId,
      amount: price
    };

    const response = await fetch(`${API}/transactions/escrow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    if (result.error) {
      if(typeof pushNotif === 'function') pushNotif('❌', 'Error', result.error, '#ff2a6d');
      return;
    }
    
    if (isBusco) {
      if(typeof pushNotif === 'function') pushNotif('🤝', 'Trabajo Aceptado', `Los ${price} CH están en Escrow. ¡Manos a la obra!`, '#F59E0B');
      // No restamos saldo porque nosotros cobramos.
    } else {
      window.currentUser.credits -= price;
      localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
      if(document.getElementById('wbCredits')) document.getElementById('wbCredits').textContent = window.currentUser.credits;
      if(typeof pushNotif === 'function') pushNotif('🔒', 'Escrow Activado', `Solicitud enviada. ${price} CH congelados.`, '#A78BFA');
    }
    updateCharts();
  } catch (error) {
    if(typeof pushNotif === 'function') pushNotif('🔌', 'Sin Conexión', 'No se pudo contactar al sistema de protección.', '#ff2a6d');
  }
}

// ── SECCIÓN: SOCIAL FEED CON FILTROS ──
function renderFeed() {
  const list = document.getElementById('feedList');
  if(!list) return;

  list.innerHTML = `
    <div class="card" style="margin-bottom: 20px; border: 1px solid var(--border); background: var(--surface1);">
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--cyan); margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span>&gt;_ CREAR_NUEVA_PUBLICACIÓN</span>
        <select id="postCategory" style="background: #050a0d; color: var(--cyan); border: 1px solid var(--border); border-radius: 4px; font-family: 'JetBrains Mono'; font-size: 11px; padding: 2px 6px; outline: none; cursor:pointer;">
          <option value="General">General</option>
          <option value="Programación">Programación</option>
          <option value="Diseño">Diseño</option>
          <option value="Ciencias">Ciencias (Mat/Fís)</option>
          <option value="Comunidad">Comunidad</option>
        </select>
      </div>
      <textarea id="postInput" placeholder="¿Qué habilidad buscas o qué proyecto estás armando?..." 
                style="width: 100%; min-height: 70px; background: #081217; border: 1px solid var(--border); border-radius: 6px; padding: 10px; color: var(--text); font-family: 'Inter', sans-serif; font-size: 13px; resize: vertical; outline: none;"></textarea>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
        <span style="font-size: 11px; color: var(--text3); font-family: 'JetBrains Mono';">// Recuerda mantener el respeto comunitario</span>
        <button class="btn btn-primary btn-sm" onclick="publishNewPost()">Publicar_</button>
      </div>
    </div>
    
    <div class="filters" style="margin-bottom: 20px; display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;">
      <button class="filter-btn active" style="transition:all 0.3s;" onclick="applyFeedFilter('Todos', this)">Todos</button>
      <button class="filter-btn" style="transition:all 0.3s;" onclick="applyFeedFilter('Programación', this)">Programación</button>
      <button class="filter-btn" style="transition:all 0.3s;" onclick="applyFeedFilter('Diseño', this)">Diseño</button>
      <button class="filter-btn" style="transition:all 0.3s;" onclick="applyFeedFilter('Ciencias', this)">Ciencias</button>
      <button class="filter-btn" style="transition:all 0.3s;" onclick="applyFeedFilter('Comunidad', this)">Comunidad</button>
    </div>

    <div id="postsContainer">
      <div style="color:var(--cyan); padding:20px; font-family:'JetBrains Mono'; text-align:center;">Sincronizando red... <span class="cursor-blink"></span></div>
    </div>
  `;
  
  fetchAndRenderPosts();
}

async function fetchAndRenderPosts() {
  try {
    const response = await fetch(`${API}/posts/`);
    const result = await response.json();

    if (result.success) {
      window.allNetworkPosts = result.posts; // Guardamos en memoria global
      updateSidebarBadge('social', window.allNetworkPosts.length);
      renderFilteredPosts('Todos'); // Renderizamos todo por defecto
    }
  } catch (error) {
    const container = document.getElementById('postsContainer');
    if(container) container.innerHTML = '<div style="color:#ff2a6d; text-align:center; padding:20px;">Error al conectar con la red.</div>';
  }
}

// Lógica de Filtrado Local (Instantáneo)
function applyFeedFilter(category, btnElement) {
  // Cambiar estilo del botón activo
  const buttons = document.querySelectorAll('#secSocial .filter-btn');
  buttons.forEach(b => {
    b.classList.remove('active');
    b.style.color = '';
    b.style.borderColor = '';
  });
  
  btnElement.classList.add('active');
  // Toque estético cyberpunk al botón activo
  btnElement.style.color = '#8e2cf9'; 
  btnElement.style.borderColor = '#8e2cf9';

  renderFilteredPosts(category);
}

function renderFilteredPosts(category) {
  const container = document.getElementById('postsContainer');
  if (!container) return;

  // Filtramos la memoria global
  const filteredPosts = category === 'Todos' 
    ? window.allNetworkPosts 
    : window.allNetworkPosts.filter(p => p.category === category || (category === 'Ciencias' && p.category.includes('Ciencias')));

  if (filteredPosts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px 20px; border: 1px dashed var(--border); border-radius: 12px; margin-top:10px;">
        <div style="font-size:32px; margin-bottom:12px;">📭</div>
        <h3 style="color:var(--text); font-family:'JetBrains Mono';">El feed está en silencio</h3>
        <p style="color:var(--text3); font-size:14px;">No hay publicaciones en la categoría "${category}".</p>
      </div>`;
    return;
  }

  container.innerHTML = filteredPosts.map((p) => {
    const authorName = p.profiles?.display_name || 'Estudiante';
    const authorCode = p.profiles?.university_code || 'U----------';
    const initials = authorName.charAt(0).toUpperCase();
    const dateObj = new Date(p.created_at);
    const timeString = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    return `
    <div class="post-card" style="animation: fadeInUp 0.4s ease forwards; background: var(--surface1); border: 1px solid var(--border); padding: 16px; border-radius: 8px; margin-bottom: 14px;">
      <div class="post-head" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <div class="post-av" style="background: var(--p-purple); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; color: #050a0d;">${initials}</div>
        <div style="flex: 1;">
          <div class="post-author" style="font-weight: 600; font-size: 14px; color: var(--text);">${authorName}</div>
          <div class="post-role" style="font-size: 11px; color: var(--cyan); font-family: 'JetBrains Mono';">${authorCode}</div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 10px; background: rgba(142, 44, 249, 0.1); color: #8e2cf9; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(142, 44, 249, 0.3); font-family: 'JetBrains Mono';">${p.category}</span>
          <div class="post-time" style="font-size: 10px; color: var(--text3); margin-top: 4px;">${timeString}</div>
        </div>
      </div>
      <div class="post-body" style="font-size: 13.5px; color: var(--text2); line-height: 1.5; white-space: pre-wrap;">${p.content}</div>
    </div>
  `}).join('');
}

async function publishNewPost() {
  const txt = document.getElementById('postInput').value.trim();
  const cat = document.getElementById('postCategory').value;
  
  if (!txt) {
    if(typeof pushNotif === 'function') pushNotif('⚠️', 'Contenido vacío', 'Escribe algo antes de publicar.', '#ff2a6d');
    return;
  }

  const btn = document.querySelector('button[onclick="publishNewPost()"]');
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  try {
    const postRes = await fetch(`${API}/posts/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_id: window.currentUser.id, content: txt, category: cat })
    });
    
    const postResult = await postRes.json();
    if (postResult.error) throw new Error(postResult.error);

    if (!window.currentUser.completedMissions) window.currentUser.completedMissions = [];
    
    if (!window.currentUser.completedMissions.includes('mission-002')) {
      const rewRes = await fetch(`${API}/profile/reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: window.currentUser.id, amount: 20 })
      });
      const rewResult = await rewRes.json();

      if (!rewResult.error) {
        window.currentUser.credits = rewResult.new_balance;
        window.currentUser.completedMissions.push('mission-002');
        localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
        
        if(document.getElementById('wbCredits')) document.getElementById('wbCredits').textContent = window.currentUser.credits;
        if(typeof pushNotif === 'function') pushNotif('🏆', 'Misión Completada', '¡+20 CH por publicar tu primer post!', '#00e5ff');
        updateCharts();
      }
    } else {
      if(typeof pushNotif === 'function') pushNotif('🚀', 'Post Publicado', 'Tu mensaje es visible en el campus.', '#00e5ff');
    }

    document.getElementById('postInput').value = '';
    // Volvemos a colocar el filtro en "Todos" visualmente
    const filterBtns = document.querySelectorAll('#secSocial .filter-btn');
    if(filterBtns.length > 0) applyFeedFilter('Todos', filterBtns[0]);
    
    fetchAndRenderPosts(); 

  } catch (error) {
    if(typeof pushNotif === 'function') pushNotif('❌', 'Error', 'No se pudo publicar el mensaje.', '#ff2a6d');
  } finally {
    btn.textContent = 'Publicar_';
    btn.disabled = false;
  }
}

// ── Mis Gigs y Profile (Estados Vacíos y Limpios) ──
function renderTasks() { 
  const container = document.getElementById('tasksContainer') || document.getElementById('secTasks');
  if(!container) return;
  container.innerHTML = `
    <div style="text-align:center; padding:60px 20px; border: 1px dashed var(--border); border-radius: 12px; margin-top:20px;">
      <div style="font-size:32px; margin-bottom:12px;">📋</div>
      <h3 style="color:var(--text); font-family:'JetBrains Mono';">Sin intercambios activos</h3>
      <p style="color:var(--text3); font-size:14px;">Ve al Marketplace para solicitar un servicio o publica el tuyo.</p>
    </div>`;
}

function renderProfile() {
  if (!window.currentUser) return;
  const u = window.currentUser;

  // ── Aplicar avatar con la URL extraída de Supabase ──
  const profAv = document.getElementById('profAv');
  if (profAv) {
    profAv.innerHTML = `<img src="${u.avatarUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
  }
  
  if(document.getElementById('profName')) document.getElementById('profName').textContent = u.name;
  if(document.getElementById('profCode')) document.getElementById('profCode').textContent = u.code;
  if(document.getElementById('profCreds')) document.getElementById('profCreds').textContent = u.credits;
  if(document.getElementById('profDone')) document.getElementById('profDone').textContent = u.completedTasks;
  
  if(document.getElementById('profSkills')) {
    document.getElementById('profSkills').innerHTML = u.skills.map(s => `<span class="s-tag">${s}</span>`).join('');
  }

  if(document.getElementById('tlList')) {
    document.getElementById('tlList').innerHTML = `
      <div class="tl-item"><div class="tl-dot">🚀</div><div class="tl-content"><div class="tl-event">Cuenta Verificada</div><div class="tl-date">Registrado</div><span class="tl-badge">Nuevo usuario</span></div></div>`;
  }
}

async function saveSelectedAvatar(newPathOrUrl) {
  if (!window.currentUser) return;

  try {
    const response = await fetch(`${API}/profile/update-avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: window.currentUser.id,
        avatar_url: newPathOrUrl
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Actualizamos memoria local de inmediato
      window.currentUser.avatarUrl = result.avatar_url;
      
      const session = JSON.parse(localStorage.getItem('currentUser') || '{}');
      session.avatarUrl = result.avatar_url;
      localStorage.setItem('currentUser', JSON.stringify(session));
      
      // Refrescar componentes visuales
      if(document.getElementById('chipAv')) {
        document.getElementById('chipAv').innerHTML = `<img src="${result.avatar_url}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
      }
      
      if(typeof pushNotif === 'function') pushNotif('🖼️', 'Avatar actualizado', 'Tu nueva identidad visual ha sido guardada en la nube.', '#00e5ff');
    }
  } catch (error) {
    console.error("Error sincronizando el avatar:", error);
  }
}