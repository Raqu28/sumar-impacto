import express from "express";
import {
  inicio,
  proyectosVista,
  formularioDonacion,
  procesarNuevaDonacion
} from "../controllers/webController.js";

const router = express.Router();

router.get("/", inicio);
router.get("/proyectos", proyectosVista);
router.get("/donaciones/nueva", formularioDonacion);
router.post("/donaciones/nueva", procesarNuevaDonacion);
router.get("/donar", (req, res) => res.redirect("/donaciones/nueva"));

export default router;
