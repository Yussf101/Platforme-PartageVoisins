"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, getToken } from "@/lib/auth";

interface Item {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  sharingType: string;
  rentalPrice: number;
  itemCondition: string;
  status: string;
}

export default function MyItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getUser();
    const token = getToken();

    if (!user || !token) {
      router.push("/login");
      return;
    }

    async function fetchMyItems() {
      try {
        const response = await fetch("http://localhost:8080/api/items/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de vos objets");
        }

        const data = await response.json();
        setItems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMyItems();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet objet ? Cette action est irréversible.")) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8080/api/items/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'objet");
      }

      setItems(items.filter(item => item.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
    
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8080/api/items/${id}/status?status=${newStatus}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Erreur lors du changement de statut");
      }

      setItems(items.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ));
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
      case "DONATION": return <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Don</span>;
      case "LOAN": return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Prêt</span>;
      case "RENTAL": return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Location</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-primary-600">
          <svg viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes objets</h1>
          <p className="mt-2 text-sm text-gray-500">
            Gérez les objets que vous avez mis en ligne pour vos voisins.
          </p>
        </div>
        <Link
          href="/items/new"
          className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
        >
          + Ajouter un objet
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded-md">
          <p>{error}</p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <span className="text-6xl mb-4 block">📦</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Vous n'avez pas encore d'objets</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            Participez à l'économie circulaire locale en proposant des objets que vous n'utilisez pas tous les jours.
          </p>
          <Link
            href="/items/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Ajouter mon premier objet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                      {item.categoryName}
                    </span>
                    {item.status === "UNAVAILABLE" && (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-md font-medium">
                        En pause
                      </span>
                    )}
                  </div>
                  {getSharingTypeBadge(item.sharingType)}
                </div>
                
                <h3 className={`text-lg font-bold mb-1 line-clamp-1 ${item.status === "UNAVAILABLE" ? "text-gray-400" : "text-gray-900"}`}>
                  {item.title}
                </h3>
                
                <div className="text-sm text-gray-500 mb-4">
                  État : <span className="font-medium text-gray-700">{getConditionLabel(item.itemCondition)}</span>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {item.description || "Aucune description fournie."}
                </p>
                
                {item.sharingType === "RENTAL" && (
                  <div className="mt-auto">
                    <span className="text-lg font-bold text-gray-900">{item.rentalPrice} DH</span>
                    <span className="text-sm text-gray-500"> / jour</span>
                  </div>
                )}
              </div>
              
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex flex-col gap-2">
                <button 
                  onClick={() => handleStatusChange(item.id, item.status)}
                  className={`w-full text-sm font-medium border rounded-md py-1.5 transition-colors ${
                    item.status === "AVAILABLE" 
                      ? "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100" 
                      : "text-green-700 bg-green-50 border-green-200 hover:bg-green-100"
                  }`}
                >
                  {item.status === "AVAILABLE" ? "⏸️ Mettre en pause" : "▶️ Réactiver l'annonce"}
                </button>
                <div className="flex gap-2">
                  <Link 
                    href={`/items/${item.id}/edit`}
                    className="flex-1 text-center text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    Modifier
                  </Link>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md py-1.5 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
