const validarProducto = (datos) => {
  const { nombre, precio } = datos;
  const errores = [];

  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    errores.push('El nombre es obligatorio y debe ser texto');
  }
  if (precio === undefined || precio === null) {
    errores.push('El precio es obligatorio');
  } else if (typeof precio !== 'number' || precio <= 0) {
    errores.push('El precio debe ser un número mayor a 0');
  }

  return {
    esValido: errores.length === 0,
    errores
  };
};

module.exports = validarProducto;