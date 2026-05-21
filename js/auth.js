/* ═══════════════════════════════════════════
   AUTH — auth.js
═══════════════════════════════════════════ */

let selectedAvatar = 0;

// ── Render avatar picker grid ──
function renderAvatarPicker() {
  const el = document.getElementById('avatarPicker');
  el.innerHTML = '';
  AVATARS.forEach((av, i) => {
    const d = document.createElement('div');
    d.className = 'av-opt' + (i === 0 ? ' selected' : '');
    d.style.background = av.bg;
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
function handleLogin() {
  const code = document.getElementById('loginCode').value.trim();
  const pass = document.getElementById('loginPass').value;

  if (!code || !pass) {
    pushNotif('⚠️', 'Error', 'Completa todos los campos.', '#FEF3C7');
    return;
  }
  const user = DB.find(code, pass);
  if (user) {
    saveSession(user);
    pushNotif('👋', '¡Bienvenido!', `Hola ${user.name.split(' ')[0]}, entrando...`, '#D1FAE5');
    setTimeout(() => goTo('dashboard'), 1200);
  } else {
    pushNotif('❌', 'Error', 'Credenciales incorrectas.', '#FBE2F4');
  }
}

// ── Register ──
function handleRegister() {
  const name   = document.getElementById('regName').value.trim();
  const code   = document.getElementById('regCode').value.trim().toUpperCase();
  const pass   = document.getElementById('regPass').value;
  const skills = document.getElementById('regSkills').value.trim();

  if (!name || !code || !pass || !skills) {
    pushNotif('⚠️', 'Error', 'Completa todos los campos.', '#FEF3C7');
    return;
  }
  if (DB.findByCode(code)) {
    pushNotif('❌', 'Error', 'Código ya registrado.', '#FBE2F4');
    return;
  }
  if (pass.length < 6) {
    pushNotif('⚠️', 'Error', 'Contraseña mínimo 6 caracteres.', '#FEF3C7');
    return;
  }

  const av   = AVATARS[selectedAvatar];
  const user = {
    id: Date.now(),
    name,
    code,
    password: pass,
    skills: skills.split(',').map(s => s.trim()),
    credits: 100,
    completedTasks: 0,
    rating: 5.0,
    joinedDate: new Date().toISOString(),
    avatar: selectedAvatar,
    avatarBg: av.bg,
    avatarIcon: av.icon,
  };

  DB.users.push(user);
  DB.save();
  saveSession(user);

  pushNotif('🎉', '¡Cuenta creada!', `Bienvenido ${name.split(' ')[0]}, tienes 100 CH iniciales.`, '#D1FAE5');
  setTimeout(() => {
    goTo('dashboard');
    setTimeout(() => showAchievement('🚀', '¡Bienvenido a SkillSwap!', 'Has recibido 100 Créditos de Habilidad. ¡Explora el marketplace!'), 1000);
  }, 1200);
}

// ── Logout ──
function handleLogout() {
  clearSession();
  if (typeof demoInterval !== 'undefined' && demoInterval) stopDemo();
  goTo('landing');
}
