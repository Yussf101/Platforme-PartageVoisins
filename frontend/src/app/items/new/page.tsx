"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { fetchFromApi } from "@/lib/api";
import { getUser, getToken } from "@/lib/auth";

// Chargement dynamique de la carte pour éviter les erreurs SSR
const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false });

interface Category {
  id: string;
  name: string;
}

export default function NewItemPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Photos
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

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

  // Vérifier la connexion et récupérer les catégories
  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    async function loadCategories() {
      try {
        const data = await fetchFromApi("/categories");
        setCategories(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (e) {
        console.error("Erreur de chargement des catégories", e);
      }
    }
    loadCategories();

    // Récupérer la position de l'utilisateur par défaut
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(coords);
          setFormData((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }));
        },
        (error) => {
          console.warn("Erreur GPS", error);
          const defaultCoords = { lat: 34.020882, lng: -6.84165 }; // Rabat
          setUserLocation(defaultCoords);
          setFormData((prev) => ({ ...prev, lat: defaultCoords.lat, lng: defaultCoords.lng }));
        }
      );
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({ ...formData, lat, lng });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (photos.length + selectedFiles.length > 5) {
        alert("Vous ne pouvez uploader que 5 photos maximum.");
        return;
      }
      
      const newPhotos = [...photos, ...selectedFiles].slice(0, 5);
      setPhotos(newPhotos);
      
      // Generate previews
      const previews = newPhotos.map(file => URL.createObjectURL(file));
      setPhotoPreviews(previews);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    
    const newPreviews = [...photoPreviews];
    newPreviews.splice(index, 1);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = getToken();
      if (!token) throw new Error("Vous devez être connecté");

      if (!formData.categoryId) throw new Error("Veuillez sélectionner une catégorie");
      if (formData.lat === 0 || formData.lng === 0) throw new Error("Veuillez sélectionner un emplacement sur la carte");
      if (photos.length === 0) throw new Error("Veuillez ajouter au moins 1 photo pour votre objet.");

      const requestBody = {
        title: formData.title,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        itemCondition: formData.itemCondition,
        sharingType: formData.sharingType,
        rentalPrice: formData.rentalPrice ? parseFloat(formData.rentalPrice) : null,
        deposit: formData.deposit ? parseFloat(formData.deposit) : null,
        latitude: formData.lat,
        longitude: formData.lng,
      };

      const response = await fetch("http://localhost:8080/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Erreur lors de la création de l'objet");
      }

      const item = await response.json();

      // Etape 2: Upload des photos
      const formDataPhotos = new FormData();
      photos.forEach(photo => {
        formDataPhotos.append("photos", photo);
      });

      const uploadRes = await fetch(`http://localhost:8080/api/items/${item.id}/photos`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formDataPhotos
      });

      if (!uploadRes.ok) {
        throw new Error("Erreur lors de l'upload des photos");
      }

      router.push("/items"); // Redirection vers la liste après création
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!userLocation) {
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
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-900">Ajouter un objet</h1>
          <p className="mt-1 text-sm text-gray-500">
            Proposez un objet au don, prêt ou à la location pour vos voisins.
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded-md">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECTION PHOTOS */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                📸 Photos de l'objet
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter des photos (min: 1, max: 5)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <span className="text-3xl mb-2">📷</span>
                      <p className="mb-2 text-sm text-gray-500 font-semibold">Cliquez pour uploader</p>
                      <p className="text-xs text-gray-500">SVG, PNG, JPG ou GIF</p>
                    </div>
                    <input type="file" className="hidden" multiple accept="image/*" onChange={handlePhotoChange} disabled={photos.length >= 5} />
                  </label>
                </div>
              </div>

              {/* Previews */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                      <img src={preview} alt={`Preview ${index}`} className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Perceuse sans fil Bosch"
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
                placeholder="Décrivez l'objet, ses caractéristiques, ce qui est inclus (ex: chargeur fourni)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localisation de l'objet *</label>
              <p className="text-xs text-gray-500 mb-2">
                Cliquez sur la carte pour indiquer précisément où l'objet est disponible.
              </p>
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
                {loading ? "Création en cours..." : "Publier l'annonce"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
