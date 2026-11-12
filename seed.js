import "dotenv/config";
import mongoose from "mongoose";
import { conectarDB } from "./config/db.js";
import Usuario from "./models/Usuario.js";
import Persona from "./models/Persona.js";
import Proyecto from "./models/Proyecto.js";
import Donacion from "./models/Donacion.js";

const inicializarBaseDatos = async () => {
  try {
    console.log("Iniciando carga de datos iniciales (Seed SemVer v1.2.0) en MongoDB...");
    await conectarDB();

    // Limpieza de colecciones previas
    await Usuario.deleteMany({});
    await Persona.deleteMany({});
    await Proyecto.deleteMany({});
    await Donacion.deleteMany({});
    console.log("Colecciones previas limpiadas correctamente.");

    // 1. Insercion de Usuarios con password seguro (pbkdf2Sync + salt sha512)
    const pass1 = Usuario.crearPasswordSeguro("admin1234");
    const pass2 = Usuario.crearPasswordSeguro("guille1234");
    const pass3 = Usuario.crearPasswordSeguro("raquel1234");
    const pass4 = Usuario.crearPasswordSeguro("eitel1234");

    const usuariosInsertados = await Usuario.insertMany([
      {
        nombre: "Administrador Sistema",
        email: "admin@sumarimpacto.org",
        passwordHash: pass1.passwordHash,
        salt: pass1.salt,
        rol: "admin"
      },
      {
        nombre: "Guillermo Chacon",
        email: "guillermo.chacon@ifts29.edu.ar",
        passwordHash: pass2.passwordHash,
        salt: pass2.salt,
        rol: "donante"
      },
      {
        nombre: "Sonia Raquel Andrada",
        email: "sonia.andrada@ifts29.edu.ar",
        passwordHash: pass3.passwordHash,
        salt: pass3.salt,
        rol: "responsable"
      },
      {
        nombre: "Eitel Hugo Belinzoni",
        email: "eitel.belinzoni@ifts29.edu.ar",
        passwordHash: pass4.passwordHash,
        salt: pass4.salt,
        rol: "donante"
      }
    ]);
    console.log(`Usuarios creados con hash sha512: ${usuariosInsertados.length}`);

    // 2. Insercion de Personas
    const personasInsertadas = await Persona.insertMany([
      {
        nombre: "Sonia Raquel Andrada",
        email: "sonia.andrada@ifts29.edu.ar",
        tipo: "responsable"
      },
      {
        nombre: "Guillermo Chacon",
        email: "guillermo.chacon@ifts29.edu.ar",
        tipo: "donante"
      },
      {
        nombre: "Eitel Hugo Belinzoni",
        email: "eitel.belinzoni@ifts29.edu.ar",
        tipo: "donante"
      },
      {
        nombre: "Carlos Menendez",
        email: "carlos.menendez@comunidad.org",
        tipo: "donante"
      }
    ]);
    console.log(`Personas creadas: ${personasInsertadas.length}`);

    // 3. Insercion de Proyectos Comunitarios
    const proyectosInsertados = await Proyecto.insertMany([
      {
        nombre: "Alimentos para Comedor Barrial",
        organizacion: "Comedor Los Pibes",
        categoria: "Alimentacion",
        montoMeta: 50000,
        recaudado: 25000
      },
      {
        nombre: "Equipamiento Escolar Rural",
        organizacion: "Fundacion Educando",
        categoria: "Educacion",
        montoMeta: 80000,
        recaudado: 20100
      },
      {
        nombre: "Salud Comunitaria y Primeros Auxilios",
        organizacion: "Cruz Barrial Solidaria",
        categoria: "Salud",
        montoMeta: 60000,
        recaudado: 12000
      }
    ]);
    console.log(`Proyectos creados: ${proyectosInsertados.length}`);

    // 4. Insercion de Donaciones iniciales vinculadas por ObjectId
    const donacionesInsertadas = await Donacion.insertMany([
      {
        personaId: personasInsertadas[1]._id, // Guillermo
        proyectoId: proyectosInsertados[0]._id, // Comedor Barrial
        monto: 15000,
        fecha: new Date("2026-10-10")
      },
      {
        personaId: personasInsertadas[2]._id, // Eitel
        proyectoId: proyectosInsertados[1]._id, // Escuela Rural
        monto: 20000,
        fecha: new Date("2026-10-12")
      },
      {
        personaId: personasInsertadas[3]._id, // Carlos
        proyectoId: proyectosInsertados[0]._id, // Comedor Barrial
        monto: 10000,
        fecha: new Date("2026-10-18")
      },
      {
        personaId: personasInsertadas[2]._id, // Eitel
        proyectoId: proyectosInsertados[1]._id, // Escuela Rural
        monto: 100,
        fecha: new Date("2026-10-20")
      }
    ]);
    console.log(`Donaciones creadas: ${donacionesInsertadas.length}`);

    console.log("¡Base de datos poblada exitosamente para la Entrega Final v1.2.0!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error.message);
    process.exit(1);
  }
};

inicializarBaseDatos();
