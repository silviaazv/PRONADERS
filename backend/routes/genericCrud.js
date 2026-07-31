// ============================================================
// genericCrud.js
// ============================================================

const db = require('../db');
const { registrarBitacora } = require('../helpers/bitacora');

/**
 * Crea un CRUD genérico con bitácora integrada
 */
function genericCrud({ table, pk, columns }) {
    const router = require('express').Router();

    // ──────────────────────────────────────────────
    // GET / - Listar todos
    // ──────────────────────────────────────────────
    router.get('/', async (req, res) => {
        try {
            const data = await db.queryAll(`SELECT * FROM ${table}`);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ──────────────────────────────────────────────
    // GET /:id - Obtener por ID
    // ──────────────────────────────────────────────
    router.get('/:id', async (req, res) => {
        try {
            const data = await db.queryOne(
                `SELECT * FROM ${table} WHERE ${pk} = ?`,
                [req.params.id]
            );
            if (!data) {
                return res.status(404).json({ error: 'Registro no encontrado' });
            }
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // ──────────────────────────────────────────────
    // POST / - Crear (CON BITÁCORA)
    // ──────────────────────────────────────────────
    router.post('/', async (req, res) => {
        try {
            const data = req.body;
            const id_usuario = data.id_usuario || 1;

            // Obtener columnas que tienen valor
            const keys = columns.filter(c => data[c] !== undefined && data[c] !== null);
            const values = keys.map(c => data[c]);
            const placeholders = keys.map(() => '?').join(',');

            const query = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;
            const result = await db.execute(query, values);

            const id = result.lastInsertRowid;

            //REGISTRAR EN BITÁCORA
            const nombreTabla = table.replace('tbl_', '').toUpperCase();
            await registrarBitacora({
                id_usuario: id_usuario,
                tipo_accion: 'INSERT',
                tipo_objeto: nombreTabla,
                id_objeto: id,
                valor_nuevo: `Registro creado en ${table}`
            });

            const nuevo = await db.queryOne(
                `SELECT * FROM ${table} WHERE ${pk} = ?`,
                [id]
            );

            res.status(201).json({
                success: true,
                message: 'Registro creado exitosamente',
                [nombreTabla.toLowerCase()]: nuevo
            });

        } catch (error) {
            console.error('Error en POST:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // ──────────────────────────────────────────────
    // PUT /:id - Actualizar (CON BITÁCORA)
    // ──────────────────────────────────────────────
    router.put('/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const id_usuario = data.id_usuario || 1;

            // Obtener el registro anterior
            const anterior = await db.queryOne(
                `SELECT * FROM ${table} WHERE ${pk} = ?`,
                [id]
            );
            if (!anterior) {
                return res.status(404).json({ error: 'Registro no encontrado' });
            }

            // Construir SET
            const sets = [];
            const values = [];
            const cambios = [];

            columns.forEach(col => {
                if (col !== pk && data[col] !== undefined) {
                    const valorNuevo = data[col];
                    const valorAnterior = anterior[col];
                    if (String(valorAnterior) !== String(valorNuevo)) {
                        sets.push(`${col} = ?`);
                        values.push(valorNuevo);
                        cambios.push({ campo: col, anterior: valorAnterior, nuevo: valorNuevo });
                    }
                }
            });

            if (sets.length === 0) {
                return res.status(400).json({ error: 'No hay cambios para actualizar' });
            }

            values.push(id);
            await db.execute(
                `UPDATE ${table} SET ${sets.join(', ')} WHERE ${pk} = ?`,
                values
            );

            //REGISTRAR EN BITÁCORA (cada campo modificado)
            const nombreTabla = table.replace('tbl_', '').toUpperCase();
            for (const cambio of cambios) {
                await registrarBitacora({
                    id_usuario: id_usuario,
                    tipo_accion: 'UPDATE',
                    tipo_objeto: nombreTabla,
                    id_objeto: id,
                    campo_modificado: cambio.campo,
                    valor_antiguo: String(cambio.anterior || null),
                    valor_nuevo: String(cambio.nuevo || null)
                });
            }

            const actualizado = await db.queryOne(
                `SELECT * FROM ${table} WHERE ${pk} = ?`,
                [id]
            );

            res.json({
                success: true,
                message: 'Registro actualizado',
                [nombreTabla.toLowerCase()]: actualizado
            });

        } catch (error) {
            console.error('Error en PUT:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // ──────────────────────────────────────────────
    // DELETE /:id - Eliminar (CON BITÁCORA)
    // ──────────────────────────────────────────────
    router.delete('/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const { id_usuario } = req.query;

            // Obtener el registro antes de eliminar
            const anterior = await db.queryOne(
                `SELECT * FROM ${table} WHERE ${pk} = ?`,
                [id]
            );
            if (!anterior) {
                return res.status(404).json({ error: 'Registro no encontrado' });
            }

            await db.execute(
                `DELETE FROM ${table} WHERE ${pk} = ?`,
                [id]
            );

            //REGISTRAR EN BITÁCORA
            const nombreTabla = table.replace('tbl_', '').toUpperCase();
            await registrarBitacora({
                id_usuario: id_usuario || 1,
                tipo_accion: 'DELETE',
                tipo_objeto: nombreTabla,
                id_objeto: id,
                valor_nuevo: `Registro eliminado de ${table}: ${JSON.stringify(anterior)}`
            });

            res.json({
                success: true,
                message: 'Registro eliminado'
            });

        } catch (error) {
            console.error('Error en DELETE:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}

module.exports = genericCrud;