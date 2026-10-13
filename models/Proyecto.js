import mongoose from "mongoose";

const proyectoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del proyecto es obligatorio"],
      trim: true
    },
    organizacion: {
      type: String,
      required: [true, "La organizacion responsable es obligatoria"],
      trim: true
    },
    categoria: {
      type: String,
      required: [true, "La categoria es obligatoria"],
      trim: true
    },
    montoMeta: {
      type: Number,
      required: [true, "El monto meta es obligatorio"],
      min: [1, "El monto meta debe ser mayor a cero"]
    },
    recaudado: {
      type: Number,
      default: 0,
      min: [0, "El monto recaudado no puede ser negativo"]
    }
  },
  {
    timestamps: true
  }
);

// Metodos de instancia de dominio (POO en Mongoose)
proyectoSchema.methods.actualizarRecaudacion = function (monto) {
  this.recaudado += Number(monto);
  return this.recaudado;
};

proyectoSchema.methods.obtenerProgreso = function () {
  if (this.montoMeta <= 0) return 0;
  return Math.min(100, Math.round((this.recaudado / this.montoMeta) * 100));
};

export default mongoose.model("Proyecto", proyectoSchema);
