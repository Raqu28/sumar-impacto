const express = require("express");
const router = express.Router();

const {
    inicio,
    proyectosVista,
    formularioDonacion,
    procesarNuevaDonacion
} = require("../controllers/webController");

router.get("/", inicio);
router.get("/proyectos", proyectosVista);
router.get("/donaciones/nueva", formularioDonacion);
router.post("/donaciones/nueva", procesarNuevaDonacion);

module.exports = router;
