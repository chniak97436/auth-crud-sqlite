# Guide pour Novice : Explication des Dossiers et Fonctions du Projet Next.js

Salut ! Ce guide est fait pour toi si tu es débutant en programmation. Je vais t'expliquer simplement chaque dossier et chaque fichier de ce projet Next.js. On va y aller étape par étape, comme si on construisait une maison : chaque pièce a un rôle important.

## 1. Le Dossier Racine (la base du projet)

C'est comme la fondation de la maison. Ici, on trouve les fichiers principaux qui font tourner tout le projet.

- **package.json** : C'est la liste des ingrédients (bibliothèques) dont le projet a besoin. Il dit aussi comment lancer le projet (`npm run dev` pour démarrer, `npm run build` pour construire, etc.).
- **next.config.mjs** : Configuration spéciale pour Next.js, comme les réglages pour les images ou les redirections.
- **README.md** : Le mode d'emploi du projet (tu l'as déjà lu !).
- **.env** : Fichier secret avec les mots de passe et clés (comme la base de données). Ne le partage jamais !
- **.gitignore** : Liste des fichiers qu'on ne veut pas envoyer sur Git (comme les secrets ou les gros fichiers temporaires).

## 2. Le Dossier `app/` (l'interface utilisateur)

C'est la partie visible de l'application, comme les pièces de la maison où les gens vivent. Ici, on met les pages web et les routes API.

### Sous-dossiers :
- **api/** : Les routes invisibles qui gèrent les données (comme un serveur derrière le rideau).
  - **auth/** : Tout ce qui concerne la connexion des utilisateurs.
    - **login/route.jsx** : Page pour se connecter (vérifie email et mot de passe).
    - **logout/route.jsx** : Page pour se déconnecter (supprime le cookie de session).
    - **register/route.jsx** : Page pour s'inscrire (crée un nouveau compte utilisateur).
  - **posts/** : Tout pour gérer les articles (posts).
    - **route.jsx** : Liste tous les posts (GET) ou en crée un nouveau (POST, mais seulement si connecté).
    - **[id]/route.jsx** : Pour un post spécifique (par exemple, lire, modifier ou supprimer un post par son numéro ID).

- **globals.css** : Les styles CSS globaux (couleurs, polices) pour toute l'app.
- **layout.js** : Le cadre commun à toutes les pages (comme le header et footer).
- **page.js** : La page d'accueil principale.
- **login/page.jsx** : La page web pour se connecter (avec formulaire).
- **register/page.jsx** : La page web pour s'inscrire (avec formulaire).

**Pourquoi ?** Next.js utilise le "App Router" : chaque fichier dans `app/` devient une page web ou une route API automatiquement.

## 3. Le Dossier `lib/` (les outils réutilisables)

C'est comme la boîte à outils du bricoleur. Ici, on met les fonctions qu'on utilise partout dans le projet.

- **auth.jsx** : Toutes les fonctions pour l'authentification.
  - `hashPassword()` : Rend le mot de passe illisible (pour la sécurité).
  - `verifyPassword()` : Vérifie si le mot de passe tapé est bon.
  - `generateToken()` : Crée un "badge" (token JWT) pour dire "tu es connecté".
  - `verifyToken()` : Vérifie si le badge est valide.

- **prisma.jsx** : Configure la connexion à la base de données (évite de se reconnecter tout le temps).

- **regex.jsx** : Contient des "règles" pour vérifier les emails (par exemple, "est-ce que c'est un vrai email ?").

**Pourquoi ?** Ces fonctions sont réutilisables, comme des outils qu'on sort quand on en a besoin.

## 4. Le Dossier `prisma/` (la base de données)

C'est comme le garage où on range les données. Prisma gère la base de données SQLite.

- **schema.prisma** : Le plan de la base de données (comme un blueprint). Définit les tables "User" (utilisateurs) et "Post" (articles), et leurs liens.
- **dev.db** : Le fichier de la base de données réelle (SQLite, léger comme une plume).
- **migrations/** : L'historique des changements de la base (comme des sauvegardes).

**Pourquoi ?** Prisma transforme les commandes en SQL automatiquement, sans écrire du code compliqué.

## 5. Le Dossier `public/` (les images et fichiers statiques)

C'est comme le placard pour les photos de famille. Ici, on met les images, icônes, etc., que les pages utilisent.

- Par exemple, des images pour le site.

**Pourquoi ?** Ces fichiers sont servis directement par le serveur web, sans traitement.

## 6. Le Dossier `node_modules/` (les bibliothèques installées)

C'est comme la bibliothèque municipale : toutes les bibliothèques (packages) installées par `npm install`. Ne touche pas à ça, c'est automatique !

## Comment ça marche ensemble ?

Imagine que tu visites le site :
1. Tu vas sur `/register` (dans `app/register/page.jsx`) : tu remplis le formulaire.
2. Le formulaire envoie les données à `/api/auth/register` (dans `app/api/auth/register/route.jsx`).
3. Cette route utilise `lib/auth.jsx` pour hasher le mot de passe et `lib/prisma.jsx` pour sauver dans la base (`prisma/`).
4. Si tout va bien, tu reçois un token (cookie) et un email de bienvenue.
5. Plus tard, tu peux créer un post via `/api/posts` (qui vérifie ton token).

C'est comme une chaîne : chaque dossier a son rôle, et ils se passent la balle pour que l'app fonctionne.

Si tu as des questions, n'hésite pas ! Ce projet est un bon début pour apprendre Next.js, Prisma et l'authentification.
