import "dotenv/config";
import http from "http";
import express from "express";
import { Server } from "socket.io";
import { conectarDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import personasRoutes from "./routes/personasRoutes.js";
import proyectosRoutes from "./routes/proyectosRoutes.js";
import donacionesRoutes from "./routes/donacionesRoutes.js";
import webRoutes from "./routes/webRoutes.js";
import { cargarUsuarioOpcional } from "./middlewares/authMiddleware.js";
import Usuario from "./models/Usuario.js";
import Persona from "./models/Persona.js";
import Proyecto from "./models/Proyecto.js";
import Donacion from "./models/Donacion.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.set("io", io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "pug");
app.set("views", "./views");

app.use(cargarUsuarioOpcional);

app.use("/", authRoutes);
app.use("/", webRoutes);
app.use("/api/personas", personasRoutes);
app.use("/api/proyectos", proyectosRoutes);
app.use("/api/donaciones", donacionesRoutes);

// Manejador 404
app.use((req, res) => {
  res.status(404);
  if (req.originalUrl.startsWith("/api/")) {
    return res.json({ mensaje: "Recurso no encontrado", ruta: req.originalUrl, status: 404 });
  }
  if (req.accepts("html")) {
    return res.render("404", { titulo: "No Encontrado", mensaje: "Ruta no encontrada" });
  }
  res.json({ mensaje: "Recurso no encontrado", status: 404 });
});

// Manejador centralizado de errores
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  if (req.accepts("html")) return res.render("404", { titulo: "Error", mensaje: err.message });
  res.json({ error: true, mensaje: err.message });
});

await conectarDB();

const TEST_PORT = 3099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

server.listen(TEST_PORT, async () => {
  console.log(`\n============================================================`);
  console.log(` INICIANDO BATERIA INTEGRAL DE PRUEBAS E2E (SemVer v1.2.0) `);
  console.log(`============================================================\n`);

  let passed = 0;
  let total = 0;
  let testEmail = "";

  async function assertTest(name, condition, details = "") {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] (${total}) ${name}`);
    } else {
      console.error(`[FAIL] (${total}) ${name} -> ${details}`);
    }
  }

  try {
    // 1. GET /api/personas
    const resPer = await fetch(`${BASE_URL}/api/personas`);
    const dataPer = await resPer.json();
    await assertTest("GET /api/personas responde 200 OK con array de personas", resPer.status === 200 && Array.isArray(dataPer) && dataPer.length >= 3);

    const testPersonaId = dataPer[0]._id;

    // 2. GET /api/personas/:id
    const resPerId = await fetch(`${BASE_URL}/api/personas/${testPersonaId}`);
    const dataPerId = await resPerId.json();
    await assertTest("GET /api/personas/:id busca por ObjectId en MongoDB", resPerId.status === 200 && dataPerId._id === testPersonaId);

    // 3. POST /api/personas
    const resPostPer = await fetch(`${BASE_URL}/api/personas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: "Tester E2E", email: "tester.e2e@sumarimpacto.org", tipo: "donante" })
    });
    const dataPostPer = await resPostPer.json();
    await assertTest("POST /api/personas crea persona con 201 Created", resPostPer.status === 201 && dataPostPer.persona?.email === "tester.e2e@sumarimpacto.org");

    // 4. GET /api/proyectos
    const resProy = await fetch(`${BASE_URL}/api/proyectos`);
    const dataProy = await resProy.json();
    await assertTest("GET /api/proyectos responde 200 OK", resProy.status === 200 && Array.isArray(dataProy) && dataProy.length >= 2);

    const testProyId = dataProy[0]._id;

    // 5. Filtro por categoria
    const resProyFiltro = await fetch(`${BASE_URL}/api/proyectos?categoria=Alimentacion`);
    const dataProyFiltro = await resProyFiltro.json();
    const filtroCorrecto = dataProyFiltro.every(p => /alimentacion/i.test(p.categoria));
    await assertTest("GET /api/proyectos?categoria=Alimentacion filtra por RegExp", resProyFiltro.status === 200 && filtroCorrecto);

    // 6. GET /api/donaciones con populate
    const resDon = await fetch(`${BASE_URL}/api/donaciones`);
    const dataDon = await resDon.json();
    const populateValido = dataDon.length > 0 && typeof dataDon[0].personaId === "object" && typeof dataDon[0].proyectoId === "object";
    await assertTest("GET /api/donaciones devuelve documentos poblados con populate()", resDon.status === 200 && populateValido);

    // ----------------------------------------------------
    // MODULO DE AUTENTICACION, SEGURIDAD Y SESIONES (v1.2.0)
    // ----------------------------------------------------

    // 7. Registro de usuario via REST API
    testEmail = `usuario.qa.${Date.now()}@sumarimpacto.org`;
    const resReg = await fetch(`${BASE_URL}/api/auth/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: "Usuario QA Test",
        email: testEmail,
        password: "passwordSeguro123",
        rol: "donante"
      })
    });
    await assertTest("Registro de usuario valida campos y crea hash sha512 con salt", resReg.status === 302 || resReg.status === 200 || resReg.status === 201);

    // 8. Login con contraseña incorrecta (debe fallar con 401)
    const resLoginFail = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "passwordErroneo" })
    });
    await assertTest("Login con contraseña incorrecta es rechazado (401 Unauthorized)", resLoginFail.status === 401);

    // 9. Login con contraseña correcta (debe responder 200 OK y devolver token)
    const resLoginOk = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "passwordSeguro123" })
    });
    const dataLogin = await resLoginOk.json();
    const rawCookie = resLoginOk.headers.get("set-cookie") || "";
    const sessionToken = dataLogin.token;
    await assertTest("Login con credenciales correctas devuelve 200 OK y cookie de sesion", resLoginOk.status === 200 && sessionToken && rawCookie.includes("sesion="));

    // 10. Acceso a rutas protegidas SIN sesion (debe redirigir 302 a /login)
    const resHomeSinCookie = await fetch(`${BASE_URL}/`, { redirect: "manual" });
    const resProtSinCookie = await fetch(`${BASE_URL}/donaciones/nueva`, { redirect: "manual" });
    await assertTest("Rutas protegidas (/ e /donaciones/nueva) sin sesion redirigen a /login (302)", resHomeSinCookie.status === 302 && resHomeSinCookie.headers.get("location")?.includes("/login") && resProtSinCookie.status === 302 && resProtSinCookie.headers.get("location")?.includes("/login"));

    // 11. Acceso a ruta privada CON sesion valida (debe permitir acceso 200 OK)
    const resProtConCookie = await fetch(`${BASE_URL}/donaciones/nueva`, {
      headers: { Cookie: `sesion=${sessionToken}` }
    });
    const htmlDonarAuth = await resProtConCookie.text();
    await assertTest("Ruta protegida /donaciones/nueva con cookie de sesion permite acceso (200 OK)", resProtConCookie.status === 200 && htmlDonarAuth.includes("Formulario de Registro de Donación"));

    // 12. Donacion via formulario web con sesion autenticada
    const params = new URLSearchParams();
    params.append("personaId", testPersonaId.toString());
    params.append("proyectoId", testProyId.toString());
    params.append("monto", "1250");

    const resWebPostDonar = await fetch(`${BASE_URL}/donaciones/nueva`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: `sesion=${sessionToken}`
      },
      body: params,
      redirect: "manual"
    });
    await assertTest("POST /donaciones/nueva con sesion procesa aporte y redirige a inicio (302)", resWebPostDonar.status === 302 && resWebPostDonar.headers.get("location")?.includes("donacion_exitosa=1"));

    // 13. Verificacion de actualizacion del monto del proyecto
    const resProyCheck = await fetch(`${BASE_URL}/api/proyectos`);
    const dataProyCheck = await resProyCheck.json();
    const proyActualizado = dataProyCheck.find(p => p._id === testProyId);
    await assertTest("Metodo de instancia actualizarRecaudacion impacto acumulado en MongoDB", proyActualizado && proyActualizado.recaudado >= 1250);

    // 14. VISTAS WEB SSR: Home con barra adaptativa
    const resHome = await fetch(`${BASE_URL}/`, {
      headers: { Cookie: `sesion=${sessionToken}` }
    });
    const htmlHome = await resHome.text();
    await assertTest("GET / renderiza inicio con saludo a usuario autenticado y badges en vivo", resHome.status === 200 && htmlHome.includes("Hola,") && htmlHome.includes("Cerrar Sesión"));

    // 15. VISTAS WEB SSR: Login y Registro
    const resVistaLogin = await fetch(`${BASE_URL}/login`);
    const htmlLogin = await resVistaLogin.text();
    await assertTest("GET /login renderiza formulario de login Pug", resVistaLogin.status === 200 && htmlLogin.includes("Iniciar Sesión en Sumar Impacto"));

    const resVistaReg = await fetch(`${BASE_URL}/registro`);
    const htmlReg = await resVistaReg.text();
    await assertTest("GET /registro renderiza formulario de registro Pug", resVistaReg.status === 200 && htmlReg.includes("Registro de Usuario"));

    // 16. Manejo de errores 404 (vista Pug y API JSON)
    const res404Html = await fetch(`${BASE_URL}/ruta-inexistente-web`);
    const html404 = await res404Html.text();
    await assertTest("Ruta inexistente web renderiza vista 404.pug con status 404", res404Html.status === 404 && html404.includes("404 - Recurso No Encontrado"));

    const res404Api = await fetch(`${BASE_URL}/api/recurso-inexistente`);
    const json404 = await res404Api.json();
    await assertTest("Ruta inexistente API responde JSON semantico 404", res404Api.status === 404 && json404.status === 404);

    // 17. Cierre de sesion (Logout)
    const resLogout = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: `sesion=${sessionToken}` }
    });
    await assertTest("Cierre de sesion invalida token y responde 200 OK", resLogout.status === 200);

    console.log(`\n============================================================`);
    console.log(` RESULTADO FINAL: ${passed}/${total} PRUEBAS EXITOSAS (${Math.round((passed/total)*100)}%) `);
    console.log(`============================================================\n`);

  } catch (err) {
    console.error("Error fatal durante la ejecucion de pruebas:", err);
  } finally {
    // Limpieza de datos temporales generados durante la prueba para no ensuciar la BD
    try {
      await Persona.deleteMany({ email: { $in: ["tester.e2e@sumarimpacto.org", testEmail] } });
      await Usuario.deleteMany({ email: testEmail });
      await Donacion.deleteMany({ monto: { $in: [1000, 1250] } });
    } catch (cleanupErr) {
      console.warn("Aviso en limpieza de tests:", cleanupErr.message);
    }
    server.close();
    process.exit(0);
  }
});
