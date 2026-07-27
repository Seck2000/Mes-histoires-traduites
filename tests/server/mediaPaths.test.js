import { describe, it, expect } from 'vitest';
import mediaPaths from '../../server/utils/mediaPaths.js';

const { toRelativeMediaPath } = mediaPaths;

describe('toRelativeMediaPath', () => {
    it('laisse un chemin relatif intact', () => {
        expect(toRelativeMediaPath('images/scene1.png')).toBe('images/scene1.png');
    });

    it('applique rootDir', () => {
        expect(toRelativeMediaPath('images/a.png', 'pack/')).toBe('pack/images/a.png');
    });

    it('retire localhost + uploads/storyId/', () => {
        expect(
            toRelativeMediaPath('http://localhost:3000/uploads/story_1/images/a.png')
        ).toBe('images/a.png');
    });

    it('retire un chemin /uploads/storyId/', () => {
        expect(toRelativeMediaPath('/uploads/story_9/images/b.png')).toBe('images/b.png');
    });
});
