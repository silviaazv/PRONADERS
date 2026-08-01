// ============================================================
// solicitudes.js - ROUTER DE SOLICITUDES 
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

async function obtenerNombreProyecto(id_proyecto) {
    const proy = await db.queryOne(
        'SELECT nombre_proyecto FROM tbl_proyectos WHERE id_proyecto = ?',
        [id_proyecto]
    );
    return proy ? proy.nombre_proyecto : null;
}

async function obtenerNombreUsuario(id_usuario) {
    const user = await db.queryOne(
        'SELECT nombre_usuario FROM tbl_usuarios WHERE id_usuario = ?',
        [id_usuario]
    );
    return user ? user.nombre_usuario : null;
}

async function obtenerNombreEquipo(id_equipo_log) {
    if (!id_equipo_log) return null;
    const eq = await db.queryOne(
        'SELECT nombre_equipo_log FROM tbl_equipos WHERE id_equipo_log = ?',
        [id_equipo_log]
    );
    return eq ? eq.nombre_equipo_log : null;
}

async function registrarBitacora(id_usuario, tipo_accion, tipo_objeto, id_objeto, campo_modificado, valor_antiguo, valor_nuevo) {
    await db.execute(`
        INSERT INTO tbl_bitacora 
        (id_usuario, tipo_accion, tipo_objeto, id_objeto, fecha_accion, campo_modificado, valor_antiguo, valor_nuevo)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)
    `, [id_usuario, tipo_accion, tipo_objeto, id_objeto, campo_modificado, valor_antiguo, valor_nuevo]);
}

// ─────────────────────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/solicitudes
 * Lista todas las solicitudes con filtros opcionales
 * Query params: estado, id_proyecto, id_usuario, id_equipo_log
 */
router.get('/', async (req, res) => {
    try {
        const { estado, id_proyecto, id_usuario, id_equipo_log } = req.query;
        let query = `
            SELECT s.*, 
                   p.nombre_proyecto as proyecto_nombre,
                   u.nombre_usuario as solicitante_nombre,
                   e.nombre_equipo_log as equipo_nombre
            FROM tbl_solicitudes s
            LEFT JOIN tbl_proyectos p ON s.id_proyecto = p.id_proyecto
            LEFT JOIN tbl_usuarios u ON s.id_usuario = u.id_usuario
            LEFT JOIN tbl_equipos e ON s.id_equipo_log = e.id_equipo_log
            WHERE 1=1
        `;
        const params = [];

        if (estado) {
            query += ' AND s.estado_solicitud = ?';
            params.push(estado.toUpperCase());
        }
        if (id_proyecto) {
            query += ' AND s.id_proyecto = ?';
            params.push(parseInt(id_proyecto));
        }
        if (id_usuario) {
            query += ` AND (s.id_usuario = ? OR p.id_supervisor = ?)`;
            params.push(parseInt(id_usuario), parseInt(id_usuario));
        }
        if (id_equipo_log) {
            query += ' AND s.id_equipo_log = ?';
            params.push(parseInt(id_equipo_log));
        }

        query += ' ORDER BY s.fecha_solicitud DESC';

        const solicitudes = await db.queryAll(query, params);

        // Obtener filas para cada solicitud
        for (const sol of solicitudes) {
            const filas = await db.queryAll(
                'SELECT * FROM tbl_fila_solicitud WHERE id_solicitud = ?',
                [sol.id_solicitud]
            );
            sol.items = filas.map(f => ({
                tipo: f.tipo_recurso,
                desc: f.descripcion_recurso,
                cantidad: f.cantidad_recurso
            }));
        }

        res.json(solicitudes);
    } catch (error) {
        console.error('Error listando solicitudes:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/solicitudes/resumen
 * Obtiene un resumen de solicitudes por estado
 */
router.get('/resumen', async (req, res) => {
    try {
        const resumen = await db.queryAll(`
            SELECT estado_solicitud, COUNT(*) as total
            FROM tbl_solicitudes
            GROUP BY estado_solicitud
        `);
        res.json(resumen);
    } catch (error) {
        console.error('Error obteniendo resumen de solicitudes:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// PATCH /api/solicitudes/:id/despachar - Registrar despacho
// ============================================================

router.patch('/:id/despachar', async (req, res) => {
    try {
        const { id_usuario, fecha_despacho, responsable_entrega, observaciones } = req.body;
        const id_solicitud = parseInt(req.params.id);

        console.log('[API] Despachando solicitud:', id_solicitud);
        console.log('[API] Datos:', { id_usuario, fecha_despacho, responsable_entrega });

        if (!id_usuario) return res.status(400).json({ error: 'Usuario es obligatorio' });
        if (!fecha_despacho) return res.status(400).json({ error: 'La fecha de despacho es obligatoria' });

        const sol = await db.queryOne(
            'SELECT * FROM tbl_solicitudes WHERE id_solicitud = ?',
            [id_solicitud]
        );
        if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada' });

        //Solo se puede despachar si está APROBADA
        if (sol.estado_solicitud !== 'APROBADA') {
            return res.status(400).json({
                error: `La solicitud debe estar APROBADA. Estado actual: ${sol.estado_solicitud}`
            });
        }

        const estadoAnterior = sol.estado_solicitud;

        //Cambiar a EN DESPACHO
        await db.execute(`
            UPDATE tbl_solicitudes 
            SET estado_solicitud = 'EN DESPACHO'
            WHERE id_solicitud = ?
        `, [id_solicitud]);

        console.log('[API] Solicitud actualizada a EN DESPACHO');

        // Registrar en bitácora
        try {
            await registrarBitacora({
                id_usuario: parseInt(id_usuario),
                tipo_accion: 'REVISION',
                tipo_objeto: 'SOLICITUD',
                id_objeto: id_solicitud,
                campo_modificado: 'estado_solicitud',
                valor_antiguo: estadoAnterior,
                valor_nuevo: `EN DESPACHO - Responsable: ${responsable_entrega || 'N/A'} - ${observaciones || ''}`
            });
        } catch (e) {
            console.warn('Error en bitácora:', e.message);
        }

        const solActualizada = await db.queryOne(
            'SELECT * FROM tbl_solicitudes WHERE id_solicitud = ?',
            [id_solicitud]
        );

        res.json({
            success: true,
            message: 'Despacho registrado. Solicitud en tránsito.',
            solicitud: solActualizada
        });

    } catch (error) {
        console.error('Error registrando despacho:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/solicitudes/:id
 * Obtiene una solicitud por ID
 */
router.get('/:id', async (req, res) => {
    try {
        const sol = await db.queryOne(`
            SELECT s.*, 
                   p.nombre_proyecto as proyecto_nombre,
                   u.nombre_usuario as solicitante_nombre,
                   e.nombre_equipo_log as equipo_nombre
            FROM tbl_solicitudes s
            LEFT JOIN tbl_proyectos p ON s.id_proyecto = p.id_proyecto
            LEFT JOIN tbl_usuarios u ON s.id_usuario = u.id_usuario
            LEFT JOIN tbl_equipos e ON s.id_equipo_log = e.id_equipo_log
            WHERE s.id_solicitud = ?
        `, [parseInt(req.params.id)]);

        if (!sol) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        const filas = await db.queryAll(
            'SELECT * FROM tbl_fila_solicitud WHERE id_solicitud = ?',
            [parseInt(req.params.id)]
        );
        sol.items = filas;

        res.json(sol);
    } catch (error) {
        console.error('Error obteniendo solicitud:', error);
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/solicitudes/:id/entregar
router.patch('/:id/entregar', async (req, res) => {
  try {

    await db.execute(`
      UPDATE tbl_solicitudes
      SET estado_solicitud = 'ENTREGADA'
      WHERE id_solicitud = ?
    `, [req.params.id]);

    const solicitud = await db.queryOne(
      'SELECT * FROM tbl_solicitudes WHERE id_solicitud = ?',
      [req.params.id]
    );

    res.json(solicitud);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/solicitudes
 * Crea una nueva solicitud
 * Body: { id_proyecto, id_usuario, justificacion, items: [{tipo, desc, cantidad}] }
 */
router.post('/', async (req, res) => {
    try {
        const { id_proyecto, id_usuario, justificacion, items } = req.body;

        // Validaciones
        if (!id_proyecto) return res.status(400).json({ error: 'El proyecto es obligatorio' });
        if (!id_usuario) return res.status(400).json({ error: 'El solicitante es obligatorio' });
        if (!justificacion || justificacion.trim().length === 0) {
            return res.status(400).json({ error: 'La justificación es obligatoria' });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Debe incluir al menos un recurso' });
        }

        for (const item of items) {
            if (!item.tipo || !item.desc || !item.cantidad) {
                return res.status(400).json({
                    error: 'Cada recurso debe tener tipo, descripción y cantidad'
                });
            }
            const tipoUpper = item.tipo.toUpperCase();
            if (!['MATERIAL', 'EQUIPO', 'FINANCIERO'].includes(tipoUpper)) {
                return res.status(400).json({
                    error: `Tipo de recurso inválido: ${item.tipo}`
                });
            }
            if (parseInt(item.cantidad) <= 0) {
                return res.status(400).json({
                    error: `La cantidad debe ser mayor a 0: ${item.cantidad}`
                });
            }
        }

        const fechaActual = new Date().toISOString();

        // Insertar solicitud
        const result = await db.execute(`
            INSERT INTO tbl_solicitudes 
            (id_proyecto, id_usuario, estado_solicitud, fecha_solicitud, justificacion)
            VALUES (?, ?, 'PENDIENTE', ?, ?)
        `, [parseInt(id_proyecto), parseInt(id_usuario), fechaActual, justificacion]);

        const id_solicitud = result.lastId || result.lastInsertRowid;

        // Insertar filas/ítems
        for (const item of items) {
            await db.execute(`
                INSERT INTO tbl_fila_solicitud 
                (id_solicitud, tipo_recurso, descripcion_recurso, cantidad_recurso)
                VALUES (?, ?, ?, ?)
            `, [
                id_solicitud,
                item.tipo.toUpperCase(),
                item.desc,
                parseInt(item.cantidad)
            ]);
        }

        // Registrar en bitácora
        await registrarBitacora(
            parseInt(id_usuario),
            'EMISION',
            'SOLICITUD',
            id_solicitud,
            null,
            null,
            `Solicitud creada para proyecto ${await obtenerNombreProyecto(id_proyecto)}`
        );

        const nuevaSol = await db.queryOne(
            'SELECT * FROM tbl_solicitudes WHERE id_solicitud = ?',
            [id_solicitud]
        );

        res.status(201).json({
            success: true,
            message: `Solicitud creada exitosamente`,
            solicitud: nuevaSol
        });
    } catch (error) {
        console.error('Error creando solicitud:', error);
        res.status(500).json({ error: error.message });
    }
});

    /**
 * GET /api/solicitudes/:id/filas
 * Obtiene las filas/ítems de una solicitud específica
 */
router.get('/:id/filas', async (req, res) => {
    try {
        const id_solicitud = parseInt(req.params.id);

        // Verificar que la solicitud existe
        const sol = await db.queryOne(
            'SELECT * FROM tbl_solicitudes WHERE id_solicitud = ?',
            [id_solicitud]
        );

        if (!sol) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }

        // Obtener las filas
        const filas = await db.queryAll(
            'SELECT * FROM tbl_fila_solicitud WHERE id_solicitud = ?',
            [id_solicitud]
        );

        res.json(filas);

    } catch (error) {
        console.error('Error obteniendo filas de solicitud:', error);
        res.status(500).json({ error: error.message });
    }
    });

/**
 * PATCH /api/solicitudes/:id/aprobar
 * Aprueba una solicitud
 * Body: { id_usuario, comentario, id_equipo_log }
 */
router.patch('/:id/aprobar', async (req, res) => {
    try {
        const { id_usuario, comentario, id_equipo_log } = req.body;
        const id_solicitud = parseInt(req.params.id);

        if (!id_usuario) return res.status(400).json({ error: 'Usuario es obligatorio' });
        if (!comentario || comentario.trim().length === 0) {
            return res.status(400).json({ error: 'El comentario de aprobación es obligatorio' });
        }
        if (!id_equipo_log) return res.status(400).json({ error: 'Debe seleccionar un equipo logístico' });

        const sol = await db.queryOne(
            'SELECT * FROM tbl_solicitudes WHERE id_solicitud = ?',
            [id_solicitud]
        );
        if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada' });
        if (sol.estado_solicitud !== 'PENDIENTE') {
            return res.status(400).json({
                error: `La solicitud no está pendiente. Estado actual: ${sol.estado_solicitud}`
            });
        }

        const fechaActual = new Date().toISOString();
        const estadoAnterior = sol.estado_solicitud;

        await db.execute(`
            UPDATE tbl_solicitudes 
            SET estado_solicitud = 'APROBADA', 
                id_equipo_log = ?,
                fecha_revision_solicitud = ?
            WHERE id_solicitud = ?
        `, [parseInt(id_equipo_log), fechaActual, id_solicitud]);

        await registrarBitacora(
            parseInt(id_usuario),
            'APROBACION',
            'SOLICITUD',
            id_solicitud,
            'estado_solicitud',
            estadoAnterior,
            `APROBADA - Comentario: ${comentario}`
        );

        const solActualizada = await db.queryOne(
            'SELECT * FROM tbl_solicitudes WHERE id_solicitud = ?',
            [id_solicitud]
        );

        res.json({
            success: true,
            message: 'Solicitud aprobada',
            solicitud: solActualizada
        });
    } catch (error) {
        console.error('Error aprobando solicitud:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/solicitudes/:id/rechazar
 * Rechaza una solicitud
 * Body: { id_usuario, motivo }
 */
router.patch('/:id/rechazar', async (req, res) => {
    try {
        const { id_usuario, motivo } = req.body;
        const id_solicitud = parseInt(req.params.id);

        if (!id_usuario) return res.status(400).json({ error: 'Usuario es obligatorio' });
        if (!motivo || motivo.trim().length === 0) {
            return res.status(400).json({ error: 'El motivo del rechazo es obligatorio' });
        }

        const sol = await db.queryOne(
            'SELECT * FROM tbl_solicitudes WHERE id_solicitud = ?',
            [id_solicitud]
        );
        if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada' });
        if (sol.estado_solicitud !== 'PENDIENTE') {
            return res.status(400).json({
                error: `La solicitud no está pendiente. Estado actual: ${sol.estado_solicitud}`
            });
        }

        const fechaActual = new Date().toISOString();
        const estadoAnterior = sol.estado_solicitud;

        await db.execute(`
            UPDATE tbl_solicitudes 
            SET estado_solicitud = 'RECHAZADA', 
                fecha_revision_solicitud = ?,
                motivo_rechazo = ?
            WHERE id_solicitud = ?
        `, [fechaActual, motivo, id_solicitud]);

        await registrarBitacora(
            parseInt(id_usuario),
            'RECHAZO',
            'SOLICITUD',
            id_solicitud,
            'estado_solicitud',
            estadoAnterior,
            `RECHAZADA - Motivo: ${motivo}`
        );

        const solActualizada = await db.queryOne(
            'SELECT * FROM tbl_solicitudes WHERE id_solicitud = ?',
            [id_solicitud]
        );

        res.json({
            success: true,
            message: 'Solicitud rechazada',
            solicitud: solActualizada
        });
    } catch (error) {
        console.error('Error rechazando solicitud:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/solicitudes/:id/despachar
 * Registra el despacho de una solicitud
 * Body: { id_usuario, fecha_despacho, responsable_entrega }
 */
router.patch('/:id/despachar', async (req, res) => {
    try {
        const { id_usuario, fecha_despacho, responsable_entrega } = req.body;
        const id_solicitud = parseInt(req.params.id);

        if (!id_usuario) return res.status(400).json({ error: 'Usuario es obligatorio' });
        if (!fecha_despacho) return res.status(400).json({ error: 'La fecha de despacho es obligatoria' });

        const sol = await db.queryOne(
            'SELECT * FROM tbl_solicitudes WHERE id_solicitud = ?',
            [id_solicitud]
        );
        if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada' });
        if (sol.estado_solicitud !== 'APROBADA') {
            return res.status(400).json({
                error: `La solicitud debe estar aprobada. Estado actual: ${sol.estado_solicitud}`
            });
        }

        const estadoAnterior = sol.estado_solicitud;

        await db.execute(`
            UPDATE tbl_solicitudes 
            SET estado_solicitud = 'EN DESPACHO'
            WHERE id_solicitud = ?
        `, [id_solicitud]);

        await registrarBitacora(
            parseInt(id_usuario),
            'REVISION',
            'SOLICITUD',
            id_solicitud,
            'estado_solicitud',
            estadoAnterior,
            `EN DESPACHO - Responsable: ${responsable_entrega || 'N/A'}`
        );

        const solActualizada = await db.queryOne(
            'SELECT * FROM tbl_solicitudes WHERE id_solicitud = ?',
            [id_solicitud]
        );

        res.json({
            success: true,
            message: 'Despacho registrado',
            solicitud: solActualizada
        });
    } catch (error) {
        console.error('Error registrando despacho:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/solicitudes/:id/confirmar-recepcion
 * Confirma la recepción de una solicitud
 * Body: { id_usuario, observaciones }
 */
router.patch('/:id/confirmar-recepcion', async (req, res) => {
    try {
        const { id_usuario, observaciones } = req.body;
        const id_solicitud = parseInt(req.params.id);

        if (!id_usuario) return res.status(400).json({ error: 'Usuario es obligatorio' });

        const sol = await db.queryOne(
            'SELECT * FROM tbl_solicitudes WHERE id_solicitud = ?',
            [id_solicitud]
        );
        if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada' });
        if (sol.estado_solicitud !== 'ENTREGADA') {
            return res.status(400).json({
                error: `La solicitud debe estar entregada. Estado actual: ${sol.estado_solicitud}`
            });
        }

        const estadoAnterior = sol.estado_solicitud;

        await db.execute(`
            UPDATE tbl_solicitudes 
            SET estado_solicitud = 'CONFIRMADA'
            WHERE id_solicitud = ?
        `, [id_solicitud]);

        await registrarBitacora(
            parseInt(id_usuario),
            'REVISION',
            'SOLICITUD',
            id_solicitud,
            'estado_solicitud',
            estadoAnterior,
            `CONFIRMADA - Recepción confirmada. ${observaciones || ''}`
        );

        const solActualizada = await db.queryOne(
            'SELECT * FROM tbl_solicitudes WHERE id_solicitud = ?',
            [id_solicitud]
        );

        res.json({
            success: true,
            message: 'Recepción confirmada',
            solicitud: solActualizada
        });
    } catch (error) {
        console.error('Error confirmando recepción:', error);
        res.status(500).json({ error: error.message });
    }

});
module.exports = router;