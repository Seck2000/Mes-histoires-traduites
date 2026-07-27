import { describe, it, expect } from 'vitest';
import storyStore from '../../server/services/storyStore.js';

const {
    withRootPrefix,
    normalizeStoryFromJson,
    toApiStory,
} = storyStore;

describe('withRootPrefix', () => {
    it('préfixe un chemin relatif', () => {
        expect(withRootPrefix('images/a.png', 'nested/')).toBe('nested/images/a.png');
    });

    it('laisse les URLs CDN externes intactes', () => {
        expect(withRootPrefix('http://example.com/a.png', 'nested/')).toBe('http://example.com/a.png');
    });

    it('convertit les URLs absolues /uploads en relatif', () => {
        expect(
            withRootPrefix('http://localhost:3000/uploads/story_1/images/a.png', '')
        ).toBe('images/a.png');
    });
});

describe('normalizeStoryFromJson', () => {
    const raw = {
        title: 'Test',
        title_ar: 'اختبار',
        ageCategory: 'petits',
        thumbnail: 'images/scene1.png',
        scenes: [
            {
                id: 1,
                image: 'images/scene1.png',
                character: { name: 'Lina', avatar: 'images/scene1.png' },
                text: { fr: 'Bonjour', en: 'Hello' },
            },
        ],
    };

    it('normalise avec l’id dossier serveur', () => {
        const story = normalizeStoryFromJson(raw, 'story_demo', '');
        expect(story.id).toBe('story_demo');
        expect(story.title).toBe('Test');
        expect(story.titleAr).toBe('اختبار');
        expect(story.ageCategory).toBe('petits');
        expect(story.scenes).toHaveLength(1);
        expect(story.scenes[0].sortIndex).toBe(0);
        expect(story.scenes[0].characterName).toBe('Lina');
    });

    it('applique rootDir aux chemins relatifs', () => {
        const story = normalizeStoryFromJson(raw, 'story_demo', 'pack/');
        expect(story.thumbnail).toBe('pack/images/scene1.png');
        expect(story.scenes[0].image).toBe('pack/images/scene1.png');
    });

    it('convertit une ancienne URL localhost en chemin relatif', () => {
        const withAbsolute = {
            ...raw,
            thumbnail: 'http://localhost:3000/uploads/story_demo/images/scene1.png',
            scenes: [
                {
                    ...raw.scenes[0],
                    image: 'http://localhost:3000/uploads/story_demo/images/scene1.png',
                },
            ],
        };
        const story = normalizeStoryFromJson(withAbsolute, 'story_demo', '');
        expect(story.thumbnail).toBe('images/scene1.png');
        expect(story.scenes[0].image).toBe('images/scene1.png');
    });

    it('rejette une histoire sans scènes', () => {
        expect(() => normalizeStoryFromJson({ title: 'x', scenes: [] }, 'id')).toThrow(/scènes/);
    });
});

describe('toApiStory', () => {
    it('reconstruit le contrat client', () => {
        const api = toApiStory(
            {
                id: 'story_1',
                title: 'Parc',
                titleAr: 'حديقة',
                thumbnail: 'images/scene1.png',
                ageCategory: 'moyens',
            },
            [
                {
                    sceneKey: 1,
                    sortIndex: 0,
                    image: 'images/scene1.png',
                    characterName: 'Lina',
                    characterAvatar: 'images/scene1.png',
                    text: { fr: 'Salut' },
                },
            ]
        );

        expect(api).toEqual({
            id: 'story_1',
            title: 'Parc',
            title_ar: 'حديقة',
            thumbnail: 'images/scene1.png',
            ageCategory: 'moyens',
            ageBand: 'moyens',
            scenes: [
                {
                    id: 1,
                    image: 'images/scene1.png',
                    character: { name: 'Lina', avatar: 'images/scene1.png' },
                    text: { fr: 'Salut' },
                },
            ],
        });
    });
});
