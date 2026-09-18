require("dotenv").config();
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Importacion de enrutadores modulares
const personasRoutes = require("./routes/personasRoutes");
const proyectosRoutes = require("./routes/proyectosRoutes");
const donacionesRoutes = require("./routes/donacionesRoutes");
const webRoutes = require("./routes/webRoutes");

// Middlewares de aplicacion
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuracion del motor de plantillas Pug
app.set("view engine", "pug");
app.set("views", "./views");

// Servicio de archivos estaticos (CSS)
app.use(express.static("public"));

// Montaje de rutas de interfaz web
app.use("/", webRoutes);

// Montaje de rutas API REST
app.use("/api/personas", personasRoutes);
app.use("/api/proyectos", proyectosRoutes);
app.use("/api/donaciones", donacionesRoutes);

// Manejador para rutas no encontradas
app.use((req, res) => {
    if (req.accepts("html")) {
        return res.status(404).send("Pagina no encontrada");
    }
    res.status(404).json({ mensaje: "Recurso no encontrado" });
});

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto " + PORT);
});