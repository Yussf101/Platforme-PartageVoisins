"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import Link from "next/link";

const badgeLabels: Record<string, string> = {
  "FIRST_LOAN": "Premier Partage",
  "ECO_10KG": "Écolo Actif",
  "ECO_50KG": "Héros Climat",
  "TRUSTED_USER": "Voisin Confiance",
  "SUPER_SHARER": "Super Partageur"
};

export interface Item {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  sharingType: string;
  rentalPrice: number;
  ownerId: string;
  ownerFirstName: string;
  trustScore: number;
  ownerBadges: string[];
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  items: Item[];
  centerLat: number;
  centerLng: number;
  highlightedItemId?: string | null;
}

export interface MapComponentHandle {
  flyToItem: (lat: number, lng: number) => void;
}

// Icône personnalisée pour la position de l'utilisateur (point bleu)
const userIcon = L.divIcon({
  className: "user-location-marker",
  html: '<div style="width:14px;height:14px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(59,130,246,0.5);"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Composant interne pour contrôler la vue de la carte
function MapController({ center, flyTarget }: { center: [number, number]; flyTarget: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);

  useEffect(() => {
    if (flyTarget) {
      map.flyTo([flyTarget.lat, flyTarget.lng], 16, { duration: 1 });
    }
  }, [flyTarget, map]);

  return null;
}

const MapComponent = forwardRef<MapComponentHandle, MapComponentProps>(
  ({ items, centerLat, centerLng, highlightedItemId }, ref) => {
    const center: [number, number] = [centerLat, centerLng];
    const flyTargetRef = useRef<{ lat: number; lng: number } | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<Map<string, L.Marker>>(new Map());

    useImperativeHandle(ref, () => ({
      flyToItem: (lat: number, lng: number) => {
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 16, { duration: 1 });
          // Ouvrir le popup du marqueur correspondant
          markersRef.current.forEach((marker, id) => {
            const pos = marker.getLatLng();
            if (Math.abs(pos.lat - lat) < 0.0001 && Math.abs(pos.lng - lng) < 0.0001) {
              marker.openPopup();
            }
          });
        }
      },
    }));

    return (
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full rounded-lg shadow-sm border border-gray-200"
        ref={(mapInstance) => {
          if (mapInstance) {
            mapRef.current = mapInstance;
          }
        }}
      >
        <MapController center={center} flyTarget={flyTargetRef.current} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marqueur de l'utilisateur (point bleu) */}
        <Marker position={center} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <span className="font-semibold">📍 Vous êtes ici</span>
            </div>
          </Popup>
        </Marker>

        {/* Marqueurs des objets */}
        {items.map((item) => {
          const lat = item.latitude || centerLat;
          const lng = item.longitude || centerLng;

          return (
            <Marker
              key={item.id}
              position={[lat, lng]}
              ref={(markerInstance) => {
                if (markerInstance) {
                  markersRef.current.set(item.id, markerInstance);
                }
              }}
            >
              <Popup>
                <div style={{ minWidth: "180px" }}>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#111827", marginBottom: "4px" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                    {item.categoryName} • 
                    <Link href={`/user/${item.ownerId}`} style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
                      {item.ownerFirstName}
                    </Link>
                    {item.trustScore > 0 && (
                      <span style={{ color: "#eab308", fontWeight: 600, fontSize: "11px" }}>★ {item.trustScore.toFixed(1)}</span>
                    )}
                  </div>
                  {item.ownerBadges && item.ownerBadges.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                      {item.ownerBadges.slice(0, 2).map((badge, idx) => (
                        <span key={idx} style={{ fontSize: "9px", padding: "2px 6px", backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "10px", color: "#4b5563", fontWeight: 700, textTransform: "uppercase" }}>
                          {badgeLabels[badge] || badge.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#059669", marginBottom: "8px" }}>
                    {item.sharingType === "RENTAL"
                      ? `${item.rentalPrice} DH/jour`
                      : item.sharingType === "LOAN"
                      ? "Prêt gratuit"
                      : "Don"}
                  </div>
                  <Link
                    href={`/items/${item.id}`}
                    style={{
                      display: "block",
                      backgroundColor: "#0ea5e9",
                      color: "white",
                      textAlign: "center",
                      padding: "6px 0",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "13px"
                    }}
                  >
                    Voir l'objet
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    );
  }
);

MapComponent.displayName = "MapComponent";
export default MapComponent;
