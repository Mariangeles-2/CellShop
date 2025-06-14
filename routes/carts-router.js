import express from "express";
import CartManager from "../carts/managers/cart-manager.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const newCart = await CartManager.addCart();
    res.send(newCart);
});

router.get("/:cid", async (req, res) => {
    res.send(await CartManager.getCartById(req.params.cid));
});

router.post("/:cid/product/:pid", async (req, res) => {
    res.send(await CartManager.addProductToCart(req.params.cid, req.params.pid));
});

export default router;
