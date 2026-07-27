/**
 * Construit les URLs média à partir de VITE_API_URL (jamais de localhost figé
 * dans les données). Réécrit les anciennes URLs absolues /uploads/... vers l'API courante.
 */

export function normalizeApiBase(apiUrl) {
    if (!apiUrl || typeof apiUrl !== 'string') return '';
    return apiUrl.replace(/\/+$/, '');
}

/**
 * Asset générique déjà sous /uploads/... (ex. avatar).
 */
export function resolveAssetUrl(path, apiUrl) {
    if (!path || typeof path !== 'string') return '';
    const base = normalizeApiBase(apiUrl);

    if (/^https?:\/\//i.test(path)) {
        try {
            const url = new URL(path);
            if (url.pathname.startsWith('/uploads/')) {
                return `${base}${url.pathname}${url.search}`;
            }
            return path;
        } catch {
            return path;
        }
    }

    if (path.startsWith('/')) {
        return `${base}${path}`;
    }

    return `${base}/${path.replace(/^\/+/, '')}`;
}

/**
 * Image d'histoire (chemin relatif type images/scene1.png, ou ancienne URL absolue).
 */
export function getStoryImageUrl(path, storyId, apiUrl) {
    if (!path || typeof path !== 'string') return '';
    const base = normalizeApiBase(apiUrl);

    if (/^https?:\/\//i.test(path)) {
        try {
            const url = new URL(path);
            if (url.pathname.startsWith('/uploads/')) {
                return `${base}${url.pathname}${url.search}`;
            }
            return path;
        } catch {
            return path;
        }
    }

    if (path.startsWith('/uploads/')) {
        return `${base}${path}`;
    }

    const cleanPath = path.replace(/^\/+/, '');
    if (!storyId) {
        return `${base}/uploads/${cleanPath}`;
    }
    return `${base}/uploads/${storyId}/${cleanPath}`;
}
