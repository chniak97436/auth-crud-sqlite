import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    console.log("tentative de connexion pour : ", email);
    // verif de base
    if (!email || !password) {
      return NextResponse.json(
        { erreur: "tous les champs sont obligatoires" },
        { status: 400 },
      );
    }
    //trouver le user par son email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });
    if (!user) {
      return NextResponse.json(
        { erreur: "identifiants invalides" },
        { status: 400 },
      );
    }
    //verif du password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { erreur: "identifiants invalides" },
        { status: 400 },
      );
    }
    //creer le user sans le password (password : _, on ignore le password et on recupere le reste ...userWithoutPassword de user)
    const { password: _, ...userWithoutPassword } = user;

    //generer le token jwt
    const token = generateToken(userWithoutPassword);
    const response = NextResponse.json(
      {
        message: "connexion reussie",
        user: userWithoutPassword,
        token, // on retourne pour coté client
      },
      { status: 200 },
    );

    // ajouter un cookie httpOnly avec le token
    response.cookies.set("token", token, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7, // 1 semaine
    });
    return response;
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    return NextResponse.json(
      { erreur: "une erreur est survenue lors de la connexion" },
      { status: 500 },
    );
  }
}
