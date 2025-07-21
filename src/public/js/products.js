// JavaScript para la página de productos
document.addEventListener('DOMContentLoaded', function () {
    // Auto-submit del formulario cuando cambian los filtros
    const filtersForm = document.getElementById('filters-form');
    const selects = filtersForm.querySelectorAll('select');

    selects.forEach(select => {
        select.addEventListener('change', function () {
            filtersForm.submit();
        });
    });

    // Funcionalidad de agregar al carrito
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', async function () {
            const productId = this.getAttribute('data-product-id');
            const originalText = this.textContent;

            try {
                // Cambiar estado del botón
                this.textContent = 'Agregando...';
                this.disabled = true;

                // Aquí podrías hacer la llamada a la API para agregar al carrito
                // Por ahora solo simulamos la funcionalidad
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mostrar mensaje de éxito
                this.textContent = '¡Agregado!';
                this.style.background = '#28a745';

                // Restaurar botón después de 2 segundos
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '';
                    this.disabled = false;
                }, 2000);

                console.log(`Producto ${productId} agregado al carrito`);

            } catch (error) {
                console.error('Error al agregar al carrito:', error);
                this.textContent = 'Error';
                this.style.background = '#dc3545';

                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '';
                    this.disabled = false;
                }, 2000);
            }
        });
    });
});
