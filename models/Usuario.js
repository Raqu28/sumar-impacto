import crypto from "crypto";
import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre del usuario es obligatorio"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "El email es obligatorio"],
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  sesionToken: {
    type: String,
    default: null
  },
  rol: {
    type: String,
    enum: ["donante", "responsable", "admin"],
    default: "donante"
  }
}, {
  timestamps: true
});

// Metodo de instancia: valida password en texto plano contra el hash y salt guardados
usuarioSchema.methods.validarPassword = function(password) {
  if (!password) return false;
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 64, "sha512")
    .toString("hex");

  return this.passwordHash === hash;
};

// Metodo estatico de clase: genera salt criptografico aleatorio y calcula hash sha512
usuarioSchema.statics.crearPasswordSeguro = function(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return { salt, passwordHash };
};

export default mongoose.model("Usuario", usuarioSchema);
