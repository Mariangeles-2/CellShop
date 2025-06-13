import express from "express"
const app = express();
app.use(express.json());
import ProductManager from "./products/managers/product-manager.js";

const router = express.Router();

router.get("/", async (req,res) =>{
    res.send(await ProductManager.getProducts())
})

router.get("/:pid", async (req,res) =>{
    res.send(await ProductManager.getProductById(parseInt(req.params.pid)))
})

router.post("/", async (req,res)=>{
    res.send(await ProductManager.addProduct(req.body))
})

app.use("/api/products", router);
app.listen(8080,()=>console.log("Servidor 8080"))

//Falta que el id del nuevo producto sea autoincremental
