// Constantes
const CURRENT_USER_KEY = 'skillswap_current_user';

// Obtener usuario actual
function getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

// Cerrar sesión
function handleLogout() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        localStorage.removeItem(CURRENT_USER_KEY);
        window.location.href = 'auth.html';
    }
}

// Obtener iniciales
function getInitials(name) {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short' };
    return date.toLocaleDateString('es-ES', options);
}

// Cargar datos del usuario
function loadUserData() {
    const user = getCurrentUser();
    
    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

    // Header
    document.getElementById('userInitials').textContent = getInitials(user.name);
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userCode').textContent = user.code;

    // Stats
    document.getElementById('userCredits').textContent = user.credits;
    document.getElementById('completedTasks').textContent = user.completedTasks;
    document.getElementById('userRating').textContent = user.rating.toFixed(1);
    document.getElementById('joinedDate').textContent = formatDate(user.joinedDate);

    // Skills
    const skillsContainer = document.getElementById('userSkills');
    skillsContainer.innerHTML = '';
    user.skills.forEach(skill => {
        const skillTag = document.createElement('span');
        skillTag.className = 'skill-tag';
        skillTag.textContent = skill;
        skillsContainer.appendChild(skillTag);
    });

    // Profile Section
    document.getElementById('profileInitials').textContent = getInitials(user.name);
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileCode').textContent = user.code;
    document.getElementById('profileCredits').textContent = user.credits;
    document.getElementById('profileTasks').textContent = user.completedTasks;
    document.getElementById('profileRating').textContent = user.rating.toFixed(1);
    
    const profileSkillsContainer = document.getElementById('profileSkills');
    profileSkillsContainer.innerHTML = '';
    user.skills.forEach(skill => {
        const skillTag = document.createElement('span');
        skillTag.className = 'skill-tag';
        skillTag.textContent = skill;
        profileSkillsContainer.appendChild(skillTag);
    });
}

// Navegación entre secciones
function switchSection(sectionName) {
    // Remover active de todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remover active de todos los nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Activar la sección correspondiente
    const sectionMap = {
        'dashboard': 'dashboardSection',
        'marketplace': 'marketplaceSection',
        'my-tasks': 'myTasksSection',
        'profile': 'profileSection'
    };

    const sectionId = sectionMap[sectionName];
    if (sectionId) {
        document.getElementById(sectionId).classList.add('active');
    }

    // Activar nav item correspondiente
    const navItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }

    // Actualizar título de página
    const titleMap = {
        'dashboard': { title: 'Dashboard', subtitle: 'Resumen de tu actividad' },
        'marketplace': { title: 'Marketplace', subtitle: 'Descubre servicios disponibles' },
        'my-tasks': { title: 'Mis Tareas', subtitle: 'Gestiona tus proyectos activos' },
        'profile': { title: 'Mi Perfil', subtitle: 'Información personal y estadísticas' }
    };

    const pageInfo = titleMap[sectionName];
    if (pageInfo) {
        document.getElementById('pageTitle').textContent = pageInfo.title;
        document.getElementById('pageSubtitle').textContent = pageInfo.subtitle;
    }
}

// Event listeners para navegación
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();

    // Navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Animaciones de entrada
    setTimeout(() => {
        document.querySelectorAll('.stat-card').forEach((card, index) => {
            card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s both`;
        });
    }, 100);
});

// Animación de counter para stats
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Agregar animación de hover a las service cards
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Keyframes para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

console.log('SkillSwap Campus - Dashboard inicializado ✨');
