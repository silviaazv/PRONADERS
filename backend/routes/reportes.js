// ============================================================
// reportes.js - ROUTER DE REPORTES (BACKEND)
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

// Se usa el helper compartido (el mismo del resto de routers) en lugar de una
// copia local. La copia recibía los datos por orden y aquí se la llamaba con un
// objeto, así que tipo_accion quedaba vacío y rechazar/eliminar tronaban con 500.
const { registrarBitacora } = require('../helpers/bitacora');

// ─────────────────────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/reportes
 * Lista reportes con filtros
 * Query params: id_proyecto, id_usuario, estado
 */
router.get('/', async (req, res) => {
    try {
        const { id_proyecto, id_usuario, estado } = req.query;
        let query = `
            SELECT r.*, 
                   p.nombre_proyecto,
                   u.nombre_usuario as autor_nombre
            FROM tbl_reportes r
            LEFT JOIN tbl_proyectos p ON r.id_proyecto = p.id_proyecto
            LEFT JOIN tbl_usuarios u ON r.id_usuario = u.id_usuario
            WHERE 1=1
        `;
        const params = [];

        if (id_proyecto) {
            query += ' AND r.id_proyecto = ?';
            params.push(parseInt(id_proyecto));
        }
        if (id_usuario) {
            query += ' AND r.id_usuario = ?';
            params.push(parseInt(id_usuario));
        }
        if (estado !== undefined && estado !== '') {
            query += ' AND r.estado_reporte = ?';
            params.push(parseInt(estado));
        }

        query += ' ORDER BY r.fecha_reporte DESC';

        const reportes = await db.queryAll(query, params);

        // Obtener archivos adjuntos para cada reporte
        for (const r of reportes) {
            const archivos = await db.queryAll(
                'SELECT * FROM tbl_archivos WHERE id_reporte = ?',
                [r.id_reporte]
            );
            r.adjuntos = archivos;
        }

        res.json(reportes);
    } catch (error) {
        console.error('Error listando reportes:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/reportes/:id
 * Obtiene un reporte por ID
 */
router.get('/:id', async (req, res) => {
    try {
        const reporte = await db.queryOne(`
            SELECT r.*, 
                   p.nombre_proyecto,
                   u.nombre_usuario as autor_nombre
            FROM tbl_reportes r
            LEFT JOIN tbl_proyectos p ON r.id_proyecto = p.id_proyecto
            LEFT JOIN tbl_usuarios u ON r.id_usuario = u.id_usuario
            WHERE r.id_reporte = ?
        `, [parseInt(req.params.id)]);

        if (!reporte) {
            return res.status(404).json({ error: 'Reporte no encontrado' });
        }

        const archivos = await db.queryAll(
            'SELECT * FROM tbl_archivos WHERE id_reporte = ?',
            [parseInt(req.params.id)]
        );
        reporte.adjuntos = archivos;

        res.json(reporte);
    } catch (error) {
        console.error('Error obteniendo reporte:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/reportes
 * Crea un nuevo reporte
 */
router.post('/', async (req, res) => {
    try {
        const { id_proyecto, id_usuario, descripcion_reporte, avance_fisico, avance_financiero, observaciones, incidencias } = req.body;

        if (!id_proyecto) return res.status(400).json({ error: 'El proyecto es obligatorio' });
        if (!id_usuario) return res.status(400).json({ error: 'El usuario es obligatorio' });
        if (!descripcion_reporte || descripcion_reporte.trim().length === 0) {
            return res.status(400).json({ error: 'La descripción del avance es obligatoria' });
        }

        const fechaActual = new Date().toISOString();

        // Observaciones e incidencias son opcionales: si vienen vacías se
        // guardan como NULL para que la tarjeta muestre su texto por defecto.
        const result = await db.execute(`
            INSERT INTO tbl_reportes
            (id_proyecto, id_usuario, descripcion_reporte, fecha_reporte, estado_reporte, avance_fisico, avance_financiero, observaciones, incidencias)
            VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)
        `, [
            parseInt(id_proyecto),
            parseInt(id_usuario),
            descripcion_reporte.trim(),
            fechaActual,
            avance_fisico || 0,
            avance_financiero || 0,
            observaciones && observaciones.trim() ? observaciones.trim() : null,
            incidencias && incidencias.trim() ? incidencias.trim() : null
        ]);

        const id_reporte = result.lastInsertRowid;

        await registrarBitacora({
            id_usuario: parseInt(id_usuario),
            tipo_accion: 'INSERT',
            tipo_objeto: 'REPORTE',
            id_objeto: id_reporte,
            valor_nuevo: `Reporte creado para proyecto ${id_proyecto}`
        });

        const nuevoReporte = await db.queryOne(
            'SELECT * FROM tbl_reportes WHERE id_reporte = ?',
            [id_reporte]
        );

        res.status(201).json({
            success: true,
            message: 'Reporte creado exitosamente',
            reporte: nuevoReporte
        });
    } catch (error) {
        console.error('Error creando reporte:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/reportes/:id/aprobar
 * Aprueba un reporte
 * Body: { id_usuario }
 */
router.patch('/:id/aprobar', async (req, res) => {
    try {
        const { id_usuario } = req.body;
        const id_reporte = parseInt(req.params.id);

        if (!id_usuario) return res.status(400).json({ error: 'Usuario es obligatorio' });

        const reporte = await db.queryOne(
            'SELECT * FROM tbl_reportes WHERE id_reporte = ?',
            [id_reporte]
        );
        if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
        if (reporte.estado_reporte !== 0) {
            return res.status(400).json({
                error: `El reporte ya está ${reporte.estado_reporte === 1 ? 'aprobado' : 'en otro estado'}`
            });
        }

        const fechaActual = new Date().toISOString();

        await db.execute(`
            UPDATE tbl_reportes 
            SET estado_reporte = 1, 
                fecha_revision_reporte = ?
            WHERE id_reporte = ?
        `, [fechaActual, id_reporte]);

        await registrarBitacora({
            id_usuario: parseInt(id_usuario),
            tipo_accion: 'REVISION',
            tipo_objeto: 'REPORTE',
            id_objeto: id_reporte,
            campo_modificado: 'estado_reporte',
            valor_antiguo: '0 (Pendiente)',
            valor_nuevo: '1 (Aprobado)'
        });

        const reporteActualizado = await db.queryOne(
            'SELECT * FROM tbl_reportes WHERE id_reporte = ?',
            [id_reporte]
        );

        res.json({
            success: true,
            message: 'Reporte aprobado',
            reporte: reporteActualizado
        });
    } catch (error) {
        console.error('Error aprobando reporte:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// PATCH /api/reportes/:id/rechazar - Rechazar reporte
// ============================================================

router.patch('/:id/rechazar', async (req, res) => {
    try {
        const { id_usuario } = req.body;
        const id_reporte = parseInt(req.params.id);

        console.log('[API] Rechazando reporte:', id_reporte, 'Usuario:', id_usuario);

        if (!id_usuario) {
            return res.status(400).json({ error: 'Usuario es obligatorio' });
        }

        const reporte = await db.queryOne(
            'SELECT * FROM tbl_reportes WHERE id_reporte = ?',
            [id_reporte]
        );
        if (!reporte) {
            return res.status(404).json({ error: 'Reporte no encontrado' });
        }

        //SOLO permitir rechazar si está PENDIENTE (estado 0)
        if (reporte.estado_reporte !== 0) {
            return res.status(400).json({ 
                error: `El reporte ya está ${reporte.estado_reporte === 1 ? 'aprobado' : 'rechazado'} y no se puede modificar`
            });
        }

        const fechaActual = new Date().toISOString();

        await db.execute(`
            UPDATE tbl_reportes 
            SET estado_reporte = 2, 
                fecha_revision_reporte = ?
            WHERE id_reporte = ?
        `, [fechaActual, id_reporte]);

        //REGISTRAR EN BITÁCORA
        await registrarBitacora({
            id_usuario: parseInt(id_usuario),
            tipo_accion: 'RECHAZO',       
            tipo_objeto: 'REPORTE',        
            id_objeto: id_reporte,         
            campo_modificado: 'estado_reporte',
            valor_antiguo: '0 (Pendiente)',
            valor_nuevo: '2 (Rechazado)'
        });

        const reporteActualizado = await db.queryOne(`
            SELECT r.*, 
                   p.nombre_proyecto,
                   u.nombre_usuario as autor_nombre
            FROM tbl_reportes r
            LEFT JOIN tbl_proyectos p ON r.id_proyecto = p.id_proyecto
            LEFT JOIN tbl_usuarios u ON r.id_usuario = u.id_usuario
            WHERE r.id_reporte = ?
        `, [id_reporte]);

        res.json({
            success: true,
            message: 'Reporte rechazado',
            reporte: reporteActualizado
        });

    } catch (error) {
        console.error('Error rechazando reporte:', error);
        res.status(500).json({ error: error.message });
    }
});
/**
 * DELETE /api/reportes/:id
 * Elimina un reporte (solo si está pendiente)
 * Query params: id_usuario
 */
router.delete('/:id', async (req, res) => {
    try {
        const id_reporte = parseInt(req.params.id);
        const { id_usuario } = req.query;

        const reporte = await db.queryOne(
            'SELECT * FROM tbl_reportes WHERE id_reporte = ?',
            [id_reporte]
        );
        if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
        if (reporte.estado_reporte !== 0) {
            return res.status(400).json({
                error: `Solo se pueden eliminar reportes pendientes. Estado actual: ${reporte.estado_reporte === 1 ? 'Aprobado' : 'Otro'}`
            });
        }

        // Eliminar archivos asociados primero
        await db.execute(
            'DELETE FROM tbl_archivos WHERE id_reporte = ?',
            [id_reporte]
        );

        await db.execute(
            'DELETE FROM tbl_reportes WHERE id_reporte = ?',
            [id_reporte]
        );

        //REGISTRAR EN BITÁCORA
        await registrarBitacora({
            id_usuario: parseInt(id_usuario) || 1,
            tipo_accion: 'DELETE',
            tipo_objeto: 'REPORTE',
            id_objeto: id_reporte,
            valor_nuevo: `Reporte eliminado: ${reporte.descripcion_reporte || 'Sin descripción'}`
        });

        res.json({
            success: true,
            message: 'Reporte eliminado'
        });
    } catch (error) {
        console.error('Error eliminando reporte:', error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;