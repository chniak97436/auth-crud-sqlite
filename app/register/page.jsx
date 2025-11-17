"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [erreurMessage, setErreurMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const formSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (formData.password !== formData.passwordConfirm) {
      setErreurMessage("les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.erreur || "une erreur est survenue");
      }
      console.log("utilisateur enregistre : ", data.user.email);

      // rediriger vers la page de login ou autre
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("erreur lors de l'inscription : ", error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-screen min-h-screen flex justify-center items-center">
      <form className="w-[70%] h-auto p-6 mx-auto" onSubmit={formSubmit}>
        <h1 className="text-3xl mb-4">Register</h1>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 mb-2 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="border p-2 mb-4 w-full"
        />
        <input
          type="password"
          placeholder="Password confirm"
          value={formData.passwordConfirm}
          onChange={(e) =>
            setFormData({ ...formData, passwordConfirm: e.target.value })
          }
          className="border p-2 mb-4 w-full"
        />
        {erreurMessage && (
          <p className="text-red-600 mb-4 py-2 px-2 w-[40%] text-center mx-auto bg-red-200 border border-red-900">
            {erreurMessage}
          </p>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <p className="mt-4">
          Deja un compte ?{" "}
          <Link href="/login" className="text-blue-500 underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
