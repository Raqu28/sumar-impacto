import express from "express";
import {
  mostrarLogin,
  mostrarRegistro,
  registrarUsuario,
  iniciarSesion,
  cerrarSesion
} from "../controllers/authController.js";
import { protegerRuta } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rutas de autenticacion Web
router.get("/login", mostrarLogin);
router.post("/login", iniciarSesion);

router.get("/registro", mostrarRegistro);
router.post("/registro", registrarUsuario);

router.get("/logout", protegerRuta, cerrarSesion);
router.post("/logout", protegerRuta, cerrarSesion);

// Endpoints REST de autenticacion
router.post("/api/auth/login", iniciarSesion);
router.post("/api/auth/registro", registrarUsuario);
router.post("/api/auth/logout", protegerRuta, cerrarSesion);

export default router;
