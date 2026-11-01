"use client";

import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface StaticLocationMapProps {
  lat: number;
  lng: number;
}

export default function StaticLocationMap({ lat, lng }: StaticLocationMapProps) {
  return (
    <div className="h-[250px] w-full z-0 relative">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* On utilise un cercle pour donner une zone approximative au lieu d'un point exact (sécurité/confidentialité) */}
        <Circle 
          center={[lat, lng]} 
          radius={300} 
          pathOptions={{ fillColor: '#0ea5e9', fillOpacity: 0.2, color: '#0284c7', weight: 2 }} 
        />
      </MapContainer>
    </div>
  );
}
