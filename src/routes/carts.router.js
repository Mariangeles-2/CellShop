import express from "express";
import CartManager from "../carts/managers/cart-manager.js";

const router = express.Router();

//Ruta para crear carrito nuevo
router.post("/", async (req, res) => {
    const newCart = await CartManager.addCart();
    res.send(newCart);
});

//Ruta para obtener carrito por ID
router.get("/:cid", async (req, res) => {
    res.send(await CartManager.getCartById(req.params["cid"]));
});

//Ruta para agregar producto a un carrito
router.post("/:cid/product/:pid", async (req, res) => {
    res.send(await CartManager.addProductToCart(req.params["cid"], req.params.pid));
});

export default router;
