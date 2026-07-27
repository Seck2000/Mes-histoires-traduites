import { describe, it, expect } from 'vitest';
import path from 'path';
import os from 'os';
import safeZip from '../../server/services/safeZipExtract.js';

const {
    shouldSkipZipEntry,
    isAllowedStoryZipEntry,
    resolveSafeExtractPath,
    isZipUpload,
} = safeZip;

describe('shouldSkipZipEntry', () => {
    it('ignore __MACOSX et .DS_Store', () => {
        expect(shouldSkipZipEntry('__MACOSX/._story.json')).toBe(true);
        expect(shouldSkipZipEntry('images/.DS_Store')).toBe(true);
    });

    it('garde les fichiers utiles', () => {
        expect(shouldSkipZipEntry('story.json')).toBe(false);
        expect(shouldSkipZipEntry('images/scene1.png')).toBe(false);
    });
});

describe('isAllowedStoryZipEntry', () => {
    it('autorise story.json et images', () => {
        expect(isAllowedStoryZipEntry('story.json')).toBe(true);
        expect(isAllowedStoryZipEntry('pack/story.json')).toBe(true);
        expect(isAllowedStoryZipEntry('images/a.PNG')).toBe(true);
        expect(isAllowedStoryZipEntry('images/a.webp')).toBe(true);
    });

    it('refuse les autres types', () => {
        expect(isAllowedStoryZipEntry('malware.exe')).toBe(false);
        expect(isAllowedStoryZipEntry('notes.txt')).toBe(false);
        expect(isAllowedStoryZipEntry('config.json')).toBe(false);
    });
});

describe('resolveSafeExtractPath', () => {
    const target = path.join(os.tmpdir(), 'story-zip-test');

    it('résout un chemin relatif sûr', () => {
        const dest = resolveSafeExtractPath(target, 'images/scene1.png');
        expect(dest).toBe(path.resolve(target, 'images', 'scene1.png'));
    });

    it('refuse le traversal', () => {
        expect(() => resolveSafeExtractPath(target, '../secret.txt')).toThrow(/traversal|interdit/i);
        expect(() => resolveSafeExtractPath(target, 'images/../../etc/passwd')).toThrow();
    });

    it('refuse les chemins absolus', () => {
        expect(() => resolveSafeExtractPath(target, '/etc/passwd')).toThrow();
    });
});

describe('isZipUpload', () => {
    it('accepte .zip', () => {
        expect(isZipUpload({ originalname: 'histoire.zip', mimetype: 'application/octet-stream' })).toBe(true);
        expect(isZipUpload({ originalname: 'x.bin', mimetype: 'application/zip' })).toBe(true);
    });

    it('refuse le reste', () => {
        expect(isZipUpload({ originalname: 'photo.png', mimetype: 'image/png' })).toBe(false);
    });
});
