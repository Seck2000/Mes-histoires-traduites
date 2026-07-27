# StoryTranslator — Ce qu’on a amélioré (version simple)

Ce document résume **les corrections importantes** faites sur le projet, pour que **tout le monde** puisse comprendre — même sans savoir coder.

En une phrase : on a rendu l’application **plus solide, plus sûre, et plus prête à être mise en ligne**.

---

## Le projet en 30 secondes

**StoryTranslator** est une application pour enfants qui apprend une langue en lisant des **histoires illustrées**.

- L’enfant lit, écoute la voix du navigateur, change de langue.
- À la fin, un **quiz / chat** (intelligence artificielle) pose des questions.
- Un **admin** peut ajouter des histoires (fichier ZIP).

Techniquement, il y a :
- un **site** (ce que l’on voit à l’écran),
- un **serveur** (le « cerveau » qui gère les comptes et les données),
- une **base de données** (où l’on range les infos de façon ordonnée).

---

## Les points traités (résumé)

| N° | En langage simple | Statut |
|----|-------------------|--------|
| 1 | Les histoires sont bien enregistrées en base de données | Fait |
| 2 | Les images ne sont plus bloquées sur « mon ordinateur seulement » | Fait |
| 3 | Une règle claire : qui parle à la base de données, et comment | Fait |
| 4 | Seul *notre* site a le droit d’appeler le serveur | Fait |
| 5 | Les photos de profil ne sont plus publiques | Fait |
| 6 | L’import d’histoires (ZIP) est sécurisé | Fait |
| 7 | Limiter l’usage de l’IA pour éviter les coûts excessifs | **Reporté** (à faire plus tard) |
| 8 | Le lecteur propose les 7 langues | Fait |
| 9 | Le code du lecteur est mieux organisé | Fait |
| 10 | Un guide pour mettre l’app en ligne | Fait |

---

## Point 1 — Les histoires en base de données

### Problème (avant)
Les histoires étaient surtout des **dossiers de fichiers** sur le disque du serveur.  
Comme une bibliothèque où les livres sont posés en vrac dans des cartons, sans vrai catalogue.

### Solution (maintenant)
Les informations des histoires (titre, scènes, textes, tranche d’âge…) sont dans **PostgreSQL**, la base de données.  
Les **images** restent des fichiers (photos), mais le « catalogue » est officiel et ordonné.

### Pourquoi c’est mieux
- On sait exactement quelles histoires existent.
- Les favoris et la progression restent cohérents.
- Plus facile à sauvegarder et à faire grandir le projet.

### Mot technique
On a créé des tables `Story` et `Scene`, et un script pour **importer** les anciennes histoires sans changer leurs identifiants (pour ne pas perdre les progrès déjà sauvés).

---

## Point 2 — Les liens des images (plus de « localhost »)

### Problème (avant)
Certaines images étaient adressées avec `localhost` (= « mon PC »).  
En ligne, ça revient à dire : « va chercher la photo chez moi à la maison » → **image cassée**.

### Solution (maintenant)
- En base : on stocke un **chemin relatif** (ex. `images/scene1.png`).
- Le site construit l’adresse complète avec l’URL réelle du serveur (`VITE_API_URL`).

### Pourquoi c’est mieux
L’appli peut tourner en local **et** sur Internet, sans recoller des adresses à la main.

---

## Point 3 — Une seule règle pour la base de données

### Problème (avant)
Deux outils se mélangeaient dans l’esprit du projet :
- **Prisma** (pour dessiner / faire évoluer la structure des tables),
- **`pg`** (pour lire et écrire les données au quotidien).

Sans règle claire, on risque la confusion et les erreurs.

### Solution (maintenant)
Règle simple, écrite dans le projet :
- **Prisma** = structure + migrations (évolution du schéma),
- **`pg`** = toutes les requêtes de l’application.

### Pourquoi c’est mieux
Tout le monde sait où regarder et quoi utiliser. Moins de risques de « double système ».

---

## Point 4 — CORS : qui a le droit de parler au serveur ?

### Problème (avant)
Le serveur acceptait les appels venant **de n’importe quel site web**.  
Un site malveillant aurait pu essayer d’utiliser ton API depuis le navigateur d’un utilisateur.

### Solution (maintenant)
On définit une liste d’adresses autorisées (`CORS_ORIGINS`), par exemple :
- en local : le site de développement,
- en production : uniquement l’URL officielle du front.

### Pourquoi c’est mieux
C’est comme une **liste d’invités** à la porte du serveur : les autres restent dehors.

---

## Point 5 — Photos de profil protégées

### Problème (avant)
Tout le dossier des fichiers uploadés était **public**, y compris les **avatars** (photos de profil). Quiconque connaissait (ou devinait) le lien pouvait les voir.

### Solution (maintenant) — compromis intelligent
- Images des **histoires** : restent accessibles (nécessaires pour lire).
- **Avatars** : plus d’accès public ; le site les charge via une route **protégée** (il faut être connecté).

### Pourquoi c’est mieux
On protège les données personnelles sans casser le lecteur d’histoires.

---

## Point 6 — Import ZIP sécurisé (espace admin)

### Problème (avant)
L’admin envoyait un ZIP et le serveur décompressait **presque tout**, sans assez de contrôles.  
Risques : fichier trop gros, « bombe » ZIP, fichiers dangereux, chemins qui sortent du bon dossier.

### Solution (maintenant)
Avant d’accepter l’histoire :
- taille limitée,
- uniquement `.zip`,
- uniquement `story.json` + images (png, jpg, etc.),
- interdiction des chemins douteux (`../`…),
- plafond sur le nombre et le volume des fichiers.

### Pourquoi c’est mieux
Même un compte admin ne peut plus (par erreur ou abus) saturer ou endommager facilement le serveur.

---

## Point 7 — Quota IA / Whisper *(pas encore fait)*

### Idée
Gemini (quiz) et Whisper (voix → texte) sont des services **payants**.  
Sans limite, trop d’utilisation peut faire monter la facture.

### Statut
**Reporté volontairement.** À faire plus tard : un plafond du type « X demandes par heure et par utilisateur ».

---

## Point 8 — Les 7 langues dans le lecteur

### Problème (avant)
L’app prévoyait 7 langues, mais le bouton du lecteur ne tournait que sur **3** (français, anglais, arabe).

### Solution (maintenant)
Le bouton parcourt **toutes** les langues : FR, EN, AR, ES, DE, IT, PT.

### Pourquoi c’est mieux
Cohérence avec le reste de l’application (profil, apprentissages, etc.).

---

## Point 9 — Code du lecteur mieux rangé

### Problème (avant)
Un très gros fichier (`App.jsx`) faisait presque tout : connexion, bibliothèque, lecteur, voix…

### Solution (maintenant)
On a **séparé** :
- l’application générale,
- le **lecteur** (`StoryPlayer`),
- la logique de **voix** (`useStorySpeech`).

### Pourquoi c’est mieux
Pour l’utilisateur : **aucun changement visible**.  
Pour l’équipe : plus facile à comprendre, corriger et faire évoluer sans tout casser.

---

## Point 10 — Guide de mise en ligne

### Problème (avant)
Le projet marchait bien en local, mais il manquait un mode d’emploi clair pour le **déployer** (Internet).

### Solution (maintenant)
Un document complet : **[DEPLOY.md](./DEPLOY.md)**  
Il explique, de A à Z :
- quoi héberger (site, serveur, base),
- quelles clés / secrets configurer,
- comment migrer la base,
- comment importer les histoires,
- une checklist de vérification,
- un exemple avec l’hébergeur Render.

### Pourquoi c’est mieux
On peut mettre l’appli en ligne **sans improvisation**, même en suivant le guide pas à pas.

---

## Ce que ça change pour un enfant / un parent

| Avant (risques) | Maintenant |
|-----------------|------------|
| Projet « fragile » pour une vraie mise en ligne | Base plus saine |
| Images parfois liées à l’ordinateur local | Images adaptées au vrai serveur |
| Sécurité trop ouverte (CORS, avatars, ZIP) | Contrôles renforcés |
| Langues incomplètes dans le lecteur | 7 langues disponibles |
| Peu de doc pour héberger | Guide de déploiement |

L’expérience de lecture (histoires, voix, quiz) **reste la même** — en mieux préparé pour l’avenir.

---

## Documents utiles dans le projet

| Fichier | Pour qui |
|---------|----------|
| `README.md` | Installer et lancer en local |
| `DEPLOY.md` | Mettre en production |
| **Ce fichier** | Comprendre les améliorations sans jargon |

---

## En une image mentale

Imagine une école :

1. **Catalogue** des livres bien rangé (point 1)  
2. **Adresses** correctes pour trouver les illustrations (point 2)  
3. **Règlement** clair pour le secrétariat / archives (point 3)  
4. **Entrée surveillée** : seuls les élèves de *cette* école (point 4)  
5. **Photos d’identité** pas affichées dans le couloir (point 5)  
6. **Colis** (ZIP) contrôlés à la réception (point 6)  
7. **Quota cantine IA** à prévoir plus tard (point 7)  
8. **Toutes les langues** du programme au tableau (point 8)  
9. **Classes mieux organisées** (point 9)  
10. **Mode d’emploi** pour ouvrir l’école ailleurs (point 10)  

---

*Document de vulgarisation des correctifs StoryTranslator — pour présentation, rapport ou transmission d’équipe.*
