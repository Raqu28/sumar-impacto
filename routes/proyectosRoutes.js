import express from "express";
import {
  obtenerProyectos,
  obtenerProyectoPorId,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto
} from "../controllers/proyectosController.js";
import { validarProyecto } from "../middlewares/validarCampos.js";

const router = express.Router();

router.get("/", obtenerProyectos);
router.get("/:id", obtenerProyectoPorId);
router.post("/", validarProyecto, crearProyecto);
router.put("/:id", actualizarProyecto);
router.delete("/:id", eliminarProyecto);

export default router;
