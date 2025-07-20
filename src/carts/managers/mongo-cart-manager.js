import Cart from "../models/cart.model.js";
import Product from "../../products/models/product.model.js";

class MongoCartManager {

    //Crear un nuevo carrito
    static async createCart() {
        try {
            const newCart = new Cart();
            await newCart.save();
            return newCart;
        } catch (error) {
            console.error('Error al crear carrito:', error);
            throw new Error('Error al crear carrito en la base de datos');
        }
    }

    //Obtener carrito por ID con productos populados completos
    static async getCartById(id) {
        try {
            const cart = await Cart.findById(id)
                .populate('products.product')
                .lean();
                
            if (!cart) {
                throw new Error(`Carrito con ID ${id} no encontrado`);
            }
            
            return cart;
        } catch (error) {
            console.error('Error al obtener carrito:', error);
            throw new Error('Error al obtener carrito de la base de datos');
        }
    }

    //Agregar producto al carrito
    static async addProductToCart(cartId, productId, quantity = 1) {
        try {
            // Verificar que el producto existe y tiene stock
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error(`Producto con ID ${productId} no encontrado`);
            }

            if (product.stock < quantity) {
                throw new Error(`Stock insuficiente. Stock disponible: ${product.stock}`);
            }

            // Obtener el carrito
            let cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error(`Carrito con ID ${cartId} no encontrado`);
            }

            // Verificar si el producto ya está en el carrito
            const existingProductIndex = cart.products.findIndex(item => 
                item.product.toString() === productId.toString()
            );

            if (existingProductIndex > -1) {
                // Si ya existe, actualizar cantidad
                const newQuantity = cart.products[existingProductIndex].quantity + quantity;
                
                if (product.stock < newQuantity) {
                    throw new Error(`Stock insuficiente. Stock disponible: ${product.stock}`);
                }
                
                cart.products[existingProductIndex].quantity = newQuantity;
            } else {
                // Si no existe, agregar nuevo producto
                cart.products.push({ product: productId, quantity });
            }

            await cart.save();
            
            // Devolver carrito actualizado con productos populados
            return await MongoCartManager.getCartById(cartId);
            
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            throw error;
        }
    }

    //Eliminar producto del carrito
    static async removeProductFromCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error(`Carrito con ID ${cartId} no encontrado`);
            }

            const productIndex = cart.products.findIndex(item => 
                item.product.toString() === productId.toString()
            );

            if (productIndex === -1) {
                throw new Error(`Producto con ID ${productId} no encontrado en el carrito`);
            }

            cart.products.splice(productIndex, 1);
            await cart.save();
            
            return await MongoCartManager.getCartById(cartId);
            
        } catch (error) {
            console.error('Error al eliminar producto del carrito:', error);
            throw error;
        }
    }

    //Actualizar cantidad de un producto en el carrito
    static async updateProductQuantity(cartId, productId, quantity) {
        try {
            if (quantity <= 0) {
                return await MongoCartManager.removeProductFromCart(cartId, productId);
            }

            // Verificar stock disponible
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error(`Producto con ID ${productId} no encontrado`);
            }

            if (product.stock < quantity) {
                throw new Error(`Stock insuficiente. Stock disponible: ${product.stock}`);
            }

            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error(`Carrito con ID ${cartId} no encontrado`);
            }

            const item = cart.products.find(item => 
                item.product.toString() === productId.toString()
            );

            if (!item) {
                throw new Error(`Producto con ID ${productId} no encontrado en el carrito`);
            }

            item.quantity = quantity;
            await cart.save();
            
            return await MongoCartManager.getCartById(cartId);
            
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            throw error;
        }
    }

    //Limpiar carrito
    static async clearCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error(`Carrito con ID ${cartId} no encontrado`);
            }

            cart.products = [];
            await cart.save();
            
            return cart;
            
        } catch (error) {
            console.error('Error al limpiar carrito:', error);
            throw error;
        }
    }

    //Eliminar carrito
    static async deleteCart(cartId) {
        try {
            const deletedCart = await Cart.findByIdAndDelete(cartId);
            if (!deletedCart) {
                throw new Error(`Carrito con ID ${cartId} no encontrado`);
            }
            return { message: 'Carrito eliminado exitosamente', cart: deletedCart };
        } catch (error) {
            console.error('Error al eliminar carrito:', error);
            throw new Error('Error al eliminar carrito de la base de datos');
        }
    }
}

export default MongoCartManager;