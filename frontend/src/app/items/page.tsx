"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { fetchFromApi } from "@/lib/api";
import type { MapComponentHandle, Item } from "./MapComponent";

// Leaflet ne peut être rendu que côté client (pas de SSR)
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

interface Category {
  id: string;
  name: string;
}

const badgeLabels: Record<string, string> = {
  "FIRST_LOAN": "Premier Partage",
  "ECO_10KG": "Écolo Actif",
  "ECO_50KG": "Héros Climat",
  "TRUSTED_USER": "Voisin de Confiance",
  "SUPER_SHARER": "Super Partageur"
};

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const mapRef = useRef<MapComponentHandle>(null);

  // Filtres
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sharingType, setSharingType] = useState("");
  const [radiusKm, setRadiusKm] = useState("10");
  const [categories, setCategories] = useState<Category[]>([]);

  // Coordonnées de secours (Rabat, Maroc)
  const fallbackLat = 34.020882;
  const fallbackLng = -6.84165;

  // Charger les catégories
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchFromApi("/categories");
        setCategories(data);
      } catch (e) {
        console.error("Erreur catégories:", e);
      }
    }
    loadCategories();
  }, []);

  // Récupérer la position GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          console.warn("Géolocalisation refusée ou erreur:", error);
          setUserLocation({ lat: fallbackLat, lng: fallbackLng });
        }
      );
    } else {
      setUserLocation({ lat: fallbackLat, lng: fallbackLng });
    }
  }, []);

  // Charger les objets
  const loadItems = useCallback(async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      // Construire les paramètres de recherche
      const params = new URLSearchParams({
        lat: userLocation.lat.toString(),
        lng: userLocation.lng.toString(),
        radiusKm: radiusKm,
      });
      if (keyword.trim()) params.set("keyword", keyword.trim());
      if (categoryId) params.set("categoryId", categoryId);
      if (sharingType) params.set("sharingType", sharingType);

      let data = await fetchFromApi(`/items/search?${params.toString()}`);

      // Auto-seeding invisible si la base est vide (première utilisation)
      if (data.length === 0 && !keyword && !categoryId && !sharingType) {
        await fetch("http://localhost:8080/api/debug/seed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: userLocation.lat, lng: userLocation.lng }),
        });
        data = await fetchFromApi(`/items/search?${params.toString()}`);
      }

      setItems(data);
    } catch (error) {
      console.error("Erreur lors du chargement des objets:", error);
    } finally {
      setLoading(false);
    }
  }, [userLocation, keyword, categoryId, sharingType, radiusKm]);

  // Recharger les objets quand la position change
  useEffect(() => {
    loadItems();
  }, [userLocation]);

  // Bouton "Voir" → zoom sur l'objet
  const handleViewItem = (item: Item) => {
    setHighlightedItemId(item.id);
    if (mapRef.current && item.latitude && item.longitude) {
      mapRef.current.flyToItem(item.latitude, item.longitude);
    }
  };

  // Recherche avec filtres
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadItems();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* En-tête */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Objets autour de vous</h1>
        <p className="text-sm text-gray-500">
          Trouvez des objets à emprunter, louer ou récupérer près de chez vous.
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <form onSubmit={handleSearch} className="mb-6 bg-white p-4 rounded-3xl shadow-md border border-slate-100 relative z-10">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Champ mot-clé principal */}
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Chercher un objet (ex: Perceuse...)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-5 py-2.5 border-none bg-slate-100 rounded-full text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-inner transition-all"
            />
          </div>

          {/* Filtre par catégorie */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">Toutes catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Filtre par type de partage */}
          <select
            value={sharingType}
            onChange={(e) => setSharingType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">Tous types</option>
            <option value="LOAN">Prêt</option>
            <option value="RENTAL">Location</option>
            <option value="DONATION">Don</option>
          </select>

          {/* Filtre par rayon */}
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="1">1 km</option>
            <option value="3">3 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="25">25 km</option>
          </select>

          {/* Bouton Rechercher */}
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full text-sm font-bold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md transform hover:scale-105"
          >
            Rechercher
          </button>
        </div>
      </form>

      {/* Contenu principal : Liste + Carte */}
      <div className="flex flex-col lg:flex-row gap-5 h-[600px]">
        {/* Liste des objets */}
        <div className="w-full lg:w-1/3 overflow-y-auto pr-1 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="animate-spin h-8 w-8 mb-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Recherche en cours...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-4xl mb-3">📦</span>
              <p className="text-sm text-center">Aucun objet trouvé dans cette zone.</p>
              <p className="text-xs text-gray-400 mt-1">Essayez d'augmenter le rayon de recherche.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-400 mb-2 font-medium ml-1">{items.length} objet{items.length > 1 ? "s" : ""} trouvé{items.length > 1 ? "s" : ""}</p>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                    highlightedItemId === item.id
                      ? "border-primary-500 ring-4 ring-primary-100"
                      : "border-slate-100"
                  }`}
                  onClick={() => handleViewItem(item)}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      {item.photoUrls && item.photoUrls.length > 0 ? (
                        <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                          <img src={`http://localhost:8080${item.photoUrls[0]}`} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center text-primary-500 text-3xl shadow-inner border border-primary-200">
                          📦
                        </div>
                      )}
                    </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm">{item.title}</h3>
                            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                              <span>{item.categoryName}</span>
                              <span>•</span>
                              <Link href={`/user/${item.ownerId}`} className="text-primary-600 hover:text-primary-700 font-semibold hover:underline">
                                {item.ownerFirstName}
                              </Link>
                              {item.trustScore > 0 && (
                                <span className="flex items-center text-yellow-500 font-bold bg-yellow-50 px-1.5 rounded text-[10px]">
                                  ★ {item.trustScore.toFixed(1)}
                                </span>
                              )}
                            </div>
                            {item.ownerBadges && item.ownerBadges.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {item.ownerBadges.slice(0, 2).map((badge, idx) => (
                                  <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-md font-bold uppercase tracking-wider">
                                    {badgeLabels[badge] || badge.replace('_', ' ')}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm ${
                              item.sharingType === "DONATION"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : item.sharingType === "LOAN"
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : "bg-amber-100 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {item.sharingType === "DONATION" ? "Don" : item.sharingType === "LOAN" ? "Prêt" : "Location"}
                          </span>
                        </div>

                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            {item.sharingType === "RENTAL" ? `${item.rentalPrice} DH/jour` : "Gratuit"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewItem(item);
                            }}
                            className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
                          >
                            📍 Voir sur la carte
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </>
          )}
        </div>

        {/* Carte */}
        <div className="w-full lg:w-2/3 bg-gray-100 rounded-lg">
          {userLocation ? (
            <MapComponent
              ref={mapRef}
              items={items}
              centerLat={userLocation.lat}
              centerLng={userLocation.lng}
              highlightedItemId={highlightedItemId}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
              <svg className="animate-spin h-8 w-8 mb-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Obtention de votre position GPS...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
