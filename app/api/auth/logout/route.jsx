import { NextResponse } from "next/server";

export async function POST() {
  // Créer une réponse JSON pour indiquer la déconnexion réussie
  const response = NextResponse.json({ message: "Déconnexion réussi" });
  // Supprimer le cookie
  response.cookies.set("token", "", {
    maxAge: 0, //
    httpOnly: false,
    sameSite: "lax",
  });

  return response;
}
