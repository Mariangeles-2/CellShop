// JavaScript para manejar paginación en index
document.addEventListener('DOMContentLoaded', function () {
    const itemsPerPageSelect = document.getElementById('itemsPerPageIndex');
    const sortByPriceSelect = document.getElementById('sortByPriceIndex');
    const prevButton = document.getElementById('prevPageIndex');
    const nextButton = document.getElementById('nextPageIndex');
    const paginationText = document.getElementById('pagination-text-index');
    const productsContainer = document.getElementById('products-container');

    // Validar que todos los elementos existen antes de continuar
    if (!itemsPerPageSelect || !sortByPriceSelect || !prevButton || !nextButton || !paginationText || !productsContainer) {
        console.log('Algunos elementos no están disponibles. Elementos encontrados:');
        console.log('itemsPerPageSelect:', itemsPerPageSelect);
        console.log('sortByPriceSelect:', sortByPriceSelect);
        console.log('prevButton:', prevButton);
        console.log('nextButton:', nextButton);
        console.log('paginationText:', paginationText);
        console.log('productsContainer:', productsContainer);
        return; // Salir si algún elemento no existe
    }

    let currentPage = 1;
    let itemsPerPage = 10;
    let sortOrder = 'desc'; // Iniciar con ordenamiento descendente por defecto

    // Obtener todos los productos del servidor
    async function fetchProducts(page = 1, limit = 10, sort = '') {
        try {
            let url = `/api/products?page=${page}&limit=${limit}`;
            if (sort) {
                url += `&sort=${sort}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return {payload: [], totalPages: 1, page: 1};
        }
    }

    // Renderizar productos
    function renderProducts(productsData) {
        const products = productsData.payload || [];

        productsContainer.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <p class="product-title">${product.title}</p>
                <p class="product-price">$${product.price}</p>
            `;
            productsContainer.appendChild(productCard);
        });

        // Actualizar información de paginación
        paginationText.textContent = `Página ${productsData.page} de ${productsData.totalPages}`;

        // Actualizar botones
        prevButton.disabled = !productsData.hasPrevPage;
        nextButton.disabled = !productsData.hasNextPage;

        currentPage = productsData.page;
    }

    // Cambiar cantidad de elementos por página
    itemsPerPageSelect.addEventListener('change', function () {
        itemsPerPage = parseInt(this.value);
        currentPage = 1;
        loadProducts();
    });

    // Cambiar ordenamiento por precio
    sortByPriceSelect.addEventListener('change', function () {
        sortOrder = this.value;
        currentPage = 1; // Resetear a página 1 cuando cambie el ordenamiento
        loadProducts();
    });

    // Botón anterior
    prevButton.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            loadProducts();
        }
    });

    // Botón siguiente
    nextButton.addEventListener('click', function () {
        currentPage++;
        loadProducts();
    });

    // Cargar productos
    async function loadProducts() {
        const productsData = await fetchProducts(currentPage, itemsPerPage, sortOrder);
        renderProducts(productsData);
    }

    // Solo ejecutar si todos los elementos existen
    loadProducts();
});
