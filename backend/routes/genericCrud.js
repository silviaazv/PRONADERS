// genericCrud.js
// Fábrica de routers CRUD para tablas con llave primaria simple.
// Compatible con sqlite3 utilizando las funciones queryAll,
// queryOne y execute definidas en db.js.

const express = require('express');
const db = require('../db');

function genericCrud({ table, pk, columns }) {

    const router = express.Router();

    const editableColumns = columns.filter(c => c !== pk);

    //==================================================
    // GET /
    //==================================================

    router.get('/', async (req, res) => {

        try {

            const filtros = Object.keys(req.query)
                .filter(k => columns.includes(k));

            let sql = `SELECT * FROM ${table}`;

            const params = [];

            if (filtros.length) {

                sql +=
                    ' WHERE ' +
                    filtros.map(f => `${f} = ?`).join(' AND ');

                filtros.forEach(f => params.push(req.query[f]));

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

    //==================================================
    // GET /:id
    //==================================================

    router.get('/:id', async (req, res) => {

        try {

            const fila = await db.queryOne(

                `SELECT * FROM ${table} WHERE ${pk} = ?`,

                [req.params.id]

            );

            if (!fila) {

                return res.status(404).json({

                    error: `${table}: registro no encontrado`

                });

            }

            res.json(fila);

        }

        catch (err) {

            res.status(500).json({

                error: err.message

            });

        }

    });

    //==================================================
    // POST
    //==================================================

    router.post('/', async (req, res) => {

        try {

            const cols = editableColumns.filter(

                c => req.body[c] !== undefined

            );

            if (!cols.length) {

                return res.status(400).json({

                    error: 'No se enviaron columnas válidas'

                });

            }

            const placeholders = cols.map(() => '?').join(', ');

            const sql =

                `INSERT INTO ${table}
                (${cols.join(', ')})
                VALUES (${placeholders})`;

            const resultado = await db.execute(

                sql,

                cols.map(c => req.body[c])

            );

            const nuevoId =

                req.body[pk] !== undefined

                    ? req.body[pk]

                    : resultado.lastID;

            const creado = await db.queryOne(

                `SELECT * FROM ${table} WHERE ${pk} = ?`,

                [nuevoId]

            );

            res.status(201).json(creado);

        }

        catch (err) {

            res.status(400).json({

                error: err.message

            });

        }

    });

    //==================================================
    // PUT
    //==================================================

    router.put('/:id', async (req, res) => {

        try {

            const cols = editableColumns.filter(

                c => req.body[c] !== undefined

            );

            if (!cols.length) {

                return res.status(400).json({

                    error: 'No se enviaron columnas válidas'

                });

            }

            const sets = cols.map(

                c => `${c} = ?`

            ).join(', ');

            const sql =

                `UPDATE ${table}
                SET ${sets}
                WHERE ${pk} = ?`;

            const resultado = await db.execute(

                sql,

                [

                    ...cols.map(c => req.body[c]),

                    req.params.id

                ]

            );

            if (resultado.changes === 0) {

                return res.status(404).json({

                    error: `${table}: registro no encontrado`

                });

            }

            const actualizado = await db.queryOne(

                `SELECT * FROM ${table} WHERE ${pk} = ?`,

                [req.params.id]

            );

            res.json(actualizado);

        }

        catch (err) {

            res.status(400).json({

                error: err.message

            });

        }

    });

    //==================================================
    // DELETE
    //==================================================

    router.delete('/:id', async (req, res) => {

        try {

            const resultado = await db.execute(

                `DELETE FROM ${table} WHERE ${pk} = ?`,

                [req.params.id]

            );

            if (resultado.changes === 0) {

                return res.status(404).json({

                    error: `${table}: registro no encontrado`

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

    return router;

}

module.exports = genericCrud;