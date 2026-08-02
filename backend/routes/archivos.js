// ============================================================
// archivos.js - ROUTER DE ARCHIVOS ADJUNTOS (BACKEND)
// ============================================================

const fs = require('fs');
const path = require('path');
const express = require('express');
const db = require('../db');
const genericCrud = require('./genericCrud');
const { registrarBitacora } = require('../helpers/bitacora');

const router = express.Router();

// Carpeta física donde quedan los adjuntos. server.js la publica como /uploads,
// así que la ruta que se guarda en la BD sirve directo para verlo o descargarlo.
const CARPETA_SUBIDAS = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(CARPETA_SUBIDAS)) {
    fs.mkdirSync(CARPETA_SUBIDAS, { recursive: true });
}

// Las mismas extensiones que acepta la restricción chk_archivos_extension.
const EXTENSIONES_PERMITIDAS = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'jpg', 'jpeg', 'png', 'gif', 'bmp',
    'txt', 'csv', 'zip', 'rar', '7z'
];

const TAMANO_MAXIMO = 20 * 1024 * 1024; // 20 MB

// ─────────────────────────────────────────────────────────────
// POST / - Sube un archivo (contenido en base64) y lo registra
// ─────────────────────────────────────────────────────────────

router.post('/', async (req, res, next) => {
    // Sin contenido no hay nada que escribir en disco: es un alta normal
    // de registro, así que la resuelve el CRUD genérico de más abajo.
    if (!req.body || !req.body.contenido_base64) return next();

    try {
        const {
            id_usuario,
            id_proyecto,
            id_solicitud,
            id_reporte,
            nombre_archivo,
            descripcion_archivo,
            contenido_base64
        } = req.body;

        if (!id_usuario) return res.status(400).json({ error: 'El usuario es obligatorio' });
        if (!nombre_archivo) return res.status(400).json({ error: 'El nombre del archivo es obligatorio' });

        const extension = path.extname(nombre_archivo).replace('.', '').toLowerCase();
        if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
            return res.status(400).json({ error: `Tipo de archivo no permitido: .${extension}` });
        }

        // El navegador manda "data:application/pdf;base64,JVBERi0..." → se quita la cabecera.
        const base64 = String(contenido_base64).replace(/^data:[^;]*;base64,/, '');
        const contenido = Buffer.from(base64, 'base64');

        if (!contenido.length) {
            return res.status(400).json({ error: 'El archivo llegó vacío' });
        }
        if (contenido.length > TAMANO_MAXIMO) {
            return res.status(400).json({ error: 'El archivo supera el máximo de 20 MB' });
        }

        // Nombre único en disco para que dos adjuntos con el mismo nombre no se pisen.
        const nombreEnDisco = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
        fs.writeFileSync(path.join(CARPETA_SUBIDAS, nombreEnDisco), contenido);

        const result = await db.execute(`
            INSERT INTO tbl_archivos
            (id_usuario, id_proyecto, id_solicitud, id_reporte, nombre_archivo, ruta_archivo, descripcion_archivo, tamano_bytes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            parseInt(id_usuario),
            id_proyecto ? parseInt(id_proyecto) : null,
            id_solicitud ? parseInt(id_solicitud) : null,
            id_reporte ? parseInt(id_reporte) : null,
            nombre_archivo,
            `/uploads/${nombreEnDisco}`,
            descripcion_archivo || null,
            contenido.length
        ]);

        const id_archivo = result.lastInsertRowid;

        await registrarBitacora({
            id_usuario: parseInt(id_usuario),
            tipo_accion: 'INSERT',
            tipo_objeto: 'ARCHIVO',
            id_objeto: id_archivo,
            valor_nuevo: `Adjunto subido: ${nombre_archivo}`
        });

        const nuevo = await db.queryOne(
            'SELECT * FROM tbl_archivos WHERE id_archivo = ?',
            [id_archivo]
        );

        res.status(201).json({
            success: true,
            message: 'Archivo subido exitosamente',
            archivo: nuevo
        });

    } catch (error) {
        console.error('Error subiendo archivo:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────
// El resto (GET, PUT, DELETE) sigue saliendo del CRUD genérico.
// ─────────────────────────────────────────────────────────────

router.use(genericCrud({
    table: 'tbl_archivos',
    pk: 'id_archivo',
    columns: [
        'id_archivo',
        'id_usuario',
        'id_proyecto',
        'id_solicitud',
        'id_reporte',
        'nombre_archivo',
        'ruta_archivo',
        'descripcion_archivo',
        'tamano_bytes',
    ],
}));

module.exports = router;
