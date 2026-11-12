import Persona from "../models/Persona.js";
import Proyecto from "../models/Proyecto.js";
import Donacion from "../models/Donacion.js";

export const inicio = async (req, res) => {
  try {
    const proyectos = await Proyecto.find().sort({ createdAt: -1 });
    res.render("index", {
      titulo: "Sumar Impacto - Gestion de Donaciones Comunitarias",
      equipo: "pITzza & BirrAPI (Grupo 15)",
      descripcion: "Plataforma comunitaria de vinculacion y financiamiento colectivo con persistencia NoSQL en MongoDB Atlas y comunicacion en tiempo real.",
      integrantes: [
        "Guillermo Chacon",
        "Sonia Raquel Andrada",
        "Eitel Hugo Belinzoni"
      ],
      proyectos,
      donacionExitosa: req.query.donacion_exitosa === "1"
    });
  } catch (error) {
    res.status(500).render("404", {
      titulo: "Error del Servidor",
      mensaje: "Error al cargar la pagina principal: " + error.message
    });
  }
};

export const proyectosVista = async (req, res) => {
  try {
    const proyectos = await Proyecto.find().sort({ createdAt: -1 });
    res.render("proyectos", {
      titulo: "Proyectos Comunitarios Activos",
      proyectos
    });
  } catch (error) {
    res.status(500).render("404", {
      titulo: "Error",
      mensaje: "Error al cargar el catalogo de proyectos: " + error.message
    });
  }
};

export const formularioDonacion = async (req, res) => {
  try {
    const proyectos = await Proyecto.find().sort({ nombre: 1 });
    const esAdmin = req.usuario && req.usuario.rol === "admin";

    // Si el usuario autenticado tiene email en la coleccion Personas, lo asociamos
    let personaUsuario = null;
    if (req.usuario) {
      personaUsuario = await Persona.findOne({ email: req.usuario.email });
      // Si por alguna razon no existiera la Persona correspondiente, la aseguramos
      if (!personaUsuario && req.usuario.rol !== "admin") {
        personaUsuario = await Persona.create({
          nombre: req.usuario.nombre,
          email: req.usuario.email,
          tipo: "donante"
        });
      }
    }

    // Solo el administrador visualiza el listado completo para registrar aportes por terceros
    let donantes = [];
    if (esAdmin) {
      donantes = await Persona.find({ tipo: "donante" }).sort({ nombre: 1 });
    }

    res.render("nueva-donacion", {
      titulo: "Registrar Donacion Solidaria",
      donantes,
      proyectos,
      personaUsuario,
      esAdmin
    });
  } catch (error) {
    res.status(500).render("404", {
      titulo: "Error",
      mensaje: "Error al cargar el formulario de donacion: " + error.message
    });
  }
};

export const procesarNuevaDonacion = async (req, res) => {
  try {
    let { personaId, proyectoId, monto } = req.body;
    const esAdmin = req.usuario && req.usuario.rol === "admin";
    let personaUsuario = null;

    if (req.usuario) {
      personaUsuario = await Persona.findOne({ email: req.usuario.email });
    }

    // Regla de autorizacion RBAC: el donante comun solo puede donar a su propio nombre
    if (!esAdmin && personaUsuario) {
      personaId = personaUsuario._id.toString();
    }

    if (!personaId || !proyectoId || !monto || Number(monto) <= 0) {
      return res.status(400).render("nueva-donacion", {
        titulo: "Registrar Donacion",
        error: "Datos invalidos: asegurese de seleccionar donante, proyecto y un monto positivo.",
        donantes: esAdmin ? await Persona.find({ tipo: "donante" }).sort({ nombre: 1 }) : [],
        proyectos: await Proyecto.find().sort({ nombre: 1 }),
        personaUsuario,
        esAdmin
      });
    }

    const persona = await Persona.findById(personaId);
    const proyecto = await Proyecto.findById(proyectoId);

    if (!persona || !proyecto) {
      return res.status(404).render("nueva-donacion", {
        titulo: "Registrar Donacion",
        error: "El donante o el proyecto seleccionado no existe en MongoDB.",
        donantes: esAdmin ? await Persona.find({ tipo: "donante" }).sort({ nombre: 1 }) : [],
        proyectos: await Proyecto.find().sort({ nombre: 1 }),
        personaUsuario,
        esAdmin
      });
    }

    const nuevaDonacion = new Donacion({
      personaId,
      proyectoId,
      monto: Number(monto)
    });

    await nuevaDonacion.save();

    proyecto.actualizarRecaudacion(monto);
    await proyecto.save();

    // Emision WebSocket en tiempo real si Socket.IO esta montado en Express
    const io = req.app.get("io");
    if (io) {
      io.emit("nueva_donacion", {
        donanteNombre: persona.nombre,
        proyectoId: proyecto._id.toString(),
        proyectoNombre: proyecto.nombre,
        monto: Number(monto),
        nuevoRecaudado: proyecto.recaudado,
        progreso: Math.min(100, Math.round((proyecto.recaudado / proyecto.montoMeta) * 100))
      });
    }

    res.redirect("/?donacion_exitosa=1");
  } catch (error) {
    console.error("Error al registrar donacion:", error);
    res.status(500).render("nueva-donacion", {
      titulo: "Registrar Donacion",
      error: "Error interno al procesar el aporte: " + error.message,
      donantes: esAdmin ? await Persona.find({ tipo: "donante" }).sort({ nombre: 1 }) : [],
      proyectos: await Proyecto.find().sort({ nombre: 1 }),
      personaUsuario,
      esAdmin
    });
  }
};
