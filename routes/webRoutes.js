import express from "express";
import {
  inicio,
  proyectosVista,
  formularioDonacion,
  procesarNuevaDonacion
} from "../controllers/webController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Todas las vistas de la aplicacion estan protegidas: si no hay sesion iniciada, redirige al login
router.get("/", protegerRuta, inicio);
router.get("/proyectos", protegerRuta, proyectosVista);
router.get("/donaciones/nueva", protegerRuta, formularioDonacion);
router.post("/donaciones/nueva", protegerRuta, procesarNuevaDonacion);
router.get("/donar", (req, res) => res.redirect("/donaciones/nueva"));

export default router;
