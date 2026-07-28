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

            id_usuario,

            tipo_accion,

            tipo_objeto,

            id_objeto,

            new Date().toISOString(),

            campo_modificado,

            valor_antiguo,

            valor_nuevo

        ]

    );

}

module.exports = {

    registrarBitacora

};