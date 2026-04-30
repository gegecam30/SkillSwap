// Simulación de base de datos en LocalStorage
const USERS_KEY = 'skillswap_users';
const CURRENT_USER_KEY = 'skillswap_current_user';

// Funciones de utilidad
function getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

// Switch entre formularios
function switchToRegister() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginForm.classList.remove('active');
    setTimeout(() => {
        registerForm.classList.add('active');
    }, 100);
}

function switchToLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    registerForm.classList.remove('active');
    setTimeout(() => {
        loginForm.classList.add('active');
    }, 100);
}

// Mostrar toast
function showToast(title, message, duration = 3000) {
    const toast = document.getElementById('successToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const code = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const users = getUsers();
    const user = users.find(u => u.code === code && u.password === password);
    
    if (user) {
        // Login exitoso
        setCurrentUser(user);
        showToast('¡Bienvenido!', `Hola ${user.name}, redirigiendo...`);
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        // Credenciales incorrectas
        showToast('Error', 'Credenciales incorrectas. Intenta de nuevo.');
    }
}

// Handle Register
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const code = document.getElementById('registerCode').value.trim().toUpperCase();
    const password = document.getElementById('registerPassword').value;
    const skills = document.getElementById('registerSkills').value.trim();
    
    const users = getUsers();
    
    // Verificar si el código ya existe
    if (users.some(u => u.code === code)) {
        showToast('Error', 'Este código de estudiante ya está registrado.');
        return;
    }
    
    // Crear nuevo usuario
    const newUser = {
        id: Date.now(),
        name,
        code,
        password,
        skills: skills.split(',').map(s => s.trim()),
        credits: 100, // Créditos iniciales
        rating: 0,
        completedTasks: 0,
        joinedDate: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    
    showToast('¡Cuenta creada!', `Bienvenido ${name}, redirigiendo...`);
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

// Verificar si ya hay sesión activa
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Ya hay sesión activa, redirigir al dashboard
        window.location.href = 'dashboard.html';
    }
});

// Animación del logo
const logo = document.querySelector('.logo-header');
if (logo) {
    logo.addEventListener('click', () => {
        logo.style.transform = 'scale(0.95)';
        setTimeout(() => {
            logo.style.transform = 'scale(1)';
        }, 200);
    });
}

console.log('SkillSwap Campus - Autenticación inicializada ✨');
