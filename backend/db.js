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
                changes: this.changes
            });

        });

    });
};

module.exports = db;