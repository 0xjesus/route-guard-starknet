"use client";

import { useEffect, useRef, useState } from "react";

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#555555" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#222222" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1f2937" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#111111" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#00d4aa" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0c1929" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
];

interface GoogleMapViewProps {
  onMapClick: (lat: number, lng: number) => void;
}

export default function GoogleMapView({ onMapClick }: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => {
      if (!mapRef.current) return;
      const G = (window as any).google;
      const map = new G.maps.Map(mapRef.current, {
        center: { lat: 19.4326, lng: -99.1332 },
        zoom: 13,
        styles: DARK_MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        backgroundColor: "#0a0a0a",
      });
      setLoaded(true);

      map.addListener("click", (e: any) => {
        if (e.latLng) onMapClick(e.latLng.lat(), e.latLng.lng());
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => {},
          { enableHighAccuracy: false, timeout: 5000 }
        );
      }
    };
    document.head.appendChild(script);

    return () => { script.remove(); };
  }, [onMapClick]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/10 flex items-center justify-center">
            <span className="text-2xl">🗺️</span>
          </div>
          <h3 className="text-white/80 font-semibold mb-2">Map View</h3>
          <p className="text-white/40 text-sm max-w-xs">
            Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the interactive map.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full min-h-[500px]" />;
}
