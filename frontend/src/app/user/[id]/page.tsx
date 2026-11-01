"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchFromApi } from "@/lib/api";
import Link from "next/link";

const badgeLabels: Record<string, string> = {
  "FIRST_LOAN": "Premier Partage",
  "ECO_10KG": "Écolo Actif (+10kg)",
  "ECO_50KG": "Héros du Climat (+50kg)",
  "TRUSTED_USER": "Voisin de Confiance",
  "SUPER_SHARER": "Super Partageur"
};

const badgeDescriptions: Record<string, string> = {
  "FIRST_LOAN": "A réalisé avec succès son premier partage sur la plateforme.",
  "ECO_10KG": "A économisé plus de 10 kg de CO2 en réutilisant des objets.",
  "ECO_50KG": "A économisé plus de 50 kg de CO2 ! Un véritable protecteur de la planète.",
  "TRUSTED_USER": "A obtenu d'excellentes évaluations de la part de ses voisins.",
  "SUPER_SHARER": "Partageur exceptionnel avec de nombreux objets prêtés."
};

interface PublicProfile {
  id: string;
  firstName: string;
  ecoScore: number;
  trustScore: number;
  totalItemsShared: number;
  itemsGiven: number;
  itemsLent: number;
  badges: string[];
  recentReviews: any[];
  sharedItems: any[];
}

export default function PublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchFromApi(`/users/${id}/profile`);
        setProfile(data);
      } catch (err: any) {
        setError("Impossible de charger le profil de cet utilisateur.");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Profil introuvable</h1>
          <p className="text-slate-500">{error}</p>
          <Link href="/items" className="mt-6 inline-block bg-primary-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary-700 transition-colors">
            Retour aux annonces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* En-tête du profil */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden relative">
          <div className="h-32 bg-gradient-to-r from-primary-400 to-primary-600"></div>
          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12 mb-6">
              <div className="w-24 h-24 bg-white rounded-full p-1.5 shadow-lg border-2 border-primary-100 flex-shrink-0">
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary-600">
                  {profile.firstName.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                  {profile.firstName}
                  {profile.trustScore > 0 && (
                    <span className="flex items-center gap-1 text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full border border-yellow-200 shadow-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {profile.trustScore.toFixed(1)} / 5
                    </span>
                  )}
                </h1>
                <p className="text-slate-500 mt-1 font-medium">Membre de confiance de PartageVoisins</p>
              </div>
            </div>

            {/* Badges */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Badges obtenus</h3>
              {profile.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge, idx) => (
                    <span 
                      key={idx} 
                      title={badgeDescriptions[badge] || "Badge obtenu par cet utilisateur"}
                      className="bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm cursor-help hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      🏆 {badgeLabels[badge] || badge.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">Aucun badge pour le moment.</p>
              )}
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <p className="text-3xl font-black text-slate-700">{profile.totalItemsShared}</p>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">Objets partagés</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <p className="text-3xl font-black text-slate-700">{profile.itemsLent}</p>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">Prêts réalisés</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <p className="text-3xl font-black text-slate-700">{profile.itemsGiven}</p>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">Dons réalisés</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 border border-green-100 text-center relative overflow-hidden">
                <div className="absolute -right-2 -bottom-2 opacity-10 text-6xl">🌱</div>
                <p className="text-3xl font-black text-green-600">{profile.ecoScore} kg</p>
                <p className="text-xs font-bold text-green-600 uppercase mt-1">CO₂ économisé</p>
              </div>
            </div>
          </div>
        </div>

        {/* Objets proposés */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Ce que {profile.firstName} propose actuellement</h2>
          {profile.sharedItems && profile.sharedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {profile.sharedItems.map(item => (
                <Link href={`/items/${item.id}`} key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-slate-100 overflow-hidden transition-all transform hover:-translate-y-1 block">
                  <div className="h-40 bg-slate-100 relative">
                    {item.photoUrls && item.photoUrls.length > 0 ? (
                      <img src={`http://localhost:8080${item.photoUrls[0]}`} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-400">
                        📦
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase shadow-md ${
                        item.sharingType === 'DONATION' ? 'bg-green-500 text-white' :
                        item.sharingType === 'LOAN' ? 'bg-blue-500 text-white' :
                        'bg-amber-500 text-white'
                      }`}>
                        {item.sharingType === 'DONATION' ? 'Don' : item.sharingType === 'LOAN' ? 'Prêt' : 'Location'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.categoryName}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
              <span className="text-4xl">😴</span>
              <p className="text-slate-500 mt-3">{profile.firstName} ne propose aucun objet pour le moment.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
