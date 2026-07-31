// proyectos.js (backend) 

const express = require('express');
const router = express.Router();
const db = require('../db');
const { registrarBitacora } = require('../helpers/bitacora');

/*const db = require('../db');
const genericCrud = require('./genericCrud');
const { registrarBitacora } = require('../helpers/bitacora');

const router = genericCrud({
    table: 'tbl_proyectos',
    pk: 'id_proyecto',
    columns: [
        'id_proyecto',
        'tipo_proyecto',
        'estado_proyecto',
        'id_ubicacion',
        'nombre_proyecto',
        'descripcion_proyecto',
        'fecha_inicio',
        'fecha_fin',
        'presupuesto_inicial',
        'presupuesto_ejecutado',
        'id_supervisor'
    ],
});*/

// ════════════════════════════════════════════════════
// POST para agregar bitácora
// ════════════════════════════════════════════════════

/*router.post('/', async (req, res) => {
    try {

        //LOGS DE PRUEBA
        console.log('========================================');
        console.log('[API] POST /api/proyectos');
        console.log('[API] Body recibido:', req.body);

        const {
            tipo_proyecto,
            nombre_proyecto,
            descripcion_proyecto,
            id_ubicacion,
            fecha_inicio,
            fecha_fin,
            presupuesto_inicial,
            id_usuario,
            usuarios_asignados,
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

        // ── INSERT ──
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
        
        const usariosParaAsignar = [];

        if (id_usuario) {
            usariosParaAsignar.push(parseInt(id_usuario));
        }

        if (id_supervisor && !usariosParaAsignar.includes(parseInt(id_supervisor))) {
            usariosParaAsignar.push(parseInt(id_supervisor));
        }

        /*Asiganar usuarios al proyecto
        // ── ASIGNAR USUARIOS AL PROYECTO ──
        if (id_supervisor) {
            try {
                await db.execute(
                    `INSERT INTO tbl_proyectos_usuarios (id_proyecto, id_usuario) VALUES (?, ?)`,
                    [id_proyecto, parseInt(id_supervisor)]
                );
                console.log(`Supervisor ${id_supervisor} asignado al proyecto ${id_proyecto}`);
            } catch (e) {
                console.warn('Supervisor ya asignado:', e.message);
            }
        }

        // Insertar asignaciones
        if (id_usuario && id_usuario !== parseInt(id_supervisor)) {
            try {
                await db.execute(
                    `INSERT INTO tbl_proyectos_usuarios (id_proyecto, id_usuario) VALUES (?, ?)`,
                    [id_proyecto, parseInt(id_usuario)]
                );
            } catch (e) {
                console.warn('Creador ya asignado:', e.message);
            }
        }*/

        /*for (const uid of usuariosParaAsignar) {
            try {
                await db.execute(
                    `INSERT INTO tbl_proyectos_usuarios (id_proyecto, id_usuario) VALUES (?, ?)`,
                    [id_proyecto, uid]
                );
                console.log(`[API] Usuario ${uid} asignado al proyecto ${id_proyecto}`);
            } catch (e) {
                console.warn(`[API] Error asignando usuario ${uid}:`, e.message);
            }
        }    

        // ── REGISTRAR EN BITÁCORA ──
        try {
        await registrarBitacora({
            id_usuario: id_usuario || 1,
            tipo_accion: 'INSERT',
            tipo_objeto: 'PROYECTO',
            id_objeto: id_proyecto,
            valor_nuevo: `Proyecto "${nombre_proyecto}" creado con estado ACTIVO`
        });

        console.log('[API] Bitácora registrada');
        } catch (e) {
            console.warn('[API] Error en bitácora:', e.message);
        }

        // ── RESPUESTA ──
        const nuevoProyecto = await db.queryOne(
            `
            SELECT p.*, s.nombre_usuario as supervisor_nombre
            FROM tbl_proyectos p
            LEFT JOIN tbl_usuarios s ON p.id_supervisor = s.id_usuario
            WHERE p.id_proyecto = ?
            `,
            [id_proyecto]
        );

        res.status(201).json({
            success: true,
            message: `Proyecto "${nombre_proyecto}" creado exitosamente`,
            proyecto: nuevoProyecto
        });

    } catch (error) {
        console.error('Error creando proyecto:', error);
        res.status(500).json({ error: error.message });
    }
});*/

//PROBANDO UN NUEVO POST
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

        console.log('[API] Creando proyecto con datos:', {
            nombre_proyecto,
            id_usuario,
            id_supervisor
        });

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
        console.log('[API] Proyecto creado con ID:', id_proyecto);

        
        // INSERTAR EN tbl_proyectos_usuarios

        // Array para almacenar los IDs de usuarios a asignar
        const usuariosIds = [];

        // 1. SIEMPRE asignar al creador (id_usuario)
        if (id_usuario) {
            usuariosIds.push(parseInt(id_usuario));
            console.log('[API] Creador a asignar:', id_usuario);
        }

        // 2. Asignar al supervisor si existe y es diferente al creador
        if (id_supervisor && !usuariosIds.includes(parseInt(id_supervisor))) {
            usuariosIds.push(parseInt(id_supervisor));
            console.log('[API] Supervisor a asignar:', id_supervisor);
        }

        console.log('[API] Usuarios a asignar:', usuariosIds);

        // Insertar cada usuario en tbl_proyectos_usuarios
        for (const uid of usuariosIds) {
            try {
                await db.execute(
                    `INSERT INTO tbl_proyectos_usuarios (id_proyecto, id_usuario) VALUES (?, ?)`,
                    [id_proyecto, uid]
                );
                console.log(`[API] Usuario ${uid} asignado al proyecto ${id_proyecto}`);
            } catch (error) {
                console.error(`[API] Error asignando usuario ${uid}:`, error.message);
            }
        }

        // ── VERIFICAR ASIGNACIONES ──
        const asignaciones = await db.queryAll(
            'SELECT * FROM tbl_proyectos_usuarios WHERE id_proyecto = ?',
            [id_proyecto]
        );
        console.log('[API] Asignaciones finales:', asignaciones);

        // ── REGISTRAR EN BITÁCORA ──
        try {
            await registrarBitacora({
                id_usuario: id_usuario || 1,
                tipo_accion: 'INSERT',
                tipo_objeto: 'PROYECTO',
                id_objeto: id_proyecto,
                valor_nuevo: `Proyecto "${nombre_proyecto}" creado con ${usuariosIds.length} colaborador(es)`
            });
        } catch (e) {
            console.warn('Error en bitácora:', e.message);
        }

        // ── RESPUESTA ──
        const nuevoProyecto = await db.queryOne(
            'SELECT * FROM tbl_proyectos WHERE id_proyecto = ?',
            [id_proyecto]
        );

        // Obtener usuarios asignados para la respuesta
        const usuarios = await db.queryAll(
            `
            SELECT u.id_usuario, u.nombre_usuario
            FROM tbl_proyectos_usuarios pu
            INNER JOIN tbl_usuarios u ON pu.id_usuario = u.id_usuario
            WHERE pu.id_proyecto = ?
            `,
            [id_proyecto]
        );

        nuevoProyecto.usuarios_asignados = usuarios;

        res.status(201).json({
            success: true,
            message: `Proyecto "${nombre_proyecto}" creado exitosamente`,
            proyecto: nuevoProyecto
        });

    } catch (error) {
        console.error('[API] Error creando proyecto:', error);
        res.status(500).json({ error: error.message });
    }
});

// ════════════════════════════════════════════════════
//PUT para agregar bitácora
// ════════════════════════════════════════════════════

router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { id_usuario, id_supervisor, ...datos } = req.body;

        // Obtener proyecto anterior
        const anterior = await db.queryOne(
            'SELECT * FROM tbl_proyectos WHERE id_proyecto = ?',
            [id]
        );
        if (!anterior) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        const camposPermitidos = [
            'tipo_proyecto', 'estado_proyecto', 'id_ubicacion', 'nombre_proyecto',
            'descripcion_proyecto', 'fecha_inicio', 'fecha_fin',
            'presupuesto_inicial', 'presupuesto_ejecutado', 'id_supervisor'
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

        // ── ACTUALIZAR SUPERVISOR ──
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

        // ── ACTUALIZAR ASIGNACIONES DE USUARIOS ──
        if (usuarios_asignados && Array.isArray(usuarios_asignados)) {
            // Eliminar asignaciones existentes
            await db.execute(
                'DELETE FROM tbl_proyectos_usuarios WHERE id_proyecto = ?',
                [id]
            );

            // Insertar nuevas asignaciones (incluir al creador)
            const usuariosUnicos = [...new Set(usuarios_asignados.map(Number))];
            
            // Asegurar que el creador esté incluido
            if (id_usuario && !usuariosUnicos.includes(parseInt(id_usuario))) {
                usuariosUnicos.push(parseInt(id_usuario));
            }

            if (id_supervisor && !usuariosUnicos.includes(parseInt(id_supervisor))) {
                usuariosUnicos.push(parseInt(id_supervisor));
            }

            for (const uid of usuariosUnicos) {
                await db.execute(
                    `INSERT INTO tbl_proyectos_usuarios (id_proyecto, id_usuario) VALUES (?, ?)`,
                    [id, uid]
                );
            }
        }

        //REGISTRAR EN BITÁCORA
        for (const cambio of cambios) {
            await registrarBitacora({
                id_usuario: id_usuario || 1,
                tipo_accion: 'UPDATE',
                tipo_objeto: 'PROYECTO',
                id_objeto: id,
                campo_modificado: cambio.campo,
                valor_antiguo: String(cambio.anterior || null),
                valor_nuevo: String(cambio.nuevo || null)
            });
        }

        const actualizado = await db.queryOne(
            `SELECT p.*, s.nombre_usuario as supervisor_nombre
            FROM tbl_proyectos p
            LEFT JOIN tbl_usuarios s ON p.id_supervisor = s.id_usuario
            WHERE p.id_proyecto = ? `,
            [id]
        );

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

// ════════════════════════════════════════════════════
//DELETE para agregar bitácora
// ════════════════════════════════════════════════════

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

        //REGISTRAR EN BITÁCORA
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

//GET /api/proyectos/:id

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

// GET /api/proyectos/usuario/:idUsuario
router.get('/usuario/:idUsuario', (req, res) => {
  try {
    const proyectos = db.prepare(`
      SELECT p.*
      FROM tbl_proyectos p
      INNER JOIN tbl_proyectos_usuarios pu
        ON pu.id_proyecto = p.id_proyecto
      WHERE pu.id_usuario = ?
      ORDER BY p.nombre_proyecto
    `).all(req.params.idUsuario);

    res.json(proyectos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
// GET /api/proyectos/:id/colaboradores
// ======================================================

/*router.get('/:id/colaboradores', async (req, res) => {
    try {
        const filas = await db.queryAll(
            `
            SELECT
                u.id_usuario,
                u.nombre_usuario,
                u.correo,
                u.id_rol
            FROM tbl_proyectos_usuarios pu
            INNER JOIN tbl_usuarios u
                ON u.id_usuario = pu.id_usuario
            WHERE pu.id_proyecto = ?
            `,
            [req.params.id]
        );
        res.json(filas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});*/

// ======================================================
// GET /api/proyectos/:id/reportes
// ======================================================

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

// ======================================================
// GET /api/proyectos
// ======================================================

router.get('/', async (req, res) => {
    try {
        const { estado, id_usuario } = req.query;

        //LOGS DE PRUEBA
                console.log('========================================');
        console.log('[API] GET /api/proyectos');
        console.log('[API] Filtros recibidos:', { estado, id_usuario });
        console.log('[API] ID Usuario (raw):', id_usuario);
        console.log('[API] ID Usuario (parsed):', id_usuario ? parseInt(id_usuario) : 'N/A');

        let query = `
            SELECT p.*, m.nombre_municipio, d.nombre_departamento
            FROM tbl_proyectos p
            LEFT JOIN tbl_municipios m ON p.id_ubicacion = m.id_municipio
            LEFT JOIN tbl_departamentos d ON m.id_departamento = d.id_departamento
            LEFT JOIN tbl_usuarios s ON p.id_supervisor = s.id_usuario
        `;
        const params = [];
        const conditions = [];

        if (estado) {
            conditions.push('p.estado_proyecto = ?');
            params.push(estado);
        }

        if (id_usuario) {
            query += ` INNER JOIN tbl_proyectos_usuarios pu ON p.id_proyecto = pu.id_proyecto`;
            conditions.push('pu.id_usuario = ?');
            params.push(parseInt(id_usuario));
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY p.fecha_inicio DESC';

        console.log('[API] Query final:', query);
        console.log('[API] Params:', params);

        const proyectos = await db.queryAll(query, params);

                // Obtener usuarios asignados a cada proyecto
        for (const p of proyectos) {
            const usuarios = await db.queryAll(
                `
                SELECT u.id_usuario, u.nombre_usuario
                FROM tbl_proyectos_usuarios pu
                INNER JOIN tbl_usuarios u ON pu.id_usuario = u.id_usuario
                WHERE pu.id_proyecto = ?
                `,
                [p.id_proyecto]
            );
            p.usuarios_ids = usuarios.map(u => u.id_usuario);
            p.usuarios_nombres = usuarios.map(u => u.nombre_usuario);
        }

        console.log('[API] Proyectos encontrados:', proyectos.length);
        console.log('[API] Proyectos:', JSON.stringify(proyectos, null, 2));

        res.json(proyectos);
    } catch (error) {
        console.error('Error listando proyectos:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;