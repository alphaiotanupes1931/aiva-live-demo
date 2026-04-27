import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Leaflet's defaults break under bundlers)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapViewProps {
  label?: string;
  className?: string;
  height?: number;
  /** Optional explicit coords. If omitted, geocodes `label` via OSM Nominatim. */
  lat?: number;
  lng?: number;
}

const FALLBACK = { lat: 38.9012, lng: -77.2653, label: "Vienna, VA" }; // Vienna, VA

/**
 * Real interactive map powered by OpenStreetMap + Leaflet.
 * No API key required. Geocodes the provided label via Nominatim.
 */
export const MapView = ({ label, className, height = 180, lat, lng }: MapViewProps) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    lat != null && lng != null ? { lat, lng } : null,
  );

  useEffect(() => {
    if (lat != null && lng != null) {
      setCoords({ lat, lng });
      return;
    }
    if (!label) {
      setCoords({ lat: FALLBACK.lat, lng: FALLBACK.lng });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(label)}`,
          { headers: { Accept: "application/json" } },
        );
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data) && data[0]) {
          setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        } else {
          setCoords({ lat: FALLBACK.lat, lng: FALLBACK.lng });
        }
      } catch {
        if (!cancelled) setCoords({ lat: FALLBACK.lat, lng: FALLBACK.lng });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [label, lat, lng]);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-border bg-muted ${className ?? ""}`}
      style={{ height }}
    >
      {coords ? (
        <MapContainer
          key={`${coords.lat}-${coords.lng}`}
          center={[coords.lat, coords.lng]}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <Marker position={[coords.lat, coords.lng]} icon={defaultIcon}>
            {label && <Popup>{label}</Popup>}
          </Marker>
        </MapContainer>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
          Loading map…
        </div>
      )}
      <div className="absolute bottom-1 right-2 text-[9px] text-foreground/60 bg-white/70 backdrop-blur-sm px-1.5 py-0.5 rounded pointer-events-none">
        © OpenStreetMap
      </div>
    </div>
  );
};
