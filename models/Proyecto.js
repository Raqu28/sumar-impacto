class Proyecto {
    constructor(id, nombre, organizacion, categoria, montoMeta, recaudado = 0) {
        this.id = id;
        this.nombre = nombre;
        this.organizacion = organizacion;
        this.categoria = categoria;
        this.montoMeta = Number(montoMeta);
        this.recaudado = Number(recaudado);
    }
}

module.exports = Proyecto;
