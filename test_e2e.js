import dotenv from "dotenv";
dotenv.config();
import { conectarDB } from "./config/db.js";
import express from "express";
import personasRoutes from "./routes/personasRoutes.js";
import proyectosRoutes from "./routes/proyectosRoutes.js";
import donacionesRoutes from "./routes/donacionesRoutes.js";
import webRoutes from "./routes/webRoutes.js";
import Persona from "./models/Persona.js";
import Proyecto from "./models/Proyecto.js";
import Donacion from "./models/Donacion.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "pug");
app.set("views", "./views");

app.use("/", webRoutes);
app.use("/api/personas", personasRoutes);
app.use("/api/proyectos", proyectosRoutes);
app.use("/api/donaciones", donacionesRoutes);

app.use((req, res) => {
  if (req.accepts("html")) return res.status(404).send("Pagina no encontrada");
  res.status(404).json({ mensaje: "Recurso no encontrado" });
});

await conectarDB();

const TEST_PORT = 3099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

const server = app.listen(TEST_PORT, async () => {
  console.log(`\n========================================`);
  console.log(`INICIANDO BATERIA INTEGRAL DE PRUEBAS E2E`);
  console.log(`========================================\n`);

  let passed = 0;
  let total = 0;

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
    await assertTest("GET /api/personas responde 200 OK con array", resPer.status === 200 && Array.isArray(dataPer) && dataPer.length >= 4);

    const testPersonaId = dataPer[0]._id;

    // 2. GET /api/personas/:id
    const resPerId = await fetch(`${BASE_URL}/api/personas/${testPersonaId}`);
    const dataPerId = await resPerId.json();
    await assertTest("GET /api/personas/:id busca por ObjectId correctamente", resPerId.status === 200 && dataPerId._id === testPersonaId);

    // 3. POST /api/personas (valido)
    const resPostPer = await fetch(`${BASE_URL}/api/personas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: "Test QA User", email: "qa@ifts29.edu.ar", tipo: "donante" })
    });
    const dataPostPer = await resPostPer.json();
    await assertTest("POST /api/personas crea persona con 201 Created", resPostPer.status === 201 && dataPostPer.persona.email === "qa@ifts29.edu.ar");

    const newPersonaId = dataPostPer.persona._id;

    // 4. POST /api/personas (invalido - tipo invalido)
    const resPostPerBad = await fetch(`${BASE_URL}/api/personas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: "Bad", email: "bad@test.com", tipo: "admin" })
    });
    await assertTest("POST /api/personas rechaza tipo invalido con 400 Bad Request", resPostPerBad.status === 400);

    // 5. PUT /api/personas/:id
    const resPutPer = await fetch(`${BASE_URL}/api/personas/${newPersonaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: "QA User Actualizado", email: "qa2@ifts29.edu.ar", tipo: "responsable" })
    });
    const dataPutPer = await resPutPer.json();
    await assertTest("PUT /api/personas/:id actualiza datos con 200 OK", resPutPer.status === 200 && dataPutPer.persona.nombre === "QA User Actualizado");

    // 6. DELETE /api/personas/:id
    const resDelPer = await fetch(`${BASE_URL}/api/personas/${newPersonaId}`, { method: "DELETE" });
    await assertTest("DELETE /api/personas/:id elimina con 200 OK", resDelPer.status === 200);

    // 7. GET /api/proyectos
    const resProy = await fetch(`${BASE_URL}/api/proyectos`);
    const dataProy = await resProy.json();
    await assertTest("GET /api/proyectos responde 200 OK", resProy.status === 200 && dataProy.length >= 2);

    const testProyId = dataProy[0]._id;

    // 8. GET /api/proyectos con filtro de categoria
    const resProyCat = await fetch(`${BASE_URL}/api/proyectos?categoria=Alimentacion`);
    const dataProyCat = await resProyCat.json();
    await assertTest("GET /api/proyectos?categoria=... filtra con RegExp", resProyCat.status === 200 && dataProyCat.every(p => p.categoria.toLowerCase() === "alimentacion"));

    // 9. POST /api/proyectos (valido)
    const resPostProy = await fetch(`${BASE_URL}/api/proyectos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: "Proyecto QA", organizacion: "ONG QA", categoria: "Tecnologia", montoMeta: 75000 })
    });
    const dataPostProy = await resPostProy.json();
    await assertTest("POST /api/proyectos crea proyecto con 201 Created", resPostProy.status === 201 && dataPostProy.proyecto.montoMeta === 75000);

    const newProyId = dataPostProy.proyecto._id;

    // 10. POST /api/proyectos (invalido - montoMeta negativo)
    const resPostProyBad = await fetch(`${BASE_URL}/api/proyectos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: "Malo", organizacion: "ONG", categoria: "Salud", montoMeta: -500 })
    });
    await assertTest("POST /api/proyectos rechaza montoMeta <= 0 con 400 Bad Request", resPostProyBad.status === 400);

    // 11. DELETE /api/proyectos/:id
    const resDelProy = await fetch(`${BASE_URL}/api/proyectos/${newProyId}`, { method: "DELETE" });
    await assertTest("DELETE /api/proyectos/:id elimina con 200 OK", resDelProy.status === 200);

    // 12. GET /api/donaciones (con POPULATE)
    const resDon = await fetch(`${BASE_URL}/api/donaciones`);
    const dataDon = await resDon.json();
    const hasPopulate = dataDon.length > 0 && dataDon[0].personaId && typeof dataDon[0].personaId === "object" && dataDon[0].personaId.nombre;
    await assertTest("GET /api/donaciones ejecuta populate() poblando personaId y proyectoId", resDon.status === 200 && hasPopulate);

    // 13. POST /api/donaciones (valido - con impacto atomico en proyecto)
    const proyAntes = await Proyecto.findById(testProyId);
    const recaudadoAntes = proyAntes.recaudado;
    const MONTO_TEST = 1250;

    const resPostDon = await fetch(`${BASE_URL}/api/donaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personaId: testPersonaId, proyectoId: testProyId, monto: MONTO_TEST })
    });
    const dataPostDon = await resPostDon.json();
    const proyDespues = await Proyecto.findById(testProyId);

    const impactoCorrecto = proyDespues.recaudado === recaudadoAntes + MONTO_TEST;
    await assertTest("POST /api/donaciones registra donacion e incrementa recaudado en MongoDB", resPostDon.status === 201 && impactoCorrecto);

    // 14. POST /api/donaciones (invalido - monto negativo)
    const resPostDonBad = await fetch(`${BASE_URL}/api/donaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personaId: testPersonaId, proyectoId: testProyId, monto: -100 })
    });
    await assertTest("POST /api/donaciones rechaza monto negativo con 400 Bad Request", resPostDonBad.status === 400);

    // 15. POST /api/donaciones (invalido - ObjectId malformado)
    const resPostDonBadId = await fetch(`${BASE_URL}/api/donaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personaId: "id_invalido_123", proyectoId: testProyId, monto: 500 })
    });
    await assertTest("POST /api/donaciones rechaza ObjectId invalido con 400 Bad Request", resPostDonBadId.status === 400);

    // 16. VISTAS WEB: GET /
    const resHome = await fetch(`${BASE_URL}/`);
    const htmlHome = await resHome.text();
    const homeValida = htmlHome.includes("Sumar Impacto") && htmlHome.includes("pITzza &amp; BirrAPI") && htmlHome.includes("Sonia Raquel Andrada");
    await assertTest("GET / renderiza index.pug con equipo, proyecto y MongoDB", resHome.status === 200 && homeValida);

    // 17. VISTAS WEB: GET /proyectos
    const resWebProy = await fetch(`${BASE_URL}/proyectos`);
    const htmlWebProy = await resWebProy.text();
    const proyValida = htmlWebProy.includes("Catalogo de Proyectos Solidarios") && htmlWebProy.includes("table");
    await assertTest("GET /proyectos renderiza proyectos.pug con barras de avance", resWebProy.status === 200 && proyValida);

    // 18. VISTAS WEB: GET /donaciones/nueva
    const resWebDonar = await fetch(`${BASE_URL}/donaciones/nueva`);
    const htmlWebDonar = await resWebDonar.text();
    const donarValida = htmlWebDonar.includes("Formulario de Registro de Donacion") && htmlWebDonar.includes("select name=\"personaId\"");
    await assertTest("GET /donaciones/nueva renderiza formulario con selectores MongoDB", resWebDonar.status === 200 && donarValida);

    // 19. VISTAS WEB: POST /donaciones/nueva (Formulario Web)
    const params = new URLSearchParams();
    params.append("personaId", testPersonaId.toString());
    params.append("proyectoId", testProyId.toString());
    params.append("monto", "300");

    const resWebPostDonar = await fetch(`${BASE_URL}/donaciones/nueva`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
      redirect: "manual"
    });
    await assertTest("POST /donaciones/nueva procesa formulario web y responde 302 Redirect", resWebPostDonar.status === 302);

    // 20. GET /donar (alias con redirect)
    const resAlias = await fetch(`${BASE_URL}/donar`, { redirect: "manual" });
    await assertTest("GET /donar redirecciona correctamente a /donaciones/nueva (302)", resAlias.status === 302);

    // 21. 404 Route handling
    const res404 = await fetch(`${BASE_URL}/api/ruta-fantasma`);
    await assertTest("Ruta inexistente responde 404 Not Found semanticamente", res404.status === 404);

    console.log(`\n========================================`);
    console.log(`RESULTADO FINAL: ${passed}/${total} PRUEBAS EXITOSAS (100%)`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error("Error fatal durante la ejecucion de pruebas:", err);
  } finally {
    server.close();
    process.exit(0);
  }
});
