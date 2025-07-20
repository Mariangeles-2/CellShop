import express from "express";
import dotenv from "dotenv";
import allRoutes from "./routes/index.js";
import {engine} from "express-handlebars";
import viewsRouter from "./routes/views.router.js";
import http from "http";
import {Server} from "socket.io";
import {__dirname} from "./utils.js";
import ProductManager from "./products/managers/product-manager.js";
import DatabaseConnection from "./config/database.js";

// Configuración variables de entorno
dotenv.config();

// Express
const app = express();
const PORT = process.env.PORT || 8080;

// Conexión a la DB
await DatabaseConnection.connect();

// HTTP desde Express
const httpServer = http.createServer(app);

// Servidor de WebSocket
const socketServer = new Server(httpServer);

// Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use("/static", express.static(__dirname + "/public"));
app.use("/api", allRoutes);
app.use("/", viewsRouter);

// Contenedor del chat
const messages = [];

// Websockets
socketServer.on("connection", async socket => {
    console.log("🔗 Nuevo cliente conectado:", socket.id);

    //Chat
    socket.emit("all-msgs", messages);

    socket.on("login", (data) => {
        socket.broadcast.emit("new-user", data);
    });

    socket.on("new-msg", (data) => {
        messages.unshift(data);
        socketServer.emit("all-msgs", messages);
    });

    //Productos
    socket.emit("products", await ProductManager.getProducts());

    socket.on("addProduct", async (data) => {
        await ProductManager.addProduct(data);
        const products = await ProductManager.getProducts();
        socketServer.emit("products", products);
    });

    socket.on("deleteProduct", async (id) => {
        await ProductManager.deleteProduct(id);
        const products = await ProductManager.getProducts();
        socketServer.emit("products", products);
    });
});

// Servidor
httpServer.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
