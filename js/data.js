
/* ═══════════════════════════════════════════
   DATA & CONSTANTS — data.js
   Cargado primero en index.html
═══════════════════════════════════════════ */

const AVATARS = [
  { bg: '#050a0d', img: '/img/Avatar1.png' },
  { bg: 'linear-gradient(135deg,#60A5FA,#3B82F6)', icon: '🐬' },
  { bg: 'linear-gradient(135deg,#34D399,#10B981)', icon: '🌿' },
  { bg: 'linear-gradient(135deg,#F59E0B,#F97316)', icon: '🦊' },
  { bg: 'linear-gradient(135deg,#EC4899,#BE185D)', icon: '🌸' },
  { bg: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', icon: '🔮' },
  { bg: 'linear-gradient(135deg,#06B6D4,#0284C7)', icon: '🐳' },
  { bg: 'linear-gradient(135deg,#F97316,#EF4444)', icon: '🔥' },
  { bg: 'linear-gradient(135deg,#84CC16,#22C55E)', icon: '🌵' },
  { bg: 'linear-gradient(135deg,#A78BFA,#60A5FA)', icon: '⚡' },
];

const SERVICES = [
  { name:'Ana García',   initials:'AG', bg:'linear-gradient(135deg,#A78BFA,#EC4899)', rating:'5.0', title:'Diseño UI/UX Figma',         desc:'Diseño interfaces modernas y limpias. Incluye prototipo interactivo.', tags:['Diseño','Figma'],          price:35 },
  { name:'Luis Ramos',   initials:'LR', bg:'linear-gradient(135deg,#60A5FA,#3B82F6)', rating:'4.9', title:'Desarrollo Web React',         desc:'Landing pages y SPAs con React, Tailwind y animaciones.',             tags:['Programación','React'],     price:45 },
  { name:'Sofía Mendez', initials:'SM', bg:'linear-gradient(135deg,#34D399,#10B981)', rating:'5.0', title:'Marketing de Contenido',       desc:'Plan de contenido para redes y estrategia de marca personal.',        tags:['Marketing','RRSS'],         price:28 },
  { name:'Carlos Vega',  initials:'CV', bg:'linear-gradient(135deg,#F59E0B,#F97316)', rating:'4.8', title:'Tutoría de Cálculo',           desc:'Apoyo en cálculo I, II y álgebra lineal. Ejercicios personalizados.', tags:['Matemáticas','Tutoría'],    price:20 },
  { name:'María Torres', initials:'MT', bg:'linear-gradient(135deg,#EC4899,#BE185D)', rating:'4.9', title:'Traducción Inglés-Español',    desc:'Traducciones técnicas y revisión de documentos académicos.',          tags:['Idiomas','Inglés'],         price:22 },
  { name:'Diego Paz',    initials:'DP', bg:'linear-gradient(135deg,#8B5CF6,#6D28D9)', rating:'5.0', title:'Edición de Video Creativa',    desc:'Edición profesional con efectos, motion graphics y música.',          tags:['Video','Diseño'],           price:40 },
];

const POSTS = [
  {
    av:'AG', bg:'linear-gradient(135deg,#A78BFA,#EC4899)',
    author:'Ana García', role:'UI/UX Designer', time:'hace 2h',
    body:'¡Acabo de completar mi primer intercambio en SkillSwap! Diseñé la identidad visual para el proyecto de Luis a cambio de una landing page. La plataforma es increíble 🎨',
    achievement:{ icon:'🎨', text:'¡Primera colaboración completada!' },
    likes:24, comments:8
  },
  {
    av:'LR', bg:'linear-gradient(135deg,#60A5FA,#3B82F6)',
    author:'Luis Ramos', role:'Frontend Developer', time:'hace 4h',
    body:'Tip del día: Cuando ofrezcas un servicio, sé específico en los entregables. Yo siempre incluyo: número de revisiones, formato de entrega y tiempo estimado. ¡Así generas confianza! 💻',
    likes:41, comments:15
  },
  {
    av:'SM', bg:'linear-gradient(135deg,#34D399,#10B981)',
    author:'Sofía Mendez', role:'Marketing Strategist', time:'hace 6h',
    body:'¿Alguien necesita ayuda con su estrategia de contenido para el proyecto de emprendimiento? Tengo 10 créditos libres esta semana y me encantaría colaborar 🌱',
    likes:18, comments:22
  },
];

const TIMELINE = [
  { icon:'🚀', event:'Te uniste a SkillSwap Campus',          date:'Hoy',       badge:null },
  { icon:'💰', event:'Recibiste 100 créditos iniciales',       date:'Hoy',       badge:'+100 CH' },
  { icon:'🎯', event:'Completa tu primer intercambio',         date:'Pendiente', badge:null },
  { icon:'⭐', event:'Obtén tu primera reseña 5 estrellas',    date:'Pendiente', badge:null },
  { icon:'🏆', event:'Desbloquea el rango "Experto"',          date:'Pendiente', badge:null },
];

const ONBOARD_STEPS = [
  { el:'#chipAv',                          title:'Tu perfil',           desc:'Aquí aparecen tu avatar y código universitario. Siempre visibles en el dashboard.' },
  { el:'#secHome .welcome-banner',         title:'Panel de bienvenida', desc:'Muestra tus créditos CH disponibles y un resumen rápido de tu actividad.' },
  { el:'#secHome .chart-row',              title:'Analíticas visuales', desc:'Sigue la evolución de tus créditos y el desglose de tus habilidades en tiempo real.' },
  { el:'.sb-item[data-sec="marketplace"]', title:'Marketplace',         desc:'Explora servicios de otros estudiantes o publica los tuyos para ganar créditos.' },
  { el:'.sb-item[data-sec="social"]',      title:'Social Feed',         desc:'Conecta con la comunidad, comparte logros y colabora con otros estudiantes.' },
];

const DEMO_NOTIFS = [
  ['🤝','Nueva solicitud',       'Carlos solicita tus habilidades de Diseño por 30 CH', '#D1FAE5'],
  ['💬','Nuevo mensaje',          'Ana García te envió un mensaje',                       '#DBEAFE'],
  ['✅','Intercambio completado', 'Luis Ramos marcó tu entrega como aceptada',            '#D1FAE5'],
  ['⭐','Nueva reseña',           'Sofía te dejó 5 estrellas en Marketing Digital',       '#FEF3C7'],
  ['💰','+40 Créditos',           'Se liberaron tus créditos del escrow',                 '#D1FAE5'],
  ['🔥','¡Top 10!',               'Entraste al top 10 de diseñadores de esta semana',     '#FFEDD5'],
  ['🎯','Match encontrado',       '¡Coincidencia perfecta! Diego busca exactamente tus habilidades', '#E9D5FF'],
  ['👥','Nuevo seguidor',         'María Torres comenzó a seguirte',                      '#FBE2F4'],
];
