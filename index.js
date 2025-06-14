import express from "express"
import ProductManager from "./products/managers/product-manager.js";
import validateProduct from "./products/utils/product-utils.js";

const app = express();
app.use(express.json());

const router = express.Router();

router.get("/", async (req, res) => {
    res.send(await ProductManager.getProducts())
})

router.get("/:pid", async (req, res) => {
    res.send(await ProductManager.getProductById(req.params.pid))
})

router.post("/", async (req, res) => {
    const error = validateProduct(req.body);
    if (error) {
        return res.status(400).json({error});
    }
    res.send(await ProductManager.addProduct(req.body));
})

router.put("/:pid", async (req, res) => {
    res.send(await ProductManager.modifyProduct(req.params.pid, req.body));
})

router.delete("/:pid", async (req, res) => {
    res.send(await ProductManager.deleteProduct(req.params.pid))
})
app.use("/api/products", router);
app.listen(8080, () => console.log("Servidor 8080"))
