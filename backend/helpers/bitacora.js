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
        //Validar que tipo_accion NO sea NULL
        if (!tipo_accion) {
            console.error('[Bitácora] tipo_accion es NULL o vacío');
            return false;
        }

        //Validar que tipo_accion sea uno de los permitidos
        const accionesValidas = ['INSERT', 'UPDATE', 'DELETE', 'REVISION', 'EMISION', 'APROBACION', 'RECHAZO', 'LOGIN', 'LOGOUT'];
        if (!accionesValidas.includes(tipo_accion)) {
            console.warn('[Bitácora] tipo_accion inválido:', tipo_accion);
            return false;
        }

        // Para LOGIN/LOGOUT, los campos de objeto deben ser NULL
        if (tipo_accion === 'LOGIN' || tipo_accion === 'LOGOUT') {
            tipo_objeto = null;
            id_objeto = null;
            campo_modificado = null;
            valor_antiguo = null;
            valor_nuevo = null;
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

    console.log('[Bitácora] Registrado:', { tipo_accion, tipo_objeto, id_objeto });

    return true;

    } catch (error) {
        console.error('[Bitácora] Error:', error.message);
        return false;
    }
}

module.exports = {

    registrarBitacora

};