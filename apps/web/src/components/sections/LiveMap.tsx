import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { INDIAN_CITIES } from "@/lib/cities";
import { useAuth } from "@/context/AuthContext";

interface MapElement {
  id: string;
  type: "volunteer" | "ngo" | "rescue";
  lat: number;
  lng: number;
  label: string;
  details?: string;
  severity?: string;
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

  // Subscribe to Firestore collections in real-time or fall back to mock data
  useEffect(() => {

    // 1. Listen to Available Volunteers
    const qVolunteers = query(
      collection(db, "public_profiles"),
      where("roles", "array-contains", "volunteer")
    );
    const unsubVolunteers = onSnapshot(
      qVolunteers,
      (snapshot) => {
        const list: MapElement[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.volunteerInfo?.availableNow && data.volunteerInfo?.currentLocation) {
            list.push({
              id: doc.id,
              type: "volunteer",
              lat: data.volunteerInfo.currentLocation.latitude,
              lng: data.volunteerInfo.currentLocation.longitude,
              label: data.displayName || "Anonymous Volunteer",
              details: `Skills: ${data.volunteerInfo.skills?.join(", ") || "None"}`
            });
          }
        });
        setVolunteers(list);
      },
      (error) => {
        console.warn("Failed to listen to volunteers:", error);
      }
    );

    // 2. Listen to NGO partners
    const qNgos = query(
      collection(db, "public_profiles"),
      where("roles", "array-contains", "ngo")
    );

    const unsubNgos = onSnapshot(
      qNgos,
      (snapshot) => {
        const list: MapElement[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.ngoInfo) {
            list.push({
              id: doc.id,
              type: "ngo",
              lat: data.volunteerInfo?.currentLocation?.latitude || 17.4421, // fallback to Hyderabad center
              lng: data.volunteerInfo?.currentLocation?.longitude || 78.3812,
              label: data.ngoInfo.orgName || "Partner NGO",
              details: `Cause: ${data.ngoInfo.causeType || "Stray welfare"}`
            });
          }
        });
        setNgos(list);
      },
      (error) => {
        console.warn("Failed to listen to NGOs:", error);
      }
    );

    // 3. Listen to Open Rescues
    const qRescues = query(
      collection(db, "rescues"),
      where("status", "in", ["reported", "dispatched", "in_progress"])
    );
    const unsubRescues = onSnapshot(
      qRescues,
      (snapshot) => {
        const list: MapElement[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.location) {
            // Add a random jitter offset (+/- 0.003 degrees, about ~300 meters) for reporter privacy
            const jitterLat = (Math.random() - 0.5) * 0.006;
            const jitterLng = (Math.random() - 0.5) * 0.006;
            
            list.push({
              id: doc.id,
              type: "rescue",
              lat: data.location.latitude + jitterLat,
              lng: data.location.longitude + jitterLng,
              label: `SOS: ${data.animalType.toUpperCase()}`,
              details: data.conditionDescription,
              severity: data.severity
            });
          }
        });
        setRescues(list);
      },
      (error) => {
        console.warn("Failed to listen to rescues:", error);
      }
    );

    return () => {
      unsubVolunteers();
      unsubNgos();
      unsubRescues();
    };
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
