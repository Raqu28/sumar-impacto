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

const inicio = (req, res) => {
    try {
        const datos = leerDatos();
        res.render("index", {
            titulo: "Sumar Impacto - Gestion de Donaciones Comunitarias",
            equipo: "pITzza & BirrAPI (Grupo 15)",
            descripcion: "Plataforma de vinculacion entre organizaciones no gubernamentales y donantes.",
            integrantes: [
                "Sonia Raquel Andrada",
                "Guillermo Chacon",
                "Eitel Hugo Belinzoni",
                "Emilia Sosa"
            ],
            proyectos: datos.proyectos
        });
    } catch (error) {
        res.status(500).send("Error al cargar la pagina principal");
    }
};

const proyectosVista = (req, res) => {
    try {
        const datos = leerDatos();
        res.render("proyectos", {
            titulo: "Proyectos Activos",
            proyectos: datos.proyectos
        });
    } catch (error) {
        res.status(500).send("Error al cargar los proyectos");
    }
};

const formularioDonacion = (req, res) => {
    try {
        const datos = leerDatos();
        const donantes = datos.personas.filter((p) => p.tipo === "donante");

        res.render("nueva-donacion", {
            titulo: "Registrar Nueva Donacion",
            donantes,
            proyectos: datos.proyectos
        });
    } catch (error) {
        res.status(500).send("Error al cargar el formulario de donacion");
    }
};

const procesarNuevaDonacion = (req, res) => {
    try {
        const personaId = parseInt(req.body.personaId, 10);
        const proyectoId = parseInt(req.body.proyectoId, 10);
        const monto = Number(req.body.monto);

        if (!personaId || !proyectoId || !monto || monto <= 0) {
            return res.status(400).send("Datos invalidos: asegurese de seleccionar donante, proyecto y un monto valido");
        }

        const datos = leerDatos();
        const persona = datos.personas.find((p) => p.id === personaId);
        const proyecto = datos.proyectos.find((pr) => pr.id === proyectoId);

        if (!persona || !proyecto) {
            return res.status(404).send("Donante o proyecto inexistente");
        }

        const nuevoId = datos.donaciones.length > 0
            ? Math.max(...datos.donaciones.map((d) => d.id)) + 1
            : 1;

        const nuevaDonacion = new Donacion(nuevoId, personaId, proyectoId, monto);
        datos.donaciones.push(nuevaDonacion);

        proyecto.recaudado += monto;
        guardarDatos(datos);

        res.redirect("/");
    } catch (error) {
        res.status(500).send("Error al procesar la donacion");
    }
};

module.exports = {
    inicio,
    proyectosVista,
    formularioDonacion,
    procesarNuevaDonacion
};
