import Donacion from "../models/Donacion.js";
import Persona from "../models/Persona.js";
import Proyecto from "../models/Proyecto.js";

export const obtenerDonaciones = async (req, res) => {
  try {
    const donaciones = await Donacion.find()
      .populate("personaId", "nombre email tipo")
      .populate("proyectoId", "nombre organizacion montoMeta recaudado")
      .sort({ createdAt: -1 });

    res.status(200).json(donaciones);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener las donaciones", error: error.message });
  }
};

export const obtenerDonacionPorId = async (req, res) => {
  try {
    const donacion = await Donacion.findById(req.params.id)
      .populate("personaId", "nombre email tipo")
      .populate("proyectoId", "nombre organizacion montoMeta recaudado");

    if (!donacion) {
      return res.status(404).json({ mensaje: "Donacion no encontrada" });
    }

    res.status(200).json(donacion);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener la donacion", error: error.message });
  }
};

export const crearDonacion = async (req, res) => {
  try {
    const { personaId, proyectoId, monto } = req.body;

    const persona = await Persona.findById(personaId);
    if (!persona) {
      return res.status(404).json({ mensaje: "La persona especificada no existe en la base de datos" });
    }

    const proyecto = await Proyecto.findById(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ mensaje: "El proyecto especificado no existe en la base de datos" });
    }

    const nuevaDonacion = new Donacion({
      personaId,
      proyectoId,
      monto: Number(monto)
    });

    await nuevaDonacion.save();

    // Actualizamos la recaudacion del proyecto en MongoDB usando su metodo de dominio
    proyecto.actualizarRecaudacion(monto);
    await proyecto.save();

    res.status(201).json({
      mensaje: "Donacion registrada exitosamente en MongoDB",
      donacion: nuevaDonacion,
      proyectoActualizado: proyecto
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar la donacion", error: error.message });
  }
};
