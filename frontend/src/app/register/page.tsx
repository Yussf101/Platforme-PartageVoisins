"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchFromApi } from "@/lib/api";
import { saveUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de l'inscription");
      }

      const data = await response.json();
      saveUser(data);
      
      // On déclenche un événement pour que la navbar se mette à jour
      window.dispatchEvent(new Event("auth-change"));
      
      router.push("/items");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 -mt-4">
      {/* Conteneur principal (carte) */}
      <div className="flex w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] border border-gray-100">
        
        {/* Formulaire à gauche */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Rejoignez-nous</h2>
              <p className="text-gray-500 text-sm">Créez votre compte gratuit et commencez à partager avec vos voisins.</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 text-sm flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <p className="mt-0.5">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Youssef"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Fatimi"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse e-mail</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder=""
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmer</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder=""
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 mt-6"
              >
                {loading ? "Création du compte..." : "Créer mon compte"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
              Vous avez déjà un compte ?{" "}
              <Link href="/login" className="font-bold text-primary-600 hover:text-primary-500">
                Connectez-vous
              </Link>
            </div>
          </div>
        </div>

        {/* Image à droite */}
        <div className="hidden lg:block lg:w-1/2 relative bg-gray-900">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-70 transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1595846519845-68e298c2edd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-gray-900/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-12">
            <div className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold text-xs mb-4 border border-white/30">
              🤝 La force du collectif
            </div>
            <h3 className="text-3xl font-extrabold text-white mb-3 leading-tight">
              Moins d'achats.<br />Plus de liens.
            </h3>
            <p className="text-gray-300 text-sm max-w-md">
              Plutôt que d'acheter une perceuse, empruntez-la. Vous ferez des économies et protégerez l'environnement.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
