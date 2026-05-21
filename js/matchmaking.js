/* ═══════════════════════════════════════════
   MATCHMAKING ENGINE — matchmaking.js
   Flujo: Ticket → Búsqueda → Expertos →
          Escrow → Chat → Entrega → Review
═══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   DATA: Expertos y Categorías
───────────────────────────────────────── */
const CATEGORIES = [
  'Modelado 3D / AutoCAD',
  'Diseño Gráfico',
  'Programación',
  'Marketing Digital',
  'Idiomas',
  'Matemáticas / Estadística'
];

const EXPERTS_DB = {
  system: { id:'system', name:'SkillSwap System', major:'Experto Guía (Tutorial)', icon:'🤖', bg:'linear-gradient(135deg,#A78BFA,#EC4899)', stars:5.0, jobs:99, badge:'Guía', portfolio:['🎓'] }
};

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
let activeGigs    = JSON.parse(localStorage.getItem('ss_gigs') || '[]');
let activeTicket  = null;   // current ticket being created
let selectedExpert = null;  // expert chosen to hire
let chatExpert     = null;  // expert currently in chat
let chatGigId      = null;
let selectedStars  = 0;

function saveGigs() { localStorage.setItem('ss_gigs', JSON.stringify(activeGigs)); }

/* ─────────────────────────────────────────
   MODAL HELPERS
───────────────────────────────────────── */
function openModal(id)  { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));
}

/* ─────────────────────────────────────────
   STEP 1: Create Ticket
───────────────────────────────────────── */
function openCreateTicket() {
  if (!window.currentUser) return;
  // Populate category select
  const sel = document.getElementById('ticketCategory');
  sel.innerHTML = '<option value="">Selecciona una categoría...</option>';
  CATEGORIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    sel.appendChild(opt);
  });
  // Update balance display
  document.getElementById('ticketBalance').textContent = window.currentUser.credits + ' CH disponibles';
  document.getElementById('ticketCH').value = '';
  document.getElementById('ticketDesc').value = '';
  document.querySelectorAll('.urgency-pill').forEach(p => p.classList.remove('active'));
  openModal('modalTicket');
}

function selectUrgency(btn) {
  document.querySelectorAll('.urgency-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
}

/* ─────────────────────────────────────────
   STEP 2: Search Experts (with spinner)
───────────────────────────────────────── */
async function searchExperts() {
  const category = document.getElementById('ticketCategory').value;
  const desc     = document.getElementById('ticketDesc').value.trim();
  const ch       = parseInt(document.getElementById('ticketCH').value);
  const urgency  = document.querySelector('.urgency-pill.active')?.textContent || '24 horas';

  if (!category) { pushNotif('⚠️','Error','Selecciona una categoría.','#FEF3C7'); return; }
  if (!desc)     { pushNotif('⚠️','Error','Describe tu necesidad.','#FEF3C7'); return; }
  if (!ch || ch < 1) { pushNotif('⚠️','Error','Ingresa los créditos a ofrecer.','#FEF3C7'); return; }
  if (ch > window.currentUser.credits) { pushNotif('❌','Sin fondos','No tienes suficientes CH.','#FBE2F4'); return; }

  activeTicket = { category, desc, ch, urgency };

  // Show spinner
  document.getElementById('ticketFormContent').style.display = 'none';
  document.getElementById('ticketSearching').style.display   = 'block';
  document.getElementById('ticketModalFoot').style.display   = 'none';

  try {
    const res = await fetch(`${API}/profiles/category/${encodeURIComponent(category)}`);
    const data = await res.json();
    let found = [];
    
    if (data.success && data.experts && data.experts.length > 0) {
      // Filtrar al mismo usuario
      found = data.experts.filter(e => e.id !== window.currentUser.id).slice(0, 3);
    }
    
    // Si no se encuentran suficientes, agregar el de tutorial
    if (found.length === 0) {
      found.push(EXPERTS_DB.system);
    }

    setTimeout(() => {
      closeModal('modalTicket');
      document.getElementById('ticketFormContent').style.display = 'block';
      document.getElementById('ticketSearching').style.display   = 'none';
      document.getElementById('ticketModalFoot').style.display   = 'flex';
      
      pushNotif('🔔','Búsqueda finalizada',`Encontramos ${found.length} opciones para ti.`,'#E9D5FF');
      
      setTimeout(() => showExperts(found), 600);
    }, 1500); // 1.5s spinner
  } catch (err) {
    console.error(err);
    pushNotif('❌','Error','No se pudo buscar expertos en la red.','#FBE2F4');
    closeModal('modalTicket');
    
    // Reset modal state
    document.getElementById('ticketFormContent').style.display = 'block';
    document.getElementById('ticketSearching').style.display   = 'none';
    document.getElementById('ticketModalFoot').style.display   = 'flex';
  }
}

async function postTicketToMarketplace() {
  if (!activeTicket) return;

  const desc = activeTicket.desc;
  const ch = activeTicket.ch;
  const category = activeTicket.category;

  try {
    const response = await fetch(`${API}/services/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider_id: window.currentUser.id,
        title: `[BUSCO] ${category}`,
        description: desc,
        price: ch
      })
    });

    const result = await response.json();
    if (result.success) {
      pushNotif('✅', 'Ticket publicado', 'Tu ticket está visible en el Marketplace. Los CH se descontarán cuando alguien lo acepte.', '#34D399');
      
      const pendingGig = {
        id: result.data && result.data[0] ? result.data[0].id : 'gig_' + Date.now(),
        category: category,
        expertName: 'Esperando Experto...',
        status: 'pending',
        desc: desc,
        ch: ch,
        chat: []
      };
      
      activeGigs.push(pendingGig);
      saveGigs();
      
      closeModal('modalExperts');
      if (document.getElementById('secTasks').classList.contains('active')) renderTasks();
    } else {
      pushNotif('❌', 'Error', result.error || 'No se pudo publicar', '#FBE2F4');
    }
  } catch (err) {
    console.error(err);
    pushNotif('❌', 'Error de red', 'No se pudo conectar al servidor.', '#FBE2F4');
  }
}

/* ─────────────────────────────────────────
   STEP 3: Show Expert Results
───────────────────────────────────────── */
function showExperts(experts) {
  const list = document.getElementById('expertList');
  list.innerHTML = '';
  selectedExpert = null;

  document.getElementById('expertsFoundCount').textContent = experts.length + ' expertos';

  experts.forEach(exp => {
    const card = document.createElement('div');
    card.className = 'expert-card';
    card.dataset.id = exp.id;

    const portHTML = (exp.portfolio || []).map(p =>
      `<div class="port-thumb" title="Ver trabajo">${p}</div>`
    ).join('');

    const bgImage = exp.avatar_url ? `url('${exp.avatar_url}')` : exp.bg;
    const isImage = exp.avatar_url ? 'background-size:cover;background-position:center;' : '';
    const iconStr = exp.avatar_url ? '' : exp.icon;

    card.innerHTML = `
      <div class="expert-av" style="background:${bgImage}; ${isImage}">${iconStr}</div>
      <div class="expert-info">
        <div class="expert-name">${exp.name}</div>
        <div class="expert-major">${exp.major}</div>
        <div class="expert-meta">
          <span class="expert-stars">⭐ ${exp.stars}</span>
          <span class="expert-badge">${exp.badge}</span>
          <span class="expert-jobs">${exp.jobs} trabajos</span>
        </div>
        <div class="expert-portfolio">${portHTML}</div>
      </div>
      <button class="expert-hire-btn" onclick="confirmHire('${exp.id}')">Contratar →</button>`;
    list.appendChild(card);
  });

  // Store experts for reference
  window._currentExperts = experts;
  openModal('modalExperts');
}

/* ─────────────────────────────────────────
   STEP 4: Escrow Confirm
───────────────────────────────────────── */
function confirmHire(expertId) {
  selectedExpert = window._currentExperts.find(e => e.id === expertId);
  if (!selectedExpert || !activeTicket) return;

  closeModal('modalExperts');

  // Fill escrow modal
  document.getElementById('escrowExpertName').textContent = selectedExpert.name;
  document.getElementById('escrowCH').textContent         = activeTicket.ch + ' CH';
  document.getElementById('escrowTask').textContent       = activeTicket.category;
  document.getElementById('escrowDeadline').textContent   = activeTicket.urgency;
  document.getElementById('escrowTermsCheck').checked     = false;

  openModal('modalEscrow');
}

// js/matchmaking.js

async function lockEscrow() {
  const agreed = document.getElementById('escrowTermsCheck').checked;
  if (!agreed) { 
    pushNotif('⚠️', '', 'Acepta los términos primero.', '#FEF3C7'); 
    return; 
  }

  // Preparamos los datos tal cual los pide Pydantic en nuestro backend
  const transactionData = {
    sender_id: window.currentUser.id, // Asumiendo que el ID del usuario logueado está aquí
    receiver_id: selectedExpert.id,
    service_id: activeTicket.id || "servicio_generico_123", // Temporal hasta que conectemos los servicios
    amount: activeTicket.ch
  };

  try {
    // Hacemos la petición POST a tu servidor FastAPI local
    const response = await fetch(`${API}/transactions/escrow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionData)
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      // Si el backend (FastAPI) rechaza la transacción (ej. no hay saldo)
      pushNotif('❌', 'Error en Escrow', result.error || 'Fondos insuficientes o error de servidor.', '#ff2a6d');
      return;
    }

    // Si FastAPI responde Success:
    closeModal('modalEscrow');
    pushNotif('🔒', '¡Escrow activado desde el Servidor!', `${activeTicket.ch} CH congelados.`, '#8e2cf9');
    
    // Crear el gig y guardarlo
    const newGig = {
      id: 'gig_' + Date.now(),
      category: activeTicket.category,
      desc: activeTicket.desc,
      ch: activeTicket.ch,
      urgency: activeTicket.urgency,
      expertId: selectedExpert.id,
      expertName: selectedExpert.name,
      expertIcon: selectedExpert.icon,
      expertBg: selectedExpert.bg,
      status: 'escrow',
      progress: 0,
      messages: []
    };
    activeGigs.push(newGig);
    saveGigs();
    
    // Aquí puedes actualizar la UI (restar el saldo visualmente, crear el gig en la pantalla, etc.)
    window.currentUser.credits -= activeTicket.ch; 
    updateCreditsUI();
    
    // Recargamos las tareas y el badge
    const badge = document.getElementById('gigsCount');
    if (badge) badge.textContent = activeGigs.filter(g => g.status !== 'done').length || 0;
    if (document.getElementById('secTasks').classList.contains('active')) renderTasks();

  } catch (error) {
    console.error("Error conectando con el backend:", error);
    pushNotif('🔌', 'Error de conexión', 'No se pudo conectar con el servidor FastAPI.', '#ff2a6d');
  }
}

function updateCreditsUI() {
  const el = document.getElementById('wbCredits');
  if (el) el.textContent = window.currentUser.credits;
}

/* ─────────────────────────────────────────
   STEP 5: Chat Workspace
───────────────────────────────────────── */
function openChat(gigId) {
  const gig = activeGigs.find(g => g.id === gigId);
  if (!gig) return;
  chatGigId  = gigId;
  chatExpert = { name: gig.expertName, icon: gig.expertIcon, bg: gig.expertBg };

  document.getElementById('chatTitle').textContent    = gig.expertName;
  document.getElementById('chatTask').textContent     = gig.category;
  document.getElementById('chatEscrowCH').textContent = gig.ch;
  document.getElementById('chatStatus').textContent   = statusLabel(gig.status);
  document.getElementById('chatDeadline').textContent = gig.urgency;

  // Show/hide approve button
  const approveBtn = document.getElementById('chatApproveBtn');
  if (approveBtn) approveBtn.style.display = gig.status === 'delivered' ? 'flex' : 'none';

  renderChatMessages(gig.messages);
  openModal('modalChat');
  scrollChat();
}

function renderChatMessages(messages) {
  const el = document.getElementById('chatMessages');
  el.innerHTML = '';
  messages.forEach(msg => {
    if (msg.from === 'system') {
      const sys = document.createElement('div');
      sys.style.cssText = 'text-align:center;padding:8px;font-size:12px;color:var(--text3);';
      sys.textContent = msg.text;
      el.appendChild(sys);
      return;
    }
    const isMe = msg.from === 'me';
    const wrapper = document.createElement('div');
    wrapper.className = 'msg' + (isMe ? ' mine' : '');

    if (msg.type === 'file') {
      wrapper.innerHTML = `
        <div class="msg-av" style="background:${isMe ? 'linear-gradient(135deg,#A78BFA,#EC4899)' : chatExpert?.bg || '#ccc'};">
          ${isMe ? (window.currentUser?.avatarIcon || '🦄') : (chatExpert?.icon || '👤')}
        </div>
        <div>
          <div class="msg-file">
            <div class="msg-file-icon">📁</div>
            <div>
              <div class="msg-file-name">${msg.filename}</div>
              <div class="msg-file-size">${msg.size}</div>
            </div>
            <span class="msg-file-badge">Entregable</span>
          </div>
          <span class="msg-time">${msg.time}</span>
        </div>`;
    } else {
      wrapper.innerHTML = `
        <div class="msg-av" style="background:${isMe ? 'linear-gradient(135deg,#A78BFA,#EC4899)' : chatExpert?.bg || '#ccc'};">
          ${isMe ? (window.currentUser?.avatarIcon || '🦄') : (chatExpert?.icon || '👤')}
        </div>
        <div>
          <div class="msg-bubble">${msg.text}</div>
          <span class="msg-time">${msg.time}</span>
        </div>`;
    }
    el.appendChild(wrapper);
  });
}

function scrollChat() {
  setTimeout(() => {
    const el = document.getElementById('chatMessages');
    if (el) el.scrollTop = el.scrollHeight;
  }, 50);
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text  = input.value.trim();
  if (!text) return;

  const gig = activeGigs.find(g => g.id === chatGigId);
  if (!gig) return;

  gig.messages.push({ from:'me', text, time: now() });
  input.value = '';
  saveGigs();
  renderChatMessages(gig.messages);
  scrollChat();

  // Simulate expert reply after 1.5s
  const replies = [
    '¡Perfecto, entendido! Ya lo tengo en cuenta. 👍',
    'Claro, sin problema. Lo ajusto ahora mismo.',
    'Recibido. Voy a avanzar y te muestro el progreso pronto.',
    '¡Excelente punto! Lo incorporo al entregable. 🔥',
  ];
  setTimeout(() => {
    gig.messages.push({ from:'expert', text: replies[Math.floor(Math.random()*replies.length)], time: now() });
    saveGigs();
    renderChatMessages(gig.messages);
    scrollChat();
  }, 1500);
}

function simulateFileUpload() {
  const gig = activeGigs.find(g => g.id === chatGigId);
  if (!gig) return;
  const filenames = ['Plano_Final_v2.dwg','Render_3D.zip','Proyecto_AutoCAD.rar','Entregable_Final.pdf'];
  const filename = filenames[Math.floor(Math.random()*filenames.length)];
  gig.messages.push({
    from:'expert', type:'file',
    filename, size:'4.2 MB', time: now()
  });
  gig.messages.push({ from:'expert', text:'¡Listo! Subí el entregable. Revísalo y avísame si necesitas algún ajuste. 🎯', time: now() });
  gig.status   = 'delivered';
  gig.progress = 90;
  saveGigs();
  renderChatMessages(gig.messages);
  scrollChat();

  // Show approve button
  const approveBtn = document.getElementById('chatApproveBtn');
  if (approveBtn) approveBtn.style.display = 'flex';

  pushNotif('📁','Entregable recibido',`${gig.expertName} subió el archivo. Revísalo y aprueba.`,'#D1FAE5');
  if (document.getElementById('secTasks').classList.contains('active')) renderTasks();
}

/* ─────────────────────────────────────────
   STEP 6: Approve + Release Escrow
───────────────────────────────────────── */
function approveWork() {
  closeModal('modalChat');
  openModal('modalReview');
  // Pre-fill expert info
  const gig = activeGigs.find(g => g.id === chatGigId);
  if (!gig) return;
  document.getElementById('reviewAvIcon').textContent        = gig.expertIcon;
  document.getElementById('reviewAvIcon').style.background   = gig.expertBg;
  document.getElementById('reviewExpertName').textContent    = gig.expertName;
  document.getElementById('reviewTask').textContent          = gig.category;
  document.getElementById('reviewComment').value             = '';
  selectedStars = 0;
  document.querySelectorAll('.star-btn').forEach(s => s.classList.remove('active'));
}

/* ─────────────────────────────────────────
   STEP 7: Peer Review → Release CH
───────────────────────────────────────── */
function setStars(n) {
  selectedStars = n;
  document.querySelectorAll('.star-btn').forEach((s, i) => {
    s.classList.toggle('active', i < n);
  });
}

function submitReview() {
  if (selectedStars === 0) { pushNotif('⚠️','','Selecciona una calificación.','#FEF3C7'); return; }

  const gig     = activeGigs.find(g => g.id === chatGigId);
  const comment = document.getElementById('reviewComment').value.trim();

  if (gig) {
    // Release escrow: credit goes to expert (simulated)
    gig.status   = 'done';
    gig.progress = 100;
    gig.review   = { stars: selectedStars, comment };
    saveGigs();

    // Give user back feeling of closure — expert "received" credits
    window.currentUser.completedTasks = (window.currentUser.completedTasks || 0) + 1;
    DB.update(window.currentUser);
    saveSession(window.currentUser);
  }

  closeModal('modalReview');
  showAchievement('⭐', '¡Intercambio completado!', `Liberaste ${gig?.ch || 0} CH a ${gig?.expertName}. Tu reseña queda en su perfil.`);
  pushNotif('💸','Créditos liberados',`${gig?.ch} CH enviados a ${gig?.expertName} desde el escrow.`,'#D1FAE5');
  pushNotif('🏆','Reseña publicada',`Tu reseña de ${selectedStars}⭐ ya está en el perfil de ${gig?.expertName}.`,'#E9D5FF');

  if (document.getElementById('secTasks').classList.contains('active')) renderTasks();
  document.getElementById('statDone').textContent = window.currentUser.completedTasks;
}

/* ─────────────────────────────────────────
   TASKS SECTION Renderer
───────────────────────────────────────── */
function renderTasks() {
  const container = document.getElementById('tasksContainer');
  if (!container) return;

  if (activeGigs.length === 0) {
    container.innerHTML = `
      <div class="empty-gigs">
        <div class="empty-gigs-icon">🎯</div>
        <h3>No tienes gigs activos</h3>
        <p>Crea un ticket y encuentra el experto perfecto para tu proyecto</p>
        <button class="btn btn-primary" onclick="openCreateTicket()">+ Crear Ticket</button>
      </div>`;
    return;
  }

  container.innerHTML = '<div class="gig-list">' +
    activeGigs.map(gig => `
      <div class="gig-card">
        <div class="gig-head">
          <div class="gig-av" style="background:${gig.expertBg};">${gig.expertIcon}</div>
          <div>
            <div class="gig-title">${gig.category}</div>
            <div class="gig-sub">con ${gig.expertName} · ${gig.ch} CH en escrow</div>
          </div>
          <span class="gig-status-badge ${statusClass(gig.status)}">${statusLabel(gig.status)}</span>
        </div>
        <div class="gig-progress">
          <div class="gig-prog-labels">
            <span>Progreso</span><span>${gig.progress}%</span>
          </div>
          <div class="gig-prog-bar">
            <div class="gig-prog-fill" style="width:${gig.progress}%;"></div>
          </div>
        </div>
        <div class="gig-actions">
          <button class="btn btn-secondary btn-sm" onclick="openChat('${gig.id}')">💬 Abrir Chat</button>
          ${gig.status === 'delivered'
            ? `<button class="btn btn-primary btn-sm" onclick="chatGigId='${gig.id}';approveWork()">✅ Aprobar Trabajo</button>`
            : ''}
          ${gig.status === 'done'
            ? `<span style="font-size:13px;color:var(--green);font-weight:700;">✓ Completado · ${gig.review?.stars}⭐</span>`
            : ''}
        </div>
      </div>`).join('') +
    '</div>';
}

function statusLabel(s) {
  return { escrow:'🔒 En Escrow', working:'🔄 En Progreso', delivered:'📦 Entregado', done:'✅ Completado' }[s] || s;
}
function statusClass(s) {
  return { escrow:'status-escrow', working:'status-working', delivered:'status-review', done:'status-done' }[s] || '';
}

/* ─────────────────────────────────────────
   Simulate expert progress automatically
───────────────────────────────────────── */
function simulateProgress(gigId) {
  const gig = activeGigs.find(g => g.id === gigId);
  if (!gig || gig.status === 'done') return;
  gig.messages.push({ from:'expert', text:'Avanzando en el proyecto... ya tengo el 60% listo. 💪', time: now() });
  gig.progress = 60;
  gig.status   = 'working';
  saveGigs();
  pushNotif('🔄','Actualización',`${gig.expertName}: "Ya tengo el 60% del trabajo listo."`, '#DBEAFE');
  if (document.getElementById('secTasks').classList.contains('active')) renderTasks();
}

/* ─────────────────────────────────────────
   Utility
───────────────────────────────────────── */
function now() {
  const d = new Date();
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}
