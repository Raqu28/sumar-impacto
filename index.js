const express = require('express');
const app = express();
const puerto = 3000;

// 📌 Importar los 3 módulos
const personas = require('./personas');
const proyectos = require('./proyectos');
const donaciones = require('./donaciones');

// Configuración
app.use(express.json());
app.set('view engine', 'pug');
app.set('views', './vistas');

// 🌐 Ruta web con Pug
app.get('/', (req, res) => {
  res.render('index', {
    titulo: "SumarImpacto — Organización sin fines de lucro",
    integrantes: [
      "Sonia Raquel Andrada",
      "Guillermo Chacón",
      "Eitel Hugo Belinzoni",
      "Emilia Sosa"
    ],
    descripcion: "Plataforma para conectar organizaciones sociales con donantes"
  });
});

// 📦 MÓDULO 1: PERSONAS
app.get('/api/personas', personas.obtenerTodas);
app.get('/api/personas/:id', personas.obtenerPorId);
app.post('/api/personas', personas.crear);
app.put('/api/personas/:id', personas.modificar);
app.delete('/api/personas/:id', personas.eliminar);

// 📦 MÓDULO 2: PROYECTOS
app.get('/api/proyectos', proyectos.obtenerTodos);
app.get('/api/proyectos/:id', proyectos.obtenerPorId);
app.post('/api/proyectos', proyectos.crear);
app.put('/api/proyectos/:id', proyectos.modificar);
app.delete('/api/proyectos/:id', proyectos.eliminar);

// 📦 MÓDULO 3: DONACIONES (los RELACIONA)
app.get('/api/donaciones', donaciones.obtenerTodas);
app.post('/api/donaciones', donaciones.crear);

// 🚀 Encender servidor
app.listen(puerto, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${puerto}`);
});