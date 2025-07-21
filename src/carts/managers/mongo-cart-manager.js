import Cart from "../models/cart.model.js";
import Product from "../../products/models/product.model.js";

class MongoCartManager {

    // Métodos privados para validaciones y obtención de datos
    static async #getAndValidateProduct(productId, requiredQuantity = 0) {
        const product = await Product.findById(productId);
        if (!product) {
            const error = new Error(`Producto con ID ${productId} no encontrado`);
            error.code = 'PRODUCT_NOT_FOUND';
            throw error;
        }

        if (requiredQuantity > 0 && product.stock < requiredQuantity) {
            const error = new Error(`Stock insuficiente. Stock disponible: ${product.stock}`);
            error.code = 'INSUFFICIENT_STOCK';
            throw error;
        }

        return product;
    }

    static async #getAndValidateCart(cartId) {
        const cart = await Cart.findById(cartId);
        if (!cart) {
            const error = new Error(`Carrito con ID ${cartId} no encontrado`);
            error.code = 'CART_NOT_FOUND';
            throw error;
        }
        return cart;
    }

    static #findAndValidateProductInCart(cart, productId) {
        const productIndex = cart.products.findIndex(item =>
            item.product.toString() === productId.toString()
        );

        if (productIndex === -1) {
            const error = new Error(`Producto con ID ${productId} no encontrado en el carrito`);
            error.code = 'PRODUCT_NOT_IN_CART';
            throw error;
        }

        return {productIndex, product: cart.products[productIndex]};
    }

    //Crear un nuevo carrito
    static async createCart() {
        try {
            const newCart = new Cart();
            await newCart.save();
            return newCart;
        } catch (error) {
            throw new Error('Error al crear carrito en la base de datos');
        }
    }

    //Obtener carrito por ID con productos
    static async getCartById(id) {
        const cart = await Cart.findById(id)
            .populate('products.product');

        if (!cart) {
            const error = new Error(`Carrito con ID ${id} no encontrado`);
            error.code = 'CART_NOT_FOUND';
            throw error;
        }

        return {
            products: cart.formattedProducts,
            totalPrice: cart.totalPrice,
            totalItems: cart.totalItems
        };
    }

    //Agregar producto al carrito
    static async addProductToCart(cartId, productId, quantity = 1) {
        // Validar producto, stock y carrito
        const product = await MongoCartManager.#getAndValidateProduct(productId, quantity);
        let cart = await MongoCartManager.#getAndValidateCart(cartId);

        // Verificar si el producto ya está en el carrito
        const existingProductIndex = cart.products.findIndex(item =>
            item.product.toString() === productId.toString()
        );

        if (existingProductIndex > -1) {
            const newQuantity = cart.products[existingProductIndex].quantity + quantity;

            // Verificar stock
            if (product.stock < newQuantity) {
                const error = new Error(`Stock insuficiente. Stock disponible: ${product.stock}`);
                error.code = 'INSUFFICIENT_STOCK';
                throw error;
            }

            cart.products[existingProductIndex].quantity = newQuantity;
        } else {
            cart.products.push({product: productId, quantity});
        }

        try {
            await cart.save();
            return await MongoCartManager.getCartById(cartId);
        } catch (error) {
            throw new Error('Error al agregar producto al carrito en la base de datos');
        }
    }

    //Eliminar producto del carrito
    static async removeProductFromCart(cartId, productId) {
        // Usar método privado para obtener y validar carrito
        const cart = await MongoCartManager.#getAndValidateCart(cartId);

        // Usar método privado para encontrar el producto en el carrito
        const {productIndex} = MongoCartManager.#findAndValidateProductInCart(cart, productId);

        try {
            cart.products.splice(productIndex, 1);
            await cart.save();
            return await MongoCartManager.getCartById(cartId);

        } catch (error) {
            throw new Error('Error al eliminar producto del carrito en la base de datos');
        }
    }

    //Actualizar cantidad de un producto en el carrito
    static async updateProductQuantity(cartId, productId, quantity) {
        if (quantity <= 0) {
            return await MongoCartManager.removeProductFromCart(cartId, productId);
        }

        // Validar producto, stock y carrito
        const product = await MongoCartManager.#getAndValidateProduct(productId, quantity);
        const cart = await MongoCartManager.#getAndValidateCart(cartId);

        // Usar método privado para encontrar el producto en el carrito
        const {product: cartProduct} = MongoCartManager.#findAndValidateProductInCart(cart, productId);

        try {
            cartProduct.quantity = quantity;
            await cart.save();
            return await MongoCartManager.getCartById(cartId);

        } catch (error) {
            throw new Error('Error al actualizar cantidad en la base de datos');
        }
    }

    //Limpiar carrito
    static async clearCart(cartId) {
        // Usar método privado para obtener y validar carrito
        const cart = await MongoCartManager.#getAndValidateCart(cartId);

        try {
            cart.products = [];
            await cart.save();
            return cart;
        } catch (error) {
            throw new Error('Error al limpiar carrito en la base de datos');
        }
    }

    //Eliminar carrito
    static async deleteCart(cartId) {
        const deletedCart = await Cart.findByIdAndDelete(cartId);
        if (!deletedCart) {
            const error = new Error(`Carrito con ID ${cartId} no encontrado`);
            error.code = 'CART_NOT_FOUND';
            throw error;
        }
        return {message: 'Carrito eliminado exitosamente', cart: deletedCart};
    }
}

export default MongoCartManager;
