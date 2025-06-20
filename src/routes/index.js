import {Router} from "express";
import productsRouter from "./products.router.js";
import cartsRouter from "./carts.router.js";

const router = Router();

router.use("/products", productsRouter);
router.use("/carts", cartsRouter);

export default router;

