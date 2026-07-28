// tbl_proyectos_usuarios tiene llave primaria compuesta (id_usuario + id_proyecto),
// así que no encaja en el CRUD genérico (pensado para PK de una sola columna).

const express = require('express');
const db = require('../db');

const router = express.Router();

// ======================================================
// GET /api/proyectos-usuarios?id_proyecto=1
// GET /api/proyectos-usuarios?id_usuario=5
// ======================================================

router.get('/', async (req, res) => {

    try {

        let sql = 'SELECT * FROM tbl_proyectos_usuarios';

        const params = [];
        const condiciones = [];

        if (req.query.id_proyecto) {

            condiciones.push('id_proyecto = ?');
            params.push(req.query.id_proyecto);

        }

        if (req.query.id_usuario) {

            condiciones.push('id_usuario = ?');
            params.push(req.query.id_usuario);

        }

        if (condiciones.length) {

            sql += ' WHERE ' + condiciones.join(' AND ');

        }

        const filas = await db.queryAll(sql, params);

        res.json(filas);

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

// ======================================================
// POST
// Agregar colaborador al proyecto
// ======================================================

router.post('/', async (req, res) => {

    const {

        id_usuario,
        id_proyecto

    } = req.body;

    if (!id_usuario || !id_proyecto) {

        return res.status(400).json({

            error: 'id_usuario e id_proyecto son requeridos'

        });

    }

    try {

        await db.execute(

            `
            INSERT INTO tbl_proyectos_usuarios
            (
                id_usuario,
                id_proyecto
            )
            VALUES (?, ?)
            `,

            [

                id_usuario,

                id_proyecto

            ]

        );

        res.status(201).json({

            id_usuario,

            id_proyecto

        });

    }

    catch (err) {

        res.status(400).json({

            error: err.message

        });

    }

});

// ======================================================
// DELETE
// Quitar colaborador del proyecto
// ======================================================

router.delete('/', async (req, res) => {

    const {

        id_usuario,
        id_proyecto

    } = req.query;

    if (!id_usuario || !id_proyecto) {

        return res.status(400).json({

            error: 'id_usuario e id_proyecto son requeridos'

        });

    }

    try {

        const resultado = await db.execute(

            `
            DELETE
            FROM tbl_proyectos_usuarios
            WHERE id_usuario = ?
              AND id_proyecto = ?
            `,

            [

                id_usuario,

                id_proyecto

            ]

        );

        if (resultado.changes === 0) {

            return res.status(404).json({

                error: 'Relación no encontrada'

            });

        }

        res.sendStatus(204);

    }

    catch (err) {

        res.status(400).json({

            error: err.message

        });

    }

});

module.exports = router;