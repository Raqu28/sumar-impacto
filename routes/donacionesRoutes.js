const express = require("express");
const router = express.Router();

const {
    obtenerDonaciones,
    crearDonacion
} = require("../controllers/donacionesController");

const { validarDonacion } = require("../middlewares/validarCampos");

router.get("/", obtenerDonaciones);
router.post("/", validarDonacion, crearDonacion);

module.exports = router;
