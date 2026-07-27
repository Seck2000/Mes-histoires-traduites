const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

/** Taille max du ZIP uploadé (compressé). */
const MAX_ZIP_BYTES = 40 * 1024 * 1024; // 40 Mo

/** Taille max totale une fois décompressé (anti zip-bomb). */
const MAX_UNCOMPRESSED_BYTES = 120 * 1024 * 1024; // 120 Mo

/** Nombre max de fichiers extraits. */
const MAX_ENTRY_FILES = 200;

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

function makeZipError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
}

/**
 * Ignore les fichiers parasites macOS / cachés.
 */
function shouldSkipZipEntry(entryPath) {
    const normalized = String(entryPath || '').replace(/\\/g, '/');
    const parts = normalized.split('/').filter(Boolean);
    if (parts[0] === '__MACOSX') return true;
    const base = path.basename(normalized);
    if (base === '.DS_Store' || base.startsWith('._')) return true;
    return false;
}

/**
 * Autorise uniquement story.json et images courantes.
 */
function isAllowedStoryZipEntry(entryPath) {
    const normalized = String(entryPath || '').replace(/\\/g, '/');
    const base = path.basename(normalized).toLowerCase();
    const ext = path.extname(normalized).toLowerCase();

    if (base === 'story.json') return true;
    if (IMAGE_EXTENSIONS.has(ext)) return true;
    return false;
}

/**
 * Résout un chemin d'entrée ZIP sous targetDir, sans traversal.
 * @returns {string} chemin absolu sûr
 */
function resolveSafeExtractPath(targetDir, entryPath) {
    const normalized = String(entryPath || '').replace(/\\/g, '/');

    if (!normalized || normalized.includes('\0')) {
        throw makeZipError('ZIP_UNSAFE_PATH', 'Chemin de fichier ZIP invalide.');
    }

    if (path.isAbsolute(normalized) || /^[a-zA-Z]:/.test(normalized)) {
        throw makeZipError('ZIP_UNSAFE_PATH', `Chemin absolu interdit dans le ZIP: ${entryPath}`);
    }

    const parts = normalized.split('/').filter((part) => part && part !== '.');
    if (parts.some((part) => part === '..')) {
        throw makeZipError(
            'ZIP_UNSAFE_PATH',
            `Chemin interdit (traversal) dans le ZIP: ${entryPath}`
        );
    }

    const root = path.resolve(targetDir);
    const absolute = path.resolve(root, ...parts);
    if (absolute !== root && !absolute.startsWith(root + path.sep)) {
        throw makeZipError('ZIP_UNSAFE_PATH', `Chemin hors dossier cible: ${entryPath}`);
    }

    return absolute;
}

/**
 * Extrait un ZIP d'histoire de façon contrôlée dans targetDir.
 */
async function extractStoryZipSafely(zipPath, targetDir, options = {}) {
    const maxUncompressed = options.maxUncompressedBytes ?? MAX_UNCOMPRESSED_BYTES;
    const maxFiles = options.maxFiles ?? MAX_ENTRY_FILES;

    await fs.promises.mkdir(targetDir, { recursive: true });

    const directory = await unzipper.Open.file(zipPath);
    let uncompressedTotal = 0;
    let fileCount = 0;
    let extractedStoryJson = false;

    for (const entry of directory.files) {
        if (entry.type === 'Directory') continue;

        const entryPath = entry.path;
        if (shouldSkipZipEntry(entryPath)) continue;

        if (!isAllowedStoryZipEntry(entryPath)) {
            throw makeZipError(
                'ZIP_FORBIDDEN_FILE',
                `Fichier non autorisé dans le ZIP (uniquement story.json + images) : ${entryPath}`
            );
        }

        const size = Number(entry.uncompressedSize) || 0;
        uncompressedTotal += size;
        if (uncompressedTotal > maxUncompressed) {
            throw makeZipError(
                'ZIP_TOO_LARGE',
                'Archive trop volumineuse une fois décompressée (limite de sécurité).'
            );
        }

        fileCount += 1;
        if (fileCount > maxFiles) {
            throw makeZipError(
                'ZIP_TOO_MANY_FILES',
                `Trop de fichiers dans le ZIP (max ${maxFiles}).`
            );
        }

        const destPath = resolveSafeExtractPath(targetDir, entryPath);
        if (path.basename(destPath).toLowerCase() === 'story.json') {
            extractedStoryJson = true;
        }

        await fs.promises.mkdir(path.dirname(destPath), { recursive: true });

        await new Promise((resolve, reject) => {
            entry
                .stream()
                .pipe(fs.createWriteStream(destPath))
                .on('error', reject)
                .on('finish', resolve);
        });
    }

    if (fileCount === 0) {
        throw makeZipError('ZIP_EMPTY', 'Le ZIP ne contient aucun fichier utilisable.');
    }

    if (!extractedStoryJson) {
        // Peut être dans un sous-dossier : findStoryJson le vérifiera ensuite.
        // Ici on signale seulement si aucun story.json n'a été écrit.
        const hasJson = directory.files.some((entry) => {
            if (entry.type === 'Directory') return false;
            return path.basename(entry.path).toLowerCase() === 'story.json';
        });
        if (!hasJson) {
            throw makeZipError(
                'STORY_JSON_MISSING',
                "Ce fichier n'est pas une histoire valide. Le fichier story.json est manquant."
            );
        }
    }

    return {
        fileCount,
        uncompressedTotal,
    };
}

function isZipUpload(file) {
    if (!file) return false;
    const name = (file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    if (name.endsWith('.zip')) return true;
    return (
        mime === 'application/zip' ||
        mime === 'application/x-zip-compressed' ||
        mime === 'multipart/x-zip'
    );
}

module.exports = {
    MAX_ZIP_BYTES,
    MAX_UNCOMPRESSED_BYTES,
    MAX_ENTRY_FILES,
    IMAGE_EXTENSIONS,
    shouldSkipZipEntry,
    isAllowedStoryZipEntry,
    resolveSafeExtractPath,
    extractStoryZipSafely,
    isZipUpload,
    makeZipError,
};
