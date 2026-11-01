"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { fetchFromApi } from "@/lib/api";
import { getUser, getToken } from "@/lib/auth";

// Chargement dynamique de la carte pour éviter les erreurs SSR
const LocationPicker = dynamic(() => import("../../new/LocationPicker"), { ssr: false });

interface Category {
  id: string;
  name: string;
}

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    itemCondition: "GOOD",
    sharingType: "DONATION",
    rentalPrice: "",
    deposit: "",
    lat: 0,
    lng: 0,
  });

  useEffect(() => {
    const user = getUser();
    const token = getToken();
    if (!user || !token) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        // 1. Charger les catégories
        const cats = await fetchFromApi("/categories");
        setCategories(cats);

        // 2. Charger les infos de l'objet
        const response = await fetch(`http://localhost:8080/api/items/${itemId}`);
        if (!response.ok) throw new Error("Objet introuvable");
        const itemData = await response.json();

        // 3. Pré-remplir le formulaire
        const catId = cats.find((c: any) => c.name === itemData.categoryName)?.id || "";
        
        setFormData({
          title: itemData.title,
          description: itemData.description || "",
          categoryId: catId.toString(),
          itemCondition: itemData.itemCondition,
          sharingType: itemData.sharingType,
          rentalPrice: itemData.rentalPrice?.toString() || "",
          deposit: itemData.deposit?.toString() || "",
          lat: itemData.latitude,
          lng: itemData.longitude,
        });

        setUserLocation({ lat: itemData.latitude, lng: itemData.longitude });

      } catch (e: any) {
        setError(e.message);
      } finally {
        setPageLoading(false);
      }
    }
    
    loadData();
  }, [router, itemId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({ ...formData, lat, lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = getToken();
      if (!token) throw new Error("Vous devez être connecté");

      if (!formData.categoryId) throw new Error("Veuillez sélectionner une catégorie");

      const requestBody = {
        title: formData.title,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        itemCondition: formData.itemCondition,
        sharingType: formData.sharingType,
        rentalPrice: formData.sharingType === "RENTAL" && formData.rentalPrice ? parseFloat(formData.rentalPrice) : null,
        deposit: formData.deposit ? parseFloat(formData.deposit) : null,
        latitude: formData.lat,
        longitude: formData.lng,
      };

      const response = await fetch(`http://localhost:8080/api/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Erreur lors de la modification de l'objet");
      }

      router.push("/my-items"); // Retourner à "Mes Objets"
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading || !userLocation) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
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
    <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modifier l'objet</h1>
            <p className="mt-1 text-sm text-gray-500">
              Mettez à jour les informations de votre annonce.
            </p>
          </div>
          <button 
            onClick={() => router.push("/my-items")}
            className="text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded-md">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Catégorie et Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                <select
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                >
                  <option value="" disabled>Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">État de l'objet *</label>
                <select
                  name="itemCondition"
                  required
                  value={formData.itemCondition}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                >
                  <option value="NEW">Neuf</option>
                  <option value="GOOD">Bon état</option>
                  <option value="FAIR">État moyen</option>
                </select>
              </div>
            </div>

            {/* Type de partage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de partage *</label>
              <div className="flex flex-col sm:flex-row gap-4">
                {["DONATION", "LOAN", "RENTAL"].map((type) => (
                  <label key={type} className={`flex items-center justify-center px-4 py-3 border rounded-md cursor-pointer flex-1 transition-colors ${formData.sharingType === type ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    <input
                      type="radio"
                      name="sharingType"
                      value={type}
                      checked={formData.sharingType === type}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-medium text-sm">
                      {type === "DONATION" ? "💝 Don" : type === "LOAN" ? "🤝 Prêt gratuit" : "💰 Location"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Prix (si location) */}
            {formData.sharingType === "RENTAL" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix par jour (DH) *</label>
                  <input
                    type="number"
                    name="rentalPrice"
                    min="1"
                    required
                    value={formData.rentalPrice}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caution éventuelle (DH)</label>
                  <input
                    type="number"
                    name="deposit"
                    min="0"
                    value={formData.deposit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localisation de l'objet *</label>
              <LocationPicker 
                onLocationSelected={handleLocationChange} 
                defaultLat={userLocation.lat} 
                defaultLng={userLocation.lng} 
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? "Sauvegarde en cours..." : "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
