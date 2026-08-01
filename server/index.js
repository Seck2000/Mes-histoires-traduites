// ==========================================
// IMPORTATION DES MODULES
// ==========================================
require('dotenv').config();

const express = require('express'); // Le framework principal pour créer le serveur web
const { pool, healthCheck } = require('./db');
const cors = require('cors'); // Autorise la communication entre notre client React et ce serveur
const multer = require('multer'); // Outil pour gérer l'upload de fichiers (comme nos .zip)
const path = require('path'); // Outil pour manipuler les chemins de dossiers facilement
const fs = require('fs'); // "File System", pour lire, créer ou supprimer des fichiers
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const libraryRoutes = require('./routes/library');
const aiRoutes = require('./routes/ai');
const speechRoutes = require('./routes/speech');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');
const { storyMatchesAgeBand } = require('./utils/ageBands');
const { buildCorsOptions, getAllowedOrigins } = require('./utils/corsConfig');
const { createAvatarPublicBlockMiddleware } = require('./utils/avatarAccess');
const {
    findStoryJson,
    importStoryFolder,
    listStoriesFromDb,
} = require('./services/storyStore');
const {
    MAX_ZIP_BYTES,
    extractStoryZipSafely,
    isZipUpload,
} = require('./services/safeZipExtract');

// Initialisation de l'application
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// CONFIGURATION (Middlewares)
// ==========================================
// CORS restreint : uniquement les origines listées dans CORS_ORIGINS (voir .env.example)
app.use(cors(buildCorsOptions()));
app.use(express.json()); // Permet au serveur de comprendre les données JSON

// Images d'histoires : publiques. Avatars : bloqués ici → route auth /api/auth/me/avatar/file
app.use(
    '/uploads',
    createAvatarPublicBlockMiddleware(),
    express.static(path.join(__dirname, 'uploads'))
);

// Configuration de Multer : ZIP histoires uniquement, taille plafonnée
const TEMP_UPLOADS_DIR = path.join(__dirname, 'temp_uploads');
if (!fs.existsSync(TEMP_UPLOADS_DIR)) {
    fs.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
}

const upload = multer({
    dest: TEMP_UPLOADS_DIR,
    limits: { fileSize: MAX_ZIP_BYTES, files: 1 },
    fileFilter(_req, file, cb) {
        if (!isZipUpload(file)) {
            const error = new Error('Seuls les fichiers .zip sont acceptés.');
            error.code = 'ZIP_TYPE_INVALID';
            return cb(error);
        }
        cb(null, true);
    },
});

// Sécurité : On s'assure que le dossier 'uploads' existe au démarrage
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// ==========================================
// ROUTES (Les portes d'entrée de notre serveur)
// ==========================================

// Authentification (inscription, connexion, profil)
app.use('/api/auth', authRoutes);

// Administration (liste des utilisateurs, etc.)
app.use('/api/admin', adminRoutes);

// Données personnelles de lecture (progression, favoris, historique)
app.use('/api/library', libraryRoutes);

// Discussion IA en fin d'histoire
app.use('/api/ai', aiRoutes);

// Transcription vocale (Whisper)
app.use('/api/speech', speechRoutes);

// 0. Vérification de la connexion à PostgreSQL
app.get('/api/health/db', async (req, res) => {
    try {
        res.json(await healthCheck());
    } catch (error) {
        console.error('Erreur connexion base de données:', error);
        res.status(500).json({ ok: false, database: 'error', message: error.message });
    }
});

// Aperçu public pour la page d'accueil (Découvrir) — métadonnées + image de couverture uniquement
app.get('/api/stories/preview', async (req, res) => {
    try {
        const storyList = await listStoriesFromDb(pool);
        const preview = storyList.map((story) => {
            const firstScene = Array.isArray(story.scenes) ? story.scenes[0] : null;
            return {
                id: story.id,
                title: story.title,
                titleAr: story.titleAr || null,
                thumbnail: story.thumbnail || firstScene?.image || null,
                ageCategory: story.ageCategory || story.ageBand || null,
            };
        });
        return res.json(preview);
    } catch (error) {
        console.error('Erreur aperçu histoires:', error);
        return res.status(500).json({ error: 'Impossible de charger l’aperçu des histoires.' });
    }
});

// 1. ROUTE POUR RÉCUPÉRER LA LISTE DES HISTOIRES (GET)
// Source de vérité = PostgreSQL (tables Story / Scene). Images toujours dans uploads/.
// Admin = toute la bibliothèque ; enfant = uniquement sa tranche d'âge
app.get('/api/stories', authMiddleware, async (req, res) => {
    try {
        const storyList = await listStoriesFromDb(pool);

        if (req.user.role === 'admin') {
            return res.json(storyList);
        }

        const userResult = await pool.query(
            `SELECT p."ageBand"
             FROM "User" u
             LEFT JOIN "UserPreference" p ON p."userId" = u.id
             WHERE u.id = $1`,
            [req.user.id]
        );
        const bandId = userResult.rows[0]?.ageBand || null;

        if (!bandId) {
            return res.json([]);
        }

        const filtered = storyList.filter((story) => storyMatchesAgeBand(story, bandId));
        return res.json(filtered);
    } catch (error) {
        console.error('Erreur lecture histoires (BDD):', error);
        return res.status(500).json({ error: 'Impossible de charger les histoires.' });
    }
});

// 2. ROUTE POUR IMPORTER UNE NOUVELLE HISTOIRE ZIP (POST) — admin seulement
// Extraction contrôlée (taille, types, anti path-traversal), puis catalogue en BDD.
app.post('/api/upload', authMiddleware, adminMiddleware, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (!err) return next();
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    error: `Le ZIP est trop volumineux (max ${Math.round(MAX_ZIP_BYTES / (1024 * 1024))} Mo).`,
                });
            }
            return res.status(400).json({ error: 'Envoi du fichier impossible.' });
        }
        if (err.code === 'ZIP_TYPE_INVALID') {
            return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message || 'Fichier invalide.' });
    });
}, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier envoyé' });
    }

    const tempPath = req.file.path;
    const storyId = `story_${Date.now()}`;
    const targetDir = path.join(UPLOADS_DIR, storyId);

    const cleanupTemp = () => {
        try {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        } catch {
            /* ignore */
        }
    };

    try {
        await extractStoryZipSafely(tempPath, targetDir);
        cleanupTemp();

        if (!findStoryJson(targetDir)) {
            fs.rmSync(targetDir, { recursive: true, force: true });
            return res.status(400).json({
                error: "Ce fichier n'est pas une histoire valide. Le fichier story.json est manquant.",
            });
        }

        await importStoryFolder(pool, UPLOADS_DIR, storyId);

        res.json({ success: true, message: 'Histoire importée avec succès', id: storyId });
    } catch (error) {
        console.error("Erreur lors de l'import d'histoire", error);
        cleanupTemp();
        if (fs.existsSync(targetDir)) {
            fs.rmSync(targetDir, { recursive: true, force: true });
        }
        const clientCodes = new Set([
            'INVALID_STORY',
            'STORY_JSON_MISSING',
            'ZIP_FORBIDDEN_FILE',
            'ZIP_UNSAFE_PATH',
            'ZIP_TOO_LARGE',
            'ZIP_TOO_MANY_FILES',
            'ZIP_EMPTY',
            'ZIP_TYPE_INVALID',
        ]);
        if (clientCodes.has(error.code)) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Erreur technique lors du traitement du fichier zip' });
    }
});

// ==========================================
// DÉMARRAGE DU SERVEUR
// ==========================================
const server = app.listen(PORT, () => {
    const origins = getAllowedOrigins();
    console.log(`Serveur backend démarré avec succès sur le port ${PORT}.`);
    console.log(
        origins.length
            ? `CORS origines autorisées: ${origins.join(', ')}`
            : 'CORS: aucune origine navigateur (définis CORS_ORIGINS en production).'
    );
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(
            `Le port ${PORT} est déjà utilisé. Arrêtez l'autre processus Node, ou changez PORT dans .env.`
        );
        console.error(`Astuce Windows : netstat -ano | findstr :${PORT}`);
    } else {
        console.error('Erreur démarrage serveur:', err);
    }
    process.exit(1);
});
