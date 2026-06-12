import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { INDIAN_CITIES } from "@/lib/cities";
import { useAuth } from "@/lib/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { cities, areas } from "@/lib/locations-data";

interface MapElement {
  id: string;
  type: "volunteer" | "ngo" | "rescue";
  lat: number;
  lng: number;
  label: string;
  details?: string;
  severity?: string;
}

function getCityCoords(cityName?: string): { lat: number; lng: number } {
  if (!cityName) return { lat: 20.5937, lng: 78.9629 };
  const normalized = cityName.toLowerCase().trim();
  if (normalized.includes("hyderabad")) return { lat: 17.3850, lng: 78.4867 };
  if (normalized.includes("mumbai")) return { lat: 19.0760, lng: 72.8777 };
  if (normalized.includes("delhi")) return { lat: 28.7041, lng: 77.1025 };
  if (normalized.includes("bengaluru") || normalized.includes("bangalore")) return { lat: 12.9716, lng: 77.5946 };
  if (normalized.includes("chennai")) return { lat: 13.0827, lng: 80.2707 };
  if (normalized.includes("kolkata")) return { lat: 22.5726, lng: 88.3639 };
  
  const seed = normalized.charCodeAt(0) + (normalized.charCodeAt(1) || 0);
  const lat = 10 + (seed % 18);
  const lng = 71 + (seed % 16);
  return { lat, lng };
}

function resolveMemberCoords(cityName?: string, areaName?: string): { lat: number; lng: number } {
  if (areaName) {
    const foundArea = areas.find(a => a.name.toLowerCase().trim() === areaName.toLowerCase().trim());
    if (foundArea && foundArea.lat && foundArea.lng) {
      return { lat: foundArea.lat, lng: foundArea.lng };
    }
  }
  if (cityName) {
    const foundCity = cities.find(c => c.name.toLowerCase().trim() === cityName.toLowerCase().trim() || c.slug === cityName.toLowerCase().trim());
    if (foundCity && foundCity.lat && foundCity.lng) {
      return { lat: foundCity.lat, lng: foundCity.lng };
    }
  }
  return getCityCoords(cityName);
}

export default function LiveMap() {
  const { user } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  
  // Realtime lists
  const [volunteers, setVolunteers] = useState<MapElement[]>([]);
  const [ngos, setNgos] = useState<MapElement[]>([]);
  const [rescues, setRescues] = useState<MapElement[]>([]);

  // Keep track of active layers/markers to clear them on updates
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [volsRes, ngosRes, rescuesRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, city_name, area_name, verification_status, roles, available_now"),
          supabase
            .from("ngos")
            .select("id, name, city_name, state_name"),
          supabase
            .from("rescue_cases")
            .select("*")
            .in("status", ["open", "assigned", "in_progress", "escalated"])
        ]);

        if (volsRes.data) {
          const vols = volsRes.data
            .filter((m: any) => m.roles?.includes("volunteer") && (m.available_now || m.verification_status === "verified"))
            .map((m: any) => {
              const coords = resolveMemberCoords(m.city_name, m.area_name);
              const jitterLat = (Math.random() - 0.5) * 0.012;
              const jitterLng = (Math.random() - 0.5) * 0.012;
              return {
                id: m.id,
                type: "volunteer" as const,
                lat: coords.lat + jitterLat,
                lng: coords.lng + jitterLng,
                label: m.full_name || "Volunteer",
                details: "Status: Online & Ready",
              };
            });
          setVolunteers(vols);
        }

        if (ngosRes.data) {
          const ngoList = ngosRes.data.map((n: any) => {
            const coords = n.lat && n.lng
              ? { lat: Number(n.lat), lng: Number(n.lng) }
              : resolveMemberCoords(n.city_name);
            const jitterLat = (Math.random() - 0.5) * 0.008;
            const jitterLng = (Math.random() - 0.5) * 0.008;
            return {
              id: n.id,
              type: "ngo" as const,
              lat: coords.lat + jitterLat,
              lng: coords.lng + jitterLng,
              label: n.name || "Partner NGO",
              details: "Stray Animal Support Center",
            };
          });
          setNgos(ngoList);
        }

        if (rescuesRes.data) {
          const activeRescues = rescuesRes.data.map((rc: any) => {
            const coords = rc.area_lat && rc.area_lng 
              ? { lat: Number(rc.area_lat), lng: Number(rc.area_lng) }
              : resolveMemberCoords(rc.city_name || rc.city_id);

            const jitterLat = (Math.random() - 0.5) * 0.006;
            const jitterLng = (Math.random() - 0.5) * 0.006;

            return {
              id: rc.id,
              type: "rescue" as const,
              lat: coords.lat + jitterLat,
              lng: coords.lng + jitterLng,
              label: `SOS: ${(rc.animal_type || "Animal").toUpperCase()}`,
              details: rc.condition_summary || rc.description || "Emergency case",
              severity: rc.emergency_level || "medium",
            };
          });
          setRescues(activeRescues);
        }
      } catch (err) {
        console.warn("Failed to fetch map data:", err);
      }
    };

    fetchData();

    // Poll every 15 seconds
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      layers: [
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        })
      ]
    });

    mapRef.current = map;

    // Create marker layer group
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    // Render pre-populated 48 cities as inactive bubbles
    INDIAN_CITIES.forEach((city) => {
      // Map approximate coordinates for each major city center (simulate for map view)
      let cityLat = 20.5937;
      let cityLng = 78.9629;

      if (city.id === "hyderabad") { cityLat = 17.3850; cityLng = 78.4867; }
      else if (city.id === "mumbai") { cityLat = 19.0760; cityLng = 72.8777; }
      else if (city.id === "delhi") { cityLat = 28.7041; cityLng = 77.1025; }
      else if (city.id === "bengaluru") { cityLat = 12.9716; cityLng = 77.5946; }
      else if (city.id === "chennai") { cityLat = 13.0827; cityLng = 80.2707; }
      else if (city.id === "kolkata") { cityLat = 22.5726; cityLng = 88.3639; }
      else {
        // approximate distributed coordinates to avoid overlapping
        const seed = city.name.charCodeAt(0) + city.name.charCodeAt(1);
        cityLat = 10 + (seed % 18);
        cityLng = 71 + (seed % 16);
      }

      L.circle([cityLat, cityLng], {
        color: "rgba(102, 187, 106, 0.25)",
        fillColor: "rgba(102, 187, 106, 0.05)",
        fillOpacity: 0.2,
        radius: 12000,
        weight: 1
      })
      .addTo(map)
      .bindPopup(`<strong>${city.name} (${city.state})</strong><br/><span style="color:#A5D6A7">Be the first volunteer in your city!</span>`);
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update live map markers when data changes
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    // Clear existing live markers
    markersGroupRef.current.clearLayers();

    // 1. Draw Volunteers (Green dots)
    volunteers.forEach((v) => {
      L.circleMarker([v.lat, v.lng], {
        radius: 6,
        fillColor: "#66BB6A",
        color: "#1B5E20",
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.9
      })
      .addTo(markersGroupRef.current!)
      .bindPopup(`<strong>🟢 Volunteer: ${v.label}</strong><br/>${v.details}`);
    });

    // 2. Draw NGOs (Blue pins)
    ngos.forEach((n) => {
      const blueIcon = L.icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [20, 32],
        iconAnchor: [10, 32],
        popupAnchor: [1, -26]
      });

      L.marker([n.lat, n.lng], { icon: blueIcon })
      .addTo(markersGroupRef.current!)
      .bindPopup(`<strong>🔵 Partner NGO: ${n.label}</strong><br/>${n.details}`);
    });

    // 3. Draw Active SOS Cases (Pulsing Red circles)
    rescues.forEach((r) => {
      L.circle([r.lat, r.lng], {
        radius: 400,
        color: "#EF5350",
        fillColor: "#EF5350",
        fillOpacity: 0.35,
        weight: 2,
        className: "pulsing-circle"
      })
      .addTo(markersGroupRef.current!)
      .bindPopup(`<strong>🔴 Active SOS: ${r.label}</strong><br/>Severity: <span style="color:#EF5350; font-weight:bold">${r.severity?.toUpperCase()}</span><br/>${r.details}<br/><br/><span style="font-size:0.75rem; color:#FFA726">Privacy offset applied (+/- 300m)</span>`);
    });

  }, [volunteers, ngos, rescues]);

  return (
    <>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%", zIndex: 1 }} />
      <style>{`
        .pulsing-circle {
          animation: pulse 1.8s ease-out infinite;
        }
        @keyframes pulse {
          0% { fill-opacity: 0.2; }
          50% { fill-opacity: 0.55; }
          100% { fill-opacity: 0.2; }
        }
      `}</style>
    </>
  );
}
