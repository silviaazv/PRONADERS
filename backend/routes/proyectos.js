// ============================================================
// routes/proyectos.js (BACKEND) 
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../db');
const { registrarBitacora } = require('../helpers/bitacora');

// ─────────────────────────────────────────────────────────────
// GET /api/proyectos - Listar proyectos
// ─────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
    try {
        const { estado, id_usuario } = req.query;

        let query = `
            SELECT 
                p.*,
                m.nombre_municipio,
                d.nombre_departamento,
                s.nombre_usuario as supervisor_nombre,
                s.id_usuario as supervisor_id
            FROM tbl_proyectos p
            LEFT JOIN tbl_municipios m ON p.id_ubicacion = m.id_municipio
            LEFT JOIN tbl_departamentos d ON m.id_departamento = d.id_departamento
            LEFT JOIN tbl_usuarios s ON p.id_supervisor = s.id_usuario
            WHERE 1=1
        `;

        const params = [];

        if (estado) {
            query += ' AND p.estado_proyecto = ?';
            params.push(estado);
        }

        // ✅ Si se filtra por usuario, buscar proyectos donde sea supervisor
        if (id_usuario) {
            query += ' AND p.id_supervisor = ?';
            params.push(parseInt(id_usuario));
        }

        query += ' ORDER BY p.fecha_inicio DESC';

        const proyectos = await db.queryAll(query, params);

        res.json(proyectos);

    } catch (error) {
        console.error('Error listando proyectos:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────
// GET /api/proyectos/:id - Obtener proyecto por ID
// ─────────────────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const proyecto = await db.queryOne(`
            SELECT 
                p.*,
                m.nombre_municipio,
                d.nombre_departamento,
                s.nombre_usuario as supervisor_nombre,
                s.id_usuario as supervisor_id
            FROM tbl_proyectos p
            LEFT JOIN tbl_municipios m ON p.id_ubicacion = m.id_municipio
            LEFT JOIN tbl_departamentos d ON m.id_departamento = d.id_departamento
            LEFT JOIN tbl_usuarios s ON p.id_supervisor = s.id_usuario
            WHERE p.id_proyecto = ?
        `, [id]);

        if (!proyecto) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        res.json(proyecto);

    } catch (error) {
        console.error('Error obteniendo proyecto:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// PATCH /api/proyectos/:id/finalizar - Finalizar proyecto
// ============================================================

router.patch('/:id/finalizar', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { id_usuario, presupuesto_ejecutado } = req.body;

        if (!id_usuario) {
            return res.status(400).json({ error: 'Usuario es obligatorio' });
        }
        if (presupuesto_ejecutado === undefined || presupuesto_ejecutado < 0) {
            return res.status(400).json({ error: 'El monto ejecutado es obligatorio y debe ser mayor o igual a 0' });
        }

        // Verificar que el proyecto existe
        const proyecto = await db.queryOne(
            'SELECT * FROM tbl_proyectos WHERE id_proyecto = ?',
            [id]
        );
        if (!proyecto) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        if (proyecto.estado_proyecto === 'FINALIZADO') {
            return res.status(400).json({ error: 'El proyecto ya está finalizado' });
        }

        // Un proyecto cancelado no puede darse por concluido
        if (proyecto.estado_proyecto === 'CANCELADO') {
            return res.status(400).json({ error: 'El proyecto está cancelado y no se puede finalizar' });
        }

        const estadoAnterior = proyecto.estado_proyecto;

        // Actualizar estado a FINALIZADO y guardar presupuesto ejecutado
        await db.execute(
            'UPDATE tbl_proyectos SET estado_proyecto = ?, presupuesto_ejecutado = ? WHERE id_proyecto = ?',
            ['FINALIZADO', parseFloat(presupuesto_ejecutado), id]
        );

        await registrarBitacora({
            id_usuario: parseInt(id_usuario),
            tipo_accion: 'UPDATE',
            tipo_objeto: 'PROYECTO',
            id_objeto: id,
            campo_modificado: 'estado_proyecto',
            valor_antiguo: estadoAnterior,
            valor_nuevo: `FINALIZADO - Monto ejecutado: L ${parseFloat(presupuesto_ejecutado).toFixed(2)}`
        });

        const actualizado = await db.queryOne(
            `
            SELECT p.*, 
                   m.nombre_municipio,
                   d.nombre_departamento,
                   s.nombre_usuario as supervisor_nombre
            FROM tbl_proyectos p
            LEFT JOIN tbl_municipios m ON p.id_ubicacion = m.id_municipio
            LEFT JOIN tbl_departamentos d ON m.id_departamento = d.id_departamento
            LEFT JOIN tbl_usuarios s ON p.id_supervisor = s.id_usuario
            WHERE p.id_proyecto = ?
            `,
            [id]
        );

        res.json({
            success: true,
            message: 'Proyecto finalizado exitosamente',
            proyecto: actualizado
        });

    } catch (error) {
        console.error('Error finalizando proyecto:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// PATCH /api/proyectos/:id/cancelar - Cancelar proyecto
// ============================================================

router.patch('/:id/cancelar', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { id_usuario } = req.body;

        if (!id_usuario) {
            return res.status(400).json({ error: 'Usuario es obligatorio' });
        }

        const proyecto = await db.queryOne(
            'SELECT * FROM tbl_proyectos WHERE id_proyecto = ?',
            [id]
        );
        if (!proyecto) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        if (proyecto.estado_proyecto === 'CANCELADO') {
            return res.status(400).json({ error: 'El proyecto ya está cancelado' });
        }

        // Un proyecto ya concluido no puede cancelarse a posteriori
        if (proyecto.estado_proyecto === 'FINALIZADO') {
            return res.status(400).json({ error: 'El proyecto ya está finalizado y no se puede cancelar' });
        }

        const estadoAnterior = proyecto.estado_proyecto;

        await db.execute(
            'UPDATE tbl_proyectos SET estado_proyecto = ? WHERE id_proyecto = ?',
            ['CANCELADO', id]
        );

        await registrarBitacora({
            id_usuario: parseInt(id_usuario),
            tipo_accion: 'UPDATE',
            tipo_objeto: 'PROYECTO',
            id_objeto: id,
            campo_modificado: 'estado_proyecto',
            valor_antiguo: estadoAnterior,
            valor_nuevo: 'CANCELADO'
        });

        const actualizado = await db.queryOne(
            `
            SELECT p.*, 
                   m.nombre_municipio,
                   d.nombre_departamento,
                   s.nombre_usuario as supervisor_nombre
            FROM tbl_proyectos p
            LEFT JOIN tbl_municipios m ON p.id_ubicacion = m.id_municipio
            LEFT JOIN tbl_departamentos d ON m.id_departamento = d.id_departamento
            LEFT JOIN tbl_usuarios s ON p.id_supervisor = s.id_usuario
            WHERE p.id_proyecto = ?
            `,
            [id]
        );

        res.json({
            success: true,
            message: 'Proyecto cancelado exitosamente',
            proyecto: actualizado
        });

    } catch (error) {
        console.error('Error cancelando proyecto:', error);
        res.status(500).json({ error: error.message });
    }
});
// ─────────────────────────────────────────────────────────────
// POST /api/proyectos - Crear proyecto
// ─────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
    try {
        const {
            tipo_proyecto,
            nombre_proyecto,
            descripcion_proyecto,
            id_ubicacion,
            fecha_inicio,
            fecha_fin,
            presupuesto_inicial,
            id_usuario,
            id_supervisor
        } = req.body;

        // ── VALIDACIONES ──
        if (!tipo_proyecto) {
            return res.status(400).json({ error: 'El tipo de proyecto es obligatorio' });
        }
        if (!nombre_proyecto || nombre_proyecto.trim().length === 0) {
            return res.status(400).json({ error: 'El nombre del proyecto es obligatorio' });
        }
        if (!id_ubicacion) {
            return res.status(400).json({ error: 'La ubicación es obligatoria' });
        }
        if (!fecha_inicio) {
            return res.status(400).json({ error: 'La fecha de inicio es obligatoria' });
        }
        if (!presupuesto_inicial || presupuesto_inicial <= 0) {
            return res.status(400).json({ error: 'El presupuesto inicial debe ser mayor a 0' });
        }

        const tipoUpper = tipo_proyecto.toUpperCase();
        if (!['AGRICOLA', 'INFRAESTRUCTURA', 'SOCIAL'].includes(tipoUpper)) {
            return res.status(400).json({ error: 'Tipo de proyecto inválido' });
        }

        // ── INSERTAR PROYECTO ──
        const result = await db.execute(`
            INSERT INTO tbl_proyectos 
            (tipo_proyecto, estado_proyecto, id_ubicacion, nombre_proyecto, 
             descripcion_proyecto, fecha_inicio, fecha_fin, presupuesto_inicial, 
             presupuesto_ejecutado, id_supervisor)
            VALUES (?, 'ACTIVO', ?, ?, ?, ?, ?, ?, 0, ?)
        `, [
            tipoUpper,
            parseInt(id_ubicacion),
            nombre_proyecto.trim(),
            descripcion_proyecto || null,
            fecha_inicio,
            fecha_fin || null,
            parseFloat(presupuesto_inicial),
            id_supervisor || null
        ]);

        const id_proyecto = result.lastInsertRowid;

        // ── REGISTRAR EN BITÁCORA ──
        try {
            await registrarBitacora({
                id_usuario: id_usuario || 1,
                tipo_accion: 'INSERT',
                tipo_objeto: 'PROYECTO',
                id_objeto: id_proyecto,
                valor_nuevo: `Proyecto "${nombre_proyecto}" creado con supervisor ${id_supervisor || 'sin asignar'}`
            });
        } catch (e) {
            console.warn('Error en bitácora:', e.message);
        }

        // ── RESPUESTA ──
        const nuevoProyecto = await db.queryOne(`
            SELECT 
                p.*,
                m.nombre_municipio,
                d.nombre_departamento,
                s.nombre_usuario as supervisor_nombre
            FROM tbl_proyectos p
            LEFT JOIN tbl_municipios m ON p.id_ubicacion = m.id_municipio
            LEFT JOIN tbl_departamentos d ON m.id_departamento = d.id_departamento
            LEFT JOIN tbl_usuarios s ON p.id_supervisor = s.id_usuario
            WHERE p.id_proyecto = ?
        `, [id_proyecto]);

        res.status(201).json({
            success: true,
            message: `Proyecto "${nombre_proyecto}" creado exitosamente`,
            proyecto: nuevoProyecto
        });

    } catch (error) {
        console.error('Error creando proyecto:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/proyectos/:id - Actualizar proyecto
// ─────────────────────────────────────────────────────────────

router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { id_usuario, id_supervisor, ...datos } = req.body;

        // ── OBTENER PROYECTO ANTERIOR ──
        const anterior = await db.queryOne(
            'SELECT * FROM tbl_proyectos WHERE id_proyecto = ?',
            [id]
        );
        if (!anterior) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        /* UN PROYECTO CERRADO ES DEFINITIVO
           CANCELADO y FINALIZADO son estados terminales: el expediente queda
           como registro histórico, así que se rechaza cualquier modificación,
           incluido un intento de devolverlo a ACTIVO. La validación vive aquí
           y no solo en el front porque el endpoint es público. */
        if (['CANCELADO', 'FINALIZADO'].includes(anterior.estado_proyecto)) {
            return res.status(400).json({
                error: `El proyecto está ${anterior.estado_proyecto.toLowerCase()} y no se puede modificar ni reactivar`
            });
        }

        // ── ACTUALIZAR CAMPOS ──
        const camposPermitidos = [
            'tipo_proyecto', 'estado_proyecto', 'id_ubicacion', 'nombre_proyecto',
            'descripcion_proyecto', 'fecha_inicio', 'fecha_fin',
            'presupuesto_inicial', 'presupuesto_ejecutado'
        ];

        const sets = [];
        const values = [];
        const cambios = [];

        camposPermitidos.forEach(campo => {
            if (datos[campo] !== undefined) {
                const valorNuevo = datos[campo];
                const valorAnterior = anterior[campo];
                if (String(valorAnterior) !== String(valorNuevo)) {
                    sets.push(`${campo} = ?`);
                    values.push(valorNuevo);
                    cambios.push({ campo, anterior: valorAnterior, nuevo: valorNuevo });
                }
            }
        });

        // Actualizar supervisor
        if (id_supervisor !== undefined) {
            const valorAnterior = anterior.id_supervisor;
            if (String(valorAnterior) !== String(id_supervisor)) {
                sets.push('id_supervisor = ?');
                values.push(id_supervisor || null);
                cambios.push({
                    campo: 'id_supervisor',
                    anterior: valorAnterior,
                    nuevo: id_supervisor
                });
            }
        }

        if (sets.length === 0) {
            return res.status(400).json({ error: 'No hay cambios para actualizar' });
        }

        values.push(id);
        await db.execute(
            `UPDATE tbl_proyectos SET ${sets.join(', ')} WHERE id_proyecto = ?`,
            values
        );

        // ── REGISTRAR EN BITÁCORA ──
        for (const cambio of cambios) {
            try {
                await registrarBitacora({
                    id_usuario: id_usuario || 1,
                    tipo_accion: 'UPDATE',
                    tipo_objeto: 'PROYECTO',
                    id_objeto: id,
                    campo_modificado: cambio.campo,
                    valor_antiguo: String(cambio.anterior || null),
                    valor_nuevo: String(cambio.nuevo || null)
                });
            } catch (e) {
                console.warn('Error en bitácora:', e.message);
            }
        }

        // ── RESPUESTA ──
        const actualizado = await db.queryOne(`
            SELECT 
                p.*,
                m.nombre_municipio,
                d.nombre_departamento,
                s.nombre_usuario as supervisor_nombre
            FROM tbl_proyectos p
            LEFT JOIN tbl_municipios m ON p.id_ubicacion = m.id_municipio
            LEFT JOIN tbl_departamentos d ON m.id_departamento = d.id_departamento
            LEFT JOIN tbl_usuarios s ON p.id_supervisor = s.id_usuario
            WHERE p.id_proyecto = ?
        `, [id]);

        res.json({
            success: true,
            message: 'Proyecto actualizado',
            proyecto: actualizado
        });

    } catch (error) {
        console.error('Error actualizando proyecto:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/proyectos/:id - Eliminar proyecto
// ─────────────────────────────────────────────────────────────

router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { id_usuario } = req.query;

        const anterior = await db.queryOne(
            'SELECT * FROM tbl_proyectos WHERE id_proyecto = ?',
            [id]
        );
        if (!anterior) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        // Verificar dependencias
        const solicitudes = await db.queryOne(
            'SELECT COUNT(*) as total FROM tbl_solicitudes WHERE id_proyecto = ?',
            [id]
        );
        if (solicitudes.total > 0) {
            return res.status(400).json({
                error: `No se puede eliminar el proyecto porque tiene ${solicitudes.total} solicitudes asociadas`
            });
        }

        await db.execute(
            'DELETE FROM tbl_proyectos WHERE id_proyecto = ?',
            [id]
        );

        await registrarBitacora({
            id_usuario: id_usuario || 1,
            tipo_accion: 'DELETE',
            tipo_objeto: 'PROYECTO',
            id_objeto: id,
            valor_nuevo: `Proyecto "${anterior.nombre_proyecto}" eliminado`
        });

        res.json({
            success: true,
            message: 'Proyecto eliminado'
        });

    } catch (error) {
        console.error('Error eliminando proyecto:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────
// GET /api/proyectos/:id/reportes
// ─────────────────────────────────────────────────────────────

router.get('/:id/reportes', async (req, res) => {
    try {
        const filas = await db.queryAll(
            `
            SELECT *
            FROM tbl_reportes
            WHERE id_proyecto = ?
            ORDER BY fecha_reporte DESC
            `,
            [req.params.id]
        );
        res.json(filas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;