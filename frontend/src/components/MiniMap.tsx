import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import type { Location } from "@/types";

const markerIcon = L.divIcon({
  className: "minimap-marker",
  html: `<div style="
    width: 12px; height: 12px;
    background: #ce82ff;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [map, center]);
  return null;
}

interface MiniMapProps {
  location: Location;
  className?: string;
}

export function MiniMap({ location, className = "" }: MiniMapProps) {
  const center: [number, number] = useMemo(
    () => [location.latitude, location.longitude],
    [location.latitude, location.longitude],
  );

  return (
    <div
      className={`rounded-lg overflow-hidden border border-[var(--color-border)] min-h-[64px] h-full w-full ${className}`}
    >
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%", minHeight: "64px" }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenter center={center} />
        <Marker position={center} icon={markerIcon} />
      </MapContainer>
    </div>
  );
}
