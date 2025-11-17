import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { decode } from "jsonwebtoken";

export async function GET(request, { params }) {
  try {
    const { id } = await params;  // Destructure l'ID depuis params (id est une string)

    const postId = parseInt(id)// Convertit la string en nombre pour Prisma
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }
    console.log(postId);

    // Cherche le post dans la base, avec l'auteur
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    })
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  }
  catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
  finally {
    await prisma.$disconnect();
  }
}

// Ajoute à la fonction PUT existante
export async function PUT(request, { params }) {
  try {
    // recuperer l id en le destructurant et le parse pour devenir un entier
    const { id } = await params
    const postId = parseInt(id)
    console.log(postId);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "l id du post est invalide" }, { status: 400 })
    }
    // Vérifie l'authentification token
    const token = request.cookies.get("token")?.value;
    console.log(token);
    if (!token) {
      return NextResponse.json({ error: "authentification du token impossible" }, { status: 404 })
    }
    //decode le token
    const isVallidToken = decode(token)
    console.log("le token : est valide : ", isVallidToken);
    if (!isVallidToken) {
      return NextResponse.json({ error: "isValideToken false" }, { status: 404 })
    }
    // Vérifie que le post existe et appartient à l'utilisateur connecté (id et autheurId)
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    })
    // verifier bien le post
    if (!post) {
      return NextResponse.json({ erreur: "requete put invalide" }, { status: 404 })
    }
    // verifie que le post appartient a l auteur
    if (post.id != isVallidToken.authorId) {
      console.log("put.id = ", post.id, " : isVallidToken.authorId : ", isVallidToken.authorId);
      return NextResponse.json({ erreur: "put.id est different de isVallidToken.author.id pas de modif post" }, { status: 403 })
    }
    // Récupère les nouvelles données title content publihed
    const { title, content, published } = await request.json();
    // Met à jour le put dans la base
    const updatePost = await prisma.post.Update({
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
    })
    // Retourne le put mis à jour ou une erreur si nécessaire
    return NextResponse.json(updatePost)
  }
  catch (err) {
    return NextResponse.json({ error: "catch erreur : " }, err.message)
  }
  // dconect de la bdd
  finally {
    await prisma.$disconnect();
  }
}

// Ajoute à la fonction DELETE existante
export async function DELETE(request, { params }) {
  try {
    // recuperer l id en le destructurant et le parse pour devenir un entier

    // Vérifie l'authentification token
    const token = await request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({erreur : "invalide token"}, {status : 404})
    }
    const isValidToken = decode(token)
    if (!isValidToken) {
      return NextResponse.json({erreur : "invalide isValidToken"}, {status : 404})
    }
    // Vérifie que le post existe et appartient à l'utilisateur id authorId

    // Supprime le post where id

    // Response

    //error catch
  } catch (error) {

  }
  // finaly
  finally {
    await prisma.$disconnect
  }
}

