const fs = require('fs');
const ruta = './datos.json';

const leerDatos = () => {
  const datos = fs.readFileSync(ruta, 'utf-8');
  return JSON.parse(datos);
};

const guardarDatos = (datos) => {
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2));
};

const obtenerTodas = (req, res) => {
  const datos = leerDatos();
  res.status(200).json(datos.personas);
};

const obtenerPorId = (req, res) => {
  const datos = leerDatos();
  const persona = datos.personas.find(p => p.id === parseInt(req.params.id));
  if (!persona) return res.status(404).json({ mensaje: "Persona no encontrada" });
  res.status(200).json(persona);
};

const crear = (req, res) => {
  const { nombre, email, tipo } = req.body;
  if (!nombre || !email || !tipo) {
    return res.status(400).json({ mensaje: "Faltan campos obligatorios: nombre, email, tipo" });
  }
  const datos = leerDatos();
  const nuevoId = datos.personas.length > 0 ? Math.max(...datos.personas.map(p => p.id)) + 1 : 1;
  const nuevaPersona = { id: nuevoId, nombre, email, tipo };
  datos.personas.push(nuevaPersona);
  guardarDatos(datos);
  res.status(201).json({ mensaje: "Persona creada", persona: nuevaPersona });
};

const modificar = (req, res) => {
  const datos = leerDatos();
  const indice = datos.personas.findIndex(p => p.id === parseInt(req.params.id));
  if (indice === -1) return res.status(404).json({ mensaje: "Persona no encontrada" });
  const { nombre, email, tipo } = req.body;
  if (nombre) datos.personas[indice].nombre = nombre;
  if (email) datos.personas[indice].email = email;
  if (tipo) datos.personas[indice].tipo = tipo;
  guardarDatos(datos);
  res.status(200).json({ mensaje: "Persona actualizada", persona: datos.personas[indice] });
};

const eliminar = (req, res) => {
  const datos = leerDatos();
  const longitudAnterior = datos.personas.length;
  datos.personas = datos.personas.filter(p => p.id !== parseInt(req.params.id));
  if (datos.personas.length === longitudAnterior) {
    return res.status(404).json({ mensaje: "Persona no encontrada" });
  }
  guardarDatos(datos);
  res.status(200).json({ mensaje: "Persona eliminada" });
};

module.exports = { obtenerTodas, obtenerPorId, crear, modificar, eliminar };