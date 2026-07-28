const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { registrarBitacora } = require('../helpers/bitacora');

const router = express.Router();

/* ============================================================
   POST /api/usuarios
   Crear usuario
============================================================ */

router.post('/', async (req, res) => {

    try {

        const {
            id_rol,
            estado_usuario,
            nombre_usuario,
            correo,
            telefono,
            contrasena
        } = req.body;

        if (!id_rol || !nombre_usuario || !correo || !contrasena) {

            return res.status(400).json({
                error: 'id_rol, nombre_usuario, correo y contrasena son requeridos'
            });

        }

        const hash = bcrypt.hashSync(contrasena, 10);

        const resultado = await db.execute(

            `
            INSERT INTO tbl_usuarios
            (
                id_rol,
                estado_usuario,
                nombre_usuario,
                correo,
                telefono,
                contrasena,
                fecha_registro
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,

            [
                id_rol,
                estado_usuario ?? 1,
                nombre_usuario,
                correo,
                telefono || null,
                hash,
                new Date().toISOString()
            ]

        );

        const usuario = await db.queryOne(

            `
            SELECT
                id_usuario,
                id_rol,
                estado_usuario,
                nombre_usuario,
                correo,
                telefono,
                fecha_registro
            FROM tbl_usuarios
            WHERE id_usuario = ?
            `,

            [resultado.lastID]

        );

        res.status(201).json(usuario);

    }

    catch (err) {

        res.status(400).json({
            error: err.message
        });

    }

});

/* ============================================================
   PUT /api/usuarios/:id
============================================================ */

router.put('/:id', async (req, res) => {

    try {

        const datos = { ...req.body };

        if (datos.contrasena) {

            datos.contrasena = bcrypt.hashSync(datos.contrasena, 10);

        }

        const columnasValidas = [
            'id_rol',
            'estado_usuario',
            'nombre_usuario',
            'correo',
            'telefono',
            'contrasena'
        ];

        const columnas = Object.keys(datos).filter(c => columnasValidas.includes(c));

        if (!columnas.length) {

            return res.status(400).json({
                error: 'No se enviaron columnas válidas'
            });

        }

        const sql = `
            UPDATE tbl_usuarios
            SET ${columnas.map(c => `${c} = ?`).join(', ')}
            WHERE id_usuario = ?
        `;

        const resultado = await db.execute(

            sql,

            [
                ...columnas.map(c => datos[c]),
                req.params.id
            ]

        );

        if (resultado.changes === 0) {

            return res.status(404).json({
                error: 'Usuario no encontrado'
            });

        }

        const usuario = await db.queryOne(

            `
            SELECT
                id_usuario,
                id_rol,
                estado_usuario,
                nombre_usuario,
                correo,
                telefono,
                fecha_registro
            FROM tbl_usuarios
            WHERE id_usuario = ?
            `,

            [req.params.id]

        );

        res.json(usuario);

    }

    catch (err) {

        res.status(400).json({
            error: err.message
        });

    }

});

/* ============================================================
   POST /api/usuarios/login
============================================================ */

router.post('/login', async (req, res) => {

    try {

        const {
            correo,
            contrasena
        } = req.body;

        if (!correo || !contrasena) {

            return res.status(400).json({
                error: 'correo y contrasena son requeridos'
            });

        }

        const usuario = await db.queryOne(

            `
            SELECT *
            FROM tbl_usuarios
            WHERE correo = ?
            `,

            [correo]

        );

        if (!usuario) {

            return res.status(401).json({
                error: 'Credenciales inválidas'
            });

        }

        const passwordCorrecto = bcrypt.compareSync(
            contrasena,
            usuario.contrasena || ''
        );

        if (!passwordCorrecto) {

            return res.status(401).json({
                error: 'Credenciales inválidas'
            });

        }

        if (usuario.estado_usuario === 0) {

            return res.status(403).json({
                error: 'Usuario inactivo'
            });

        }

        await registrarBitacora({

            id_usuario: usuario.id_usuario,

            tipo_accion: 'LOGIN'

        });

        const rol = await db.queryOne(

            `
            SELECT nombre_rol
            FROM tbl_roles
            WHERE id_rol = ?
            `,

            [usuario.id_rol]

        );

        const { contrasena: _, ...usuarioSeguro } = usuario;

        res.json({

            usuario: usuarioSeguro,

            rol: rol ? rol.nombre_rol : null

        });

    }

    catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});

/* ============================================================
   GET /api/usuarios
   Lista de usuarios (sin contraseña)
============================================================ */

router.get('/', async (req, res) => {

    try {

        const usuarios = await db.queryAll(

            `
            SELECT
                id_usuario,
                id_rol,
                estado_usuario,
                nombre_usuario,
                correo,
                telefono,
                fecha_registro
            FROM tbl_usuarios
            ORDER BY nombre_usuario
            `

        );

        res.json(usuarios);

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

/* ============================================================
   GET /api/usuarios/:id
============================================================ */

router.get('/:id', async (req, res) => {

    try {

        const usuario = await db.queryOne(

            `
            SELECT
                id_usuario,
                id_rol,
                estado_usuario,
                nombre_usuario,
                correo,
                telefono,
                fecha_registro
            FROM tbl_usuarios
            WHERE id_usuario = ?
            `,

            [req.params.id]

        );

        if (!usuario) {

            return res.status(404).json({

                error: 'Usuario no encontrado'

            });

        }

        res.json(usuario);

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});


   //DELETE /api/usuarios/:id

router.delete('/:id', async (req, res) => {

    try {

        const resultado = await db.execute(

            `
            DELETE
            FROM tbl_usuarios
            WHERE id_usuario = ?
            `,

            [req.params.id]

        );

        if (resultado.changes === 0) {

            return res.status(404).json({

                error: 'Usuario no encontrado'

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

module.exports = router;