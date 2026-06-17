"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Controversy } from "@/lib/api";

// Fix Leaflet default icon issues in client environments
const setupLeafletDefaultIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

interface SignalMapProps {
  controversies: Controversy[];
  onSelectCompany: (companyName: string) => void;
  selectedCompany: string | null;
}

// Custom Leaflet DivIcon based on controversy severity
const getSeverityIcon = (severity: number, isSelected: boolean) => {
  let color = "#EAB308"; // Yellow (Low risk < 65)
  if (severity >= 80) {
    color = "#EF4444"; // Red (High risk >= 80)
  } else if (severity >= 65) {
    color = "#F97316"; // Orange (Medium risk 65-80)
  }

  const borderSize = isSelected ? "3px" : "1.5px";
  const borderColor = isSelected ? "#38BDF8" : "#030712";
  const size = isSelected ? 24 : 18;
  const shadowGlow = isSelected ? `0 0 14px ${color}` : `0 0 8px ${color}`;

  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <div style="
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border-radius: 50%;
          border: ${borderSize} solid ${borderColor};
          box-shadow: ${shadowGlow};
          cursor: pointer;
          transition: all 0.2s ease;
        "></div>
        <div style="
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border-radius: 50%;
          animation: marker-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
          opacity: 0.35;
          pointer-events: none;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Map controller to handle dynamic center and zoom updates
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

export default function SignalMap({ controversies, onSelectCompany, selectedCompany }: SignalMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState<number>(2);

  useEffect(() => {
    setupLeafletDefaultIcon();
  }, []);

  // Update map viewport when a company is selected from components/sidebar
  useEffect(() => {
    if (selectedCompany && controversies.length > 0) {
      const related = controversies.find((c) => c.company === selectedCompany);
      if (related) {
        setMapCenter([related.latitude, related.longitude]);
        setMapZoom(5);
      }
    }
  }, [selectedCompany, controversies]);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-border glass-panel">
      {/* CSS Animation Keyframes Injector */}
      <style jsx global>{`
        @keyframes marker-ping {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
      `}</style>
      
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full min-h-[400px] md:min-h-[550px]"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapController center={mapCenter} zoom={mapZoom} />

        {controversies.map((cont) => {
          const isSelected = selectedCompany === cont.company;
          return (
            <Marker
              key={cont.id}
              position={[cont.latitude, cont.longitude]}
              icon={getSeverityIcon(cont.severity, isSelected)}
              eventHandlers={{
                click: () => {
                  onSelectCompany(cont.company);
                },
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 max-w-xs text-sm">
                  {/* Title / Company Header */}
                  <div className="flex justify-between items-start gap-3">
                    <span className="font-semibold text-primary text-base hover:underline cursor-pointer" onClick={() => onSelectCompany(cont.company)}>
                      {cont.company}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                        cont.severity >= 80
                          ? "bg-red-950/80 text-red-400 border border-red-800"
                          : cont.severity >= 65
                          ? "bg-orange-950/80 text-orange-400 border border-orange-800"
                          : "bg-yellow-950/80 text-yellow-400 border border-yellow-800"
                      }`}
                    >
                      SEV: {cont.severity}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-x-2 text-[11px] text-gray-400 font-mono">
                    <div>Category: <span className="text-gray-200">{cont.category}</span></div>
                    <div>Sector: <span className="text-gray-200">{cont.sector}</span></div>
                    <div>Country: <span className="text-gray-200">{cont.country}</span></div>
                    <div>Date: <span className="text-gray-200">{cont.date}</span></div>
                  </div>

                  {/* GDELT News Source */}
                  <div className="border-t border-border/80 pt-2 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Latest News (GDELT)</div>
                    <div className="font-medium text-gray-200 text-xs leading-snug line-clamp-2">
                      {cont.headline}
                    </div>
                    <a
                      href={cont.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[11px] text-primary hover:text-sky-300 font-medium"
                    >
                      Read Source ({cont.source_domain}) &rarr;
                    </a>
                  </div>

                  {/* SEC Disclosure Source */}
                  <div className="border-t border-border/80 pt-2 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">SEC disclosure ({cont.filing_type})</div>
                    <p className="text-[11px] italic text-gray-300 leading-snug line-clamp-2">
                      {cont.sec_disclosure}
                    </p>
                    <a
                      href={cont.sec_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[11px] text-secondary hover:text-indigo-300 font-medium"
                    >
                      View SEC Edgar Filing &rarr;
                    </a>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => onSelectCompany(cont.company)}
                      className="text-[11px] w-full mt-1 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary px-2 py-1 rounded font-semibold transition"
                    >
                      Select Company Profile
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
