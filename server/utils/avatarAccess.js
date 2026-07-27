const path = require('path');

/**
 * Bloque l'accès public au dossier avatars sous /uploads.
 * Les images d'histoires restent servies en statique.
 */
function isAvatarUploadPath(requestPath) {
    const normalized = decodeURIComponent(String(requestPath || ''))
        .replace(/\\/g, '/')
        .replace(/^\/+/, '');

    return (
        normalized === 'avatars' ||
        normalized.startsWith('avatars/') ||
        normalized.includes('/avatars/')
    );
}

function createAvatarPublicBlockMiddleware() {
    return function blockPublicAvatars(req, res, next) {
        if (isAvatarUploadPath(req.path)) {
            return res.status(404).json({ error: 'Non trouvé.' });
        }
        return next();
    };
}

/**
 * Résout le fichier avatar sur disque à partir de avatarUrl en BDD.
 * N'accepte que des fichiers dans AVATAR_DIR dont le nom commence par userId.
 */
function resolveOwnedAvatarFile(avatarUrl, userId, avatarDir) {
    if (!avatarUrl || !userId || !avatarDir) return null;

    let pathname = String(avatarUrl).trim();
    try {
        if (/^https?:\/\//i.test(pathname)) {
            pathname = new URL(pathname).pathname;
        }
    } catch {
        return null;
    }

    const filename = path.basename(pathname.replace(/\\/g, '/'));
    if (!filename || filename === '.' || filename === '..') return null;
    if (!filename.startsWith(`${userId}-`)) return null;

    const absolute = path.resolve(avatarDir, filename);
    const root = path.resolve(avatarDir);
    if (absolute !== root && !absolute.startsWith(root + path.sep)) {
        return null;
    }

    return absolute;
}

module.exports = {
    isAvatarUploadPath,
    createAvatarPublicBlockMiddleware,
    resolveOwnedAvatarFile,
};
