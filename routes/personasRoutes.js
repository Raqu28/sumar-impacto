const express = require("express");
const router = express.Router();

const {
    obtenerPersonas,
    obtenerPersonaPorId,
    crearPersona,
    actualizarPersona,
    eliminarPersona
} = require("../controllers/personasController");

const { validarPersona } = require("../middlewares/validarCampos");

router.get("/", obtenerPersonas);
router.get("/:id", obtenerPersonaPorId);
router.post("/", validarPersona, crearPersona);
router.put("/:id", validarPersona, actualizarPersona);
router.delete("/:id", eliminarPersona);

module.exports = router;
