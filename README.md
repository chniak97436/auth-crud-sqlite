# Auth CRUD SQLite - Projet Next.js avec Authentification et CRUD

Ce projet est une application web full-stack construite avec **Next.js 16**, utilisant **Prisma** comme ORM pour interagir avec une base de données **SQLite**, et incluant un système d'authentification complet avec JWT. L'application permet aux utilisateurs de s'inscrire, se connecter, et gérer des posts (articles) via une API REST.

## Table des Matières
- [Installation et Configuration](#installation-et-configuration)
- [Structure du Projet](#structure-du-projet)
- [Explication Détaillée des Fichiers](#explication-détaillée-des-fichiers)
- [Commandes Utilisées](#commandes-utilisées)
- [Fonctionnalités](#fonctionnalités)
- [Technologies Utilisées](#technologies-utilisées)

## Installation et Configuration

### Prérequis
- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn** ou **pnpm** ou **bun**

### Étapes d'Installation

1. **Cloner ou créer le projet Next.js** :
   ```bash
   npx create-next-app@latest auth-crud-sqlite
   cd auth-crud-sqlite
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```
   Cette commande installe toutes les dépendances listées dans `package.json`.

3. **Configurer Prisma** :
   - Créer un fichier `.env` à la racine avec :
     ```
     DATABASE_URL="file:./dev.db"
     JWT_SECRET="votre_secret_jwt_super_securise"
     SMTP_USER="votre_email@gmail.com"
     SMTP_PASS="votre_mot_de_passe_app"
     ```
   - Initialiser Prisma :
     ```bash
     npx prisma init
     ```
   - Pousser le schéma vers la base de données :
     ```bash
     npx prisma db push
     ```
   - Générer le client Prisma :
     ```bash
     npx prisma generate
     ```

4. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur [http://localhost:3500](http://localhost:3500).

5. **(Optionnel) Ouvrir Prisma Studio** :
   ```bash
   npx prisma studio
   ```
   Interface graphique pour visualiser et modifier la base de données sur [http://localhost:5555](http://localhost:5555).

## Structure du Projet

```
auth-crud-sqlite/
├── app/                          # Dossier principal de Next.js (App Router)
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Routes d'authentification
│   │   │   ├── login/            # Connexion
│   │   │   ├── logout/           # Déconnexion
│   │   │   └── register/         # Inscription
│   │   └── posts/                # Routes pour les posts
│   │       ├── [id]/             # Route dynamique pour un post spécifique
│   │       └── route.jsx         # CRUD des posts
│   ├── globals.css               # Styles globaux
│   ├── layout.js                 # Layout principal
│   ├── page.js                   # Page d'accueil
│   ├── login/                    # Page de connexion
│   └── register/                 # Page d'inscription
├── lib/                          # Utilitaires et configurations
│   ├── auth.jsx                  # Fonctions d'authentification
│   ├── prisma.jsx                # Client Prisma
│   └── regex.jsx                 # Expressions régulières
├── prisma/                       # Configuration Prisma
│   ├── dev.db                    # Base de données SQLite
│   ├── migrations/               # Migrations de base de données
│   └── schema.prisma             # Schéma de la base de données
├── public/                       # Assets statiques
├── package.json                  # Dépendances et scripts
├── next.config.mjs               # Configuration Next.js
└── README.md                     # Ce fichier
```

## Explication Détaillée des Fichiers

### Configuration et Dépendances

#### `package.json`
Ce fichier définit le projet Node.js. Il contient :
- **name** : Nom du projet
- **version** : Version actuelle
- **scripts** : Commandes disponibles (dev, build, start, lint, format)
- **dependencies** : Bibliothèques nécessaires au runtime
  - `next` : Framework React pour le web
  - `@prisma/client` : Client pour interagir avec la base de données
  - `bcryptjs` : Pour hasher les mots de passe
  - `jsonwebtoken` : Pour créer et vérifier les tokens JWT
  - `js-cookie` : Pour gérer les cookies côté client
  - `nodemailer` : Pour envoyer des emails
- **devDependencies** : Outils de développement
  - `@biomejs/biome` : Linter et formateur de code
  - `tailwindcss` : Framework CSS utilitaire

#### `prisma/schema.prisma`
Définit la structure de la base de données :
- **datasource db** : Utilise SQLite comme base de données
- **generator client** : Génère le client Prisma
- **Modèle User** : Représente un utilisateur avec email, mot de passe hashé, nom, et relation avec les posts
- **Modèle Post** : Représente un article avec titre, contenu, statut de publication, et auteur

### Utilitaires (`lib/`)

#### `lib/auth.jsx`
Contient toutes les fonctions d'authentification :
- `hashPassword(password)` : Hash un mot de passe avec bcrypt (rend le mot de passe illisible)
- `verifyPassword(password, hashedPassword)` : Vérifie si un mot de passe correspond à son hash
- `generateToken(user)` : Crée un token JWT contenant l'ID et l'email de l'utilisateur, valable 7 jours
- `verifyToken(token)` : Vérifie et décode un token JWT, retourne les données utilisateur ou null si invalide

#### `lib/prisma.jsx`
Configure le client Prisma pour interagir avec la base de données :
- Utilise un singleton pour éviter de créer plusieurs connexions
- En développement, stocke l'instance globalement pour le hot reload

#### `lib/regex.jsx`
Contient des expressions régulières utilitaires :
- `emailRegex` : Valide le format d'une adresse email

### Pages et Composants (`app/`)

#### `app/layout.js`
Layout principal de l'application :
- Importe les polices Geist de Google Fonts
- Définit les métadonnées de base (titre, description)
- Enveloppe toutes les pages avec le HTML de base

#### `app/page.js`
Page d'accueil par défaut :
- Affiche un message de bienvenue
- Contient des liens vers la documentation Next.js
- Vérifie potentiellement l'authentification (imports présents mais non utilisés)

#### `app/globals.css`
Styles globaux :
- Importe Tailwind CSS
- Définit des variables CSS pour les thèmes clair/sombre
- Configure la police et les couleurs de base

#### `app/login/page.jsx`
Page de connexion côté client :
- Formulaire avec champs email et mot de passe
- Envoie une requête POST à `/api/auth/login`
- Gère les erreurs et redirige vers la page d'accueil en cas de succès

#### `app/register/page.jsx`
Page d'inscription côté client :
- Formulaire avec nom, email, mot de passe et confirmation
- Valide que les mots de passe correspondent
- Envoie une requête POST à `/api/auth/register`
- Envoie un email de bienvenue et redirige vers la page de connexion

### API Routes (`app/api/`)

#### `app/api/auth/register/route.jsx`
API pour l'inscription :
- Reçoit POST avec email, password, name
- Valide les données et vérifie que l'email n'existe pas
- Hash le mot de passe et crée l'utilisateur en base
- Génère un token JWT et le stocke dans un cookie
- Envoie un email de bienvenue avec Nodemailer

#### `app/api/auth/login/route.jsx`
API pour la connexion :
- Reçoit POST avec email et password
- Trouve l'utilisateur par email
- Vérifie le mot de passe avec bcrypt
- Génère un token JWT et le stocke dans un cookie
- Retourne les données utilisateur (sans mot de passe)

#### `app/api/auth/logout/route.jsx`
API pour la déconnexion :
- Supprime le cookie contenant le token JWT

#### `app/api/posts/route.jsx`
API CRUD pour les posts :
- **GET** : Récupère tous les posts avec les informations de l'auteur, triés par date décroissante
- **POST** : Crée un nouveau post (nécessite authentification via token JWT)
  - Vérifie le token, trouve l'utilisateur
  - Crée le post en base avec l'auteur associé

#### `app/api/posts/[id]/route.jsx`
API pour un post spécifique :
- **GET** : Devrait récupérer un post par son ID (non implémenté)
- **PUT** : Devrait modifier un post (non implémenté)
- **DELETE** : Devrait supprimer un post (non implémenté)

## Commandes Utilisées

Voici un résumé des commandes exécutées dans le terminal :

1. `npm run dev` : Lance le serveur de développement sur le port 3500
2. `npx prisma migrate dev --name init` : Crée une migration Prisma (base déjà synchronisée)
3. `npx prisma generate` : Génère le client Prisma pour interagir avec la base
4. `npx prisma db push` : Applique le schéma Prisma à la base de données SQLite
5. `npx prisma studio` : Ouvre une interface graphique pour la base de données
6. `npm install` : Installe les dépendances (déjà à jour)
7. `npx prisma db seed` : Tente de peupler la base avec des données de test (pas de script de seed configuré)
8. `npm run build` : Compile l'application pour la production
9. `npm run start` : Tente de lancer l'application en production (erreur de port)
10. `npm run lint` : Vérifie le code avec Biome (trouve des imports inutilisés)
11. `npm run format` : Formate automatiquement le code

## Fonctionnalités

### Authentification
- ✅ Inscription avec validation email et hashage de mot de passe
- ✅ Connexion avec vérification des identifiants
- ✅ Déconnexion
- ✅ Protection des routes API avec JWT
- ✅ Stockage du token dans les cookies
- ✅ Envoi d'email de bienvenue lors de l'inscription

### Gestion des Posts
- ✅ Récupération de tous les posts
- ✅ Création de nouveaux posts (authentification requise)
- ❌ Récupération d'un post spécifique
- ❌ Modification d'un post
- ❌ Suppression d'un post
- ❌ Interface utilisateur pour afficher/gérer les posts

### Interface Utilisateur
- ✅ Page d'inscription
- ✅ Page de connexion
- ✅ Page d'accueil basique
- ❌ Dashboard pour les utilisateurs connectés
- ❌ Liste des posts
- ❌ Formulaire de création de post
- ❌ Navigation entre les pages

## Technologies Utilisées

- **Next.js 16** : Framework React avec App Router pour les routes API et pages
- **React 19** : Bibliothèque pour construire l'interface utilisateur
- **Prisma** : ORM pour interagir avec la base de données
- **SQLite** : Base de données légère et fichier
- **bcryptjs** : Hashage sécurisé des mots de passe
- **jsonwebtoken** : Gestion des tokens d'authentification
- **nodemailer** : Envoi d'emails
- **Tailwind CSS** : Framework CSS utilitaire
- **Biome** : Outil de linting et formatage
- **js-cookie** : Gestion des cookies côté client

## Scripts Disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Construit l'application pour la production
- `npm run start` : Lance l'application en production
- `npm run lint` : Vérifie la qualité du code
- `npm run format` : Formate automatiquement le code

## Variables d'Environnement

Créer un fichier `.env` à la racine :
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="votre_secret_jwt_unique_et_securise"
SMTP_USER="votre_email@gmail.com"
SMTP_PASS="mot_de_passe_application_gmail"
```

## Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Configurer la base de données
npx prisma db push
npx prisma generate

# Lancer l'application
npm run dev
```

Visitez [http://localhost:3500](http://localhost:3500) pour voir l'application.
