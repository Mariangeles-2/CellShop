import express from "express";
import dotenv from "dotenv";
import allRoutes from "./routes/index.js";
import {engine} from "express-handlebars";
import viewsRouter from "./routes/views.router.js";
import http from "http";
import {Server} from "socket.io";
import {__dirname} from "./utils.js";
import MongoProductManager from "./products/managers/mongo-product-manager.js";
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

// Configurar Handlebars con helpers personalizados
app.engine('handlebars', engine({
    helpers: {
        eq: function (a, b) {
            return a === b;
        },
        gt: function (a, b) {
            return a > b;
        },
        multiply: function (a, b) {
            return (a * b).toFixed(2);
        }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
}));
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
    try {
        const products = await MongoProductManager.getProducts();
        socket.emit("products", products.payload);
    } catch (error) {
        console.error('Error al obtener productos para socket:', error);
        socket.emit("products", []);
    }

    socket.on("addProduct", async (data) => {
        try {
            await MongoProductManager.addProduct(data);
            const products = await MongoProductManager.getProducts();
            socketServer.emit("products", products.payload);
        } catch (error) {
            console.error('Error al agregar producto via socket:', error);
        }
    });

    socket.on("deleteProduct", async (id) => {
        try {
            await MongoProductManager.deleteProduct(id);
            const products = await MongoProductManager.getProducts();
            socketServer.emit("products", products.payload);
        } catch (error) {
            console.error('Error al eliminar producto via socket:', error);
        }
    });
});

// Servidor
httpServer.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
