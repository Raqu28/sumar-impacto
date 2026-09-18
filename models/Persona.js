class Persona {
    constructor(id, nombre, email, tipo) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.tipo = tipo; // "donante" o "responsable"
    }
}

module.exports = Persona;
