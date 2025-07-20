import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

// Esquema para los productos dentro del carrito
const cartProductSchema = new mongoose.Schema({
    product: {
        type: String, // UUID del producto
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: [true, 'La cantidad es obligatoria'],
        min: [1, 'La cantidad debe ser mayor a 0'],
        validate: {
            validator: Number.isInteger,
            message: 'La cantidad debe ser un número entero'
        }
    }
}, {
    _id: false // No crear _id para subdocumentos
});

// Esquema principal del carrito
const cartSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    products: [cartProductSchema] 
}, {
    timestamps: true,
    versionKey: false
});

/* Esquema del carrito:
{
    _id: 54cf8c93 - 7f2d - 476b - 8b6d -01778f02a7d7,
        products: [
            {
                product: dfddd39c - 2896 - 4bd1- 8414 - 541cb7a3e87f,
            quantity: 3
      }
    ]
  } */

// Método para agregar producto al carrito
cartSchema.methods.addProduct = function(productId, quantity = 1) {
    const existingProduct = this.products.find(item => 
        item.product.toString() === productId.toString()
    );
    
    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        this.products.push({ product: productId, quantity });
    }
    
    return this.save();
};

// Método para remover producto del carrito
cartSchema.methods.removeProduct = function(productId) {
    this.products = this.products.filter(item => 
        item.product.toString() !== productId.toString()
    );
    return this.save();
};

// Método para actualizar cantidad de un producto
cartSchema.methods.updateProductQuantity = function(productId, quantity) {
    const item = this.products.find(item => 
        item.product.toString() === productId.toString()
    );
    
    if (item) {
        if (quantity <= 0) {
            return this.removeProduct(productId);
        } else {
            item.quantity = quantity;
            return this.save();
        }
    }
    
    throw new Error('Producto no encontrado en el carrito');
};

// Método para limpiar el carrito
cartSchema.methods.clear = function() {
    this.products = [];
    return this.save();
};

// Método virtual para obtener la cantidad total de items
cartSchema.virtual('totalItems').get(function() {
    return this.products.reduce((total, item) => total + item.quantity, 0);
});

// Configurar toJSON
cartSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        return ret;
    }
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
