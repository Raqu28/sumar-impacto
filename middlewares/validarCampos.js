const validarPersona = (req, res, next) => {
    const { nombre, email, tipo } = req.body;
    if (!nombre || !email || !tipo) {
        return res.status(400).json({
            mensaje: "Campos obligatorios incompletos: nombre, email y tipo son requeridos"
        });
    }

    if (tipo !== "donante" && tipo !== "responsable") {
        return res.status(400).json({
            mensaje: "El campo tipo debe ser 'donante' o 'responsable'"
        });
    }

    next();
};

const validarProyecto = (req, res, next) => {
    const { nombre, organizacion, categoria, montoMeta } = req.body;
    if (!nombre || !organizacion || !categoria || montoMeta === undefined) {
        return res.status(400).json({
            mensaje: "Campos obligatorios incompletos: nombre, organizacion, categoria y montoMeta son requeridos"
        });
    }

    if (isNaN(Number(montoMeta)) || Number(montoMeta) <= 0) {
        return res.status(400).json({
            mensaje: "El campo montoMeta debe ser un numero mayor a cero"
        });
    }

    next();
};

const validarDonacion = (req, res, next) => {
    const { personaId, proyectoId, monto } = req.body;
    if (!personaId || !proyectoId || monto === undefined) {
        return res.status(400).json({
            mensaje: "Campos obligatorios incompletos: personaId, proyectoId y monto son requeridos"
        });
    }

    if (isNaN(Number(monto)) || Number(monto) <= 0) {
        return res.status(400).json({
            mensaje: "El monto a donar debe ser un valor numerico superior a cero"
        });
    }

    next();
};

module.exports = {
    validarPersona,
    validarProyecto,
    validarDonacion
};