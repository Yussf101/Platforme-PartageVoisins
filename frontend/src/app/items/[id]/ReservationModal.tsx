"use client";

import { useState } from "react";
import { getToken } from "@/lib/auth";

interface ReservationModalProps {
  itemId: string;
  sharingType: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReservationModal({ itemId, sharingType, onClose, onSuccess }: ReservationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    initialMessage: "Bonjour, je suis très intéressé par cet objet. Est-il toujours disponible ?",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = getToken();
      if (!token) throw new Error("Vous devez être connecté pour envoyer une demande");

      // Préparation des dates (pour les locations/prêts, startDate et endDate sont nécessaires)
      let start = null;
      let end = null;

      if (sharingType !== "DONATION") {
        if (!formData.startDate || !formData.endDate) {
          throw new Error("Veuillez sélectionner les dates pour votre réservation.");
        }
        start = new Date(formData.startDate).toISOString();
        end = new Date(formData.endDate).toISOString();
        
        if (new Date(start) > new Date(end)) {
          throw new Error("La date de fin doit être après la date de début.");
        }
      }

      const requestBody = {
        itemId: itemId,
        startDate: start,
        endDate: end,
        initialMessage: formData.initialMessage,
      };

      const response = await fetch("http://localhost:8080/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Erreur lors de l'envoi de la demande");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">
            {sharingType === "DONATION" ? "Demander cet objet" : "Réserver cet objet"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm rounded-md">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {sharingType !== "DONATION" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Du</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Au</label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message pour le propriétaire</label>
              <textarea
                name="initialMessage"
                required
                rows={4}
                value={formData.initialMessage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
                placeholder="Écrivez un petit mot amical..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Envoyer ma demande"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
