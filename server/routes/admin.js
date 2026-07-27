const express = require('express');
const { pool } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

function publicAdminUser(row) {
    const firstName = row.firstName ?? null;
    const lastName = row.lastName ?? null;
    const displayName =
        row.displayName ||
        [firstName, lastName].filter(Boolean).join(' ').trim() ||
        null;

    return {
        id: row.id,
        email: row.email,
        firstName,
        lastName,
        displayName,
        avatarUrl: row.avatarUrl ?? null,
        role: row.role || 'user',
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        preferences: {
            spokenLang: row.spokenLang || 'fr',
            learningLang: row.learningLang || 'en',
            level: row.level || 'debutant',
            defaultLang: row.defaultLang || row.learningLang || 'en',
            ageBand: row.ageBand || 'moyens',
        },
    };
}

// GET /api/admin/users — liste de tous les comptes inscrits
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.email, u."firstName", u."lastName", u."displayName",
                    u."avatarUrl", u.role, u."createdAt", u."updatedAt",
                    p."spokenLang", p."learningLang", p.level, p."defaultLang", p."ageBand"
             FROM "User" u
             LEFT JOIN "UserPreference" p ON p."userId" = u.id
             ORDER BY u."createdAt" DESC`
        );

        res.json({
            users: result.rows.map(publicAdminUser),
            total: result.rows.length,
        });
    } catch (error) {
        console.error('Erreur liste utilisateurs admin:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs.' });
    }
});

module.exports = router;
