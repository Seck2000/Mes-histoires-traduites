/**
 * Accès PostgreSQL runtime — source unique pour les requêtes de l'API.
 *
 * Convention du projet (point 3) :
 * - Prisma  → schéma (`prisma/schema.prisma`) + migrations uniquement
 * - `pg`    → toutes les lectures/écritures runtime (routes, services, scripts)
 *
 * Ne pas importer `@prisma/client` / PrismaClient dans les routes.
 * Après un changement de schéma : `npx prisma migrate dev` (ou `migrate deploy`).
 */
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
    console.error('Erreur pool PostgreSQL:', err);
});

/** Raccourci typé pour les appels SQL (même pool partout). */
function query(text, params) {
    return pool.query(text, params);
}

async function healthCheck() {
    await pool.query('SELECT 1');
    return { ok: true, database: 'connected' };
}

module.exports = {
    pool,
    query,
    healthCheck,
};
