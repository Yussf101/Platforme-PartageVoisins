"use client";

import { useEffect, useState } from "react";
import { fetchFromApi } from "@/lib/api";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ecoScore: number;
  trustScore: number;
  totalItemsShared: number;
  itemsGiven: number;
  itemsLent: number;
  badges: string[];
  recentReviews: {
    id: string;
    score: number;
    comment: string;
    evaluatorName: string;
    createdAt: string;
  }[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchFromApi("/users/me");
        setProfile(data);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  if (loading) return <div className="text-center mt-20">Chargement de votre profil...</div>;
  if (!profile) return <div className="text-center mt-20 text-red-500">Erreur de chargement du profil</div>;

  const renderStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score || 0);
    const hasHalfStar = (score || 0) % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400 text-xl">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400 text-xl">★</span>); // Simplifié pour MVP
      } else {
        stars.push(<span key={i} className="text-gray-300 text-xl">★</span>);
      }
    }
    return stars;
  };

  const badgeIcons: Record<string, string> = {
    "FIRST_LOAN": "🤝",
    "ECO_10KG": "🌱",
    "ECO_50KG": "🌳",
    "TRUSTED_USER": "⭐",
  };
  const badgeLabels: Record<string, string> = {
    "FIRST_LOAN": "Premier Partage",
    "ECO_10KG": "Écolo Actif (+10kg)",
    "ECO_50KG": "Héros du Climat (+50kg)",
    "TRUSTED_USER": "Voisin de Confiance",
  };
  const badgeDescriptions: Record<string, string> = {
    "FIRST_LOAN": "A réalisé avec succès son premier partage sur la plateforme.",
    "ECO_10KG": "A économisé plus de 10 kg de CO2 en réutilisant des objets.",
    "ECO_50KG": "A économisé plus de 50 kg de CO2 ! Un véritable protecteur de la planète.",
    "TRUSTED_USER": "A obtenu d'excellentes évaluations de la part de ses voisins.",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Profil */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex items-center gap-6">
        <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-4xl font-bold">
          {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-gray-500 mb-2">{profile.email}</p>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Confiance :</span>
            <div className="flex">{renderStars(profile.trustScore)}</div>
            <span className="text-sm text-gray-500 ml-1">({profile.trustScore?.toFixed(1) || "N/A"})</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Colonne de gauche : Stats */}
        <div className="md:col-span-2 space-y-8">
          {/* Eco Score */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-9xl">🌍</span>
            </div>
            <h2 className="text-lg font-semibold text-green-800 mb-2">Mon Impact Écologique</h2>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-green-600">{profile.ecoScore?.toFixed(1) || "0.0"}</span>
              <span className="text-xl font-medium text-green-700 mb-1">kg de CO2 sauvés</span>
            </div>
            <p className="text-green-700 mt-2 text-sm">
              En partageant vos objets au lieu de les jeter ou d'en acheter de nouveaux, vous contribuez activement à protéger la planète.
            </p>
          </div>

          {/* Stats de Partage */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Mes Statistiques de Partage</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <span className="block text-3xl font-bold text-blue-600 mb-1">{profile.totalItemsShared}</span>
                <span className="text-sm font-medium text-blue-800">Objets partagés</span>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
                <span className="block text-3xl font-bold text-purple-600 mb-1">{profile.itemsGiven}</span>
                <span className="text-sm font-medium text-purple-800">Objets donnés</span>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
                <span className="block text-3xl font-bold text-orange-600 mb-1">{profile.itemsLent}</span>
                <span className="text-sm font-medium text-orange-800">Prêts réalisés</span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne de droite : Badges */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
              Mes Badges
              <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">
                {profile.badges?.length || 0}
              </span>
            </h2>
            
            {profile.badges && profile.badges.length > 0 ? (
              <div className="space-y-4">
                {profile.badges.map((badge, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50 cursor-help transition-all hover:shadow-md hover:border-primary-200 hover:bg-primary-50"
                    title={badgeDescriptions[badge] || "Badge d'accomplissement"}
                  >
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-2xl border border-gray-100">
                      {badgeIcons[badge] || "🏆"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{badgeLabels[badge] || badge}</h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl mb-3 opacity-30">🏆</div>
                <p className="text-sm text-gray-500">Vous n'avez pas encore de badge.</p>
                <p className="text-xs text-gray-400 mt-1">Continuez à partager pour en débloquer !</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section des Avis (Reviews) */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          ⭐ Ce que les voisins disent de moi
          <span className="bg-gray-100 text-gray-600 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {profile.recentReviews?.length || 0}
          </span>
        </h2>

        {profile.recentReviews && profile.recentReviews.length > 0 ? (
          <div className="space-y-6">
            {profile.recentReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{review.evaluatorName}</h3>
                  <span className="text-sm text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex mb-2">
                  {renderStars(review.score)}
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
            <span className="text-4xl opacity-30 mb-3 block">💬</span>
            <p className="text-gray-500 font-medium">Aucun avis pour le moment.</p>
            <p className="text-sm text-gray-400 mt-1">Partagez des objets pour recevoir vos premières étoiles !</p>
          </div>
        )}
      </div>
    </div>
  );
}
