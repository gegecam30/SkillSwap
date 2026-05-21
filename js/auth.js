/* ═══════════════════════════════════════════
   AUTH — auth.js (100% FASTAPI / SIN FALLBACKS)
═══════════════════════════════════════════ */

const API = 'http://127.0.0.1:8000'; // URL del backend FastAPI
let selectedAvatar = 0;

// ── Renderizar avatar picker ──
function renderAvatarPicker() {
  const el = document.getElementById('avatarPicker');
  if (!el) return;
  el.innerHTML = '';
  // Si AVATARS no está cargado, ponemos un fallback seguro
  const avatars = (typeof AVATARS !== 'undefined') ? AVATARS : [{icon: '👽', bg: '#00e5ff'}];
  
  avatars.forEach((av, i) => {
    const d = document.createElement('div');
    d.className = 'av-opt' + (i === 0 ? ' selected' : '');
    d.textContent = av.icon;
    d.onclick = () => {
      document.querySelectorAll('.av-opt').forEach(a => a.classList.remove('selected'));
      d.classList.add('selected');
      selectedAvatar = i;
    };
    el.appendChild(d);
  });
  selectedAvatar = 0;
}

// ── Login ──
async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  
  if (!email || !pass) {
    if(typeof pushNotif === 'function') pushNotif('⚠️', 'Error', 'Completa todos los campos.', '#ff2a6d');
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pass })
    });
    const data = await res.json();
    
    if (data.error) {
      if(typeof pushNotif === 'function') pushNotif('❌', 'Error', data.error, '#ff2a6d');
      return;
    }

    const user = { id: data.user_id, avatar: selectedAvatar || 0 };
    localStorage.setItem('currentUser', JSON.stringify(user));
    goTo('dashboard');
  } catch (error) {
    if(typeof pushNotif === 'function') pushNotif('🔌', 'Sin Conexión', 'No se pudo contactar al servidor.', '#ff2a6d');
  }
}

// ── Register ──
async function handleRegister() {
  const name   = document.getElementById('regName').value.trim();
  const email  = document.getElementById('regEmail').value.trim();
  const pass   = document.getElementById('regPass').value;
  const skills = document.getElementById('regSkills').value.trim();

  // 1. Validaciones básicas
  if (!name || !email || !pass || !skills) {
    if(typeof pushNotif === 'function') pushNotif('⚠️', 'Error', 'Faltan campos por llenar.', '#00e5ff');
    return;
  }
  
  // 2. Filtro Anti-Contraseñas Débiles
  const weakPasswords = ['123456', '12345678', 'password', 'abcdef', 'qwerty', '123456789'];
  if (pass.length < 6 || weakPasswords.includes(pass.toLowerCase())) {
    if(typeof pushNotif === 'function') pushNotif('🛡️', 'Seguridad', 'Contraseña muy débil. Usa algo más seguro.', '#ff2a6d');
    return;
  }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, password: pass, skills: skills })
    });
    const data = await res.json();
    
    if (data.error) {
      if(typeof pushNotif === 'function') pushNotif('❌', 'Error', data.error, '#ff2a6d');
      return;
    }

    // Mensaje dinámico según el bono
    const msg = data.bonus_applied 
      ? '¡Bono .edu activado! Revisa tu email para verificar la cuenta.' 
      : 'Revisa tu email para verificar la cuenta.';
      
    if(typeof pushNotif === 'function') pushNotif('✉️', 'Verificación enviada', msg, '#00e5ff');
    
    setTimeout(() => {
      switchPane('login');
      document.getElementById('loginEmail').value = email;
    }, 2500);

  } catch (error) {
    if(typeof pushNotif === 'function') pushNotif('🔌', 'Sin Conexión', 'No se pudo contactar al servidor.', '#ff2a6d');
  }
}

// ── Logout ──
function handleLogout() {
  localStorage.removeItem('currentUser');
  if (typeof demoInterval !== 'undefined' && demoInterval) stopDemo();
  goTo('landing');
}