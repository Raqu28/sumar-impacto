const validarProducto = require('../validaciones/productoValido');

const validarCamposProducto = (req, res, next) => {
  const { esValido, errores } = validarProducto(req.body);
  
  if (!esValido) {
    return res.status(400).json({ 
      mensaje: 'Datos inválidos',
      errores 
    });
  }
  
  next();
};

module.exports = validarCamposProducto;