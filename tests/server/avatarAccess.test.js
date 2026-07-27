import { describe, it, expect } from 'vitest';
import path from 'path';
import avatarAccess from '../../server/utils/avatarAccess.js';

const {
    isAvatarUploadPath,
    resolveOwnedAvatarFile,
} = avatarAccess;

describe('isAvatarUploadPath', () => {
    it('détecte /avatars', () => {
        expect(isAvatarUploadPath('/avatars/user-1.jpg')).toBe(true);
        expect(isAvatarUploadPath('avatars/user-1.jpg')).toBe(true);
    });

    it('laisse les histoires passer', () => {
        expect(isAvatarUploadPath('/story_1/images/scene1.png')).toBe(false);
        expect(isAvatarUploadPath('story_cendrillon/images/a.png')).toBe(false);
    });
});

describe('resolveOwnedAvatarFile', () => {
    const dir = path.join('C:', 'fake', 'avatars');
    const userId = 'user123';

    it('accepte un fichier appartenant à l’utilisateur', () => {
        const file = resolveOwnedAvatarFile(
            `/uploads/avatars/${userId}-999.jpg`,
            userId,
            dir
        );
        expect(file).toBe(path.resolve(dir, `${userId}-999.jpg`));
    });

    it('refuse un fichier d’un autre utilisateur', () => {
        expect(
            resolveOwnedAvatarFile('/uploads/avatars/other-1.jpg', userId, dir)
        ).toBeNull();
    });

    it('refuse path traversal', () => {
        expect(
            resolveOwnedAvatarFile('/uploads/avatars/../secret.txt', userId, dir)
        ).toBeNull();
    });
});
