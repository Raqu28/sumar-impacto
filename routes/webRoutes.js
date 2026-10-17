import express from "express";
import {
  inicio,
  proyectosVista,
  formularioDonacion,
  procesarNuevaDonacion
} from "../controllers/webController.js";
import {
  mostrarRegistro,
  procesarRegistro
} from "../controllers/authController.js";

const router = express.Router();

router.get("/", inicio);
router.get("/proyectos", proyectosVista);
router.get("/donaciones/nueva", formularioDonacion);
router.post("/donaciones/nueva", procesarNuevaDonacion);
router.get("/donar", (req, res) => res.redirect("/donaciones/nueva"));
router.get("/registro", mostrarRegistro);
router.post("/registro", procesarRegistro);

export default router;
