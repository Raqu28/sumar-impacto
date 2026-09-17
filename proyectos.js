const fs = require('fs');
const ruta = './datos.json';

const leerDatos = () => {
  const datos = fs.readFileSync(ruta, 'utf-8');
  return JSON.parse(datos);
};

const guardarDatos = (datos) => {
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2));
};

const obtenerTodos = (req, res) => {
  const datos = leerDatos();
  if (req.query.categoria) {
    const filtrados = datos.proyectos.filter(p => p.categoria === req.query.categoria);
    return res.status(200).json(filtrados);
  }
  res.status(200).json(datos.proyectos);
};

const obtenerPorId = (req, res) => {
  const datos = leerDatos();
  const proyecto = datos.proyectos.find(p => p.id === parseInt(req.params.id));
  if (!proyecto) return res.status(404).json({ mensaje: "Proyecto no encontrado" });
  res.status(200).json(proyecto);
};

const crear = (req, res) => {
  const { nombre, organizacion, categoria, montoMeta } = req.body;
  if (!nombre || !organizacion || !categoria || !montoMeta) {
    return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
  }
  const datos = leerDatos();
  const nuevoId = datos.proyectos.length > 0 ? Math.max(...datos.proyectos.map(p => p.id)) + 1 : 1;
  const nuevo = { id: nuevoId, nombre, organizacion, categoria, montoMeta, recaudado: 0 };
  datos.proyectos.push(nuevo);
  guardarDatos(datos);
  res.status(201).json({ mensaje: "Proyecto creado", proyecto: nuevo });
};

const modificar = (req, res) => {
  const datos = leerDatos();
  const indice = datos.proyectos.findIndex(p => p.id === parseInt(req.params.id));
  if (indice === -1) return res.status(404).json({ mensaje: "Proyecto no encontrado" });
  const { nombre, organizacion, categoria, montoMeta } = req.body;
  if (nombre) datos.proyectos[indice].nombre = nombre;
  if (organizacion) datos.proyectos[indice].organizacion = organizacion;
  if (categoria) datos.proyectos[indice].categoria = categoria;
  if (montoMeta) datos.proyectos[indice].montoMeta = montoMeta;
  guardarDatos(datos);
  res.status(200).json({ mensaje: "Proyecto actualizado", proyecto: datos.proyectos[indice] });
};

const eliminar = (req, res) => {
  const datos = leerDatos();
  const longitudAnterior = datos.proyectos.length;
  datos.proyectos = datos.proyectos.filter(p => p.id !== parseInt(req.params.id));
  if (datos.proyectos.length === longitudAnterior) {
    return res.status(404).json({ mensaje: "Proyecto no encontrado" });
  }
  guardarDatos(datos);
  res.status(200).json({ mensaje: "Proyecto eliminado" });
};

module.exports = { obtenerTodos, obtenerPorId, crear, modificar, eliminar };