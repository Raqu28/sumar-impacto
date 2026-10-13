import mongoose from "mongoose";

const donacionSchema = new mongoose.Schema(
  {
    personaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Persona",
      required: [true, "El donante es obligatorio"]
    },
    proyectoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proyecto",
      required: [true, "El proyecto destinatario es obligatorio"]
    },
    monto: {
      type: Number,
      required: [true, "El monto es obligatorio"],
      min: [1, "El monto a donar debe ser superior a cero"]
    },
    fecha: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Donacion", donacionSchema);
