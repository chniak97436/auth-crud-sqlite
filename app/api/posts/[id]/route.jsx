import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import jwt from "jsonwebtoken"; // Changement : Import jwt pour utiliser verify au lieu de decode pour la sécurité

export async function GET(request, { params }) {
  try {
    const { id } = params; // Changement : params est déjà résolu dans Next.js 13+, pas besoin d'await

    const postId = parseInt(id); // Convertit la string en nombre pour Prisma
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }
    console.log(postId);

    // Cherche le post dans la base, avec l'auteur
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Ajoute à la fonction PUT existante
export async function PUT(request, { params }) {
  try {
    // Récupérer l'id en le destructurant et le parser pour devenir un entier
    const { id } = params; // Changement : params déjà résolu
    const postId = parseInt(id);
    console.log(postId);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 }); // Changement : Message en anglais pour cohérence
    }
    // Vérifie l'authentification token
    const token = request.cookies.get("token")?.value;
    console.log(token);
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 }); // Changement : Code 401 pour non autorisé
    }
    // Vérifie le token avec verify pour la sécurité
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Changement : Utilise verify au lieu de decode, nécessite JWT_SECRET
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    // Vérifie que le post existe et appartient à l'utilisateur connecté
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    // Vérifie que le post appartient à l'auteur
    if (post.authorId !== decodedToken.id) { // Changement : Comparaison correcte avec authorId et decodedToken.id
      return NextResponse.json({ error: "Forbidden: You can only update your own posts" }, { status: 403 });
    }
    // Récupère les nouvelles données title, content, published
    const { title, content, published } = await request.json();
    // Validation basique des données
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 }); // Changement : Validation ajoutée
    }
    // Met à jour le post dans la base
    const updatedPost = await prisma.post.update({ // Changement : Correction de la syntaxe Prisma
      where: { id: postId },
      data: { title, content, published },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    // Retourne le post mis à jour
    return NextResponse.json(updatedPost);
  } catch (err) {
    console.error("Error updating post:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 }); // Changement : Gestion d'erreur uniforme
  } finally {
    await prisma.$disconnect();
  }
}

// Ajoute à la fonction DELETE existante
export async function DELETE(request, { params }) {
  try {
    // Récupérer l'id en le destructurant et le parser pour devenir un entier
    const { id } = params; // Changement : params déjà résolu
    const postId = parseInt(id);
    console.log(postId);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 }); // Changement : Validation ajoutée
    }
    // Vérifie l'authentification token
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    // Vérifie le token avec verify pour la sécurité
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Changement : Utilise verify au lieu de decode
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    // Vérifie que le post existe et appartient à l'utilisateur
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true } // Changement : Sélectionne authorId au lieu de author pour optimisation
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    // Vérifie que le post appartient à l'auteur
    if (post.authorId !== decodedToken.id) { // Changement : Comparaison correcte
      return NextResponse.json({ error: "Forbidden: You can only delete your own posts" }, { status: 403 });
    }
    // Supprime le post
    await prisma.post.delete({ // Changement : Syntaxe Prisma correcte
      where: { id: postId }
    });
    // Response
    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 }); // Changement : Gestion d'erreur uniforme
  } finally {
    await prisma.$disconnect(); // Changement : Parentheses ajoutées
  }
}

