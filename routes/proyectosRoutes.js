const express = require("express");
const router = express.Router();

const {
    obtenerProyectos,
    obtenerProyectoPorId,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto
} = require("../controllers/proyectosController");

const { validarProyecto } = require("../middlewares/validarCampos");

router.get("/", obtenerProyectos);
router.get("/:id", obtenerProyectoPorId);
router.post("/", validarProyecto, crearProyecto);
router.put("/:id", validarProyecto, actualizarProyecto);
router.delete("/:id", eliminarProyecto);

module.exports = router;
