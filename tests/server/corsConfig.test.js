import { describe, it, expect, vi, afterEach } from 'vitest';
import corsConfig from '../../server/utils/corsConfig.js';

const { getAllowedOrigins, buildCorsOptions, DEFAULT_DEV_ORIGINS } = corsConfig;

describe('getAllowedOrigins', () => {
    it('utilise CORS_ORIGINS quand défini', () => {
        expect(
            getAllowedOrigins({
                CORS_ORIGINS: 'https://app.example.com, http://localhost:5173',
            })
        ).toEqual(['https://app.example.com', 'http://localhost:5173']);
    });

    it('fallback dev si non défini', () => {
        expect(getAllowedOrigins({ NODE_ENV: 'development' })).toEqual(DEFAULT_DEV_ORIGINS);
    });

    it('liste vide en production sans CORS_ORIGINS', () => {
        expect(getAllowedOrigins({ NODE_ENV: 'production' })).toEqual([]);
    });
});

describe('buildCorsOptions', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('autorise une origine listée', async () => {
        const options = buildCorsOptions({
            CORS_ORIGINS: 'http://localhost:5173',
        });
        const result = await new Promise((resolve) => {
            options.origin('http://localhost:5173', (_err, ok) => resolve(ok));
        });
        expect(result).toBe(true);
    });

    it('refuse une origine inconnue', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const options = buildCorsOptions({
            CORS_ORIGINS: 'http://localhost:5173',
        });
        const result = await new Promise((resolve) => {
            options.origin('https://evil.example', (_err, ok) => resolve(ok));
        });
        expect(result).toBe(false);
    });

    it('autorise les requêtes sans Origin', async () => {
        const options = buildCorsOptions({ CORS_ORIGINS: 'http://localhost:5173' });
        const result = await new Promise((resolve) => {
            options.origin(undefined, (_err, ok) => resolve(ok));
        });
        expect(result).toBe(true);
    });
});
