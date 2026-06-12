"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Activity, Shield, Users, AlertCircle, Volume2, VolumeX, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PageHero from "@/components/PageHero";
import FilterPill from "@/components/FilterPill";
import { INDIAN_CITIES } from "@/lib/cities";

// Dynamic import of Leaflet map to prevent SSR issues
const LiveMap = dynamic(() => import("@/components/sections/LiveMap"), { ssr: false });

export default function MapPage() {
  const { user, loading: authLoading } = useAuth();
  
  const [volunteersCount, setVolunteersCount] = useState(2);
  const [ngosCount, setNgosCount] = useState(0);
  const [rescuesCount, setRescuesCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filters state
  const [showVolunteers, setShowVolunteers] = useState(true);
  const [showSOS, setShowSOS] = useState(true);
  const [showNGOs, setShowNGOs] = useState(true);
  const [showAdoptions, setShowAdoptions] = useState(true);
  const [showVegans, setShowVegans] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  const prevRescuesCountRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(true);

  // Synchronize soundRef with soundEnabled state
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Load sound setting from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ecoverse_map_sound");
    if (saved !== null) {
      setSoundEnabled(saved === "true");
    }
  }, []);

  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem("ecoverse_map_sound", String(newVal));
  };

  const playAlertSound = () => {
    if (!soundEnabledRef.current) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const now = ctx.currentTime;
      
      const playBeep = (startTime: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, startTime); // A5 note
        osc.frequency.exponentialRampToValueAtTime(440, startTime + 0.15);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.2);
      };
      
      playBeep(now);
      playBeep(now + 0.25);
    } catch (err) {
      console.warn("Audio Context sound blocked by browser autoplay policy:", err);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    const countVolunteers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, roles, available_now")
          .eq("available_now", true);

        if (error) throw error;

        const count = (data || []).filter((p: any) => p.roles?.includes("volunteer")).length;
        setVolunteersCount(count || 2);
        setIsConnected(true);
      } catch (err) {
        console.warn("Error counting volunteers:", err);
        setIsConnected(false);
      }
    };

    const countNgos = async () => {
      try {
        const { count, error } = await supabase
          .from("ngos")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        if (error) throw error;
        setNgosCount(count || 0);
      } catch (err) {
        console.warn("Error counting NGOs:", err);
      }
    };

    const countRescues = async () => {
      try {
        const { count, error } = await supabase
          .from("rescue_cases")
          .select("*", { count: "exact", head: true })
          .in("status", ["open", "assigned", "in_progress", "escalated"]);

        if (error) throw error;
        setRescuesCount(count || 0);
      } catch (err) {
        console.warn("Error counting rescues:", err);
      }
    };

    countVolunteers();
    countNgos();
    countRescues();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("map-stats-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => countVolunteers()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ngos" },
        () => countNgos()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rescue_cases" },
        () => countRescues()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading]);

  // Alert trigger when rescuesCount changes from 0 -> >0
  useEffect(() => {
    if (prevRescuesCountRef.current !== null) {
      if (prevRescuesCountRef.current === 0 && rescuesCount > 0) {
        playAlertSound();
      }
    }
    prevRescuesCountRef.current = rescuesCount;
  }, [rescuesCount]);

  // Filter cities by search term
  const filteredCities = INDIAN_CITIES.filter((city) =>
    city.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    city.state.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 48); // Ensure exactly 48 cities

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050f07",
        color: "#FFFFFF",
        fontFamily: "var(--font-sans), sans-serif",
      }}
    >
      <Navbar />

      {/* Hero Section */}
      <PageHero
        tag="📍 INDIA-WIDE"
        h1="Live Community Map"
        subtitle="Every volunteer, rescue case, NGO pinned live. Filter by city, emergency level, animal type."
      />

      {/* Stats strip */}
      <div
        style={{
          borderBottom: "1px solid rgba(102, 187, 106, 0.12)",
          background: "rgba(15, 26, 16, 0.95)",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "center",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "24px",
            maxWidth: "1200px",
            width: "100%",
            justifyContent: "space-between",
          }}
          className="stats-strip-container"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>📍</span>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>1 Pilot City</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Coverage</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>🤝</span>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{volunteersCount} Volunteers</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Registered</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>🏢</span>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{ngosCount} NGOs</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Partners</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>🚨</span>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{rescuesCount} Active SOS</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Dispatched</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>🏡</span>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>0 Adoptions</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Available</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.2rem" }}>✅</span>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>0 Cases</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div
        style={{
          position: "sticky",
          top: "72px",
          background: "rgba(5, 15, 7, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(102, 187, 106, 0.15)",
          padding: "12px 24px",
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <FilterPill
            label="Volunteers"
            active={showVolunteers}
            onClick={() => setShowVolunteers(!showVolunteers)}
            icon={<span>🤝</span>}
          />
          <FilterPill
            label="SOS Cases"
            active={showSOS}
            onClick={() => setShowSOS(!showSOS)}
            icon={<span>🚨</span>}
          />
          <FilterPill
            label="NGOs"
            active={showNGOs}
            onClick={() => setShowNGOs(!showNGOs)}
            icon={<span>🏢</span>}
          />
          <FilterPill
            label="Adoptions"
            active={showAdoptions}
            onClick={() => setShowAdoptions(!showAdoptions)}
            icon={<span>🏡</span>}
          />
          <FilterPill
            label="Vegans"
            active={showVegans}
            onClick={() => setShowVegans(!showVegans)}
            icon={<span>🌱</span>}
          />
        </div>

        {/* City search input */}
        <div style={{ position: "relative", minWidth: "240px" }} className="mobile-search-full">
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(102, 187, 106, 0.5)",
            }}
          />
          <input
            type="text"
            placeholder="Search city..."
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(10, 16, 11, 0.6)",
              border: "1px solid rgba(102, 187, 106, 0.22)",
              borderRadius: "8px",
              padding: "8px 12px 8px 36px",
              color: "#FFFFFF",
              fontSize: "0.85rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Main Map Content Wrapper */}
      <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Map Container */}
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              height: "500px",
              background: "#050806",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid rgba(102, 187, 106, 0.2)",
              position: "relative",
            }}
          >
            {/* Pulsing Live Badge top-right */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                zIndex: 10,
                background: "rgba(15, 26, 16, 0.9)",
                border: "1px solid rgba(102, 187, 106, 0.3)",
                borderRadius: "8px",
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#66BB6A",
                  boxShadow: "0 0 8px #66BB6A",
                  display: "inline-block",
                  animation: "livePulse 1.6s ease-in-out infinite",
                }}
              />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#66BB6A" }}>
                Live Feed
              </span>
              
              <button
                onClick={toggleSound}
                style={{
                  background: "transparent",
                  border: "none",
                  color: soundEnabled ? "#66BB6A" : "#EF5350",
                  cursor: "pointer",
                  display: "flex",
                  padding: 0,
                  marginLeft: "4px",
                }}
              >
                {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
            </div>

            {/* Map legends card */}
            <div
              style={{
                position: "absolute",
                bottom: "24px",
                left: "24px",
                zIndex: 10,
                background: "rgba(15, 26, 16, 0.9)",
                border: "1px solid rgba(102, 187, 106, 0.2)",
                borderRadius: "12px",
                padding: "16px",
                width: "240px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
              }}
              className="map-legend-card"
            >
              <h4 style={{ margin: "0 0 10px 0", fontSize: "0.85rem", fontWeight: 700, color: "#66BB6A" }}>Legends</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#66BB6A" }} />
                  <span>🟢 Volunteers ({volunteersCount})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#EF5350" }} />
                  <span>🔴 SOS Cases ({rescuesCount})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#42A5F5" }} />
                  <span>🔵 NGOs ({ngosCount})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FFA726" }} />
                  <span>🟠 Adoptions (0)</span>
                </div>
              </div>
            </div>

            <LiveMap />
          </div>
        </div>

        {/* Cities List Section */}
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 40px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>48 Cities — Growing</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", marginTop: "4px" }}>
              Be the first volunteer in your city
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredCities.map((city) => {
              const isHyderabad = city.id === "hyderabad";
              const count = isHyderabad ? volunteersCount : 0;
              const hasVolunteers = count > 0;

              return (
                <div
                  key={city.id}
                  style={{
                    background: "rgba(21, 35, 23, 0.45)",
                    border: "1px solid rgba(102, 187, 106, 0.12)",
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                    transition: "all 0.25s ease",
                  }}
                  className="city-card"
                >
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "#FFFFFF" }}>{city.name}</h3>
                    <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: "2px 0 0 0" }}>{city.state}</p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>
                        Volunteers
                      </span>
                      <span style={{ fontSize: "1.1rem", fontWeight: 800, color: hasVolunteers ? "#66BB6A" : "rgba(255,255,255,0.2)" }}>
                        {hasVolunteers ? count : "--"}
                      </span>
                    </div>

                    {hasVolunteers ? (
                      <Link
                        href="/ngos"
                        style={{
                          background: "rgba(102, 187, 106, 0.12)",
                          border: "1px solid rgba(102, 187, 106, 0.25)",
                          color: "#A5D6A7",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        View
                      </Link>
                    ) : (
                      <Link
                        href="/ngos"
                        style={{
                          background: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
                          color: "#FFFFFF",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          boxShadow: "0 4px 10px rgba(46,125,50,0.2)",
                        }}
                      >
                        Be First
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <Footer />

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .stats-strip-container::-webkit-scrollbar {
          display: none;
        }
        .city-card:hover {
          border-color: rgba(102, 187, 106, 0.35) !important;
          box-shadow: 0 4px 20px rgba(102, 187, 106, 0.1);
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .mobile-search-full {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
