import Persona from "../models/Persona.js";

export const obtenerPersonas = async (req, res) => {
  try {
    const personas = await Persona.find().sort({ nombre: 1 });
    res.status(200).json(personas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener la lista de personas", error: error.message });
  }
};

export const obtenerPersonaPorId = async (req, res) => {
  try {
    const persona = await Persona.findById(req.params.id);
    if (!persona) {
      return res.status(404).json({ mensaje: "Persona no encontrada" });
    }
    res.status(200).json(persona);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al buscar la persona solicitada", error: error.message });
  }
};

export const crearPersona = async (req, res) => {
  try {
    const { nombre, email, tipo } = req.body;
    const nuevaPersona = new Persona({ nombre, email, tipo });
    await nuevaPersona.save();

    res.status(201).json({
      mensaje: "Persona creada exitosamente en MongoDB",
      persona: nuevaPersona
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al guardar la nueva persona", error: error.message });
  }
};

export const actualizarPersona = async (req, res) => {
  try {
    const { nombre, email, tipo } = req.body;
    const personaActualizada = await Persona.findByIdAndUpdate(
      req.params.id,
      { nombre, email, tipo },
      { new: true, runValidators: true }
    );

    if (!personaActualizada) {
      return res.status(404).json({ mensaje: "Persona no encontrada" });
    }

    res.status(200).json({
      mensaje: "Persona actualizada exitosamente",
      persona: personaActualizada
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar la persona", error: error.message });
  }
};

export const eliminarPersona = async (req, res) => {
  try {
    const personaEliminada = await Persona.findByIdAndDelete(req.params.id);
    if (!personaEliminada) {
      return res.status(404).json({ mensaje: "Persona no encontrada" });
    }

    res.status(200).json({ mensaje: "Persona eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar la persona", error: error.message });
  }
};
