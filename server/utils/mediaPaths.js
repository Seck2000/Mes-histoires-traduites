/**
 * Normalise un chemin média pour le stockage / l'API :
 * jamais d'URL absolue (localhost ou autre) — uniquement un chemin relatif.
 *
 * Exemples :
 *   http://localhost:3000/uploads/story_1/images/a.png → images/a.png
 *   /uploads/story_1/images/a.png → images/a.png
 *   images/a.png → images/a.png (éventuellement préfixé avec rootDir)
 */

function toRelativeMediaPath(value, rootDir = '') {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';

    if (/^https?:\/\//i.test(trimmed)) {
        try {
            const url = new URL(trimmed);
            // Anciennes URLs d'assets locaux → chemin relatif. CDN externe → inchangé.
            if (url.pathname.startsWith('/uploads/')) {
                return stripUploadsStoryPrefix(url.pathname);
            }
            return trimmed;
        } catch {
            return trimmed;
        }
    }

    if (trimmed.startsWith('/')) {
        return stripUploadsStoryPrefix(trimmed);
    }

    const prefix = rootDir || '';
    if (prefix && trimmed.startsWith(prefix)) {
        return trimmed;
    }
    return `${prefix}${trimmed}`;
}

function stripUploadsStoryPrefix(pathname) {
    const clean = String(pathname || '').replace(/^\/+/, '');
    const match = clean.match(/^uploads\/[^/]+\/(.+)$/i);
    if (match) return match[1];
    if (clean.startsWith('uploads/')) {
        return clean.slice('uploads/'.length);
    }
    return clean;
}

module.exports = {
    toRelativeMediaPath,
    stripUploadsStoryPrefix,
};
