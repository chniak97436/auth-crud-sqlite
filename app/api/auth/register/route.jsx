import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";
import { emailRegex } from "@/lib/regex";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();
    console.log("tentative d'inscription pour : ", email);
    // verif de base
    if (!email || !emailRegex.test(email) || !password || !name) {
      return NextResponse.json(
        {
          erreur:
            "tous les champs sont obligatoires et l'adresse Email doit etre valide.",
        },
        { status: 400 },
      );
    }

    // verif si l'email donc user existe deja
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return NextResponse.json(
        { erreur: "cet email est deja utilise" },
        { status: 400 },
      );
    }
    // hash le password
    const hashedPassword = await hashPassword(password);
    // cree le user dans la bdd
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    //generer le token jwt
    const token = generateToken(user);
    console.log("user creer : ", user.email);

    //configurer le transporteur d'email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    // Debug des variables d'environnement
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("SMTP_PASS:", process.env.SMTP_PASS ? "Défini" : "Non défini");
    // envoyer un email de bienvenue
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Bienvenue sur notre plateforme !",
      text: `Bonjour ${user.name},\n\nMerci de vous être inscrit sur notre plateforme. Nous sommes ravis de vous compter parmi nous !\n\nCordialement,\nL'équipe http://localhost:3500/login`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(
          "Erreur lors de l'envoi de l'email de bienvenue :",
          error,
        );
      } else {
        console.log("Email de bienvenue envoyé :", info.response);
      }
    });
    //creer la reponse
    const response = NextResponse.json(
      {
        message: "utilisateur creer avec succes",
        user,
        token, // on retourne pour coté client
      },
      { status: 201 },
    );
    // ajouter un cookie httpOnly avec le token
    response.cookies.set("token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });
    return response;
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    return NextResponse.json(
      { erreur: "erreur interne du serveur" },
      { status: 500 },
    );
  }
}
