import Persona from "../models/Persona.js";
import Proyecto from "../models/Proyecto.js";
import Donacion from "../models/Donacion.js";

export const inicio = async (req, res) => {
  try {
    const proyectos = await Proyecto.find().sort({ createdAt: -1 });
    res.render("index", {
      titulo: "Sumar Impacto - Gestion de Donaciones Comunitarias",
      equipo: "pITzza & BirrAPI (Grupo 15)",
      descripcion: "Plataforma de vinculacion entre organizaciones comunitarias y donantes con persistencia en MongoDB.",
      integrantes: [
        "Sonia Raquel Andrada",
        "Guillermo Chacon",
        "Eitel Hugo Belinzoni",
        "Emilia Sosa"
      ],
      proyectos
    });
  } catch (error) {
    res.status(500).send("Error al cargar la pagina principal: " + error.message);
  }
};

export const proyectosVista = async (req, res) => {
  try {
    const proyectos = await Proyecto.find().sort({ createdAt: -1 });
    res.render("proyectos", {
      titulo: "Proyectos Activos",
      proyectos
    });
  } catch (error) {
    res.status(500).send("Error al cargar los proyectos: " + error.message);
  }
};

export const formularioDonacion = async (req, res) => {
  try {
    const donantes = await Persona.find({ tipo: "donante" }).sort({ nombre: 1 });
    const proyectos = await Proyecto.find().sort({ nombre: 1 });

    res.render("nueva-donacion", {
      titulo: "Registrar Nueva Donacion",
      donantes,
      proyectos
    });
  } catch (error) {
    res.status(500).send("Error al cargar el formulario de donacion: " + error.message);
  }
};

export const procesarNuevaDonacion = async (req, res) => {
  try {
    const { personaId, proyectoId, monto } = req.body;

    if (!personaId || !proyectoId || !monto || Number(monto) <= 0) {
      return res.status(400).send("Datos invalidos: asegurese de seleccionar donante, proyecto y un monto valido");
    }

    const persona = await Persona.findById(personaId);
    const proyecto = await Proyecto.findById(proyectoId);

    if (!persona || !proyecto) {
      return res.status(404).send("Donante o proyecto inexistente en MongoDB");
    }

    const nuevaDonacion = new Donacion({
      personaId,
      proyectoId,
      monto: Number(monto)
    });

    await nuevaDonacion.save();

    proyecto.actualizarRecaudacion(monto);
    await proyecto.save();

    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error al procesar la donacion: " + error.message);
  }
};
