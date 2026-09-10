# StoryTranslator

Application web d'apprentissage des langues pour enfants, par la lecture d'histoires illustrées.

**Dépôt :** [https://github.com/Seck2000/StoryTranslatorWeb](https://github.com/Seck2000/StoryTranslatorWeb)

## Fonctionnalités

- Lecture d'histoires multilingues (FR, EN, AR, ES, DE, IT, PT)
- Synthèse vocale du navigateur
- Comptes utilisateurs (JWT + bcrypt) et rôles `user` / `admin`
- Persistance PostgreSQL (profil, favoris, progression, historique)
- Interface selon la langue maternelle
- Quiz de fin d'histoire avec Gemini
- Mode oral avec transcription Whisper (OpenAI)
- Import d'histoires en ZIP (espace admin), extraction sécurisée
- Tests unitaires (Vitest) + CI GitHub Actions

## Prérequis

- Node.js 22+
- PostgreSQL
- Clés API : Gemini et OpenAI (Whisper)

## Installation

### 1. Base de données

Créer une base PostgreSQL, puis configurer `server/.env` à partir de `server/.env.example` :

```env
DATABASE_URL="postgresql://postgres:MOT_DE_PASSE@localhost:5432/StoryTranslatorDB"
PORT=3000
JWT_SECRET="une-longue-chaine-secrete"
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
GEMINI_API_KEY="votre-cle"
GEMINI_CHAT_MODEL="gemini-2.5-flash"
OPENAI_API_KEY="votre-cle-openai"
WHISPER_MODEL="whisper-1"
```

`CORS_ORIGINS` liste les URLs du front autorisées à appeler l’API. En production, mets l’URL réelle du site (pas `*`).

Puis, dans `server/` :

```bash
npx prisma migrate deploy
# ou : npx prisma db push

# Importer le catalogue d'histoires (dossiers uploads/ → tables Story / Scene)
npm run db:migrate-stories
```

Les métadonnées des histoires sont en PostgreSQL ; les images restent dans `server/uploads/<id>/`.

**Accès données (convention) :**
- **Prisma** → schéma + migrations (`server/prisma/`)
- **`pg`** → toutes les requêtes de l’API (`server/db.js`)

Ne pas introduire Prisma Client dans les routes sans décision d’équipe : un seul style runtime.

### 2. Serveur

```bash
cd server
npm install
node index.js
```

API : `http://localhost:3000`

### 3. Client

Configurer `client/.env` à partir de `client/.env.example` :

```env
VITE_API_URL=http://localhost:3000
```

En production, mets l’URL publique de ton API (pas `localhost`).

```bash
cd client
npm install
npm run dev
```

Interface : `http://localhost:5173` (ou le port indiqué par Vite)

Les images d’histoires sont des chemins relatifs en BDD ; le client les préfixe avec `VITE_API_URL`.  
Les **avatars** ne sont plus publics sous `/uploads/avatars` : ils passent par `GET /api/auth/me/avatar/file` (JWT).

## Tests

À la racine du projet :

```bash
npm install
npm test
```

## Intégration continue (CI)

Le workflow GitHub Actions (`.github/workflows/tests.yml`) lance automatiquement les tests Vitest à chaque `push` ou `pull request`.  
Il n'y a pas de déploiement automatique (pas de CD).

## Structure

```
StoryTranslatorWeb/
  client/          # React + Vite
  server/          # Express + pg (runtime) + Prisma (migrations)
  tests/           # Tests unitaires
  .github/         # CI GitHub Actions
```


