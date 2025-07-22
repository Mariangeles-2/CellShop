// Inicializar página de detalle del producto
document.addEventListener('DOMContentLoaded', function () {
    // Configurar botón agregar al carrito
    const addToCartButton = document.querySelector('.btn-add-cart-large');
    const quantityInput = document.getElementById('quantity');

    if (addToCartButton) {
        addToCartButton.addEventListener('click', async function () {
            const productId = this.getAttribute('data-product-id');
            const quantity = quantityInput ? quantityInput.value : 1;
            const originalText = this.textContent;

            try {
                // Validar cantidad
                if (!quantity || quantity <= 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Cantidad inválida',
                        text: 'Por favor, selecciona una cantidad válida',
                        confirmButtonColor: '#007bff'
                    });
                    return;
                }

                // Cambiar estado del botón
                this.textContent = 'Agregando...';
                this.disabled = true;

                await addToCart(productId, quantity);

                console.log(`Producto ${productId} agregado al carrito con cantidad: ${quantity}`);

            } catch (error) {
                console.error('Error al agregar al carrito:', error);

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al agregar el producto al carrito',
                    confirmButtonColor: '#dc3545'
                });
            } finally {
                // Rehabilitar botón
                this.disabled = false;
                this.textContent = originalText;
            }
        });
    }

    // Configurar cambio de imágenes
    const thumbnails = document.querySelectorAll('.thumbnail-small');
    const mainImage = document.querySelector('.product-image-large img');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function () {
            if (mainImage) {
                mainImage.src = this.src;
            }
        });
    });

    // Configurar validación de cantidad
    if (quantityInput) {
        quantityInput.addEventListener('change', function () {
            const maxStock = parseInt(this.getAttribute('max'));
            const minValue = parseInt(this.getAttribute('min'));
            let value = parseInt(this.value);

            if (value < minValue) {
                this.value = minValue;
            } else if (value > maxStock) {
                this.value = maxStock;
                Swal.fire({
                    icon: 'warning',
                    title: 'Cantidad ajustada',
                    text: `Cantidad máxima disponible: ${maxStock}`,
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    }
});

// Agregar producto al carrito
async function addToCart(productId, quantity = 1) {
    try {
        // Obtener o crear carrito
        let cartId = localStorage.getItem('cartId');

        if (!cartId) {
            const createResponse = await fetch('/api/carts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (createResponse.ok) {
                const newCart = await createResponse.json();
                // La respuesta es directamente el carrito, no tiene .payload
                cartId = newCart._id;
                localStorage.setItem('cartId', cartId);
            } else {
                throw new Error('No se pudo crear el carrito');
            }
        }

        // Agregar producto al carrito
        const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({quantity: parseInt(quantity)})
        });

        if (response.ok) {
            const result = await Swal.fire({
                icon: 'success',
                title: '¡Producto agregado!',
                text: `${quantity} producto(s) agregado(s) al carrito exitosamente`,
                showCancelButton: true,
                confirmButtonText: '🛒 Ver carrito',
                cancelButtonText: '🛍️ Seguir comprando',
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#007bff',
                reverseButtons: true
            });

            if (result.isConfirmed) {
                window.location.href = `/cart/${cartId}`;
            }
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error al agregar',
                text: errorData.error || 'No se pudo agregar el producto al carrito',
                confirmButtonColor: '#dc3545'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'Error al conectar con el servidor. Inténtalo de nuevo.',
            confirmButtonColor: '#dc3545'
        });
    }
}
