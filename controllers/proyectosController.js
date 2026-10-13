import Proyecto from "../models/Proyecto.js";

export const obtenerProyectos = async (req, res) => {
  try {
    const { categoria } = req.query;
    const filtro = categoria ? { categoria: new RegExp(`^${categoria}$`, "i") } : {};
    const proyectos = await Proyecto.find(filtro).sort({ createdAt: -1 });

    res.status(200).json(proyectos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener proyectos", error: error.message });
  }
};

export const obtenerProyectoPorId = async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id);
    if (!proyecto) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }

    res.status(200).json(proyecto);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al buscar el proyecto solicitado", error: error.message });
  }
};

export const crearProyecto = async (req, res) => {
  try {
    const { nombre, organizacion, categoria, montoMeta } = req.body;
    const nuevoProyecto = new Proyecto({
      nombre,
      organizacion,
      categoria,
      montoMeta: Number(montoMeta),
      recaudado: 0
    });

    await nuevoProyecto.save();

    res.status(201).json({
      mensaje: "Proyecto creado exitosamente en MongoDB",
      proyecto: nuevoProyecto
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al guardar el nuevo proyecto", error: error.message });
  }
};

export const actualizarProyecto = async (req, res) => {
  try {
    const { nombre, organizacion, categoria, montoMeta } = req.body;
    const datosActualizar = {};
    if (nombre) datosActualizar.nombre = nombre;
    if (organizacion) datosActualizar.organizacion = organizacion;
    if (categoria) datosActualizar.categoria = categoria;
    if (montoMeta !== undefined) datosActualizar.montoMeta = Number(montoMeta);

    const proyectoActualizado = await Proyecto.findByIdAndUpdate(
      req.params.id,
      datosActualizar,
      { new: true, runValidators: true }
    );

    if (!proyectoActualizado) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }

    res.status(200).json({
      mensaje: "Proyecto actualizado exitosamente",
      proyecto: proyectoActualizado
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar el proyecto", error: error.message });
  }
};

export const eliminarProyecto = async (req, res) => {
  try {
    const proyectoEliminado = await Proyecto.findByIdAndDelete(req.params.id);
    if (!proyectoEliminado) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }

    res.status(200).json({ mensaje: "Proyecto eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el proyecto", error: error.message });
  }
};
