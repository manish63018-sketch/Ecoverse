"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Activity, Shield, Users, AlertCircle } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import dynamic from "next/dynamic";

// Dynamic import of Leaflet map to prevent SSR issues
const LiveMap = dynamic(() => import("@/components/sections/LiveMap"), { ssr: false });

export default function MapPage() {
  const [volunteersCount, setVolunteersCount] = useState(0);
  const [ngosCount, setNgosCount] = useState(0);
  const [rescuesCount, setRescuesCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Count Volunteers
    const qVolunteers = query(collection(db, "public_profiles"), where("roles", "array-contains", "volunteer"));
    const unsubVolunteers = onSnapshot(qVolunteers, (snapshot) => {
      let count = 0;
      snapshot.forEach((doc) => {
        if (doc.data().volunteerInfo?.availableNow) count++;
      });
      setVolunteersCount(count);
      setIsConnected(true); // Firestore connection confirmed
    }, () => setIsConnected(false));

    // 2. Count NGOs
    const qNgos = query(collection(db, "public_profiles"), where("roles", "array-contains", "ngo"));
    const unsubNgos = onSnapshot(qNgos, (snapshot) => {
      setNgosCount(snapshot.size);
    });

    // 3. Count Open Rescues
    const qRescues = query(collection(db, "rescues"), where("status", "in", ["reported", "dispatched", "in_progress"]));
    const unsubRescues = onSnapshot(qRescues, (snapshot) => {
      setRescuesCount(snapshot.size);
    });

    return () => {
      unsubVolunteers();
      unsubNgos();
      unsubRescues();
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#050806",
        color: "#FFFFFF",
        fontFamily: "var(--font-sans), sans-serif",
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          background: "rgba(15, 26, 16, 0.95)",
          borderBottom: "1px solid rgba(102, 187, 106, 0.15)",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", color: "rgba(232,245,233,0.7)", textDecoration: "none" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>EcoVerse Live India Map</h1>
              {/* LIVE indicator — only green when Firestore connected */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className={isConnected ? "live-dot live-dot-active" : "live-dot live-dot-inactive"} />
                <span style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: isConnected ? "#66BB6A" : "rgba(232,245,233,0.3)",
                  textTransform: "uppercase",
                }}>
                  {isConnected ? "Live" : "Connecting..."}
                </span>
              </div>
            </div>
            <p style={{ fontSize: "0.75rem", color: "rgba(232,245,233,0.5)", margin: "2px 0 0 0" }}>
              Real-time volunteer distribution and open rescue alerts
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }} className="counters-container">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ background: "rgba(102, 187, 106, 0.15)", color: "#66BB6A", padding: "6px", borderRadius: "50%", display: "flex" }}>
              <Users size={16} />
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{volunteersCount} Available</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(232,245,233,0.5)" }}>Volunteers</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ background: "rgba(239, 83, 80, 0.15)", color: "#EF5350", padding: "6px", borderRadius: "50%", display: "flex" }}>
              <Activity size={16} />
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{rescuesCount} Active</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(232,245,233,0.5)" }}>SOS Dispatches</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ background: "rgba(66, 165, 245, 0.15)", color: "#42A5F5", padding: "6px", borderRadius: "50%", display: "flex" }}>
              <Shield size={16} />
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{ngosCount} Verified</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(232,245,233,0.5)" }}>NGO Partners</div>
            </div>
          </div>
        </div>
      </header>

      {/* Active Emergency Banner — only shown when real open rescues exist */}
      {rescuesCount > 0 && (
        <div style={{
          background: "rgba(239, 83, 80, 0.12)",
          borderBottom: "1px solid rgba(239, 83, 80, 0.3)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          animation: "slideDown 0.3s ease",
        }}>
          <AlertCircle size={16} color="#EF5350" />
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#EF5350" }}>
            🚨 {rescuesCount} active emergency{rescuesCount > 1 ? " cases" : " case"} open right now — nearby rescuers have been alerted.
          </span>
        </div>
      )}

      {/* No emergencies message when 0 rescues */}
      {rescuesCount === 0 && isConnected && (
        <div style={{
          background: "rgba(102, 187, 106, 0.06)",
          borderBottom: "1px solid rgba(102, 187, 106, 0.12)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <span style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.4)" }}>
            ✅ No active emergencies right now. All quiet on the rescue front.
          </span>
        </div>
      )}

      {/* Main Map Viewer */}
      <div style={{ flex: 1, position: "relative" }}>
        <LiveMap />

        {/* Pixel dot CSS overlay on map container */}
        <div className="map-pixel-overlay" aria-hidden="true" />
        
        {/* Float Sidebar info card */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            zIndex: 10,
            background: "rgba(15, 26, 16, 0.88)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(102, 187, 106, 0.15)",
            borderRadius: "var(--radius-xl)",
            padding: "20px",
            width: "280px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
          className="map-legend-card"
        >
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 12px 0", color: "#66BB6A" }}>Map Legends &amp; Safety</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#66BB6A" }}></div>
              <span>Active Rescuers / Volunteers</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#EF5350", boxShadow: "0 0 8px #EF5350" }}></div>
              <span>Open Rescue Cases (Privacy offset applied)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#42A5F5" }}></div>
              <span>Partner NGO Locations</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "1px solid rgba(102,187,106,0.3)", background: "rgba(102,187,106,0.05)" }}></div>
              <span>Pilot Cities (Active/Inactive)</span>
            </div>
          </div>
          
          <div style={{ borderTop: "1px solid rgba(102,187,106,0.15)", marginTop: "14px", paddingTop: "12px", fontSize: "0.7rem", color: "rgba(232,245,233,0.5)", lineHeight: 1.4 }}>
            💡 <strong>Privacy Protection:</strong> Exact GPS coordinates of emergency cases are masked. Jitter offsets (+/- 300m) are applied publicly.
          </div>
        </div>
      </div>

      <style>{`
        /* LIVE indicator dot */
        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .live-dot-active {
          background: #66BB6A;
          box-shadow: 0 0 6px #66BB6A;
          animation: livePulse 1.6s ease-in-out infinite;
        }
        .live-dot-inactive {
          background: rgba(232,245,233,0.2);
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        /* Pixel dot CSS overlay on map */
        .map-pixel-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 1px 1px, #2E7D32 1px, transparent 0);
          background-size: 18px 18px;
          opacity: 0.06;
          pointer-events: none;
          z-index: 5;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .counters-container { display: none !important; }
          .map-legend-card { width: 220px !important; }
        }
      `}</style>
    </div>
  );
}
