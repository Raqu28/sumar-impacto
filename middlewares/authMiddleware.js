import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

// Parsea cookies desde req.cookies (cookie-parser) o analiza la cabecera directamente
const obtenerCookies = (req) => {
  if (req.cookies && Object.keys(req.cookies).length > 0) {
    return req.cookies;
  }
  const header = req.headers.cookie;
  if (!header) return {};
  return header.split(";").reduce((acc, c) => {
    const [nombre, valor] = c.trim().split("=");
    if (nombre && valor) acc[nombre] = decodeURIComponent(valor);
    return acc;
  }, {});
};

// Middleware que protege rutas privadas mediante validacion de JWT y sesion
const protegerRuta = async (req, res, next) => {
  try {
    const cookies = obtenerCookies(req);
    const token = cookies.token || req.headers.authorization?.replace("Bearer ", "");
    const sesionToken = cookies.sesion;

    if (!token && !sesionToken) {
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(401).json({ mensaje: "Acceso no autorizado: inicie sesion para operar" });
      }
      return res.redirect("/login");
    }

    let usuario = null;

    // Estrategia 1: Verificacion de JWT firmado (Clase 13 y 14)
    // Acepta token en cookie 'token', cabecera Authorization, o cookie 'sesion' si contiene un JWT
    const posibleJwt = token || (sesionToken && sesionToken.includes(".") ? sesionToken : null);
    if (posibleJwt) {
      try {
        const payload = jwt.verify(posibleJwt, process.env.JWT_SECRET || "secreto_super_seguro_ifts29");
        usuario = await Usuario.findById(payload.id);
      } catch (jwtErr) {
        // Token JWT expirado o invalido
      }
    }

    // Estrategia 2: Fallback a sesion persistida en MongoDB (Clase 12)
    if (!usuario && sesionToken) {
      usuario = await Usuario.findOne({ sesionToken });
    }

    if (!usuario) {
      res.clearCookie("token");
      res.clearCookie("sesion");
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(401).json({ mensaje: "Sesion invalida o expirada" });
      }
      return res.redirect("/login");
    }

    req.usuario = usuario;
    res.locals.usuario = usuario; // Disponible para Pug en todas las plantillas
    next();
  } catch (error) {
    console.error("Error en middleware de autenticacion:", error.message);
    res.clearCookie("token");
    res.clearCookie("sesion");
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(401).json({ mensaje: "Error de autenticacion" });
    }
    res.redirect("/login");
  }
};

// Middleware global no bloqueante: adjunta el usuario a res.locals si la sesion existe
const cargarUsuarioOpcional = async (req, res, next) => {
  try {
    const cookies = obtenerCookies(req);
    const token = cookies.token || req.headers.authorization?.replace("Bearer ", "");
    const sesionToken = cookies.sesion;

    let usuario = null;
    const posibleJwt = token || (sesionToken && sesionToken.includes(".") ? sesionToken : null);

    if (posibleJwt) {
      try {
        const payload = jwt.verify(posibleJwt, process.env.JWT_SECRET || "secreto_super_seguro_ifts29");
        usuario = await Usuario.findById(payload.id);
      } catch (e) {}
    }

    if (!usuario && sesionToken) {
      usuario = await Usuario.findOne({ sesionToken });
    }

    if (usuario) {
      req.usuario = usuario;
      res.locals.usuario = usuario;
    }
    next();
  } catch (error) {
    next();
  }
};

export {
  obtenerCookies as leerCookies,
  protegerRuta,
  cargarUsuarioOpcional
};
