const router = require('express').Router();
const db = require('../db');

/**
 * GET /api/municipios
 * Lista municipios con filtro opcional por departamento
 * Query params: id_departamento
 */
router.get('/', async (req, res) => {
    try {
        const { id_departamento } = req.query;

        let query = `
            SELECT m.id_municipio, m.nombre_municipio, m.id_departamento,
                   d.nombre_departamento
            FROM tbl_municipios m
            LEFT JOIN tbl_departamentos d ON m.id_departamento = d.id_departamento
        `;
        const params = [];


        if (id_departamento) {
            query += ' WHERE m.id_departamento = ?';
            params.push(parseInt(id_departamento));
        }

        query += ' ORDER BY m.nombre_municipio';

        const municipios = await db.queryAll(query, params);
        res.json(municipios);

    } catch (error) {
        console.error('Error listando municipios:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;