/** Origines Vite courantes en développement local. */
const DEFAULT_DEV_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
];

/**
 * Liste des origines autorisées depuis CORS_ORIGINS (séparées par des virgules).
 * - Si défini : utilise uniquement cette liste
 * - Sinon en développement : localhost Vite
 * - Sinon en production : liste vide (aucun front navigateur autorisé tant que non configuré)
 */
function getAllowedOrigins(env = process.env) {
    const raw = (env.CORS_ORIGINS || '').trim();
    if (raw) {
        return raw
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean);
    }

    if ((env.NODE_ENV || '').toLowerCase() === 'production') {
        return [];
    }

    return [...DEFAULT_DEV_ORIGINS];
}

/**
 * Options pour le middleware `cors`.
 * Les requêtes sans en-tête Origin (curl, health checks, same-origin) restent acceptées.
 */
function buildCorsOptions(env = process.env) {
    const allowed = getAllowedOrigins(env);

    return {
        origin(origin, callback) {
            if (!origin) {
                return callback(null, true);
            }
            if (allowed.includes(origin)) {
                return callback(null, true);
            }
            console.warn(`CORS bloqué pour l'origine: ${origin}`);
            return callback(null, false);
        },
        optionsSuccessStatus: 204,
    };
}

module.exports = {
    DEFAULT_DEV_ORIGINS,
    getAllowedOrigins,
    buildCorsOptions,
};
