import crypto from "crypto";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import Persona from "../models/Persona.js";

// Muestra el formulario de inicio de sesion
export const mostrarLogin = (req, res) => {
  // Si ya esta autenticado, redirige al inicio
  if (req.usuario) {
    return res.redirect("/");
  }
  const mensajeExito = req.query.registrado ? "Registro exitoso. Ya podes iniciar sesion." : null;
  res.render("login", {
    titulo: "Iniciar Sesion - Sumar Impacto",
    error: null,
    exito: mensajeExito
  });
};

// Muestra el formulario de registro de usuario
export const mostrarRegistro = (req, res) => {
  if (req.usuario) {
    return res.redirect("/");
  }
  res.render("registro", {
    titulo: "Crear Cuenta - Sumar Impacto",
    error: null
  });
};

// Procesa el alta de un nuevo usuario
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).render("registro", {
        titulo: "Crear Cuenta - Sumar Impacto",
        error: "Todos los campos (nombre, email y contraseña) son obligatorios."
      });
    }

    if (password.length < 6) {
      return res.status(400).render("registro", {
        titulo: "Crear Cuenta - Sumar Impacto",
        error: "La contraseña debe tener al menos 6 caracteres."
      });
    }

    const emailNormalizado = email.toLowerCase().trim();
    const usuarioExistente = await Usuario.findOne({ email: emailNormalizado });

    if (usuarioExistente) {
      return res.status(409).render("registro", {
        titulo: "Crear Cuenta - Sumar Impacto",
        error: "El correo electronico ya se encuentra registrado."
      });
    }

    // Genera salt y hash criptografico sha512 mediante el metodo estatico del Schema
    const { salt, passwordHash } = Usuario.crearPasswordSeguro(password);

    // Seguridad: el registro publico solo permite rol 'donante' o 'responsable' (nunca 'admin')
    const rolAsignado = (rol === "responsable") ? "responsable" : "donante";

    await Usuario.create({
      nombre: nombre.trim(),
      email: emailNormalizado,
      passwordHash,
      salt,
      rol: rolAsignado
    });

    // Asegura consistencia de dominio: crea la Persona donante asociada si aun no existe
    const personaExiste = await Persona.findOne({ email: emailNormalizado });
    if (!personaExiste) {
      await Persona.create({
        nombre: nombre.trim(),
        email: emailNormalizado,
        tipo: "donante"
      });
    }

    res.redirect("/login?registrado=1");
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).render("registro", {
      titulo: "Crear Cuenta - Sumar Impacto",
      error: "Error interno al procesar el registro: " + error.message
    });
  }
};

// Autentica credenciales y genera cookie de sesion persistida en MongoDB
export const iniciarSesion = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const errorMsg = "Por favor ingrese email y contraseña.";
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(400).json({ error: errorMsg });
      }
      return res.status(400).render("login", {
        titulo: "Iniciar Sesion - Sumar Impacto",
        error: errorMsg,
        exito: null
      });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });

    if (!usuario || !usuario.validarPassword(password)) {
      const errorMsg = "Credenciales incorrectas: email o contraseña no validos.";
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(401).json({ error: errorMsg });
      }
      return res.status(401).render("login", {
        titulo: "Iniciar Sesion - Sumar Impacto",
        error: errorMsg,
        exito: null
      });
    }

    // Genera token JWT firmado con algoritmo seguro y tiempo de expiracion
    const jwtToken = jwt.sign(
      { id: usuario._id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || "secreto_super_seguro_ifts29",
      { expiresIn: "2h" }
    );

    // Guarda token en MongoDB para trazabilidad y revocacion inmediata
    const sesionToken = crypto.randomBytes(32).toString("hex");
    usuario.sesionToken = sesionToken;
    await usuario.save();

    // Establece cookie segura de token JWT y cookie de sesion HTTP-only
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 2 // 2 horas de vigencia
    };
    res.cookie("token", jwtToken, cookieOptions);
    res.cookie("sesion", sesionToken, cookieOptions);

    if (req.originalUrl.startsWith("/api/")) {
      return res.status(200).json({
        mensaje: "Autenticacion exitosa",
        token: jwtToken,
        sesionToken,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    }

    res.redirect("/");
  } catch (error) {
    console.error("Error al iniciar sesion:", error);
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).render("login", {
      titulo: "Iniciar Sesion - Sumar Impacto",
      error: "Error interno al iniciar sesion: " + error.message,
      exito: null
    });
  }
};

// Cierra la sesion invalidando el token en la BD y limpiando la cookie
export const cerrarSesion = async (req, res) => {
  try {
    if (req.usuario) {
      req.usuario.sesionToken = null;
      await req.usuario.save();
    }
    res.clearCookie("token");
    res.clearCookie("sesion");

    if (req.originalUrl.startsWith("/api/")) {
      return res.status(200).json({ mensaje: "Sesion cerrada correctamente" });
    }
    res.redirect("/login");
  } catch (error) {
    console.error("Error al cerrar sesion:", error);
    res.clearCookie("token");
    res.clearCookie("sesion");
    res.redirect("/login");
  }
};
