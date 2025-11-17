# Explication du Code Manquant (Fonctionnalités Non Implémentées)

Salut ! Dans le projet, certaines parties ne sont pas encore faites. C'est normal : on construit petit à petit, comme une maison qu'on agrandit au fur et à mesure. Je vais t'expliquer ce qui manque et comment on pourrait l'implémenter. Pour chaque partie, je donne le code complet avec des explications, comme si on codait ensemble.

## 1. API pour Récupérer un Post Spécifique : `app/api/posts/[id]/route.jsx` (GET)

Actuellement, c'est juste un placeholder. Voici comment l'implémenter pour lire un post par son ID.

```javascript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = params  // Récupère l'ID depuis l'URL (ex: /api/posts/123)

    // Convertit l'ID en nombre (Prisma attend un Int)
    const postId = parseInt(id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    // Cherche le post dans la base, avec l'auteur
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: { select: { id: true, name: true, email: true } } }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post non trouvé' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Les autres méthodes (PUT, DELETE) restent vides pour l'instant
export async function PUT() {
  return NextResponse.json({ message: "Pas encore implémenté" })
}

export async function DELETE() {
  return NextResponse.json({ message: "Pas encore implémenté" })
}
```

**Explication :**
- **GET** : Lit un post spécifique. Par exemple, si tu vas sur `/api/posts/5`, ça retourne le post numéro 5.
- **Validation ID** : S'assure que l'ID est un nombre valide.
- **Include author** : Montre qui a écrit le post.
- **Pourquoi utile ?** Pour afficher un article seul, comme sur un blog.

## 2. API pour Modifier un Post : `app/api/posts/[id]/route.jsx` (PUT)

Pour permettre à l'auteur de modifier son post.

```javascript
// Ajoute à la fonction PUT existante
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const postId = parseInt(id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    // Vérifie l'authentification
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifie que le post existe et appartient à l'utilisateur
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post non trouvé' }, { status: 404 })
    }

    if (post.authorId !== decoded.userId) {
      return NextResponse.json({ error: 'Pas le droit de modifier ce post' }, { status: 403 })
    }

    // Récupère les nouvelles données
    const { title, content, published } = await request.json()

    // Met à jour le post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { title, content, published },
      include: { author: { select: { id: true, name: true, email: true } } }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

**Explication :**
- **Authentification** : Vérifie que tu es connecté et propriétaire du post.
- **Autorisation** : Seul l'auteur peut modifier (pas les autres utilisateurs).
- **Update** : Change titre, contenu, ou statut de publication.
- **Pourquoi ?** Permet d'éditer ses propres articles.

## 3. API pour Supprimer un Post : `app/api/posts/[id]/route.jsx` (DELETE)

Pour supprimer un post (seulement par son auteur).

```javascript
// Ajoute à la fonction DELETE existante
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const postId = parseInt(id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    // Vérifie l'authentification
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifie que le post existe et appartient à l'utilisateur
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post non trouvé' }, { status: 404 })
    }

    if (post.authorId !== decoded.userId) {
      return NextResponse.json({ error: 'Pas le droit de supprimer ce post' }, { status: 403 })
    }

    // Supprime le post
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json({ message: 'Post supprimé' })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

**Explication :**
- Similaire à PUT, mais supprime au lieu de modifier.
- **Sécurité** : Vérifie que c'est bien ton post avant de le supprimer.
- **Pourquoi ?** Évite que quelqu'un supprime les posts des autres.

## 4. Page Dashboard pour Utilisateurs Connectés : `app/dashboard/page.jsx`

Une page personnelle pour voir et gérer ses posts.

```javascript
import Link from 'next/link'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function Dashboard() {
  // Vérifie la connexion
  const token = (await cookies()).get('token')?.value
  const user = token ? verifyToken(token) : null

  if (!user) {
    return (
      <div className="min-h-screen p-8">
        <p>Tu dois être connecté pour voir cette page.</p>
        <Link href="/login" className="text-blue-500 underline">Se connecter</Link>
      </div>
    )
  }

  // Récupère les posts de l'utilisateur
  const posts = await prisma.post.findMany({
    where: { authorId: user.userId },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Mon Dashboard</h1>
      <p>Salut {user.email} !</p>

      <div className="mt-8">
        <Link href="/posts/new" className="bg-blue-500 text-white px-4 py-2 rounded">
          Créer un nouveau post
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl mb-4">Mes Posts</h2>
        {posts.length === 0 ? (
          <p>Tu n'as pas encore de posts.</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id} className="border p-4 rounded">
                <h3 className="text-xl font-bold">{post.title}</h3>
                <p className="text-gray-600">{post.content.substring(0, 100)}...</p>
                <div className="mt-2">
                  <Link href={`/posts/${post.id}/edit`} className="text-blue-500 underline mr-4">
                    Modifier
                  </Link>
                  <button className="text-red-500 underline">Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
```

**Explication :**
- **Vérification** : Redirige si pas connecté.
- **Liste posts** : Montre seulement tes propres posts.
- **Actions** : Liens pour créer, modifier, supprimer.
- **Pourquoi ?** Interface personnelle pour gérer son contenu.

## 5. Page pour Créer un Post : `app/posts/new/page.jsx`

Formulaire pour écrire un nouvel article.

```javascript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewPost() {
  const [formData, setFormData] = useState({
    title: "",
    content: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création')
      }

      router.push('/dashboard')  // Redirige vers le dashboard
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Créer un nouveau post</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-4">
          <label className="block mb-2">Titre</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Contenu</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="border p-2 w-full h-40"
            required
          />
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Création...' : 'Créer le post'}
        </button>
      </form>
    </div>
  )
}
```

**Explication :**
- **Formulaire** : Champs pour titre et contenu.
- **Soumission** : Envoie à `/api/posts` (POST).
- **Redirection** : Après création, va au dashboard.
- **Pourquoi ?** Permet d'écrire de nouveaux articles.

## 6. Page pour Voir un Post : `app/posts/[id]/page.jsx`

Pour afficher un post seul.

```javascript
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getPost(id) {
  const res = await fetch(`http://localhost:3000/api/posts/${id}`)
  if (!res.ok) return null
  return res.json()
}

export default async function PostPage({ params }) {
  const post = await getPost(params.id)

  if (!post) {
    notFound()  // Page 404 si post pas trouvé
  }

  return (
    <div className="min-h-screen p-8">
      <Link href="/" className="text-blue-500 underline mb-4 inline-block">
        ← Retour à l'accueil
      </Link>

      <article className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-600 mb-2">Par {post.author.name}</p>
        <div className="prose">
          {post.content.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  )
}
```

**Explication :**
- **Fetch** : Appelle l'API pour récupérer le post.
- **Affichage** : Montre titre, auteur, contenu.
- **Navigation** : Lien pour revenir en arrière.
- **Pourquoi ?** Lecture détaillée d'un article.

Voilà ! Ces ajouts complètent l'application. Tu peux les implémenter un par un, tester à chaque fois. C'est comme ajouter des pièces à ta maison : ça devient plus confortable au fur et à mesure. Si tu as des questions, dis-moi !
