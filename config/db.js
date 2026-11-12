import mongoose from "mongoose";

export const conectarDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("Falta la variable de entorno MONGO_URI (o MONGODB_URI) en el archivo .env");
    }
    const conexion = await mongoose.connect(uri);
    const host = conexion.connection.host;
    const dbName = conexion.connection.name;
    const esAtlas = host.includes("mongodb.net");

    if (esAtlas) {
      console.log(`MongoDB Atlas (Cloud) conectado exitosamente a cluster: ${host} | Base: ${dbName}`);
    } else {
      const port = conexion.connection.port || 27017;
      console.log(`MongoDB Local conectado exitosamente en: ${host}:${port}/${dbName}`);
    }
    return conexion;
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    process.exit(1);
  }
};
