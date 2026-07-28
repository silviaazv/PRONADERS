const db = require('../db');
const genericCrud = require('./genericCrud');

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
    ],
});

// ======================================================
// GET /api/proyectos/:id/colaboradores
// Devuelve los usuarios asignados a un proyecto
// ======================================================

router.get('/:id/colaboradores', async (req, res) => {

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

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

// ======================================================
// GET /api/proyectos/:id/reportes
// Reportes asociados al proyecto
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

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

/**
 * GET /api/proyectos
 * Lista proyectos con filtros
 * Query params: estado, id_usuario
 */
router.get('/', async (req, res) => {
    try {
        const { estado, id_usuario } = req.query;
        let query = `
            SELECT p.*, m.nombre_municipio, d.nombre_departamento
            FROM tbl_proyectos p
            LEFT JOIN tbl_municipios m ON p.id_ubicacion = m.id_municipio
            LEFT JOIN tbl_departamentos d ON m.id_departamento = d.id_departamento
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

        const proyectos = await db.queryAll(query, params);
        res.json(proyectos);
    } catch (error) {
        console.error('Error listando proyectos:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
