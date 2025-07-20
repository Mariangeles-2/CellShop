import mongoose from "mongoose";

//Configuración de la conexión a MongoDB usando Mongoose

class DatabaseConnection {
    
    //Conectar a la base de datos MongoDB
    static async connect() {
        try {
            const connectionURL = process.env.MONGODB_URL || "mongodb://localhost:27017/cell-shop";
            await mongoose.connect(connectionURL);
            console.log("✅ Conectado exitosamente a MongoDB");
            
            // Eventos de conexión
            mongoose.connection.on('error', (err) => {
                console.error("❌ Error de conexión a MongoDB:", err);
            });
            
            mongoose.connection.on('disconnected', () => {
                console.warn("⚠️ Desconectado de MongoDB");
            });
            
        } catch (error) {
            console.error("❌ Error al conectar a MongoDB:", error.message);
            process.exit(1);
        }
    }

    //Cerrar la conexión a la base de datos
    static async disconnect() {
        try {
            await mongoose.connection.close();
            console.log("🔌 Conexión a MongoDB cerrada");
        } catch (error) {
            console.error("❌ Error al cerrar la conexión:", error.message);
        }
    }
}

export default DatabaseConnection;
