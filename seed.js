import dotenv from "dotenv";
import mongoose from "mongoose";
import { conectarDB } from "./config/db.js";
import Persona from "./models/Persona.js";
import Proyecto from "./models/Proyecto.js";
import Donacion from "./models/Donacion.js";

dotenv.config();

const inicializarBaseDatos = async () => {
  try {
    console.log("Iniciando carga de datos iniciales (Seed) en MongoDB...");
    await conectarDB();

    // Limpieza de colecciones previas
    await Persona.deleteMany({});
    await Proyecto.deleteMany({});
    await Donacion.deleteMany({});
    console.log("Colecciones previas limpiadas correctamente.");

    // 1. Insercion de Personas (Integrantes del equipo y donantes)
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
        nombre: "Emilia Sosa",
        email: "emilia.sosa@ifts29.edu.ar",
        tipo: "donante"
      }
    ]);
    console.log(`Personas creadas: ${personasInsertadas.length}`);

    // 2. Insercion de Proyectos Comunitarios
    const proyectosInsertados = await Proyecto.insertMany([
      {
        nombre: "Alimentos para Comedor Barrial",
        organizacion: "Comedor Los Pibes",
        categoria: "Alimentacion",
        montoMeta: 50000,
        recaudado: 20000
      },
      {
        nombre: "Equipamiento Escolar Rural",
        organizacion: "Fundacion Educando",
        categoria: "Educacion",
        montoMeta: 80000,
        recaudado: 20100
      }
    ]);
    console.log(`Proyectos creados: ${proyectosInsertados.length}`);

    // 3. Insercion de Donaciones iniciales vinculadas por ObjectId
    const donacionesInsertadas = await Donacion.insertMany([
      {
        personaId: personasInsertadas[1]._id, // Guillermo
        proyectoId: proyectosInsertados[0]._id, // Comedor Barrial
        monto: 15000,
        fecha: new Date("2026-09-10")
      },
      {
        personaId: personasInsertadas[2]._id, // Eitel
        proyectoId: proyectosInsertados[1]._id, // Escuela Rural
        monto: 20000,
        fecha: new Date("2026-09-12")
      },
      {
        personaId: personasInsertadas[3]._id, // Emilia
        proyectoId: proyectosInsertados[0]._id, // Comedor Barrial
        monto: 5000,
        fecha: new Date("2026-09-18")
      },
      {
        personaId: personasInsertadas[2]._id, // Eitel
        proyectoId: proyectosInsertados[1]._id, // Escuela Rural
        monto: 100,
        fecha: new Date("2026-09-18")
      }
    ]);
    console.log(`Donaciones creadas: ${donacionesInsertadas.length}`);

    console.log("Base de datos poblada exitosamente con MongoDB y Mongoose!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error.message);
    process.exit(1);
  }
};

inicializarBaseDatos();
