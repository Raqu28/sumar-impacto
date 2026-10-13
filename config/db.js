import mongoose from "mongoose";

export const conectarDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sumar_impacto";
    const conexion = await mongoose.connect(uri);
    console.log(`MongoDB conectado exitosamente en: ${conexion.connection.host}:${conexion.connection.port}/${conexion.connection.name}`);
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    process.exit(1);
  }
};
