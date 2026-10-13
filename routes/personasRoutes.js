import express from "express";
import {
  obtenerPersonas,
  obtenerPersonaPorId,
  crearPersona,
  actualizarPersona,
  eliminarPersona
} from "../controllers/personasController.js";
import { validarPersona } from "../middlewares/validarCampos.js";

const router = express.Router();

router.get("/", obtenerPersonas);
router.get("/:id", obtenerPersonaPorId);
router.post("/", validarPersona, crearPersona);
router.put("/:id", actualizarPersona);
router.delete("/:id", eliminarPersona);

export default router;
