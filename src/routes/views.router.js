import {Router} from "express";
import {getRandomUser} from "../users/utils.js";
import ProductManager from "../products/managers/product-manager.js";

const viewsRouter = Router();

viewsRouter.get("/products", (req, res) => {
    res.render("products");
})

viewsRouter.get("/", async (req, res) => {
    const user = getRandomUser();
    const products = await ProductManager.getProducts()
    res.render("index", {
        user: user,
        isAdmin: user.role === "admin",
        products,
        pageStyles: "index"
    });
})

viewsRouter.get("/register", (req, res) => {
    res.render("register");
})

viewsRouter.get("/chat", (req, res) => {
    res.render("chat", {pageStyles: "chat"});
});

viewsRouter.get("/realtimeproducts", (req, res) => {
    res.render("realTimeProducts", {pageStyles: "realtimeproducts"});
})

export default viewsRouter;
