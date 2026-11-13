import "dotenv/config";
import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { conectarDB } from "./config/db.js";

// Middlewares personalizados de aplicacion
import { cargarUsuarioOpcional } from "./middlewares/authMiddleware.js";

// Importacion de enrutadores modulares (ES Modules)
import authRoutes from "./routes/authRoutes.js";
import webRoutes from "./routes/webRoutes.js";
import personasRoutes from "./routes/personasRoutes.js";
import proyectosRoutes from "./routes/proyectosRoutes.js";
import donacionesRoutes from "./routes/donacionesRoutes.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Hacemos accesible la instancia io en todos los controladores mediante req.app.get("io")
app.set("io", io);

const PORT = process.env.PORT || 3000;

// Configuracion de sockets en tiempo real
io.on("connection", (socket) => {
  // Cliente conectado
  socket.on("disconnect", () => {
    // Cliente desconectado
  });
});

// Middlewares globales de aplicacion
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servicio de archivos estaticos (CSS y cliente Web)
app.use(express.static("public"));

// Configuracion del motor de plantillas Pug
app.set("view engine", "pug");
app.set("views", "./views");

// Middleware de sesion: asocia req.usuario y res.locals.usuario si existe cookie valida
app.use(cargarUsuarioOpcional);

// Montaje de rutas de autenticacion y navegacion Web
app.use("/", authRoutes);
app.use("/", webRoutes);

// Montaje de rutas API REST
app.use("/api/personas", personasRoutes);
app.use("/api/proyectos", proyectosRoutes);
app.use("/api/donaciones", donacionesRoutes);

// Manejador semantico para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404);
  if (req.originalUrl.startsWith("/api/")) {
    return res.json({ mensaje: "Recurso no encontrado", ruta: req.originalUrl, status: 404 });
  }
  if (req.accepts("html")) {
    return res.render("404", {
      titulo: "Pagina No Encontrada",
      mensaje: `La ruta solicitada '${req.originalUrl}' no existe en la plataforma.`
    });
  }
  res.json({ mensaje: "Recurso no encontrado", ruta: req.originalUrl, status: 404 });
});

// Middleware centralizado de manejo de errores (500)
app.use((err, req, res, next) => {
  console.error("[Error Handler Global]:", err.message);
  const status = err.status || 500;
  res.status(status);

  if (req.accepts("html")) {
    return res.render("404", {
      titulo: "Error en la Solicitud",
      mensaje: process.env.NODE_ENV === "production"
        ? "Se produjo un problema al procesar su solicitud. Intente nuevamente."
        : `Detalle del error: ${err.message}`
    });
  }

  res.json({
    error: true,
    mensaje: err.message || "Error interno del servidor",
    status
  });
});

// Conectar a MongoDB antes de levantar el servidor HTTP
await conectarDB();

server.listen(PORT, () => {
  console.log(`Servidor de Sumar Impacto v1.2.0 corriendo en http://localhost:${PORT}`);
});
