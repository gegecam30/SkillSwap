/**
 * Lógica principal de SkillSwap Campus (Prototipo)
 * Simula el flujo del sistema de contratos Escrow (retención de saldo) y actualización de la Billetera de Créditos de Habilidad (CH).
 */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Estado inicial de la Billetera 
    let walletBalance = parseInt(document.getElementById('ch-balance').innerText);
    const balanceElement = document.getElementById('ch-balance');

    // 2. Interacción: Publicar Necesidad
    const btnPublicar = document.getElementById('btn-publicar');
    if (btnPublicar) {
        btnPublicar.addEventListener('click', () => {
            // Animación sutil de clic
            btnPublicar.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btnPublicar.style.transform = 'none';
                alert('Abriendo formulario para detallar el requerimiento. Se requerirá congelar CH en el sistema Escrow al confirmar.');
            }, 150);
        });
    }

    // 3. Interacción: Matchmaking y Escrow
    const actionButtons = document.querySelectorAll('.card .btn-secondary');

    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.card');
            const title = card.querySelector('h3').innerText;
            const priceText = card.querySelector('.price strong').innerText;
            const costCH = parseInt(priceText.replace(' CH', ''));
            
            // Detectar si el usuario está contratando un servicio o postulando a uno
            const isContratar = this.innerText.toLowerCase().includes('contratar');

            // Validación de saldo si el usuario está contratando
            if (isContratar && walletBalance < costCH) {
                alert('Saldo insuficiente. Necesitas más Créditos de Habilidad (CH) para esta operación.');
                return;
            }

            // UI: Estado de carga
            this.innerText = 'Procesando Escrow...';
            this.style.pointerEvents = 'none';
            this.style.opacity = '0.7';

            // Simulación asíncrona de conexión al backend
            setTimeout(() => {
                if (isContratar) {
                    // Deducción de la billetera (simulando retención) 
                    walletBalance -= costCH;
                    balanceElement.innerText = walletBalance;
                    
                    // Feedback visual en la billetera
                    balanceElement.style.color = '#34d399';
                    balanceElement.style.transform = 'scale(1.3)';
                    balanceElement.style.transition = 'all 0.3s ease';
                    
                    setTimeout(() => {
                        balanceElement.style.color = 'inherit';
                        balanceElement.style.transform = 'none';
                    }, 500);

                    alert(`¡Match exitoso para: "${title}"!\nSe han deducido ${costCH} CH de tu billetera y están retenidos en fideicomiso (Escrow) hasta que valides la entrega.`);
                } else {
                    // Lógica para el que postula (no gasta sus propios CH)
                    alert(`¡Postulación enviada para: "${title}"!\nSi te aceptan, los ${costCH} CH del cliente quedarán congelados en Escrow para garantizar tu pago.`);
                }

                // UI: Actualizar estado de la tarjeta a "Contrato Activo"
                this.innerText = 'Contrato Activo';
                this.style.background = 'rgba(52, 211, 153, 0.15)'; // Fondo verde transparente
                this.style.color = '#34d399'; // Texto verde neon
                this.style.border = '1px solid rgba(52, 211, 153, 0.5)';
                this.style.opacity = '1';
                
            }, 800);
        });
    });
});