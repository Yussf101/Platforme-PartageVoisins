"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

// Icône personnalisée pour marquer l'emplacement choisi
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  onLocationSelected: (lat: number, lng: number) => void;
  defaultLat?: number;
  defaultLng?: number;
}

// Composant pour écouter les clics sur la carte
function LocationMarker({ onLocationSelected, position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
}

// Composant pour forcer le redimensionnement initial (fixe les bugs de carte grise)
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
}

export default function LocationPicker({ onLocationSelected, defaultLat, defaultLng }: LocationPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    defaultLat && defaultLng ? new L.LatLng(defaultLat, defaultLng) : null
  );

  const defaultCenter: [number, number] = defaultLat && defaultLng 
    ? [defaultLat, defaultLng] 
    : [34.020882, -6.84165]; // Rabat par défaut

  return (
    <div className="h-[300px] w-full rounded-md border border-gray-300 overflow-hidden relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <MapResizer />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelected={onLocationSelected} position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
}
