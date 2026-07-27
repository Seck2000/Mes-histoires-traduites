import { useEffect, useState } from 'react';
import { api } from '../api';

/**
 * Charge l'avatar via l'API authentifiée (blob), car /uploads/avatars n'est plus public.
 * @param {string|null|undefined} avatarUrl valeur en BDD (indique qu'une photo existe)
 * @returns {string|null} object URL à passer à <img src>, ou null
 */
export function useProtectedAvatar(avatarUrl) {
    const [src, setSrc] = useState(null);

    useEffect(() => {
        if (!avatarUrl) {
            setSrc(null);
            return undefined;
        }

        let cancelled = false;
        let objectUrl = null;

        (async () => {
            try {
                const { data } = await api.get('/api/auth/me/avatar/file', {
                    responseType: 'blob',
                });
                if (cancelled) return;
                objectUrl = URL.createObjectURL(data);
                setSrc(objectUrl);
            } catch {
                if (!cancelled) setSrc(null);
            }
        })();

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [avatarUrl]);

    return src;
}
