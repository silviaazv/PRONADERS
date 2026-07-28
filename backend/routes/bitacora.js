const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {

    try {

        const filtros = [

            'id_usuario',

            'tipo_accion',

            'tipo_objeto',

            'id_objeto'

        ].filter(

            k => req.query[k] !== undefined

        );

        let sql = 'SELECT * FROM tbl_bitacora';

        const params = [];

        if (filtros.length) {

            sql +=
                ' WHERE ' +
                filtros.map(f => `${f} = ?`).join(' AND ');

            filtros.forEach(

                f => params.push(req.query[f])

            );

        }

        sql +=
            ' ORDER BY fecha_accion DESC';

        const registros =
            await db.queryAll(sql, params);

        res.json(registros);

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

module.exports = router;
