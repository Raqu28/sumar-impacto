const express = require('express');
const fs = require('fs');
const path = require('path');
const validarCamposProducto = require('../middlewares/validarCampos');

const router = express.Router();
const ARCHIVO = path.join(__dirname, '../datos/productos.json');

// Leer y guardar
const leer = () => JSON.parse(fs.readFileSync(ARCHIVO, 'utf-8'));
const guardar = (datos) => fs.writeFileSync(ARCHIVO, JSON.stringify(datos, null, 2));

// GET todos + ?limite=
router.get('/', (req, res) => {
  let productos = leer();
  if (req.query.limite) {
    productos = productos.slice(0, Number(req.query.limite));
  }
  res.status(200).json(productos);
});

// GET por ID
router.get('/:id', (req, res) => {
  const productos = leer();
  const prod = productos.find(p => p.id === Number(req.params.id));
  if (!prod) return res.status(404).json({ mensaje: 'Producto no encontrado' });
  res.status(200).json(prod);
});

// POST
router.post('/', validarCamposProducto, (req, res) => {
  const productos = leer();
  const nuevo = {
    id: productos.length ? productos[productos.length - 1].id + 1 : 1,
    nombre: req.body.nombre.trim(),
    precio: req.body.precio,
    categoria: req.body.categoria || 'Sin categoría'
  };
  productos.push(nuevo);
  guardar(productos);
  res.status(201).json({ mensaje: 'Producto creado', producto: nuevo });
});

// PUT
router.put('/:id', validarCamposProducto, (req, res) => {
  const productos = leer();
  const idx = productos.findIndex(p => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ mensaje: 'Producto no encontrado' });
  
  productos[idx] = {
    ...productos[idx],
    nombre: req.body.nombre.trim(),
    precio: req.body.precio,
    categoria: req.body.categoria || productos[idx].categoria
  };
  guardar(productos);
  res.status(200).json({ mensaje: 'Producto actualizado', producto: productos[idx] });
});

// DELETE
router.delete('/:id', (req, res) => {
  let productos = leer();
  const existe = productos.some(p => p.id === Number(req.params.id));
  if (!existe) return res.status(404).json({ mensaje: 'Producto no encontrado' });
  
  productos = productos.filter(p => p.id !== Number(req.params.id));
  guardar(productos);
  res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
});

module.exports = router;