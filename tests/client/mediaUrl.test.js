import { describe, it, expect } from 'vitest';
import {
    normalizeApiBase,
    resolveAssetUrl,
    getStoryImageUrl,
} from '../../client/src/utils/mediaUrl.js';

describe('normalizeApiBase', () => {
    it('retire le slash final', () => {
        expect(normalizeApiBase('http://api.test/')).toBe('http://api.test');
    });
});

describe('resolveAssetUrl', () => {
    const api = 'https://api.prod.com';

    it('préfixe un chemin /uploads', () => {
        expect(resolveAssetUrl('/uploads/avatars/a.jpg', api)).toBe(
            'https://api.prod.com/uploads/avatars/a.jpg'
        );
    });

    it('réécrit une ancienne URL localhost /uploads', () => {
        expect(
            resolveAssetUrl('http://localhost:3000/uploads/avatars/a.jpg', api)
        ).toBe('https://api.prod.com/uploads/avatars/a.jpg');
    });

    it('conserve une URL externe hors /uploads', () => {
        expect(resolveAssetUrl('https://cdn.example.com/pic.png', api)).toBe(
            'https://cdn.example.com/pic.png'
        );
    });
});

describe('getStoryImageUrl', () => {
    const api = 'https://api.prod.com';

    it('construit depuis un chemin relatif', () => {
        expect(getStoryImageUrl('images/scene1.png', 'story_1', api)).toBe(
            'https://api.prod.com/uploads/story_1/images/scene1.png'
        );
    });

    it('réécrit localhost absolu vers l’API courante', () => {
        expect(
            getStoryImageUrl(
                'http://localhost:3000/uploads/story_1/images/scene1.png',
                'story_1',
                api
            )
        ).toBe('https://api.prod.com/uploads/story_1/images/scene1.png');
    });
});
