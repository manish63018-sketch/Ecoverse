"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Activity, Shield, Users } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import dynamic from "next/dynamic";

// Dynamic import of Leaflet map to prevent SSR issues
const LiveMap = dynamic(() => import("@/components/sections/LiveMap"), { ssr: false });

export default function MapPage() {
  const [volunteersCount, setVolunteersCount] = useState(0);
  const [ngosCount, setNgosCount] = useState(0);
  const [rescuesCount, setRescuesCount] = useState(0);

  useEffect(() => {
    // 1. Count Volunteers
    const qVolunteers = query(collection(db, "public_profiles"), where("roles", "array-contains", "volunteer"));
    const unsubVolunteers = onSnapshot(qVolunteers, (snapshot) => {
      let count = 0;
      snapshot.forEach((doc) => {
        if (doc.data().volunteerInfo?.availableNow) count++;
      });
      setVolunteersCount(count);
    });

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
          zIndex: 100
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", color: "rgba(232,245,233,0.7)", textDecoration: "none" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>EcoVerse Live India Map</h1>
            <p style={{ fontSize: "0.75rem", color: "rgba(232,245,233,0.5)", margin: "2px 0 0 0" }}>Real-time volunteer distribution and open rescue alerts</p>
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

      {/* Main Map Viewer */}
      <div style={{ flex: 1, position: "relative" }}>
        <LiveMap />
        
        {/* Float Sidebar info card */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            zIndex: 10,
            background: "rgba(15, 26, 16, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(102, 187, 106, 0.15)",
            borderRadius: "var(--radius-xl)",
            padding: "20px",
            width: "280px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}
          className="map-legend-card"
        >
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 12px 0", color: "#66BB6A" }}>Map Legends & Safety</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#66BB6A" }}></div>
              <span>Active Rescuers / Volunteers</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#EF5350", boxShadow: "0 0 8px #EF5350" }}></div>
              <span>Open Rescue Cases (Jittered)</span>
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
    </div>
  );
}
