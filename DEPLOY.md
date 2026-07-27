# Déploiement StoryTranslator — guide A → Z

Ce document explique **comment passer du projet local à une version en ligne**, de façon reproductible.

Le dépôt a déjà une **CI** (tests Vitest). Il n’y a **pas encore de CD** automatique : le déploiement se fait manuellement (ou via le dashboard de ton hébergeur) en suivant ce guide.

---

## Table des matières

1. [Vue d’ensemble](#1-vue-densemble)
2. [Prérequis](#2-prérequis)
3. [Choisir une architecture](#3-choisir-une-architecture)
4. [Variables d’environnement](#4-variables-denvironnement)
5. [Préparer le code en local](#5-préparer-le-code-en-local)
6. [Base de données PostgreSQL](#6-base-de-données-postgresql)
7. [Déployer l’API (backend)](#7-déployer-lapi-backend)
8. [Importer les histoires](#8-importer-les-histoires)
9. [Déployer le front (client)](#9-déployer-le-front-client)
10. [Configurer CORS et URLs](#10-configurer-cors-et-urls)
11. [Créer le compte admin](#11-créer-le-compte-admin)
12. [Vérifications de mise en ligne](#12-vérifications-de-mise-en-ligne)
13. [Exemple concret : Render](#13-exemple-concret-render)
14. [Stockage des images (point critique)](#14-stockage-des-images-point-critique)
15. [CI / CD (optionnel ensuite)](#15-ci--cd-optionnel-ensuite)
16. [Dépannage](#16-dépannage)
17. [Checklist finale](#17-checklist-finale)

---

## 1. Vue d’ensemble

StoryTranslator = **3 briques** :

| Brique | Rôle | Techno |
|--------|------|--------|
| **Client** | Interface React | Vite → build statique (`client/dist`) |
| **API** | Auth, histoires, IA, Whisper | Express (`server/`) |
| **PostgreSQL** | Users, favoris, progression, catalogue `Story` / `Scene` | Prisma migrations + `pg` |

Les **images** des histoires restent dans `server/uploads/<storyId>/` (fichiers).  
Les **avatars** sont dans `server/uploads/avatars/` mais servis uniquement via l’API authentifiée.

```text
Navigateur
   │
   ├─ https://TON-FRONT…     (HTML/JS/CSS)
   │
   └─ https://TON-API…       (/api/*, /uploads/story_*)
         │
         ├─ PostgreSQL
         └─ disque uploads/  (+ Gemini + OpenAI)
```

---

## 2. Prérequis

- Compte GitHub (le code est déjà sur le dépôt)
- Node.js **22+** en local (pour builder)
- Un hébergeur pour l’API (ex. [Render](https://render.com), [Railway](https://railway.app), [Fly.io](https://fly.io))
- Un hébergeur pour le front **ou** le même service qui sert aussi `client/dist`
- Une base **PostgreSQL** managée (souvent fournie par le même hébergeur, ou [Neon](https://neon.tech), [Supabase](https://supabase.com))
- Clés API :
  - **Gemini** (Google AI Studio) → quiz / chat
  - **OpenAI** → Whisper (mode oral)
- Un secret JWT long et aléatoire (jamais committer)

---

## 3. Choisir une architecture

### Option A — Deux services (recommandée pour démarrer)

1. **Web Service** = API Express (`server/`)
2. **Static Site** = build Vite (`client/dist`)

Avantage : simple à comprendre, front et API séparés.  
À configurer : `VITE_API_URL` + `CORS_ORIGINS`.

### Option B — Un seul service

L’API Express sert aussi les fichiers du build React (`client/dist`).  
Avantage : une seule URL.  
Inconvénient : il faut un peu de code Express supplémentaire (`express.static` + fallback SPA) — **pas encore dans le repo** ; à ajouter si tu choisis cette option.

> Ce guide détaille surtout l’**option A**.

---

## 4. Variables d’environnement

### Backend (`server/.env` en local / secrets en prod)

| Variable | Obligatoire | Exemple prod | Rôle |
|----------|-------------|--------------|------|
| `DATABASE_URL` | oui | `postgresql://user:pass@host:5432/db?sslmode=require` | Connexion Postgres |
| `PORT` | souvent auto | `3000` | Port HTTP (souvent injecté par l’hébergeur) |
| `JWT_SECRET` | oui | chaîne longue aléatoire | Signature des tokens |
| `CORS_ORIGINS` | oui en prod | `https://ton-front.onrender.com` | Front(s) autorisés |
| `GEMINI_API_KEY` | oui pour le quiz | clé Google AI Studio | Chat IA |
| `GEMINI_CHAT_MODEL` | non | `gemini-2.5-flash` | Modèle Gemini |
| `OPENAI_API_KEY` | oui pour le micro | `sk-…` | Whisper |
| `WHISPER_MODEL` | non | `whisper-1` | Modèle Whisper |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | scripts admin | — | Scripts `ensureAdmin` |

Voir aussi `server/.env.example`.

### Frontend (build time — Vite)

| Variable | Obligatoire | Exemple prod | Rôle |
|----------|-------------|--------------|------|
| `VITE_API_URL` | oui | `https://ton-api.onrender.com` | Base URL de l’API **et** des images `/uploads` |

Voir `client/.env.example`.

> **Important :** `VITE_*` est **injecté au moment du `npm run build`**.  
> Si tu changes l’URL de l’API, tu dois **rebuilder** le client.

---

## 5. Préparer le code en local

```bash
# Racine
git pull
npm install

# Serveur
cd server
npm install

# Client
cd ../client
npm install
```

Lancer les tests avant de déployer :

```bash
# à la racine
npm test
```

Build du client (smoke test) :

```bash
cd client
# crée un .env.production.local temporaire si besoin
echo VITE_API_URL=https://TON-API.exemple.com > .env.production.local
npm run build
# → génère client/dist
```

---

## 6. Base de données PostgreSQL

1. Crée une instance Postgres managée.
2. Copie l’URL de connexion → `DATABASE_URL`  
   (souvent avec `?sslmode=require` en cloud).
3. Depuis une machine qui a accès au réseau de la BDD (ton PC ou un job de deploy) :

```bash
cd server
# DATABASE_URL doit pointer vers la BDD PROD
npx prisma migrate deploy
```

Cela applique toutes les migrations dans `server/prisma/migrations/`  
(y compris les tables `Story` / `Scene`).

**Ne pas** utiliser `prisma migrate dev` en production.

Vérifier :

```bash
# optionnel
npx prisma studio
# ou endpoint santé une fois l’API up :
# GET https://TON-API/api/health/db
```

---

## 7. Déployer l’API (backend)

### Réglages typiques du service

| Setting | Valeur |
|---------|--------|
| Root / Workdir | `server` |
| Build command | `npm install && npx prisma generate` |
| Start command | `npm start` (= `node index.js`) |
| Node | 22.x |

### Secrets à coller dans le dashboard

- `DATABASE_URL`
- `JWT_SECRET` (génère une valeur unique, ex. 64 caractères)
- `CORS_ORIGINS` (URL HTTPS du front, sans slash final)
- `GEMINI_API_KEY`, `GEMINI_CHAT_MODEL`
- `OPENAI_API_KEY`, `WHISPER_MODEL`

### Disque / fichiers

Le dossier `server/uploads/` doit **survivre** aux redémarrages :

- Sur Render : attache un **Persistent Disk** monté sur `/opt/render/project/src/server/uploads` (chemin exact selon la doc Render), **ou**
- Prévoir plus tard un stockage objet (S3, etc.).

Sans disque persistant, **les images d’histoires disparaissent** à chaque redeploy.

### Après le premier démarrage

1. Ouvre `https://TON-API/api/health/db` → `{ "ok": true, ... }`
2. Les routes `/api/*` renvoient `401` sans token (normal).

---

## 8. Importer les histoires

Le catalogue est en **PostgreSQL** ; les images sur **disque**.

### Première mise en ligne

Option 1 — depuis une machine avec accès au serveur / au disque :

```bash
cd server
# DATABASE_URL = prod
# uploads/ déjà présent avec les dossiers story_*
npm run db:migrate-stories
```

Option 2 — connecte-toi en **admin** sur le front prod et utilise **Import ZIP**  
(chaque ZIP valide crée un dossier + une ligne en BDD).

Les ZIPs de référence locaux sont dans `server/histoire_*` (ex. `histoire_lina/histoire_lina.zip`).

### Mises à jour suivantes

- Nouvelles histoires → import ZIP admin **ou** script de seed + `db:migrate-stories`
- Changement de schéma → `npx prisma migrate deploy` puis redémarrage API

---

## 9. Déployer le front (client)

### Build

```bash
cd client
# Variable connue AU BUILD :
export VITE_API_URL=https://TON-API.onrender.com   # Linux/macOS
# PowerShell :
# $env:VITE_API_URL="https://TON-API.onrender.com"

npm install
npm run build
```

### Hébergement static

Sur Vercel / Netlify / Render Static :

| Setting | Valeur |
|---------|--------|
| Root | `client` |
| Build | `npm install && npm run build` |
| Publish / Output | `dist` |
| Env | `VITE_API_URL=https://TON-API…` |

SPA : si tu ajoutes un routeur plus tard, configure le fallback vers `index.html`.  
Aujourd’hui la navigation est en état React (pas de react-router) : un seul `index.html` suffit.

---

## 10. Configurer CORS et URLs

Après avoir les deux URLs HTTPS :

1. **API** — `CORS_ORIGINS` = URL exacte du front  
   Ex. `https://storytranslator-web.onrender.com`  
   Plusieurs origines : séparées par des virgules, sans espaces superflus.

2. **Client** — `VITE_API_URL` = URL exacte de l’API  
   Ex. `https://storytranslator-api.onrender.com`  
   Puis **rebuild** + redeploy du front.

3. Redémarre l’API pour recharger `CORS_ORIGINS`.

Au boot, le serveur loggue les origines CORS autorisées.

---

## 11. Créer le compte admin

En local / avec `DATABASE_URL` pointant sur la prod (si ton IP est autorisée) :

```bash
cd server
# ADMIN_EMAIL et ADMIN_PASSWORD dans .env
node scripts/ensureAdmin.js
```

Sinon : inscris un compte via l’UI, puis :

```bash
node scripts/promoteAdmin.js
# (selon le script : passer l’email en argument si prévu)
```

Vérifie les scripts dans `server/scripts/` pour les arguments exacts.

---

## 12. Vérifications de mise en ligne

Parcours manuel recommandé :

1. [ ] `GET /api/health/db` → OK  
2. [ ] Page d’accueil du front charge  
3. [ ] Inscription / connexion  
4. [ ] Bibliothèque affiche des histoires + miniatures  
5. [ ] Ouverture d’une histoire + TTS navigateur  
6. [ ] Changement de langue (7 codes)  
7. [ ] Favoris / reprise de progression  
8. [ ] Fin d’histoire → chat Gemini  
9. [ ] Mode oral → Whisper (si clé OpenAI OK)  
10. [ ] Admin → import ZIP d’une petite histoire test  
11. [ ] Avatar profil s’affiche (route protégée)  
12. [ ] Un autre domaine **ne** peut **pas** appeler l’API (CORS)

---

## 13. Exemple concret : Render

### 13.1 PostgreSQL

1. New → PostgreSQL  
2. Copie **Internal Database URL** (si API aussi sur Render) ou External  
3. Note-la comme `DATABASE_URL`

### 13.2 Web Service (API)

1. New → Web Service → connecte le repo GitHub  
2. Root Directory : `server`  
3. Build : `npm install && npx prisma generate`  
4. Start : `npm start`  
5. Ajoute les env vars (section 4)  
6. **Disk** : Persistent Disk → mount path vers le dossier `uploads` du service  
7. Deploy  
8. Dans un **Shell** Render (ou en local avec `DATABASE_URL` prod) :

```bash
npx prisma migrate deploy
npm run db:migrate-stories   # si uploads déjà peuplé sur le disque
```

### 13.3 Static Site (front)

1. New → Static Site → même repo  
2. Root : `client`  
3. Build : `npm install && npm run build`  
4. Publish : `dist`  
5. Env : `VITE_API_URL=https://<ton-service-api>.onrender.com`  
6. Deploy  
7. Mets cette URL static dans `CORS_ORIGINS` de l’API → **Redeploy API**

### 13.4 Ordre conseillé

1. Postgres  
2. API (sans CORS final encore OK)  
3. Migrations + histoires  
4. Front avec `VITE_API_URL`  
5. Corriger `CORS_ORIGINS` + redéployer API  
6. Tests section 12  

---

## 14. Stockage des images (point critique)

| Approche | Quand |
|----------|--------|
| Disque persistant sur le serveur API | MVP / petit trafic |
| Object storage (S3, R2, etc.) + URLs en BDD | Prod sérieuse / multi-instances |

Aujourd’hui le code suppose un **filesystem local** sous `server/uploads/`.  
Si tu scales à **plusieurs instances** API sans volume partagé, les images se cassent → passer au stockage objet (évolution future).

---

## 15. CI / CD (optionnel ensuite)

**Aujourd’hui :** `.github/workflows/tests.yml` → tests seulement.

**Plus tard (CD) :**

1. Workflow GitHub Actions :  
   - `npm test`  
   - build client avec `VITE_API_URL` (secret)  
   - deploy API (ex. Render Deploy Hook)  
   - `prisma migrate deploy` en job dédié  
2. Ne jamais committer `.env` (déjà dans `.gitignore`).

---

## 16. Dépannage

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| Front charge, API « Impossible de joindre le serveur » | Mauvaise `VITE_API_URL` ou API down | Vérifier URL + rebuild front |
| Erreur CORS dans la console | `CORS_ORIGINS` ≠ URL du front | Corriger + redémarrer API |
| Bibliothèque vide | Pas de rows `Story` ou mauvais `ageBand` | `db:migrate-stories` / import ZIP / préférences âge |
| Miniatures cassées | Disque `uploads` vide ou non persistant | Remonter les fichiers + volume |
| `/api/health/db` en erreur | `DATABASE_URL` / SSL / firewall | Tester la connexion Postgres |
| Quiz IA KO | `GEMINI_API_KEY` | Clé AI Studio |
| Micro KO | `OPENAI_API_KEY` / quota | Compte OpenAI |
| Avatar invisible | Token expiré ou 404 | Se reconnecter ; vérifier upload |

---

## 17. Checklist finale

Avant d’annoncer l’URL :

- [ ] Postgres migré (`migrate deploy`)  
- [ ] API HTTPS up + health DB OK  
- [ ] `JWT_SECRET` fort et unique  
- [ ] `CORS_ORIGINS` = front prod uniquement  
- [ ] Front buildé avec la bonne `VITE_API_URL`  
- [ ] Histoires présentes (BDD + images)  
- [ ] Compte admin créé  
- [ ] Parcours enfant + admin testés  
- [ ] Clés Gemini / OpenAI valides  
- [ ] Disque `uploads` persistant (ou plan S3)  
- [ ] Aucun secret dans Git  

### Points projet encore en attente (hors deploy)

- **Point 7** (volontairement reporté) : rate-limit / quota sur `/api/ai` et `/api/speech` avant une ouverture large au public — recommandé pour limiter les coûts.

---

## Références dans le dépôt

| Fichier | Contenu |
|---------|---------|
| `README.md` | Install locale |
| `server/.env.example` | Secrets API |
| `client/.env.example` | `VITE_API_URL` |
| `server/prisma/migrations/` | Schéma BDD |
| `server/scripts/migrateStoriesToDb.js` | Import catalogue |
| `server/scripts/ensureAdmin.js` | Admin |
| `.github/workflows/tests.yml` | CI tests |

---

*Document point 10 — stratégie de déploiement documentée (sans CD automatique pour l’instant).*
