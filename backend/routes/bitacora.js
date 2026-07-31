const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * GET /api/bitacora
 * Lista registros de bitácora con filtros opcionales
 * Query params: id_usuario, tipo_accion, tipo_objeto, id_objeto, limite
 */
router.get('/', async (req, res) => {

    try {

        console.log('[Bitácora] GET /api/bitacora - Filtros:', req.query);

        // ── FILTROS DISPONIBLES ──
        const filtrosPermitidos = [
            'id_usuario',
            'tipo_accion',
            'tipo_objeto',
            'id_objeto'
        ];

        const filtros = filtrosPermitidos.filter(
            k => req.query[k] !== undefined && req.query[k] !== ''
        );

        // ── CONSTRUIR CONSULTA ──
        let sql = `
            SELECT 
                b.*,
                u.nombre_usuario as usuario_nombre
            FROM tbl_bitacora b
            LEFT JOIN tbl_usuarios u ON b.id_usuario = u.id_usuario
        `;

        const params = [];

        if (filtros.length) {
            sql += ' WHERE ' + filtros.map(f => `b.${f} = ?`).join(' AND ');
            filtros.forEach(f => params.push(req.query[f]));
        }

        sql += ' ORDER BY b.fecha_accion DESC';

        // ── LÍMITE ──
        if (req.query.limite) {
            sql += ' LIMIT ?';
            params.push(parseInt(req.query.limite));
        }

        console.log('[Bitácora] SQL:', sql);
        console.log('[Bitácora] Params:', params);

        const registros = await db.queryAll(sql, params);

        console.log('[Bitácora] Registros encontrados:', registros.length);

        res.json(registros);

    }

    catch (err) {

        console.error('[Bitácora] Error:', err);
        res.status(500).json({
            error: err.message
        });

    }

});

/**
 * GET /api/bitacora/:id
 * Obtiene un registro de bitácora por ID
 */
router.get('/:id', async (req, res) => {

    try {

        const registro = await db.queryOne(
            `
            SELECT 
                b.*,
                u.nombre_usuario as usuario_nombre
            FROM tbl_bitacora b
            LEFT JOIN tbl_usuarios u ON b.id_usuario = u.id_usuario
            WHERE b.id_registro = ?
            `,
            [req.params.id]
        );

        if (!registro) {
            return res.status(404).json({
                error: 'Registro no encontrado'
            });
        }

        res.json(registro);

    }

    catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});

/**
 * GET /api/bitacora/resumen
 * Resumen de acciones por tipo
 */
router.get('/resumen', async (req, res) => {

    try {

        const resumen = await db.queryAll(
            `
            SELECT 
                tipo_accion,
                tipo_objeto,
                COUNT(*) as total,
                DATE(fecha_accion) as fecha
            FROM tbl_bitacora
            GROUP BY tipo_accion, tipo_objeto, DATE(fecha_accion)
            ORDER BY fecha DESC, total DESC
            LIMIT 20
            `
        );

        res.json(resumen);

    }

    catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});

module.exports = router;
