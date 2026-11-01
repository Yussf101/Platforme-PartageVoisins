"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getUser } from "@/lib/auth";
import ReservationModal from "./ReservationModal";
import Link from "next/link";

// Static map to show the location without marker movement
const StaticLocationMap = dynamic(() => import("./StaticLocationMap"), { ssr: false });

interface ItemDetail {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  itemCondition: string;
  sharingType: string;
  rentalPrice: number;
  deposit: number;
  status: string;
  latitude: number;
  longitude: number;
  ownerId: string;
  ownerFirstName: string;
  trustScore: number;
  co2Saved: number;
  photoUrls?: string[];
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const currentUser = getUser();
  const isOwner = currentUser && item && currentUser.id === item.ownerId;

  useEffect(() => {
    async function fetchItem() {
      try {
        const response = await fetch(`http://localhost:8080/api/items/${itemId}`);
        if (!response.ok) throw new Error("Objet introuvable");
        const data = await response.json();
        setItem(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [itemId]);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    try {
      const response = await fetch(`http://localhost:8080/api/items/${itemId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ reason: reportReason }),
      });

      if (!response.ok) throw new Error("Erreur lors du signalement");
      
      setIsReportModalOpen(false);
      setReportReason("");
      alert("Votre signalement a bien été envoyé. Merci !");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getConditionLabel = (condition: string) => {
    switch(condition) {
      case "NEW": return "Neuf";
      case "GOOD": return "Bon état";
      case "FAIR": return "État moyen";
      default: return condition;
    }
  };

  const getSharingTypeBadge = (type: string) => {
    switch(type) {
      case "DONATION": return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">💝 Don</span>;
      case "LOAN": return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">🤝 Prêt gratuit</span>;
      case "RENTAL": return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">💰 Location</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-primary-600">
          <svg viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <span className="text-6xl mb-4">😕</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Objet introuvable</h1>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={() => router.push("/items")} className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
          Retour à la carte
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      
      {requestSent && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 text-green-800 rounded-md flex justify-between items-center shadow-sm">
          <div>
            <h3 className="font-bold">Demande envoyée avec succès ! 🎉</h3>
            <p className="text-sm mt-1">Le propriétaire a reçu votre message. Vous serez notifié de sa réponse.</p>
          </div>
          <button onClick={() => setRequestSent(false)} className="text-green-600 hover:text-green-800">✖</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne Gauche : Détails */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Affichage des photos */}
            {item.photoUrls && item.photoUrls.length > 0 ? (
              <div className="relative h-96 w-full bg-gray-100 flex overflow-x-auto snap-x snap-mandatory">
                {item.photoUrls.map((url, idx) => (
                  <div key={idx} className="min-w-full h-full snap-center relative">
                    <img src={`http://localhost:8080${url}`} alt={`${item.title} - Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {item.photoUrls.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {item.photoUrls.map((_, idx) => (
                      <div key={idx} className="w-2 h-2 rounded-full bg-white/80 shadow-sm" />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 bg-gray-100 flex items-center justify-center border-b border-gray-200">
                <span className="text-6xl">📷</span>
                <p className="text-gray-400 ml-4 font-medium text-lg">Pas de photo</p>
              </div>
            )}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md">
                  {item.categoryName}
                </span>
                {getSharingTypeBadge(item.sharingType)}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
              
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">État :</span> {getConditionLabel(item.itemCondition)}
                </div>
                {item.sharingType === "RENTAL" && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">Prix :</span> <span className="text-lg font-bold text-amber-600">{item.rentalPrice} DH/j</span>
                  </div>
                )}
                {item.deposit > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">Caution :</span> {item.deposit} DH
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {item.description || "Aucune description fournie par le propriétaire."}
              </p>
            </div>
          </div>

          {/* Encart Écologique */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 flex items-center gap-6 shadow-sm">
            <div className="bg-white p-4 rounded-full shadow-sm text-3xl">🍃</div>
            <div>
              <h3 className="text-lg font-bold text-green-900 mb-1">Impact positif</h3>
              <p className="text-green-800 text-sm">
                En empruntant cet objet plutôt que de l'acheter neuf, vous évitez l'émission de <strong className="text-green-900 text-base">{item.co2Saved} kg de CO2</strong> !
              </p>
            </div>
          </div>

        </div>

        {/* Colonne Droite : Propriétaire & Action & Carte */}
        <div className="space-y-6">
          
          {/* Card Propriétaire */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-20 h-20 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              {item.ownerFirstName.charAt(0)}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{item.ownerFirstName}</h3>
            <div className="flex justify-center items-center gap-1 text-amber-500 my-2">
              <span>⭐</span> <span className="font-medium text-gray-900">{item.trustScore}/5</span>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              {item.status !== "AVAILABLE" ? (
                <div className="bg-gray-100 text-gray-600 py-3 rounded-md font-medium text-sm">
                  Cet objet est actuellement indisponible.
                </div>
              ) : isOwner ? (
                <Link 
                  href={`/items/${item.id}/edit`}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  ✏️ Modifier mon annonce
                </Link>
              ) : (
                <button
                  onClick={() => {
                    if (!currentUser) router.push("/login");
                    else setIsModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  {item.sharingType === "DONATION" ? "Demander cet objet" : "Faire une demande"}
                </button>
              )}
            </div>
          </div>

          {/* Carte Statique */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Lieu de retrait approximatif</h3>
            </div>
            <StaticLocationMap lat={item.latitude} lng={item.longitude} />
          </div>

          {/* Bouton Signaler */}
          {!isOwner && currentUser && (
            <div className="text-center pt-2">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="text-sm font-medium text-red-500 hover:text-red-700 transition flex items-center justify-center gap-1 mx-auto"
              >
                🚩 Signaler cette annonce
              </button>
            </div>
          )}

        </div>
      </div>

      {isModalOpen && (
        <ReservationModal
          itemId={item.id}
          sharingType={item.sharingType}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            setRequestSent(true);
          }}
        />
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button onClick={() => setIsReportModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✖</button>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Signaler cette annonce</h2>
            <p className="text-sm text-gray-600 mb-6">Veuillez expliquer pourquoi vous signalez cette annonce. Notre équipe modérera le contenu au plus vite.</p>
            
            <form onSubmit={handleReportSubmit}>
              <textarea
                required
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Ex: Contenu inapproprié, Arnaque suspectée..."
                className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 mb-4"
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Annuler</button>
                <button type="submit" disabled={!reportReason.trim()} className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg font-medium transition">
                  Envoyer le signalement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
