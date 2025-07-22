import {Router} from "express";
import {getRandomUser} from "../users/utils.js";
import MongoProductManager from "../products/managers/mongo-product-manager.js";
import MongoCartManager from "../carts/managers/mongo-cart-manager.js";

const viewsRouter = Router();

// Renderiza la página principal con usuario
viewsRouter.get("/", async (req, res) => {
    try {
        const user = getRandomUser();
        const productsResult = await MongoProductManager.getProducts();
        res.render("index", {
            user: user,
            isAdmin: user.role === "admin",
            products: productsResult.payload,
            pageStyles: "index"
        });
    } catch (error) {
        console.error('Error al obtener productos para la vista:', error);
        const user = getRandomUser();
        res.render("index", {
            user: user,
            isAdmin: user.role === "admin",
            products: [],
            pageStyles: "index"
        });
    }
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

// Renderiza la vista de productos con paginación y filtros
viewsRouter.get("/products", async (req, res) => {
    try {
        const {limit = 10, page = 1, sort = 'desc', category, availability} = req.query;
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort,
            category,
            availability
        };

        const productsResult = await MongoProductManager.getProducts(options);

        // Obtener todas las categorías para el filtro
        const categories = ['smartphones', 'tablets', 'accessories', 'smartwatches'];

        res.render("products", {
            products: productsResult.payload,
            pagination: {
                currentPage: productsResult.page,
                totalPages: productsResult.totalPages,
                hasPrevPage: productsResult.hasPrevPage,
                hasNextPage: productsResult.hasNextPage,
                prevPage: productsResult.prevPage,
                nextPage: productsResult.nextPage,
                prevLink: productsResult.prevLink,
                nextLink: productsResult.nextLink
            },
            filters: {
                currentSort: sort,
                currentCategory: category || '',
                currentAvailability: availability || '',
                categories: categories,
                currentLimit: parseInt(limit)
            },
            pageStyles: "products"
        });
    } catch (error) {
        console.error('Error al obtener productos para vista:', error);
        res.render("products", {
            products: [],
            pagination: {currentPage: 1, totalPages: 1},
            filters: {categories: ['smartphones', 'tablets', 'accessories', 'smartwatches']},
            error: 'Error al cargar los productos'
        });
    }
});

// Renderiza la vista de detalle de un producto individual
viewsRouter.get("/products/:pid", async (req, res) => {
    try {
        const product = await MongoProductManager.getProductById(req.params.pid);

        res.render("productDetail", {
            product: product,
            pageStyles: "productDetail"
        });
    } catch (error) {
        console.error('Error al obtener producto para vista de detalle:', error);
        if (error.code === 'PRODUCT_NOT_FOUND') {
            return res.status(404).render("productDetail", {
                error: 'Producto no encontrado',
                pageStyles: "productDetail"
            });
        }
        res.status(500).render("productDetail", {
            error: 'Error al cargar el producto',
            pageStyles: "productDetail"
        });
    }
});

// Renderiza la vista del carrito
viewsRouter.get("/cart/:cid", async (req, res) => {
    try {
        const cart = await MongoCartManager.getCartById(req.params.cid);
        const user = getRandomUser();

        res.render("cart", {
            cart: cart,
            user: user,
            pageStyles: "cart"
        });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.render("cart", {
            cart: null,
            error: 'Error al cargar el carrito',
            pageStyles: "cart"
        });
    }
});

export default viewsRouter;
