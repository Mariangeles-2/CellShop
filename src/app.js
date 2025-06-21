import express from "express";
import allRoutes from "./routes/index.js"
import {engine} from "express-handlebars";
import viewsRouter from "./routes/views.router.js";

const PORT = 8080
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', import.meta.dirname + '/views');
app.use("/static", express.static(import.meta.dirname + "/public"))
app.use("/api", allRoutes);
app.use("/", viewsRouter);

app.listen(PORT, () => console.log(`Servidor ${PORT}`));


