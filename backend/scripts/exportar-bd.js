// ============================================================
// exportar-bd.js
// ------------------------------------------------------------
// Vuelca la base de datos completa (estructura + datos) a un
// archivo de texto: BD/pronaders-sqlite.sql
//
// Se corre con:  npm run exportar-bd
//
// Ese archivo es el que viaja en el repositorio, en lugar del
// .db binario. Al ser texto se puede leer, comparar y revisar
// en un pull request, cosa que con el .db no se podía.
//
// Solo hace falta correrlo cuando se quiera actualizar la copia
// "oficial" de la base que van a recibir los demás.
// ============================================================

const fs = require('fs');
const path = require('path');
const db = require('../db');

const SALIDA = path.join(__dirname, '..', '..', 'BD', 'pronaders-sqlite.sql');

// Convierte un valor de JavaScript a como se escribe en SQL.
function aSQL(valor) {
    if (valor === null || valor === undefined) return 'NULL';
    if (typeof valor === 'number') return String(valor);
    if (Buffer.isBuffer(valor)) return `X'${valor.toString('hex')}'`;
    // Las comillas simples se escapan duplicándolas.
    return `'${String(valor).replace(/'/g, "''")}'`;
}

(async () => {
    try {
        const tablas = await db.queryAll(`
            SELECT name, sql FROM sqlite_master
            WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        `);

        const lineas = [];
        lineas.push('-- ============================================================');
        lineas.push('-- pronaders-sqlite.sql');
        lineas.push('-- Estructura y datos de la base de datos de PRONADERS (SQLite).');
        lineas.push('--');
        lineas.push('-- NO se edita a mano. Se genera con:  npm run exportar-bd');
        lineas.push('-- Para armar la base desde acá:       npm run crear-bd');
        lineas.push('-- ============================================================');
        lineas.push('');
        lineas.push('PRAGMA foreign_keys = OFF;');
        lineas.push('BEGIN TRANSACTION;');
        lineas.push('');

        let totalFilas = 0;

        for (const tabla of tablas) {
            lineas.push(`-- ── ${tabla.name} ──────────────────────────────────`);
            lineas.push(`DROP TABLE IF EXISTS ${tabla.name};`);
            lineas.push(`${tabla.sql};`);
            lineas.push('');

            const filas = await db.queryAll(`SELECT * FROM ${tabla.name}`);
            if (filas.length) {
                const columnas = Object.keys(filas[0]);
                for (const fila of filas) {
                    const valores = columnas.map(c => aSQL(fila[c])).join(', ');
                    lineas.push(`INSERT INTO ${tabla.name} (${columnas.join(', ')}) VALUES (${valores});`);
                }
                lineas.push('');
            }

            totalFilas += filas.length;
            console.log(`  ${tabla.name}: ${filas.length} fila(s)`);
        }

        lineas.push('COMMIT;');
        lineas.push('PRAGMA foreign_keys = ON;');
        lineas.push('');

        fs.writeFileSync(SALIDA, lineas.join('\n'), 'utf8');

        console.log(`\nListo: ${tablas.length} tablas y ${totalFilas} filas en BD/pronaders-sqlite.sql`);
        process.exit(0);

    } catch (error) {
        console.error('Error exportando la base:', error.message);
        process.exit(1);
    }
})();
