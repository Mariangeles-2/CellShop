// Funciones para manejo del carrito

// Eliminar producto del carrito
async function removeFromCart(cartId, productId) {
    try {
        const result = await Swal.fire({
            title: '¿Eliminar producto?',
            text: '¿Estás seguro de que quieres eliminar este producto del carrito?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Producto eliminado!',
                    text: 'El producto se ha eliminado del carrito',
                    timer: 1500,
                    showConfirmButton: false
                });
                window.location.reload();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar el producto del carrito'
                });
            }
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al eliminar el producto del carrito'
        });
    }
}

// Vaciar carrito completamente
async function clearCart(cartId) {
    try {
        const result = await Swal.fire({
            title: '¿Vaciar carrito?',
            text: '¿Estás seguro de que quieres eliminar todos los productos del carrito?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, vaciar carrito',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const response = await fetch(`/api/carts/${cartId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Carrito vaciado!',
                    text: 'Todos los productos han sido eliminados del carrito',
                    timer: 1500,
                    showConfirmButton: false
                });
                window.location.reload();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al vaciar el carrito'
                });
            }
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al vaciar el carrito'
        });
    }
}

// Proceder al checkout (placeholder)
function checkout() {
    Swal.fire({
        icon: 'info',
        title: 'Checkout en desarrollo',
        text: 'La funcionalidad de checkout estará disponible próximamente',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#007bff'
    });
}

// Agregar producto al carrito (para usar en productDetail)
async function addToCart(productId, quantity = 1) {
    try {
        // Crear o obtener carrito (usando un ID fijo por simplicidad)
        const cartId = localStorage.getItem('cartId');

        let finalCartId = cartId;

        // Si no existe carrito, crear uno nuevo
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
                finalCartId = newCart._id;
                localStorage.setItem('cartId', finalCartId);
            } else {
                throw new Error('No se pudo crear el carrito');
            }
        }

        // Agregar producto al carrito
        const response = await fetch(`/api/carts/${finalCartId}/product/${productId}`, {
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
                text: 'El producto se ha agregado al carrito exitosamente',
                showCancelButton: true,
                confirmButtonText: 'Ver carrito',
                cancelButtonText: 'Seguir comprando',
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#007bff'
            });

            if (result.isConfirmed) {
                window.location.href = `/cart/${finalCartId}`;
            }

            // Actualizar contador del carrito si existe
            updateCartCounter();
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorData.error || 'No se pudo agregar el producto al carrito'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al agregar el producto al carrito'
        });
    }
}

// Actualizar contador del carrito en navbar
async function updateCartCounter() {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) return;

    try {
        const response = await fetch(`/api/carts/${cartId}`);
        if (response.ok) {
            const cart = await response.json();
            // La respuesta es directamente el carrito, no tiene .payload
            const totalItems = cart.products.reduce((sum, item) => sum + item.quantity, 0);

            // Buscar elemento del contador y actualizarlo
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

// Cambiar cantidad con botones +/-
async function changeQuantity(cartId, productId, currentQuantity, change) {
    const newQuantity = currentQuantity + change;

    if (newQuantity <= 0) {
        // Si la cantidad llega a 0 o menos, preguntar si eliminar el producto
        const result = await Swal.fire({
            title: '¿Eliminar producto?',
            text: 'La cantidad llegará a 0. ¿Quieres eliminar este producto del carrito?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            // Eliminar directamente sin otra confirmación
            try {
                const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Producto eliminado!',
                        text: 'El producto se ha eliminado del carrito',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    window.location.reload();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al eliminar el producto del carrito'
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar el producto del carrito'
                });
            }
        }
        return;
    }

    await updateQuantity(cartId, productId, newQuantity);
}

// Actualizar cantidad de un producto
async function updateQuantity(cartId, productId, newQuantity) {
    if (!newQuantity || newQuantity <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Cantidad inválida',
            text: 'La cantidad debe ser mayor a 0',
            confirmButtonColor: '#007bff'
        });

        // Recargar la página para restaurar el valor original
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        return;
    }

    try {
        // Mostrar loading durante la actualización
        const loadingToast = Swal.fire({
            title: 'Actualizando cantidad...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({quantity: parseInt(newQuantity)})
        });

        loadingToast.close();

        if (response.ok) {
            // Mostrar notificación de éxito y recargar
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });

            await Toast.fire({
                icon: 'success',
                title: 'Cantidad actualizada'
            });

            window.location.reload();
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar',
                text: errorData.error || 'No se pudo actualizar la cantidad',
                confirmButtonColor: '#dc3545'
            });

            // Recargar para restaurar valor original en caso de error
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'Error al conectar con el servidor',
            confirmButtonColor: '#dc3545'
        });

        // Recargar para restaurar valor original en caso de error
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
}

// Inicializar contador al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    updateCartCounter();
});
