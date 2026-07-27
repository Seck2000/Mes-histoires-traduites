const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { toRelativeMediaPath } = require('../utils/mediaPaths');

/**
 * Localise story.json dans un dossier d'histoire (racine ou 1er sous-dossier).
 * @returns {{ jsonPath: string, rootDir: string } | null}
 */
function findStoryJson(storyDir) {
    const direct = path.join(storyDir, 'story.json');
    if (fs.existsSync(direct)) {
        return { jsonPath: direct, rootDir: '' };
    }

    if (!fs.existsSync(storyDir)) return null;

    const subDirs = fs
        .readdirSync(storyDir)
        .filter((name) => fs.statSync(path.join(storyDir, name)).isDirectory());

    for (const sub of subDirs) {
        const nested = path.join(storyDir, sub, 'story.json');
        if (fs.existsSync(nested)) {
            return { jsonPath: nested, rootDir: `${sub}/` };
        }
    }

    return null;
}

function withRootPrefix(value, rootDir) {
    return toRelativeMediaPath(value, rootDir);
}

/**
 * Transforme un story.json + id dossier en payload normalisé pour la BDD / l'API.
 */
function normalizeStoryFromJson(data, storyId, rootDir = '') {
    if (!data || !Array.isArray(data.scenes) || data.scenes.length === 0) {
        const error = new Error('Histoire invalide: scènes manquantes.');
        error.code = 'INVALID_STORY';
        throw error;
    }

    const scenes = data.scenes.map((scene, index) => {
        const text =
            scene?.text && typeof scene.text === 'object' && !Array.isArray(scene.text)
                ? scene.text
                : {};

        return {
            sceneKey: Number.isInteger(scene?.id) ? scene.id : index + 1,
            sortIndex: index,
            image: withRootPrefix(scene?.image, rootDir),
            characterName: scene?.character?.name || null,
            characterAvatar: withRootPrefix(scene?.character?.avatar, rootDir),
            text,
        };
    });

    return {
        id: storyId,
        title: (data.title && String(data.title).trim()) || storyId,
        titleAr: data.title_ar ? String(data.title_ar) : null,
        thumbnail: withRootPrefix(data.thumbnail, rootDir) || null,
        ageCategory: data.ageCategory || data.ageBand || null,
        scenes,
    };
}

/**
 * Lit un dossier uploads/<id> et renvoie le payload normalisé.
 */
function loadStoryFromFolder(uploadsDir, storyId) {
    const storyDir = path.join(uploadsDir, storyId);
    const located = findStoryJson(storyDir);
    if (!located) {
        const error = new Error('story.json introuvable.');
        error.code = 'STORY_JSON_MISSING';
        throw error;
    }

    const raw = JSON.parse(fs.readFileSync(located.jsonPath, 'utf8'));
    return normalizeStoryFromJson(raw, storyId, located.rootDir);
}

/**
 * Format API inchangé pour le client (lecteur, bibliothèque, chat).
 */
function toApiStory(storyRow, sceneRows) {
    return {
        id: storyRow.id,
        title: storyRow.title,
        title_ar: storyRow.titleAr ?? undefined,
        // Chemins relatifs uniquement — le client préfixe avec VITE_API_URL
        thumbnail: toRelativeMediaPath(storyRow.thumbnail) || null,
        ageCategory: storyRow.ageCategory ?? undefined,
        ageBand: storyRow.ageCategory ?? undefined,
        scenes: sceneRows.map((scene) => ({
            id: scene.sceneKey ?? scene.sortIndex + 1,
            image: toRelativeMediaPath(scene.image) || '',
            character: {
                name: scene.characterName || '',
                avatar: toRelativeMediaPath(scene.characterAvatar) || '',
            },
            text: scene.text || {},
        })),
    };
}

/**
 * Upsert histoire + remplacement des scènes (transaction).
 */
async function upsertStory(pool, story) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(
            `INSERT INTO "Story" (id, title, "titleAr", thumbnail, "ageCategory", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
             ON CONFLICT (id) DO UPDATE SET
               title = EXCLUDED.title,
               "titleAr" = EXCLUDED."titleAr",
               thumbnail = EXCLUDED.thumbnail,
               "ageCategory" = EXCLUDED."ageCategory",
               "updatedAt" = NOW()`,
            [
                story.id,
                story.title,
                story.titleAr,
                story.thumbnail,
                story.ageCategory,
            ]
        );

        await client.query(`DELETE FROM "Scene" WHERE "storyId" = $1`, [story.id]);

        for (const scene of story.scenes) {
            await client.query(
                `INSERT INTO "Scene"
                   (id, "storyId", "sceneKey", "sortIndex", image, "characterName", "characterAvatar", text)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
                [
                    crypto.randomUUID(),
                    story.id,
                    scene.sceneKey,
                    scene.sortIndex,
                    scene.image || null,
                    scene.characterName,
                    scene.characterAvatar || null,
                    JSON.stringify(scene.text || {}),
                ]
            );
        }

        await client.query('COMMIT');
        return story.id;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function importStoryFolder(pool, uploadsDir, storyId) {
    const story = loadStoryFromFolder(uploadsDir, storyId);
    await upsertStory(pool, story);
    return story;
}

/**
 * Liste toutes les histoires avec scènes, format API.
 */
async function listStoriesFromDb(pool) {
    const storiesResult = await pool.query(
        `SELECT id, title, "titleAr", thumbnail, "ageCategory", "createdAt", "updatedAt"
         FROM "Story"
         ORDER BY "createdAt" ASC, id ASC`
    );

    if (storiesResult.rows.length === 0) {
        return [];
    }

    const ids = storiesResult.rows.map((row) => row.id);
    const scenesResult = await pool.query(
        `SELECT id, "storyId", "sceneKey", "sortIndex", image, "characterName", "characterAvatar", text
         FROM "Scene"
         WHERE "storyId" = ANY($1::text[])
         ORDER BY "storyId" ASC, "sortIndex" ASC`,
        [ids]
    );

    const scenesByStory = new Map();
    for (const scene of scenesResult.rows) {
        if (!scenesByStory.has(scene.storyId)) {
            scenesByStory.set(scene.storyId, []);
        }
        scenesByStory.get(scene.storyId).push(scene);
    }

    return storiesResult.rows
        .map((row) => {
            const scenes = scenesByStory.get(row.id) || [];
            if (scenes.length === 0) return null;
            return toApiStory(row, scenes);
        })
        .filter(Boolean);
}

/**
 * Importe tous les dossiers valides de uploads/ vers la BDD (idempotent).
 */
async function migrateUploadsToDb(pool, uploadsDir) {
    if (!fs.existsSync(uploadsDir)) {
        return { imported: [], skipped: [], errors: [] };
    }

    const entries = fs.readdirSync(uploadsDir, { withFileTypes: true });
    const folders = entries
        .filter((entry) => entry.isDirectory() && entry.name !== 'avatars')
        .map((entry) => entry.name);

    const imported = [];
    const skipped = [];
    const errors = [];

    for (const folder of folders) {
        try {
            if (!findStoryJson(path.join(uploadsDir, folder))) {
                skipped.push({ id: folder, reason: 'story.json manquant' });
                continue;
            }
            await importStoryFolder(pool, uploadsDir, folder);
            imported.push(folder);
        } catch (error) {
            errors.push({ id: folder, message: error.message });
        }
    }

    return { imported, skipped, errors };
}

module.exports = {
    findStoryJson,
    withRootPrefix,
    normalizeStoryFromJson,
    loadStoryFromFolder,
    toApiStory,
    upsertStory,
    importStoryFolder,
    listStoriesFromDb,
    migrateUploadsToDb,
};
