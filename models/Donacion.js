class Donacion {
    constructor(id, personaId, proyectoId, monto, fecha = null) {
        this.id = id;
        this.personaId = Number(personaId);
        this.proyectoId = Number(proyectoId);
        this.monto = Number(monto);
        this.fecha = fecha || new Date().toISOString().split("T")[0];
    }
}

module.exports = Donacion;
