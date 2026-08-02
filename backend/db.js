// db.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const sqlite3 = require('sqlite3').verbose();

const BD_DIR = path.join(__dirname, '..', 'BD');

// La base con la que trabaja el sistema. Es local de cada quien y no viaja
// en git, por eso nadie le pisa los datos a nadie.
const DB_PATH = path.join(BD_DIR, 'pronaders-local.db');

// Los datos compartidos, en texto. Esto sí viaja en git: al ser texto, git
// puede fusionar lo que subió una con lo que subió la otra. El .db binario
// no se podía fusionar (una versión pisaba la otra entera).
const SQL_PATH = path.join(BD_DIR, 'pronaders-sqlite.sql');

// Huella del .sql de la última vez, para detectar si alguien subió datos.
const VERSION_PATH = path.join(BD_DIR, '.bd-version');

// La base vieja, la que estaba versionada. Se conserva para no borrarle los
// datos a nadie: la primera vez se copia a la base local de cada quien.
const DB_ANTERIOR = path.join(BD_DIR, 'pronadersBD.db');

// ────────────────────────────────────────────────────────────────
// PREPARACIÓN Y SINCRONIZACIÓN DE LA BASE
// ────────────────────────────────────────────────────────────────
// Al arrancar puede pasar una de tres cosas:
//
//  1. No hay base local pero sí la vieja  → se copia, así nadie
//     pierde lo que tenía al actualizar el proyecto.
//  2. No hay ninguna de las dos (repo recién clonado) → se arma
//     desde el .sql.
//  3. Ya hay base local pero el .sql cambió → alguien subió datos
//     y se hizo pull, así que se rehace para quedar igual a todas.
//
// En ningún caso hay que correr comandos a mano: con npm start
// alcanza. Para publicar tus datos: npm run exportar-bd y commitear.
// ────────────────────────────────────────────────────────────────

function huellaDelSQL() {
    return crypto.createHash('md5').update(fs.readFileSync(SQL_PATH)).digest('hex');
}

function rehacerBase(motivo) {
    console.log(motivo);
    try {
        execFileSync(
            process.execPath,
            [path.join(__dirname, 'scripts', 'crear-bd.js'), '--forzar'],
            { stdio: 'inherit' }
        );
    } catch (error) {
        console.error('No se pudo preparar la base de datos automáticamente.');
        process.exit(1);
    }
}

if (fs.existsSync(SQL_PATH)) {
    if (!fs.existsSync(DB_PATH) && fs.existsSync(DB_ANTERIOR)) {
        // Caso 1: se rescata la base que ya tenía, con todos sus datos.
        // Se marca la versión actual para que el paso siguiente NO la
        // rehaga y le borre justo lo que se acaba de rescatar.
        console.log('Migrando tu base de datos actual a BD/pronaders-local.db...');
        fs.copyFileSync(DB_ANTERIOR, DB_PATH);
        fs.writeFileSync(VERSION_PATH, huellaDelSQL(), 'utf8');
        console.log('   Listo, tus datos quedaron intactos.');

    } else if (!fs.existsSync(DB_PATH)) {
        // Caso 2: repositorio recién clonado.
        rehacerBase('No se encontró la base de datos. Creándola...');

    } else {
        // Caso 3: ¿alguien subió datos nuevos?
        const huellaGuardada = fs.existsSync(VERSION_PATH)
            ? fs.readFileSync(VERSION_PATH, 'utf8').trim()
            : null;

        if (huellaGuardada !== huellaDelSQL()) {
            rehacerBase('Se detectaron datos nuevos en el repositorio. Actualizando la base...');
        }
    }
}

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error al conectar con SQLite:', err.message);
        process.exit(1);
    }

    console.log('Base de datos SQLite conectada.');

    db.run('PRAGMA foreign_keys = ON;');
});

/*====================================================
  CONSULTAR VARIOS REGISTROS
====================================================*/

db.queryAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {

        db.all(sql, params, (err, rows) => {

            if (err) {
                return reject(err);
            }

            resolve(rows);

        });

    });
};

/*====================================================
  CONSULTAR UN SOLO REGISTRO
====================================================*/

db.queryOne = (sql, params = []) => {
    return new Promise((resolve, reject) => {

        db.get(sql, params, (err, row) => {

            if (err) {
                return reject(err);
            }

            resolve(row);

        });

    });
};

/*====================================================
  INSERT / UPDATE / DELETE
====================================================*/

db.execute = (sql, params = []) => {
    return new Promise((resolve, reject) => {

        db.run(sql, params, function (err) {

            if (err) {
                return reject(err);
            }

            resolve({
                lastID: this.lastID,
                lastId: this.lastID,
                lastInsertRowid: this.lastID,
                changes: this.changes
            });

        });

    });
};

module.exports = db;