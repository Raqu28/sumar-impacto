const fs = require("fs");
const path = require("path");
const Persona = require("../models/Persona");

const rutaArchivo = path.join(__dirname, "../data/datos.json");

const leerDatos = () => {
    const raw = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(raw);
};

const guardarDatos = (datos) => {
    fs.writeFileSync(rutaArchivo, JSON.stringify(datos, null, 2));
};

const obtenerPersonas = (req, res) => {
    try {
        const datos = leerDatos();
        res.status(200).json(datos.personas);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al leer los datos de personas" });
    }
};

const obtenerPersonaPorId = (req, res) => {
    try {
        const datos = leerDatos();
        const id = parseInt(req.params.id, 10);
        const persona = datos.personas.find((p) => p.id === id);

        if (!persona) {
            return res.status(404).json({ mensaje: "Persona no encontrada" });
        }

        res.status(200).json(persona);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al buscar la persona solicitada" });
    }
};

const crearPersona = (req, res) => {
    try {
        const { nombre, email, tipo } = req.body;
        const datos = leerDatos();

        const nuevoId = datos.personas.length > 0
            ? Math.max(...datos.personas.map((p) => p.id)) + 1
            : 1;

        const nuevaPersona = new Persona(nuevoId, nombre, email, tipo);
        datos.personas.push(nuevaPersona);
        guardarDatos(datos);

        res.status(201).json({
            mensaje: "Persona creada exitosamente",
            persona: nuevaPersona
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al guardar la nueva persona" });
    }
};

const actualizarPersona = (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const datos = leerDatos();
        const persona = datos.personas.find((p) => p.id === id);

        if (!persona) {
            return res.status(404).json({ mensaje: "Persona no encontrada" });
        }

        const { nombre, email, tipo } = req.body;
        if (nombre) persona.nombre = nombre;
        if (email) persona.email = email;
        if (tipo) persona.tipo = tipo;

        guardarDatos(datos);

        res.status(200).json({
            mensaje: "Persona actualizada exitosamente",
            persona
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar la persona" });
    }
};

const eliminarPersona = (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const datos = leerDatos();
        const longitudPrevia = datos.personas.length;

        datos.personas = datos.personas.filter((p) => p.id !== id);

        if (datos.personas.length === longitudPrevia) {
            return res.status(404).json({ mensaje: "Persona no encontrada" });
        }

        guardarDatos(datos);

        res.status(200).json({ mensaje: "Persona eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar la persona" });
    }
};

module.exports = {
    obtenerPersonas,
    obtenerPersonaPorId,
    crearPersona,
    actualizarPersona,
    eliminarPersona
};
