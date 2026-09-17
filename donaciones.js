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
  const resultado = datos.donaciones.map(d => ({
    id: d.id,
    monto: d.monto,
    fecha: d.fecha,
    persona: datos.personas.find(p => p.id === d.personaId),
    proyecto: datos.proyectos.find(p => p.id === d.proyectoId)
  }));
  res.status(200).json(resultado);
};

const crear = (req, res) => {
  const { personaId, proyectoId, monto } = req.body;
  
  if (!personaId || !proyectoId || !monto) {
    return res.status(400).json({ mensaje: "Faltan campos: personaId, proyectoId, monto" });
  }
  if (monto <= 0) {
    return res.status(400).json({ mensaje: "El monto debe ser mayor a 0" });
  }

  const datos = leerDatos();
  
  const persona = datos.personas.find(p => p.id === personaId);
  if (!persona) return res.status(404).json({ mensaje: "Persona no encontrada" });

  const proyecto = datos.proyectos.find(p => p.id === proyectoId);
  if (!proyecto) return res.status(404).json({ mensaje: "Proyecto no encontrado" });

  const nuevoId = datos.donaciones.length > 0 ? Math.max(...datos.donaciones.map(d => d.id)) + 1 : 1;
  const nuevaDonacion = {
    id: nuevoId,
    personaId,
    proyectoId,
    monto,
    fecha: new Date().toLocaleDateString('es-AR')
  };

  datos.donaciones.push(nuevaDonacion);
  const indiceProyecto = datos.proyectos.findIndex(p => p.id === proyectoId);
  datos.proyectos[indiceProyecto].recaudado += monto;

  guardarDatos(datos);
  res.status(201).json({
    mensaje: "Donación registrada ✅",
    donacion: nuevaDonacion,
    proyectoActualizado: datos.proyectos[indiceProyecto]
  });
};

module.exports = { obtenerTodas, crear };