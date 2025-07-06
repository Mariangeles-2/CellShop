import {Router} from "express";
import {getRandomUser} from "../users/utils.js";
import ProductManager from "../products/managers/product-manager.js";

const viewsRouter = Router();

// Renderiza la vista de productos
viewsRouter.get("/products", (req, res) => {
    res.render("products");
})

// Renderiza la página principal con usuario
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

// Renderiza la vista de registro de usuario
viewsRouter.get("/register", (req, res) => {
    res.render("register", {pageStyles: "register"});
})

// Renderiza la vista del chat
viewsRouter.get("/chat", (req, res) => {
    res.render("chat", {pageStyles: "chat"});
});

// Renderiza la vista de productos
viewsRouter.get("/realtimeproducts", (req, res) => {
    res.render("realTimeProducts", {pageStyles: "realtimeproducts"});
})

export default viewsRouter;
