// db.js

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// BD/pronadersBD.db está un nivel arriba de /backend
const DB_PATH = path.join(__dirname, '..', 'BD', 'pronadersBD.db');

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

/*====================================================
  AJUSTES DE ESQUEMA AL ARRANCAR
  El archivo .db lo mantiene otra integrante del equipo, así que las
  columnas que le falten se agregan aquí al iniciar el servidor en vez
  de editar la base a mano. Es idempotente: si la columna ya existe,
  no hace nada.
====================================================*/

const agregarColumnaSiFalta = (tabla, columna, definicion) => {
    db.all(`PRAGMA table_info(${tabla})`, [], (err, columnas) => {

        if (err) {
            return console.error(`No se pudo leer el esquema de ${tabla}:`, err.message);
        }

        if (columnas.some(c => c.name === columna)) {
            return;
        }

        db.run(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`, (errAlter) => {

            if (errAlter) {
                return console.error(`No se pudo agregar ${tabla}.${columna}:`, errAlter.message);
            }

            console.log(`Columna ${tabla}.${columna} agregada.`);

        });

    });
};

// El formulario de "Nuevo Reporte" del Supervisor de Campo captura
// incidencias y observaciones, pero la tabla original no tenía dónde
// guardarlas y se perdían al enviar el reporte.
agregarColumnaSiFalta('tbl_reportes', 'observaciones', 'TEXT');
agregarColumnaSiFalta('tbl_reportes', 'incidencias', 'TEXT');

module.exports = db;