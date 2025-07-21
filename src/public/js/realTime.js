const socket = io();

const addForm = document.getElementById('add-product-form');
const deleteForm = document.getElementById('delete-product-form');
const list = document.getElementById('product-list');
const itemsPerPageSelect = document.getElementById('itemsPerPage');
const prevButton = document.getElementById('prevPage');
const nextButton = document.getElementById('nextPage');
const paginationText = document.getElementById('pagination-text');

// Variables de paginación
let currentPage = 1;
let itemsPerPage = 10;
let allProducts = [];
let totalPages = 1;

//Envío del formulario para agregar producto
addForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = {
        title: addForm.title.value,
        description: addForm.description.value,
        price: parseFloat(addForm.price.value),
        thumbnail: addForm.thumbnail.value,
        code: addForm.code.value,
        stock: parseInt(addForm.stock.value),
        category: addForm.category.value
    };
    socket.emit('addProduct', data);
    addForm.reset();
});

//Envío del formulario para eliminar producto
deleteForm.addEventListener('submit', e => {
    e.preventDefault();
    const id = deleteForm.id.value;
    socket.emit('deleteProduct', id);
    deleteForm.reset();
});

// Función para calcular paginación
function calculatePagination(products) {
    totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
}

// Función para actualizar controles de paginación
function updatePaginationControls() {
    paginationText.textContent = `Página ${currentPage} de ${totalPages}`;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
}

// Función para renderizar productos
function renderProducts(productsToShow) {
    list.innerHTML = '';
    productsToShow.forEach(p => {
        const li = document.createElement('li');
        li.textContent = `${p.title} - $${p.price} - Stock: ${p.stock} - Categoría: ${p.category} - ID: ${p._id}`;
        list.appendChild(li);
    });
}

//Actualización de la lista con paginación
socket.on('products', products => {
    allProducts = products;

    // Si la página actual no existe después de eliminar productos, ir a la última página
    totalPages = Math.ceil(allProducts.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    if (totalPages === 0) {
        currentPage = 1;
    }

    const productsToShow = calculatePagination(allProducts);
    renderProducts(productsToShow);
    updatePaginationControls();
});

// Cambiar cantidad de elementos por página
itemsPerPageSelect.addEventListener('change', function () {
    itemsPerPage = parseInt(this.value);
    currentPage = 1; // Resetear a página 1
    const productsToShow = calculatePagination(allProducts);
    renderProducts(productsToShow);
    updatePaginationControls();
});

// Botón página anterior
prevButton.addEventListener('click', function () {
    if (currentPage > 1) {
        currentPage--;
        const productsToShow = calculatePagination(allProducts);
        renderProducts(productsToShow);
        updatePaginationControls();
    }
});

// Botón página siguiente
nextButton.addEventListener('click', function () {
    if (currentPage < totalPages) {
        currentPage++;
        const productsToShow = calculatePagination(allProducts);
        renderProducts(productsToShow);
        updatePaginationControls();
    }
});
