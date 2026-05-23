/* ═══════════════════════════════════════════
   AUTH — auth.js (100% FASTAPI / SIN FALLBACKS)
   + Subida de imagen de perfil personalizada
   + Preparado para Supabase
═══════════════════════════════════════════ */

// API ya está definida globalmente en data.js (detección automática dev/prod)
let selectedAvatar = 0;
let customAvatarFile = null;   // Archivo seleccionado por el usuario
let customAvatarDataURL = null; // Preview en base64

// ── Renderizar avatar picker ──
function renderAvatarPicker() {
  const el = document.getElementById('avatarPicker');
  if (!el) return;
  el.innerHTML = '';
  const avatars = (typeof AVATARS !== 'undefined') ? AVATARS : [{ img: 'img/Avatar1.png', bg: '#050a0d' }];

  avatars.forEach((av, i) => {
    const d = document.createElement('div');
    d.className = 'av-opt' + (i === 0 ? ' selected' : '');

    if (av.img) {
      const im = document.createElement('img');
      im.src = av.img;
      im.alt = `Avatar ${i + 1}`;
      im.draggable = false;
      d.appendChild(im);
    } else if (av.icon) {
      d.textContent = av.icon;
    } else {
      d.textContent = '?';
    }

    d.onclick = () => {
          document.querySelectorAll('.av-opt').forEach(a => a.classList.remove('selected'));
          d.classList.add('selected');
          selectedAvatar = i;
          customAvatarFile = null;
          customAvatarDataURL = null;
          
          // ── AQUÍ LA MAGIA: Si ya inició sesión, guarda el avatar en la BD ──
          if (window.currentUser && typeof saveSelectedAvatar === 'function') {
            saveSelectedAvatar(av.img);
          }
        };
    el.appendChild(d);
  });

  // ── Botón para subir imagen personalizada ──
  const uploadOpt = document.createElement('div');
  uploadOpt.className = 'av-opt av-opt-upload';
  uploadOpt.id = 'avatarUploadBtn';
  uploadOpt.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
    <span class="av-upload-label">Subir</span>
  `;

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/png,image/jpeg,image/webp,image/gif';
  fileInput.style.display = 'none';
  fileInput.id = 'avatarFileInput';
  fileInput.onchange = (e) => handleCustomAvatarUpload(e, uploadOpt);

  uploadOpt.onclick = () => fileInput.click();
  uploadOpt.appendChild(fileInput);
  el.appendChild(uploadOpt);

  selectedAvatar = 0;
}

// ── Manejar subida de avatar personalizado ──
function handleCustomAvatarUpload(event, uploadOptElement) {
  const file = event.target.files[0];
  if (!file) return;

  // Validar tamaño (máx 2MB)
  if (file.size > 2 * 1024 * 1024) {
    if (typeof pushNotif === 'function') pushNotif('⚠️', 'Archivo muy grande', 'Máximo 2MB permitido.', '#ff2a6d');
    return;
  }

  customAvatarFile = file;

  const reader = new FileReader();
    reader.onload = async (e) => { // <--- Agregamos 'async' aquí
      customAvatarDataURL = e.target.result;

      // Actualizar la UI del botón de upload para mostrar preview
      uploadOptElement.innerHTML = '';
      const previewImg = document.createElement('img');
      previewImg.src = customAvatarDataURL;
      previewImg.alt = 'Tu avatar';
      previewImg.draggable = false;
      // IMPORTANTE: Mismo fix de CSS para que no se estire el preview
      previewImg.style.width = '100%';
      previewImg.style.height = '100%';
      previewImg.style.objectFit = 'cover';
      previewImg.style.borderRadius = '50%';
      uploadOptElement.appendChild(previewImg);

      // Seleccionar este avatar
      document.querySelectorAll('.av-opt').forEach(a => a.classList.remove('selected'));
      uploadOptElement.classList.add('selected');
      selectedAvatar = -1; // -1 indica avatar personalizado

      if (typeof pushNotif === 'function') pushNotif('📸', 'Avatar cargado', 'Tu imagen personalizada está lista.', '#00e5ff');

      // ── INTEGRACIÓN CON SUPABASE STORAGE Y SQL ──
      // Solo lo subimos automáticamente si el usuario ya inició sesión (Dashboard)
      // (Si está en la pantalla de Registro, se debe subir DESPUÉS de crear la cuenta)
      if (window.currentUser && typeof uploadAvatarToSupabase === 'function') {
          try {
              // 1. Subir archivo a Supabase Storage (carpeta de imágenes)
              const publicUrl = await uploadAvatarToSupabase(file);
              
              // 2. Guardar la URL resultante en la base de datos (SQL)
              if (publicUrl) {
                  saveSelectedAvatar(publicUrl);
              }
          } catch (err) {
              console.error(err);
              if (typeof pushNotif === 'function') pushNotif('❌', 'Error', 'Fallo al subir a la nube.', '#ff2a6d');
          }
      }
    };
    reader.readAsDataURL(file);
}

// ── Helper: obtener datos del avatar para mostrar ──
function getAvatarDisplay(avatarIndex, customUrl) {
  // Si tiene avatar custom (URL de Supabase o dataURL local)
  if (customUrl) {
    return { type: 'img', src: customUrl, bg: '#0d1b2a' };
  }
  // Si es un avatar predefinido válido
  if (typeof AVATARS !== 'undefined' && AVATARS[avatarIndex] && AVATARS[avatarIndex].img) {
    return { type: 'img', src: AVATARS[avatarIndex].img, bg: AVATARS[avatarIndex].bg || '#0d1b2a' };
  }
  // Fallback
  return { type: 'text', text: '?', bg: '#00e5ff' };
}

// ── Aplicar avatar a un elemento DOM ──
function applyAvatarToElement(element, avatarIndex, customUrl) {
  if (!element) return;
  const display = getAvatarDisplay(avatarIndex, customUrl);

  element.style.background = display.bg;
  element.innerHTML = '';

  if (display.type === 'img') {
    const img = document.createElement('img');
    img.src = display.src;
    img.alt = 'Avatar';
    img.draggable = false;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;';
    element.appendChild(img);
  } else {
    element.textContent = display.text;
  }
}

// ── Login ──
async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;

  if (!email || !pass) {
    if (typeof pushNotif === 'function') pushNotif('⚠️', 'Error', 'Completa todos los campos.', '#ff2a6d');
    return;
  }

  try {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if(loadingOverlay) loadingOverlay.style.display = 'flex';

    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pass })
    });
    const data = await res.json();
    
    if(loadingOverlay) loadingOverlay.style.display = 'none';

    if (data.error) {
      if (typeof pushNotif === 'function') pushNotif('❌', 'Error', data.error, '#ff2a6d');
      return;
    }

    const user = { id: data.user_id, avatar: selectedAvatar || 0 };

    // Si hay avatar personalizado, guardarlo como dataURL temporal
    if (customAvatarDataURL && selectedAvatar === -1) {
      user.avatar = -1;
      user.customAvatar = customAvatarDataURL;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    goTo('dashboard');
  } catch (error) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if(loadingOverlay) loadingOverlay.style.display = 'none';
    if (typeof pushNotif === 'function') pushNotif('🔌', 'Sin Conexión', 'No se pudo contactar al servidor.', '#ff2a6d');
  }
}

// ── Register ──
async function handleRegister() {
  const name   = document.getElementById('regName').value.trim();
  const email  = document.getElementById('regEmail').value.trim();
  const pass   = document.getElementById('regPass').value;
  
  // Leer valores múltiples del select
  const skillsSelect = document.getElementById('regSkills');
  const selectedOptions = Array.from(skillsSelect.selectedOptions).map(opt => opt.value);
  const skills = selectedOptions.join(', ');

  // 1. Validaciones básicas
  if (!name || !email || !pass || !skills) {
    if (typeof pushNotif === 'function') pushNotif('⚠️', 'Error', 'Faltan campos por llenar.', '#00e5ff');
    return;
  }

  // 2. Filtro Anti-Contraseñas Débiles
  const weakPasswords = ['123456', '12345678', 'password', 'abcdef', 'qwerty', '123456789'];
  if (pass.length < 6 || weakPasswords.includes(pass.toLowerCase())) {
    if (typeof pushNotif === 'function') pushNotif('🛡️', 'Seguridad', 'Contraseña muy débil. Usa algo más seguro.', '#ff2a6d');
    return;
  }

  try {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if(loadingOverlay) loadingOverlay.style.display = 'flex';

    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, password: pass, skills: skills })
    });
    const data = await res.json();
    
    if(loadingOverlay) loadingOverlay.style.display = 'none';

    if (data.error) {
      if (typeof pushNotif === 'function') pushNotif('❌', 'Error', data.error, '#ff2a6d');
      return;
    }

    // Si hay avatar personalizado, subirlo a Supabase tras el registro
    if (customAvatarFile && selectedAvatar === -1 && data.user_id) {
      await uploadAvatarToSupabase(data.user_id, customAvatarFile);
    }

    // ── Mostrar pantalla de verificación de correo ──
    showVerifyScreen(email, data.bonus_applied);

  } catch (error) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if(loadingOverlay) loadingOverlay.style.display = 'none';
    if (typeof pushNotif === 'function') pushNotif('🔌', 'Sin Conexión', 'No se pudo contactar al servidor.', '#ff2a6d');
  }
}

// ── Logout ──
function handleLogout() {
  localStorage.removeItem('currentUser');
  if (typeof demoInterval !== 'undefined' && demoInterval) stopDemo();
  goTo('landing');
}

// ═══════════════════════════════════════════
//  SUPABASE — Configuración y Upload de Avatar
//  Descomenta y configura cuando conectes Supabase
// ═══════════════════════════════════════════

/*
// ── 1. Inicializar cliente Supabase ──
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
*/

// ── Subir avatar a Supabase Storage ──
async function uploadAvatarToSupabase(userId, file) {
  /*
  // ── Requiere Supabase configurado ──
  if (!supabase) {
    console.warn('Supabase no está configurado. Avatar guardado localmente.');
    return null;
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Subir archivo al bucket 'avatars'
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true  // Reemplaza si ya existe
      });

    if (error) {
      console.error('Error subiendo avatar:', error);
      if (typeof pushNotif === 'function') pushNotif('❌', 'Error', 'No se pudo subir la imagen.', '#ff2a6d');
      return null;
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Guardar la URL en la tabla de perfiles
    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (typeof pushNotif === 'function') pushNotif('✅', 'Avatar guardado', 'Tu imagen se subió correctamente.', '#00e5ff');
    return publicUrl;

  } catch (err) {
    console.error('Error en uploadAvatarToSupabase:', err);
    return null;
  }
  */

  // Mientras no haya Supabase, guardamos en localStorage
  console.log('Supabase no configurado — avatar guardado en localStorage');
  return null;
}

// ── Cambiar avatar desde el perfil (dashboard) ──
function openProfileAvatarUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/webp,image/gif';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      if (typeof pushNotif === 'function') pushNotif('⚠️', 'Error', 'La imagen no puede superar 2MB.', '#ff2a6d');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;

      if (window.currentUser) {
        // Mostramos el preview localmente de inmediato para que se sienta rápido
        const profAv = document.getElementById('profAv');
        const chipAv = document.getElementById('chipAv');
        const imgTag = `<img src="${dataUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        
        if (profAv) profAv.innerHTML = imgTag;
        if (chipAv) chipAv.innerHTML = imgTag;

        // Guardamos el avatar en base64 en la base de datos (Backend)
        if (window.currentUser.id && typeof saveSelectedAvatar === 'function') {
          saveSelectedAvatar(dataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// ═══════════════════════════════════════════
//  PANTALLA DE VERIFICACIÓN DE CORREO
// ═══════════════════════════════════════════
function showVerifyScreen(email, bonusApplied) {
  // Mostrar el pane de verificación
  switchPane('verify');

  // Inyectar el email del usuario
  const emailEl = document.getElementById('verifyEmail');
  if (emailEl) emailEl.textContent = email;

  // Mostrar badge de bono si aplica
  const bonusBadge = document.getElementById('verifyBonus');
  if (bonusBadge) {
    bonusBadge.style.display = bonusApplied ? 'inline-flex' : 'none';
  }

  // Guardar el email para pre-llenarlo en login después
  window._pendingVerifyEmail = email;
}

// Función para ir al login desde la pantalla de verificación
function goToLoginFromVerify() {
  switchPane('login');
  const loginEmail = document.getElementById('loginEmail');
  if (loginEmail && window._pendingVerifyEmail) {
    loginEmail.value = window._pendingVerifyEmail;
  }
  if (typeof pushNotif === 'function') {
    pushNotif('✅', '¡Listo!', 'Ingresa tu contraseña para comenzar.', '#00e5ff');
  }
}