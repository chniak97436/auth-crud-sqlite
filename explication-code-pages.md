# Explication du Code de Chaque Page (pour Novices)

Salut ! Maintenant, on va regarder le code de chaque page en détail. Je vais t'expliquer ligne par ligne ou section par section, comme si on lisait une recette de cuisine. Je vais utiliser des mots simples et des analogies. Rappelle-toi : chaque fichier est comme une pièce d'un puzzle qui s'emboîte avec les autres.

## 1. Page d'Accueil : `app/page.js`

Cette page est la porte d'entrée de ton site. C'est ce que voient les visiteurs quand ils arrivent sur `/`.

```javascript
import Link from 'next/link'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export default async function Home() {
  // On essaie de récupérer le cookie "token" (comme un badge d'accès)
  const token = (await cookies()).get('token')?.value

  // Si le badge existe, on le vérifie avec notre outil verifyToken
  const user = token ? verifyToken(token) : null

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Bienvenue sur Auth CRUD SQLite</h1>

      {user ? (
        // Si l'utilisateur est connecté, on lui dit bonjour
        <div>
          <p>Salut {user.email} ! Tu es connecté.</p>
          <Link href="/api/auth/logout" className="text-blue-500 underline">
            Se déconnecter
          </Link>
        </div>
      ) : (
        // Sinon, on lui propose de se connecter ou s'inscrire
        <div>
          <Link href="/login" className="text-blue-500 underline mr-4">
            Se connecter
          </Link>
          <Link href="/register" className="text-blue-500 underline">
            S'inscrire
          </Link>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl mb-2">Posts récents</h2>
        {/* Ici, on pourrait afficher la liste des posts, mais c'est pas encore fait */}
      </div>
    </div>
  )
}
```

**Explication :**
- **Imports** : On importe des outils (Link pour les liens, cookies pour lire les cookies, verifyToken pour vérifier l'utilisateur).
- **Fonction Home** : C'est la page principale. Elle est `async` car elle doit attendre de lire les cookies.
- **Vérification du token** : Comme un vigile qui vérifie ton badge à l'entrée.
- **Affichage conditionnel** : Si connecté, montre un message perso. Sinon, des liens pour se connecter.
- **Pourquoi ?** Cette page s'adapte selon si tu es connecté ou pas.

## 2. Page de Connexion : `app/login/page.jsx`

C'est la page avec le formulaire pour se connecter. Elle envoie les données à l'API.

```javascript
"use client"  // Dit à Next.js que c'est du code qui tourne dans le navigateur

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {
  // État pour stocker email et mot de passe (comme des variables qui changent)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [erreurMessage, setErreurMessage] = useState("")

  const router = useRouter()  // Outil pour changer de page

  // Fonction appelée quand on soumet le formulaire
  const formSubmit = async (e) => {
    e.preventDefault()  // Empêche la page de se recharger

    try {
      // Envoie les données à l'API /api/auth/login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)  // Convertit les données en JSON
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erreur || "Erreur inconnue")
      }

      // Si ça marche, on redirige vers l'accueil
      router.push("/")
      router.refresh()  // Rafraîchit la page pour voir les changements
    } catch (error) {
      setErreurMessage(error.message)  // Affiche l'erreur
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center">
      <form onSubmit={formSubmit} className="w-80 p-6 border rounded">
        <h1 className="text-2xl mb-4">Connexion</h1>

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 mb-2 w-full"
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="border p-2 mb-2 w-full"
          required
        />

        {erreurMessage && <p className="text-red-500 mb-2">{erreurMessage}</p>}

        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
          Se connecter
        </button>
      </form>
    </div>
  )
}
```

**Explication :**
- **"use client"** : Ce code tourne côté navigateur (pas serveur), car il gère des interactions utilisateur.
- **useState** : Garde en mémoire les valeurs du formulaire.
- **formSubmit** : Envoie les données à l'API et gère la réponse (succès ou erreur).
- **fetch** : Comme un messager qui va porter ta lettre (requête) à l'API.
- **Pourquoi ?** Permet à l'utilisateur de taper ses infos et de se connecter sans recharger la page.

## 3. Page d'Inscription : `app/register/page.jsx`

Similaire à la connexion, mais pour créer un compte.

```javascript
"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: ""
  })
  const [erreurMessage, setErreurMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const formSubmit = async (e) => {
    e.preventDefault()

    // Vérifie que les mots de passe correspondent
    if (formData.password !== formData.passwordConfirm) {
      setErreurMessage("Les mots de passe ne correspondent pas")
      return
    }

    setLoading(true)  // Montre qu'on travaille

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erreur || "Erreur inconnue")
      }

      // Succès : redirige vers login
      router.push("/login")
      router.refresh()
    } catch (error) {
      setErreurMessage(error.message)
    } finally {
      setLoading(false)  // Arrête le chargement
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center">
      <form onSubmit={formSubmit} className="w-80 p-6 border rounded">
        <h1 className="text-3xl mb-4">Inscription</h1>

        <input
          type="text"
          placeholder="Nom"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 mb-2 w-full"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 mb-2 w-full"
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="border p-2 mb-4 w-full"
          required
        />

        <input
          type="password"
          placeholder="Confirmer mot de passe"
          value={formData.passwordConfirm}
          onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
          className="border p-2 mb-4 w-full"
          required
        />

        {erreurMessage && (
          <p className="text-red-600 mb-4 py-2 px-2 bg-red-200 border border-red-900">
            {erreurMessage}
          </p>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full"
          disabled={loading}
        >
          {loading ? "Inscription..." : "S'inscrire"}
        </button>

        <p className="mt-4">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-blue-500 underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  )
}
```

**Explication :**
- Similaire à login, mais avec plus de champs (nom, confirmation mot de passe).
- **Validation côté client** : Vérifie que les mots de passe sont identiques avant d'envoyer.
- **Loading state** : Désactive le bouton pendant l'envoi pour éviter les doubles clics.
- **Pourquoi ?** Crée un nouveau compte utilisateur via l'API.

## 4. API Connexion : `app/api/auth/login/route.jsx`

C'est le "serveur" derrière la page de connexion. Il vérifie les identifiants.

```javascript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request) {
  try {
    const { email, password } = await request.json()  // Récupère les données envoyées

    // Vérifications de base
    if (!email || !password) {
      return NextResponse.json({ erreur: "Tous les champs sont obligatoires" }, { status: 400 })
    }

    // Cherche l'utilisateur dans la base
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true }
    })

    if (!user) {
      return NextResponse.json({ erreur: "Identifiants invalides" }, { status: 400 })
    }

    // Vérifie le mot de passe
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ erreur: "Identifiants invalides" }, { status: 400 })
    }

    // Crée l'utilisateur sans le mot de passe (pour la sécurité)
    const { password: _, ...userWithoutPassword } = user

    // Génère un token
    const token = generateToken(userWithoutPassword)

    // Réponse avec les données utilisateur
    const response = NextResponse.json({
      message: "Connexion réussie",
      user: userWithoutPassword,
      token
    }, { status: 200 })

    // Ajoute un cookie avec le token
    response.cookies.set("token", token, {
      httpOnly: false,  // Accessible côté client (pour JS)
      maxAge: 60 * 60 * 24 * 7  // 7 jours
    })

    return response
  } catch (error) {
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 })
  }
}
```

**Explication :**
- **POST** : Traite les requêtes de type POST (envoi de données).
- **Validation** : Vérifie que email et password sont fournis.
- **Recherche DB** : Utilise Prisma pour trouver l'utilisateur.
- **Vérif mot de passe** : Compare avec le hash stocké.
- **Token** : Crée un badge et le met dans un cookie.
- **Pourquoi ?** Authentifie l'utilisateur et lui donne accès aux parties protégées.

## 5. API Déconnexion : `app/api/auth/logout/route.jsx`

Simple : supprime le cookie.

```javascript
import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ message: "Déconnexion réussie" })

  // Supprime le cookie token
  response.cookies.set("token", "", { maxAge: 0, httpOnly: false })

  return response
}
```

**Explication :** Met le cookie à vide et expire immédiatement. Comme retirer le badge d'accès.

## 6. API Inscription : `app/api/auth/register/route.jsx`

Crée un nouveau compte.

```javascript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, generateToken } from "@/lib/auth"
import { emailRegex } from "@/lib/regex"
import nodemailer from "nodemailer"

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    // Validations
    if (!name || !email || !password) {
      return NextResponse.json({ erreur: "Tous les champs sont requis" }, { status: 400 })
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ erreur: "Email invalide" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ erreur: "Mot de passe trop court" }, { status: 400 })
    }

    // Vérifie si email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ erreur: "Email déjà utilisé" }, { status: 400 })
    }

    // Hash le mot de passe
    const hashedPassword = await hashPassword(password)

    // Crée l'utilisateur
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })

    // Génère token
    const token = generateToken({ id: user.id, email: user.email, name: user.name })

    // Envoie email de bienvenue
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Bienvenue !',
      text: `Salut ${name}, ton compte est créé !`
    })

    // Réponse avec cookie
    const response = NextResponse.json({
      message: "Inscription réussie",
      user: { id: user.id, email: user.email, name: user.name }
    }, { status: 201 })

    response.cookies.set("token", token, { httpOnly: false, maxAge: 60*60*24*7 })

    return response
  } catch (error) {
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 })
  }
}
```

**Explication :**
- **Validations** : Vérifie format email, longueur mot de passe, unicité email.
- **Hash** : Rend le mot de passe sécurisé.
- **Création DB** : Ajoute l'utilisateur avec Prisma.
- **Email** : Envoie un message de bienvenue.
- **Token** : Connecte automatiquement après inscription.

## 7. API Posts : `app/api/posts/route.jsx`

Gère la liste des posts.

```javascript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  // Récupère tous les posts avec auteur, triés par date
  const posts = await prisma.post.findMany({
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(posts)
}

export async function POST(request) {
  try {
    // Récupère le token du cookie
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Trouve l'utilisateur
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Récupère titre et contenu
    const { title, content } = await request.json()
    if (!title || !content) {
      return NextResponse.json({ error: 'Titre et contenu requis' }, { status: 400 })
    }

    // Crée le post
    const newPost = await prisma.post.create({
      data: { title, content, authorId: user.id },
      include: { author: { select: { id: true, name: true, email: true } } }
    })

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

**Explication :**
- **GET** : Liste publique des posts (pas besoin d'être connecté).
- **POST** : Crée un post, mais vérifie le token (authentification requise).
- **Vérification** : S'assure que l'utilisateur existe et est connecté.

## 8. API Post Spécifique : `app/api/posts/[id]/route.jsx`

Pour un post individuel (pas encore implémenté).

```javascript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request, { params }) {
  const { id } = params
  // TODO: Implémenter la récupération d'un post par ID
  return NextResponse.json({ message: "Pas encore fait" })
}
```

**Explication :** Placeholder pour lire/modifier/supprimer un post spécifique. `[id]` est dynamique (change selon l'URL).

Voilà ! Maintenant tu comprends comment chaque page fonctionne. C'est comme un orchestre : chaque instrument (fichier) joue sa partie pour créer la musique (l'app). Si tu veux modifier quelque chose, commence petit et teste !
