/* ═══════════════════════════════════════════
   AUTH — auth.js
═══════════════════════════════════════════ */

let selectedAvatar = 0;

function renderAvatarPicker() {
  const el = document.getElementById('avatarPicker');
  if(!el) return;
  el.innerHTML = '';
  AVATARS.forEach((av, i) => {
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

// js/auth.js (Reemplaza handleLogin y handleRegister con esto)

async function handleLogin() {
  const code = document.getElementById('loginCode').value.trim();
  const pass = document.getElementById('loginPass').value;

  if (!code || !pass) {
    if(typeof pushNotif === 'function') pushNotif('⚠️', 'Error', 'Completa todos los campos.', '#00e5ff');
    return;
  }

  try {
    // Petición al backend en Python
    const response = await fetch('http://127.0.0.1:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code, password: pass })
    });
    
    const result = await response.json();

    if (result.error) {
      if(typeof pushNotif === 'function') pushNotif('❌', 'Error', result.error, '#ff2a6d');
      return;
    }

    // Guardamos la sesión usando el ID real de Supabase
    const user = { id: result.user_id, name: code, credits: 100 };
    saveSession(user);
    
    if(typeof pushNotif === 'function') pushNotif('👋', '¡Bienvenido!', `Conectado al servidor...`, '#00e5ff');
    setTimeout(() => {
      if(typeof goTo === 'function') goTo('dashboard');
    }, 1200);

  } catch (error) {
    console.error("Error HTTP:", error);
    if(typeof pushNotif === 'function') pushNotif('🔌', 'Error', 'No hay conexión con FastAPI.', '#ff2a6d');
  }
}

async function handleRegister() {
  const name   = document.getElementById('regName').value.trim();
  const code   = document.getElementById('regCode').value.trim().toUpperCase();
  const pass   = document.getElementById('regPass').value;
  const skills = document.getElementById('regSkills').value.trim();

  if (!name || !code || !pass || !skills) {
    if(typeof pushNotif === 'function') pushNotif('⚠️', 'Error', 'Completa todos los campos.', '#00e5ff');
    return;
  }
  if (pass.length < 6) {
    if(typeof pushNotif === 'function') pushNotif('⚠️', 'Error', 'Contraseña mínimo 6 caracteres.', '#00e5ff');
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, code: code, password: pass, skills: skills })
    });
    
    const result = await response.json();

    if (result.error) {
      if(typeof pushNotif === 'function') pushNotif('❌', 'Error', result.error, '#ff2a6d');
      return;
    }

    if(typeof pushNotif === 'function') pushNotif('🎉', '¡Cuenta creada!', `Base de datos actualizada.`, '#00e5ff');
    
    // Cambiamos automáticamente al panel de login
    setTimeout(() => {
      switchPane('login');
    }, 1500);

  } catch (error) {
    console.error("Error HTTP:", error);
    if(typeof pushNotif === 'function') pushNotif('🔌', 'Error', 'No hay conexión con FastAPI.', '#ff2a6d');
  }
}