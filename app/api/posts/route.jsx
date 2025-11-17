import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET recuperer tous les posts fetch('/api/posts')
export async function GET() {
  const post = await prisma.post.findMany({
    include: {
      author: {
        // inclure les informations de l'auteur
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc", // trier par date de création décroissante
    },
  });
  return NextResponse.json(post);
}

// POST creer un post fetch('/api/posts', {method: 'POST', body: JSON.stringify({title: 'Mon titre', content: 'Mon contenu'})})
export async function POST(req) {
  try {
    // recuperer le token du cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    } // recuperer l'utilisateur
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId, // id de l'utilisateur dans le token
      },
    }); // verifier si l'utilisateur existe
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    } // recuperer les données du post
    const { title, content } = await req.json();
    if (!title || !content) {
      return NextResponse.json(
        { error: "Titre et contenu sont requis" },
        { status: 400 },
      );
    }
    // creer le post dans bdd
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        published: published || false,
        authorId: user.id, // associer le post à l'utilisateur connecter
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    console.log("Post creer : ", post.title);
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
