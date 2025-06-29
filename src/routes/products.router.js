import express from "express";
import ProductManager from "../products/managers/product-manager.js";
import {validateProductFull, validateProductPartial} from "../products/utils/product-utils.js";

const router = express.Router();

router.get("/", async (req, res) => {
    res.send(await ProductManager.getProducts());
});

router.get("/:pid", async (req, res) => {
    res.send(await ProductManager.getProductById(req.params.pid));
});

router.post("/", async (req, res) => {
    const error = validateProductFull(req.body);
    if (error) {
        return res.status(400).json({error});
    }
    res.send(await ProductManager.addProduct(req.body));
});

router.put("/:pid", async (req, res) => {
    const error = validateProductPartial(req.body);
    if (error) {
        return res.status(400).json({error});
    }
    res.send(await ProductManager.modifyProduct(req.params.pid, req.body));
});

router.delete("/:pid", async (req, res) => {
    res.sendStatus(204).send(await ProductManager.deleteProduct(req.params.pid));
});

export default router;

