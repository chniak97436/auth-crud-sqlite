"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [erreurMessage, setErreurMessage] = useState("");

  const router = useRouter();

  const formSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.erreur || "une erreur est survenue");
        setErreurMessage("une erreur est survenue", data.erreur);
      }
      console.log("utilisateur connecte : ", data.user.email);
      // rediriger vers la page d'accueil ou autre
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("erreur lors de la connexion : ", error.message);
      setErreurMessage("erreur lors de la connexion : ", error.message);
    }
  };

  return (
    <div className="min-w-screen min-h-screen flex justify-center items-center">
      <form className="w-[70%] h-auto p-6 mx-auto" onSubmit={formSubmit}>
        <h1 className="text-3xl mb-4">Login Page</h1>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="border p-2 mb-2 w-full"
        />
        {erreurMessage && <p className="text-red-500 mb-2">{erreurMessage}</p>}
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
          Se connecter
        </button>
      </form>
    </div>
  );
}
