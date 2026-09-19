const fs = require("fs");
const path = require("path");
const Proyecto = require("../models/Proyecto");

const rutaArchivo = path.join(__dirname, "../data/datos.json");

const leerDatos = () => {
    const raw = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(raw);
};

const guardarDatos = (datos) => {
    fs.writeFileSync(rutaArchivo, JSON.stringify(datos, null, 2));
};

const obtenerProyectos = (req, res) => {
    try {
        const datos = leerDatos();
        const { categoria } = req.query;

        if (categoria) {
            const filtrados = datos.proyectos.filter(
                (p) => p.categoria.toLowerCase() === categoria.toLowerCase()
            );
            return res.status(200).json(filtrados);
        }

        res.status(200).json(datos.proyectos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener proyectos" });
    }
};

const obtenerProyectoPorId = (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const datos = leerDatos();
        const proyecto = datos.proyectos.find((p) => p.id === id);

        if (!proyecto) {
            return res.status(404).json({ mensaje: "Proyecto no encontrado" });
        }

        res.status(200).json(proyecto);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al buscar el proyecto solicitado" });
    }
};

const crearProyecto = (req, res) => {
    try {
        const { nombre, organizacion, categoria, montoMeta } = req.body;
        const datos = leerDatos();

        const nuevoId = datos.proyectos.length > 0
            ? Math.max(...datos.proyectos.map((p) => p.id)) + 1
            : 1;

        const nuevoProyecto = new Proyecto(
            nuevoId,
            nombre,
            organizacion,
            categoria,
            montoMeta,
            0
        );

        datos.proyectos.push(nuevoProyecto);
        guardarDatos(datos);

        res.status(201).json({
            mensaje: "Proyecto creado exitosamente",
            proyecto: nuevoProyecto
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al guardar el nuevo proyecto" });
    }
};

const actualizarProyecto = (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const datos = leerDatos();
        const proyecto = datos.proyectos.find((p) => p.id === id);

        if (!proyecto) {
            return res.status(404).json({ mensaje: "Proyecto no encontrado" });
        }

        const { nombre, organizacion, categoria, montoMeta } = req.body;
        if (nombre) proyecto.nombre = nombre;
        if (organizacion) proyecto.organizacion = organizacion;
        if (categoria) proyecto.categoria = categoria;
        if (montoMeta !== undefined) proyecto.montoMeta = Number(montoMeta);

        guardarDatos(datos);

        res.status(200).json({
            mensaje: "Proyecto actualizado exitosamente",
            proyecto
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar el proyecto" });
    }
};

const eliminarProyecto = (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const datos = leerDatos();
        const longitudPrevia = datos.proyectos.length;

        datos.proyectos = datos.proyectos.filter((p) => p.id !== id);

        if (datos.proyectos.length === longitudPrevia) {
            return res.status(404).json({ mensaje: "Proyecto no encontrado" });
        }

        guardarDatos(datos);

        res.status(200).json({ mensaje: "Proyecto eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar el proyecto" });
    }
};

module.exports = {
    obtenerProyectos,
    obtenerProyectoPorId,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto
};
