import "dotenv/config";
import express from "express";
import { conectarDB } from "./config/db.js";

// Importacion de enrutadores modulares (ES Modules)
import personasRoutes from "./routes/personasRoutes.js";
import proyectosRoutes from "./routes/proyectosRoutes.js";
import donacionesRoutes from "./routes/donacionesRoutes.js";
import webRoutes from "./routes/webRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales de aplicacion
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servicio de archivos estaticos (CSS)
app.use(express.static("public"));

// Configuracion del motor de plantillas Pug
app.set("view engine", "pug");
app.set("views", "./views");

// Montaje de rutas de interfaz web
app.use("/", webRoutes);

// Montaje de rutas API REST
app.use("/api/personas", personasRoutes);
app.use("/api/proyectos", proyectosRoutes);
app.use("/api/donaciones", donacionesRoutes);

// Manejador semantico para rutas no encontradas (404)
app.use((req, res) => {
  if (req.accepts("html")) {
    return res.status(404).send("Pagina no encontrada");
  }
  res.status(404).json({ mensaje: "Recurso no encontrado" });
});

// Conectar a MongoDB antes de levantar el servidor HTTP
await conectarDB();

app.listen(PORT, () => {
  console.log(`Servidor de Sumar Impacto corriendo en http://localhost:${PORT}`);
});
