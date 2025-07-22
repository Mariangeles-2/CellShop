import express from "express";
import MongoCartManager from "../carts/managers/mongo-cart-manager.js";

const router = express.Router();

// Crear carrito nuevo
router.post("/", async (req, res) => {
    try {
        const newCart = await MongoCartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        console.error('Error al crear carrito:', error);
        res.status(500).json({error: error.message});
    }
});

// Obtener carrito por ID
router.get("/:cid", async (req, res) => {
    try {
        const cart = await MongoCartManager.getCartById(req.params.cid);
        res.json(cart);
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        if (error.code === 'CART_NOT_FOUND') {
            return res.status(404).json({error: error.message});
        }
        res.status(500).json({error: 'Error interno del servidor'});
    }
});

// Agregar producto a carrito
router.post("/:cid/product/:pid", async (req, res) => {
    try {
        const {quantity = 1} = req.body;
        const updatedCart = await MongoCartManager.addProductToCart(
            req.params.cid,
            req.params.pid,
            quantity
        );
        res.json(updatedCart);
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        if (error.code === 'CART_NOT_FOUND' || error.code === 'PRODUCT_NOT_FOUND') {
            return res.status(404).json({error: error.message});
        }
        if (error.code === 'INSUFFICIENT_STOCK') {
            return res.status(409).json({error: error.message});
        }
        res.status(500).json({error: 'Error interno del servidor'});
    }
});

// Actualizar cantidad de producto en carrito
router.put("/:cid/product/:pid", async (req, res) => {
    try {
        const {quantity} = req.body;
        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({error: 'La cantidad debe ser un número positivo'});
        }

        const updatedCart = await MongoCartManager.updateProductQuantity(
            req.params.cid,
            req.params.pid,
            quantity
        );
        res.json(updatedCart);
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        if (error.code === 'CART_NOT_FOUND' || error.code === 'PRODUCT_NOT_FOUND' || error.code === 'PRODUCT_NOT_IN_CART') {
            return res.status(404).json({error: error.message});
        }
        if (error.code === 'INSUFFICIENT_STOCK') {
            return res.status(409).json({error: error.message});
        }
        res.status(500).json({error: 'Error interno del servidor'});
    }
});

// Eliminar producto del carrito
router.delete("/:cid/product/:pid", async (req, res) => {
    try {
        const updatedCart = await MongoCartManager.removeProductFromCart(
            req.params.cid,
            req.params.pid
        );
        res.json(updatedCart);
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        if (error.code === 'CART_NOT_FOUND' || error.code === 'PRODUCT_NOT_IN_CART') {
            return res.status(404).json({error: error.message});
        }
        res.status(500).json({error: 'Error interno del servidor'});
    }
});

// Limpiar carrito
router.delete("/:cid", async (req, res) => {
    try {
        const clearedCart = await MongoCartManager.clearCart(req.params.cid);
        res.json(clearedCart);
    } catch (error) {
        console.error('Error al limpiar carrito:', error);
        if (error.code === 'CART_NOT_FOUND') {
            return res.status(404).json({error: error.message});
        }
        res.status(500).json({error: 'Error interno del servidor'});
    }
});

// Actualizar todos los productos del carrito con un arreglo de productos
router.put("/:cid", async (req, res) => {
    try {
        const {products} = req.body;

        // Validar que products sea un arreglo
        if (!Array.isArray(products)) {
            return res.status(400).json({error: 'El campo products debe ser un arreglo'});
        }

        // Validar que cada producto tenga la estructura correcta
        for (const item of products) {
            if (!item.product || !item.quantity) {
                return res.status(400).json({
                    error: 'Cada producto debe tener "product" (ID) y "quantity" (cantidad)'
                });
            }
            if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                return res.status(400).json({
                    error: 'La cantidad debe ser un número positivo'
                });
            }
        }

        // Limpiar el carrito primero
        await MongoCartManager.clearCart(req.params.cid);

        // Agregar todos los productos del arreglo
        let updatedCart = null;
        for (const item of products) {
            updatedCart = await MongoCartManager.addProductToCart(
                req.params.cid,
                item.product,
                item.quantity
            );
        }

        // Si no había productos, obtener el carrito limpio
        if (products.length === 0) {
            updatedCart = await MongoCartManager.getCartById(req.params.cid);
        }

        res.json(updatedCart);
    } catch (error) {
        console.error('Error al actualizar carrito:', error);
        if (error.code === 'CART_NOT_FOUND' || error.code === 'PRODUCT_NOT_FOUND') {
            return res.status(404).json({error: error.message});
        }
        if (error.code === 'INSUFFICIENT_STOCK') {
            return res.status(409).json({error: error.message});
        }
        res.status(500).json({error: 'Error interno del servidor'});
    }
});

export default router;
