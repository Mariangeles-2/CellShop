import express from "express";
import allRoutes from "./routes/index.js"

const PORT = 8080
const app = express();

app.use(express.json());
app.use("/api", allRoutes);
app.listen(PORT, () => console.log(`Servidor ${PORT}`));
