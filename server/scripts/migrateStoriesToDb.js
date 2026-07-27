/**
 * Importe les histoires déjà présentes dans server/uploads/ vers PostgreSQL.
 * Idempotent : peut être relancé sans doublon (upsert par id de dossier).
 *
 * Usage (depuis server/) :
 *   node scripts/migrateStoriesToDb.js
 */
require('dotenv').config();

const path = require('path');
const { pool } = require('../db');
const { migrateUploadsToDb } = require('../services/storyStore');

async function main() {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    console.log('Migration uploads → BDD…');
    console.log('Dossier:', uploadsDir);

    const { imported, skipped, errors } = await migrateUploadsToDb(pool, uploadsDir);

    console.log(`\nImportées (${imported.length}):`);
    for (const id of imported) console.log('  ✓', id);

    if (skipped.length) {
        console.log(`\nIgnorées (${skipped.length}):`);
        for (const row of skipped) console.log('  –', row.id, `(${row.reason})`);
    }

    if (errors.length) {
        console.log(`\nErreurs (${errors.length}):`);
        for (const row of errors) console.log('  ✗', row.id, '→', row.message);
        process.exitCode = 1;
    } else {
        console.log('\nMigration terminée.');
    }
}

main()
    .catch((error) => {
        console.error('Échec migration:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
