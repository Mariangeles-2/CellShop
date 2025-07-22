import express from "express";
import MongoProductManager from "../products/managers/mongo-product-manager.js";
import {validateProductFull, validateProductPartial} from "../products/utils/product-utils.js";

const router = express.Router();

// Obtener productos con paginación y filtros
router.get("/", async (req, res) => {
    try {
        const {limit = 10, page = 1, sort, category, availability} = req.query;
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort,
            category,
            availability
        };

        const result = await MongoProductManager.getProducts(options);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Obtener producto por ID
router.get("/:pid", async (req, res) => {
    try {
        const product = await MongoProductManager.getProductById(req.params.pid);
        res.json(product);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        if (error.code === 'PRODUCT_NOT_FOUND') {
            return res.status(404).json({error: error.message});
        }
        res.status(500).json({error: 'Error interno del servidor'});
    }
});

// Crear nuevo producto
router.post("/", async (req, res) => {
    try {
        const error = validateProductFull(req.body);
        if (error) {
            return res.status(400).json({error});
        }

        const newProduct = await MongoProductManager.addProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error al crear producto:', error);
        if (error.code === 'DUPLICATE_CODE') {
            return res.status(409).json({error: error.message});
        }
        res.status(500).json({error: error.message});
    }
});

// Actualizar producto por ID
router.put("/:pid", async (req, res) => {
    try {
        const error = validateProductPartial(req.body);
        if (error) {
            return res.status(400).json({error});
        }

        const updatedProduct = await MongoProductManager.updateProduct(req.params.pid, req.body);
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        if (error.code === 'PRODUCT_NOT_FOUND') {
            return res.status(404).json({error: error.message});
        }
        if (error.code === 'DUPLICATE_CODE') {
            return res.status(409).json({error: error.message});
        }
        res.status(500).json({error: error.message});
    }
});

// Eliminar producto por ID
router.delete("/:pid", async (req, res) => {
    try {
        await MongoProductManager.deleteProduct(req.params.pid);
        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        if (error.code === 'PRODUCT_NOT_FOUND') {
            return res.status(404).json({error: error.message});
        }
        res.status(500).json({error: 'Error interno del servidor'});
    }
});

export default router;
