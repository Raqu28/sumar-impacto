const fs = require("fs");
const path = require("path");
const Donacion = require("../models/Donacion");

const rutaArchivo = path.join(__dirname, "../data/datos.json");

const leerDatos = () => {
    const raw = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(raw);
};

const guardarDatos = (datos) => {
    fs.writeFileSync(rutaArchivo, JSON.stringify(datos, null, 2));
};

const obtenerDonaciones = (req, res) => {
    try {
        const datos = leerDatos();
        const listado = datos.donaciones.map((d) => {
            const persona = datos.personas.find((p) => p.id === d.personaId);
            const proyecto = datos.proyectos.find((pr) => pr.id === d.proyectoId);

            return {
                id: d.id,
                monto: d.monto,
                fecha: d.fecha,
                donante: persona ? { id: persona.id, nombre: persona.nombre, email: persona.email } : null,
                proyecto: proyecto ? { id: proyecto.id, nombre: proyecto.nombre, organizacion: proyecto.organizacion } : null
            };
        });

        res.status(200).json(listado);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener las donaciones" });
    }
};

const crearDonacion = (req, res) => {
    try {
        const personaId = parseInt(req.body.personaId, 10);
        const proyectoId = parseInt(req.body.proyectoId, 10);
        const monto = Number(req.body.monto);

        const datos = leerDatos();

        const persona = datos.personas.find((p) => p.id === personaId);
        if (!persona) {
            return res.status(404).json({ mensaje: "La persona especificada no existe" });
        }

        const proyecto = datos.proyectos.find((pr) => pr.id === proyectoId);
        if (!proyecto) {
            return res.status(404).json({ mensaje: "El proyecto especificado no existe" });
        }

        const nuevoId = datos.donaciones.length > 0
            ? Math.max(...datos.donaciones.map((d) => d.id)) + 1
            : 1;

        const nuevaDonacion = new Donacion(nuevoId, personaId, proyectoId, monto);
        datos.donaciones.push(nuevaDonacion);

        proyecto.recaudado += monto;

        guardarDatos(datos);

        res.status(201).json({
            mensaje: "Donacion registrada exitosamente",
            donacion: nuevaDonacion,
            proyectoActualizado: proyecto
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar la donacion" });
    }
};

module.exports = {
    obtenerDonaciones,
    crearDonacion
};
