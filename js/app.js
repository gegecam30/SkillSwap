document.addEventListener("DOMContentLoaded", () => {
    
    // ------------------------------------------------
    // 1. SISTEMA DE NAVEGACIÓN SPA (Router)
    // ------------------------------------------------
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remover clase active de todos los botones y secciones
            navItems.forEach(nav => nav.classList.remove('active'));
            viewSections.forEach(view => view.classList.remove('active'));
            
            // Añadir clase active al botón clickeado
            item.classList.add('active');
            
            // Mostrar la sección correspondiente
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // ------------------------------------------------
    // 2. LÓGICA DE BILLETERA Y ESCROW (Mantenida)
    // ------------------------------------------------
    let walletBalance = parseInt(document.getElementById('ch-balance').innerText);
    const balanceElement = document.getElementById('ch-balance');

    // Botón Publicar
    const btnPublicar = document.getElementById('btn-publicar');
    if (btnPublicar) {
        btnPublicar.addEventListener('click', () => {
            btnPublicar.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btnPublicar.style.transform = 'none';
                alert('Abriendo editor de solicitud. Se requerirá retener CH para publicar.');
            }, 150);
        });
    }

    // Botones de las tarjetas en el Feed
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.card');
            const title = card.querySelector('h3').innerText;
            const priceText = card.querySelector('.price strong').innerText;
            const costCH = parseInt(priceText.replace(' CH', ''));
            const isContratar = this.innerText.toLowerCase().includes('contratar');

            if (isContratar && walletBalance < costCH) {
                alert('Saldo insuficiente. Necesitas más Créditos de Habilidad (CH).');
                return;
            }

            this.innerText = 'Procesando...';
            this.style.pointerEvents = 'none';
            this.style.opacity = '0.7';

            setTimeout(() => {
                if (isContratar) {
                    walletBalance -= costCH;
                    balanceElement.innerText = walletBalance;
                    
                    // Animación de la billetera
                    balanceElement.style.color = '#34d399';
                    balanceElement.style.transform = 'scale(1.3)';
                    balanceElement.style.transition = 'all 0.3s ease';
                    setTimeout(() => {
                        balanceElement.style.color = 'inherit';
                        balanceElement.style.transform = 'none';
                    }, 500);

                    alert(`¡Match exitoso! ${costCH} CH han sido movidos a Escrow[cite: 56]. Revisa la pestaña "Mis Contratos".`);
                } else {
                    alert(`¡Postulación enviada para: "${title}"!\nSi te aceptan, los CH quedarán retenidos garantizando tu trabajo[cite: 56].`);
                }

                this.innerText = 'Contrato Activo';
                this.style.background = 'rgba(52, 211, 153, 0.15)';
                this.style.color = '#34d399';
                this.style.border = '1px solid rgba(52, 211, 153, 0.5)';
                this.style.opacity = '1';
                
            }, 800);
        });
    });
});
