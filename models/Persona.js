import mongoose from "mongoose";

const personaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "El email institucional es obligatorio"],
      trim: true,
      lowercase: true
    },
    tipo: {
      type: String,
      required: [true, "El tipo es obligatorio"],
      enum: {
        values: ["donante", "responsable"],
        message: "El tipo debe ser 'donante' o 'responsable'"
      }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Persona", personaSchema);
