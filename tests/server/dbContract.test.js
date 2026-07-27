import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Garde-fou point 3 : le runtime ne doit pas importer Prisma Client.
 * Prisma reste réservé aux migrations / schéma.
 */
describe('contrat accès BDD', () => {
    const serverRoot = path.resolve('server');

    function listJsFiles(dir) {
        const out = [];
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.name === 'node_modules' || entry.name === 'uploads' || entry.name === 'temp_uploads') {
                continue;
            }
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                out.push(...listJsFiles(full));
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                out.push(full);
            }
        }
        return out;
    }

    it('aucun fichier serveur n’importe @prisma/client', () => {
        const files = listJsFiles(serverRoot);
        const offenders = [];
        const importRe =
            /require\s*\(\s*['"]@prisma\/client['"]\s*\)|from\s+['"]@prisma\/client['"]|new\s+PrismaClient\s*\(/;
        for (const file of files) {
            const text = fs.readFileSync(file, 'utf8');
            if (importRe.test(text)) {
                offenders.push(path.relative(serverRoot, file));
            }
        }
        expect(offenders).toEqual([]);
    });

    it('db.js exporte pool et query', async () => {
        // Import dynamique après les autres tests pour éviter dotenv côté collect
        const db = await import('../../server/db.js');
        expect(typeof db.pool?.query).toBe('function');
        expect(typeof db.query).toBe('function');
        expect(typeof db.healthCheck).toBe('function');
    });
});
