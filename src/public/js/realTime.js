const socket = io();

const addForm = document.getElementById('add-product-form');
const deleteForm = document.getElementById('delete-product-form');
const list = document.getElementById('product-list');

//Envío del formulario para agregar producto
addForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = {
        title: addForm.title.value,
        description: addForm.description.value,
        price: addForm.price.value,
        thumbnail: addForm.thumbnail.value,
        code: addForm.code.value,
        stock: addForm.stock.value
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

//Actualizacion de la lista
socket.on('products', products => {
    list.innerHTML = '';
    products.forEach(p => {
        const li = document.createElement('li');
        li.textContent = `${p.title} - $${p.price} - (Stock:${p.stock}) - (ID: ${p.id})`;
        list.appendChild(li);
    });
});
