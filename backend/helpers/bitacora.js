const db = require('../db');

async function registrarBitacora({

    id_usuario,
    tipo_accion,
    tipo_objeto = null,
    id_objeto = null,
    campo_modificado = null,
    valor_antiguo = null,
    valor_nuevo = null

}) {

    try {

        const accionesSinObjeto = ['LOGIN', 'LOGOUT'];

        if (accionesSinObjeto.includes(tipo_accion)) {
            // Login/Logout: objeto debe ser NULL
            tipo_objeto = null;
            id_objeto = null;
            campo_modificado = null;
            valor_antiguo = null;
            valor_nuevo = null;
        } else {
            // Otras acciones: objeto NO debe ser NULL
            if (!tipo_objeto) {
                console.warn('[Bitácora] tipo_objeto es NULL para', tipo_accion);
                return false;
            }
            if (!id_objeto) {
                console.warn('[Bitácora] id_objeto es NULL para', tipo_accion);
                return false;
            }
        }
    

    await db.execute(

        `
        INSERT INTO tbl_bitacora
        (
            id_usuario,
            tipo_accion,
            tipo_objeto,
            id_objeto,
            fecha_accion,
            campo_modificado,
            valor_antiguo,
            valor_nuevo
        )

        VALUES(?,?,?,?,?,?,?,?)
        `,

        [

            id_usuario || 1,

            tipo_accion,

            tipo_objeto,

            id_objeto,

            new Date().toISOString(),

            campo_modificado || null,

            valor_antiguo || null,

            valor_nuevo || null

        ]

    );

    return true;

    } catch (error) {
        console.error('[Bitácora] Error:', error.message);
        return false;
    }
}

module.exports = {

    registrarBitacora

};