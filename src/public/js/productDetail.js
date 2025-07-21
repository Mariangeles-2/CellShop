// JavaScript para la página de detalle del producto
document.addEventListener('DOMContentLoaded', function () {
    // Funcionalidad del botón agregar al carrito
    const addToCartButton = document.querySelector('.btn-add-cart-large');
    const quantityInput = document.getElementById('quantity');

    if (addToCartButton) {
        addToCartButton.addEventListener('click', async function () {
            const productId = this.getAttribute('data-product-id');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            const originalText = this.textContent;

            try {
                // Validar cantidad
                if (!quantity || quantity <= 0) {
                    alert('Por favor, selecciona una cantidad válida');
                    return;
                }

                // Cambiar estado del botón
                this.textContent = 'Agregando...';
                this.disabled = true;

                // Aquí podrías hacer la llamada real a la API para agregar al carrito
                // Por ejemplo: POST /api/carts/:cartId/product/:productId
                // Por ahora simulamos la funcionalidad
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mostrar mensaje de éxito
                this.textContent = '¡Agregado al carrito!';
                this.style.background = '#28a745';

                // Mostrar notificación
                showNotification(`${quantity} producto(s) agregado(s) al carrito`, 'success');

                // Restaurar botón después de 3 segundos
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '';
                    this.disabled = false;
                }, 3000);

                console.log(`Producto ${productId} agregado al carrito con cantidad: ${quantity}`);

            } catch (error) {
                console.error('Error al agregar al carrito:', error);

                this.textContent = 'Error al agregar';
                this.style.background = '#dc3545';

                showNotification('Error al agregar al carrito', 'error');

                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '';
                    this.disabled = false;
                }, 3000);
            }
        });
    }

    // Funcionalidad para cambiar imagen principal al hacer clic en thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail-small');
    const mainImage = document.querySelector('.product-image-large img');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function () {
            if (mainImage) {
                mainImage.src = this.src;
            }
        });
    });

    // Validación del input de cantidad
    if (quantityInput) {
        quantityInput.addEventListener('change', function () {
            const maxStock = parseInt(this.getAttribute('max'));
            const minValue = parseInt(this.getAttribute('min'));
            let value = parseInt(this.value);

            if (value < minValue) {
                this.value = minValue;
            } else if (value > maxStock) {
                this.value = maxStock;
                showNotification(`Cantidad máxima disponible: ${maxStock}`, 'warning');
            }
        });
    }
});

// Función auxiliar para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Estilos inline para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;

    // Colores según el tipo
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    notification.style.backgroundColor = colors[type] || colors.info;

    // Agregar al DOM
    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

