// ============================================================
// crear-bd.js
// ------------------------------------------------------------
// Arma BD/pronadersBD.db a partir de BD/pronaders-sqlite.sql.
//
// Normalmente NO hace falta correrlo a mano: el servidor lo llama
// solo cuando hace falta (ver db.js). Se corre suelto con:
//     npm run crear-bd            (solo si la base no existe)
//     npm run crear-bd -- --forzar   (la rehace aunque exista)
//
// Después de armarla guarda la huella del .sql en BD/.bd-version,
// que es lo que permite darse cuenta, la próxima vez, de si alguien
// subió datos nuevos al repositorio.
// ============================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('sqlite3');

const RAIZ = path.join(__dirname, '..', '..');
const ARCHIVO_SQL = path.join(RAIZ, 'BD', 'pronaders-sqlite.sql');
const ARCHIVO_BD = path.join(RAIZ, 'BD', 'pronaders-local.db');
const ARCHIVO_VERSION = path.join(RAIZ, 'BD', '.bd-version');

const forzar = process.argv.includes('--forzar');

// Huella del archivo de datos oficial. Si cambia, es que alguien subió datos.
function huellaDelSQL() {
    return crypto.createHash('md5').update(fs.readFileSync(ARCHIVO_SQL)).digest('hex');
}

if (!fs.existsSync(ARCHIVO_SQL)) {
    console.error(`No se encontró ${ARCHIVO_SQL}`);
    process.exit(1);
}

if (fs.existsSync(ARCHIVO_BD)) {
    if (!forzar) {
        console.log('La base ya existe, no se toca.');
        console.log('Para rehacerla desde cero: npm run crear-bd -- --forzar');
        process.exit(0);
    }

    // Siempre se guarda una copia antes de reemplazarla, por las dudas.
    const respaldo = `${ARCHIVO_BD}.respaldo-${Date.now()}`;
    fs.copyFileSync(ARCHIVO_BD, respaldo);
    fs.unlinkSync(ARCHIVO_BD);
    console.log(`Tu base anterior quedó respaldada en BD/${path.basename(respaldo)}`);
}

const sql = fs.readFileSync(ARCHIVO_SQL, 'utf8');
const db = new sqlite3.Database(ARCHIVO_BD);

db.exec(sql, (error) => {
    if (error) {
        console.error('Error creando la base:', error.message);
        process.exit(1);
    }

    db.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        (err, tablas) => {
            if (err) {
                console.error('Error verificando:', err.message);
                process.exit(1);
            }

            fs.writeFileSync(ARCHIVO_VERSION, huellaDelSQL(), 'utf8');

            console.log(`Base lista: ${tablas.length} tablas.`);
            db.close();
            process.exit(0);
        }
    );
});
