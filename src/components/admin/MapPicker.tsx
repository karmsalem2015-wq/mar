// src/components/admin/MapPicker.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

interface MapPickerProps {
  lat: string | number;
  lng: string | number;
  onChange: (lat: number, lng: number) => void;
  defaultCity?: string;
}

export default function MapPicker({ lat, lng, onChange, defaultCity = 'جدة' }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Saudi default coordinates (Jeddah)
  const DEFAULT_LAT = 21.5433;
  const DEFAULT_LNG = 39.1728;

  const currentLat = parseFloat(lat as string) || DEFAULT_LAT;
  const currentLng = parseFloat(lng as string) || DEFAULT_LNG;

  useEffect(() => {
    // Dynamic import to prevent SSR rendering error in Next.js
    import('leaflet').then((L) => {
      if (!mapContainerRef.current) return;

      // Fix default marker icon paths in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Initialize map instance if not already defined
      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current).setView([currentLat, currentLng], 12);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const marker = L.marker([currentLat, currentLng], { draggable: true }).addTo(map);
        markerRef.current = marker;

        // Update coordinates on drag end
        marker.on('dragend', () => {
          const position = marker.getLatLng();
          onChange(parseFloat(position.lat.toFixed(6)), parseFloat(position.lng.toFixed(6)));
        });

        // Click on map to position the marker
        map.on('click', (e: any) => {
          const { lat: clickLat, lng: clickLng } = e.latlng;
          marker.setLatLng([clickLat, clickLng]);
          onChange(parseFloat(clickLat.toFixed(6)), parseFloat(clickLng.toFixed(6)));
        });

        setIsLoaded(true);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position if coordinates change externally
  useEffect(() => {
    if (markerRef.current && mapRef.current && isLoaded) {
      const markerLatLng = markerRef.current.getLatLng();
      if (markerLatLng.lat !== currentLat || markerLatLng.lng !== currentLng) {
        markerRef.current.setLatLng([currentLat, currentLng]);
        mapRef.current.panTo([currentLat, currentLng]);
      }
    }
  }, [currentLat, currentLng, isLoaded]);

  // Geocode location by city search query
  const handleFocusCity = () => {
    const searchQuery = encodeURIComponent(`${defaultCity} Saudi Arabia`);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data[0]) {
          const newLat = parseFloat(data[0].lat);
          const newLng = parseFloat(data[0].lon);
          onChange(newLat, newLng);
        }
      })
      .catch((err) => console.error('Geocoding error:', err));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--neu-text-muted)] font-medium">
          انقر فوق الخارطة أو اسحب المؤشر لتحديد الإحداثيات الجغرافية بدقة
        </span>
        <button
          type="button"
          onClick={handleFocusCity}
          className="text-xs text-[var(--neu-gold)] hover:underline font-bold"
        >
          تركيز الخارطة على مدينة {defaultCity}
        </button>
      </div>
      <div
        ref={mapContainerRef}
        className="w-full h-64 rounded-xl border border-[var(--neu-depressed)] overflow-hidden z-0 bg-[var(--neu-depressed)] neu-inset-sm"
        style={{ minHeight: '260px' }}
      />
    </div>
  );
}
