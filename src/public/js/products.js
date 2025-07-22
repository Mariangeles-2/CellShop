// Inicializar página de productos
document.addEventListener('DOMContentLoaded', function () {
    // Configurar auto-submit de filtros
    const filtersForm = document.getElementById('filters-form');
    const selects = filtersForm.querySelectorAll('select');

    selects.forEach(select => {
        select.addEventListener('change', function () {
            filtersForm.submit();
        });
    });

    // Configurar botones de agregar al carrito
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', async function () {
            const productId = this.getAttribute('data-product-id');
            const originalText = this.textContent;

            try {
                this.textContent = 'Agregando...';
                this.disabled = true;

                await addToCart(productId, 1);
                console.log(`Producto ${productId} agregado al carrito`);

            } catch (error) {
                console.error('Error al agregar al carrito:', error);

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al agregar el producto al carrito',
                    confirmButtonColor: '#dc3545'
                });
            } finally {
                this.disabled = false;
                this.textContent = originalText;
            }
        });
    });
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
                text: `Producto agregado al carrito exitosamente`,
                showCancelButton: true,
                confirmButtonText: '🛒 Ver carrito',
                cancelButtonText: '🛍️ Seguir comprando',
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#007bff',
                reverseButtons: true,
                timer: 3000,
                timerProgressBar: true
            });

            if (result.isConfirmed) {
                window.location.href = `/cart/${cartId}`;
            }

            // Actualizar contador del carrito si existe
            updateCartCounter();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'No se pudo agregar el producto al carrito');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error; // Re-lanzar el error para que lo maneje el caller
    }
}

// Actualizar contador del carrito
async function updateCartCounter() {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) return;

    try {
        const response = await fetch(`/api/carts/${cartId}`);
        if (response.ok) {
            const cart = await response.json();
            const totalItems = cart.totalItems || 0;

            const counter = document.querySelector('.cart-counter');
            if (counter) {
                counter.textContent = totalItems;
                counter.style.display = totalItems > 0 ? 'inline' : 'none';
            }
        }
    } catch (error) {
        console.error('Error al actualizar contador del carrito:', error);
    }
}

// Inicializar contador al cargar página
updateCartCounter();
