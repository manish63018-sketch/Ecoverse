"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft, Plus, MapPin, Activity, Shield, Clock,
  AlertCircle, CheckCircle, Search, Filter, ChevronDown,
  Layers, Navigation
} from "lucide-react";
import toast from "react-hot-toast";
import type { RescueCase } from "@/types/rescue";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getApiUrl } from "@/lib/api";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  critical: { bg: "rgba(239,83,80,0.15)",   text: "#EF5350" },
  high:     { bg: "rgba(255,167,38,0.15)",   text: "#FFA726" },
  medium:   { bg: "rgba(255,213,79,0.12)",   text: "#FFE082" },
  low:      { bg: "rgba(102,187,106,0.12)",  text: "#A5D6A7" },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open:        { bg: "rgba(239,83,80,0.1)",  text: "#EF5350" },
  assigned:    { bg: "rgba(66,165,245,0.1)", text: "#42A5F5" },
  in_progress: { bg: "rgba(255,167,38,0.1)", text: "#FFA726" },
  escalated:   { bg: "rgba(255,61,0,0.12)",  text: "#FF6D00" },
  resolved:    { bg: "rgba(102,187,106,0.1)", text: "#66BB6A" },
};

const ANIMAL_ICONS: Record<string, string> = {
  dog: "🐶", cat: "🐱", cow: "🐮", bird: "🐦", pigeon: "🕊️", other: "🐾",
};




// Location scope levels
type LocationScope = "area" | "city" | "state";

export default function RescuePage() {
  const { user, loading: authLoading } = useAuth();

  const [cases, setCases] = useState<(RescueCase & { city_name?: string; state_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<LocationScope>("area");
  const [userLocation, setUserLocation] = useState<{
    area_id?: string;
    city_id?: string;
    state_id?: string;
    display_zone?: string;
    area_name?: string;
  } | null>(null);

  // Filters
  const [searchTerm, setSearchTerm]     = useState("");
  const [animalFilter, setAnimalFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  // ── Load user's location profile ─────────────────────────────
  useEffect(() => {
    if (!user) return;
    const loadUserLocation = async () => {
      try {
        const res = await fetch(getApiUrl(`/api/users/location?firebase_uid=${user.uid}`));
        if (!res.ok) throw new Error("Failed to fetch location profile");
        const data = await res.json();
        const profile = data.profile;
        if (profile) {
          setUserLocation({
            area_id: profile.area_id ?? undefined,
            city_id: profile.city_id ?? undefined,
            state_id: profile.state_id ?? undefined,
            display_zone: profile.display_zone,
            area_name: profile.area_name,
          });
        }
      } catch (e) {
        console.error("Failed to load user location profile", e);
      }
    };
    loadUserLocation();
  }, [user]);

  // ── Fetch cases by scope ─────────────────────────────────────
  const fetchCases = useCallback(async () => {
    setLoading(true);

    try {
      let url = "/api/rescues";

      if (user) {
        // Build query params based on scope
        if (userLocation && userLocation.area_id !== "all-areas") {
          if (scope === "area" && userLocation.area_id) {
            url += `?area_id=${userLocation.area_id}`;
          } else if (scope === "city" && userLocation.city_id) {
            url += `?city_id=${userLocation.city_id}`;
          } else if (scope === "state" && userLocation.state_id) {
            url += `?state_id=${userLocation.state_id}`;
          } else {
            // Fallback: use firebase_uid for auto-detection
            url += `?firebase_uid=${user.uid}`;
          }
        } else {
          url += `?firebase_uid=${user.uid}`;
        }
      }

      const res = await fetch(getApiUrl(url));
      const data = await res.json();
      setCases(data.cases ?? []);
    } catch (err) {
      console.error("Failed to fetch rescue cases", err);
      toast.error("Failed to load rescue feed");
    } finally {
      setLoading(false);
    }
  }, [user, scope, userLocation]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setUserLocation({
        display_zone: "All Active Locations",
        area_name: "All Areas",
        area_id: "all-areas"
      });
    }
    fetchCases();
    // Refresh every 30 seconds for near-real-time feel
    const interval = setInterval(fetchCases, 30000);
    return () => clearInterval(interval);
  }, [user, authLoading, fetchCases]);

  const handleAcceptDispatch = async (caseId: string) => {
    if (!user) return toast.error("Please login to accept dispatches");
    try {
      const res = await fetch(getApiUrl(`/api/rescues/${caseId}/respond`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteer_id: user.uid, response: "accepted" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to accept");

      // Sync to Firestore
      try {
        await updateDoc(doc(db, "rescues", caseId), {
          status: "dispatched",
          assignedVolunteerId: user.uid
        });
      } catch (fsErr) {
        console.error("Failed to sync volunteer assignment to Firestore:", fsErr);
      }

      toast.success("✅ Rescue case accepted! You are now assigned.");
      fetchCases();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to accept rescue case");
    }
  };

  // Apply client-side filters
  const filtered = cases.filter((r) => {
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      if (
        !r.condition_summary?.toLowerCase().includes(t) &&
        !r.display_zone?.toLowerCase().includes(t) &&
        !r.animal_type?.toLowerCase().includes(t)
      ) return false;
    }
    if (animalFilter !== "all" && r.animal_type !== animalFilter) return false;
    if (severityFilter !== "all" && r.emergency_level !== severityFilter) return false;
    return true;
  });

  const hasNoLocation = !userLocation?.area_id;

  return (
    <div style={{ minHeight: "100vh", background: "#0a1a0e", color: "#E8F5E9", fontFamily: "var(--font-sans), sans-serif", paddingBottom: "80px" }}>
      <Navbar />

      <div style={{ paddingTop: "72px" }}>
        {/* ── Sticky Header ─────────────────────────────────────── */}
        <div style={{
          background: "rgba(15,26,16,0.95)",
          borderBottom: "1px solid rgba(102,187,106,0.12)",
          padding: "18px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: "72px", zIndex: 50,
          backdropFilter: "blur(16px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/" style={{ color: "rgba(232,245,233,0.55)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem" }}>
              <ArrowLeft size={16} /> Home
            </Link>
            <div>
              <h1 style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
                Live Rescue Board
              </h1>
              {userLocation?.display_zone && (
                <p style={{ fontSize: "0.72rem", color: "rgba(232,245,233,0.45)", margin: "2px 0 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Navigation size={10} /> {userLocation.display_zone}
                </p>
              )}
            </div>
          </div>
          <Link
            href="/sos"
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "linear-gradient(135deg, #EF5350, #C62828)",
              border: "none", color: "#FFFFFF",
              fontWeight: 700, fontSize: "0.85rem",
              padding: "10px 18px", borderRadius: "999px",
              textDecoration: "none", boxShadow: "0 4px 12px rgba(239,83,80,0.3)",
            }}
          >
            <Plus size={15} /> Report SOS
          </Link>
        </div>

        <div className="container" style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 24px" }}>

          {/* ── Guest Warning Banner ───────────────────────────── */}
          {!user && (
            <div style={{
              padding: "16px 20px",
              background: "rgba(255,167,38,0.08)",
              border: "1px solid rgba(255,167,38,0.25)",
              borderRadius: "12px",
              marginBottom: "24px",
              display: "flex", gap: "12px", alignItems: "flex-start",
            }}>
              <AlertCircle size={18} style={{ color: "#FFA726", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <div style={{ fontWeight: 700, color: "#FFA726", fontSize: "0.9rem" }}>Guest Preview Mode</div>
                <p style={{ color: "rgba(232,245,233,0.6)", fontSize: "0.82rem", margin: "4px 0 8px 0" }}>
                  You are currently viewing the live rescue board in preview mode. Please log in or register to report new cases, receive dispatches, or contact other volunteers.
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Link
                    href="/login"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      color: "#FFA726", fontWeight: 700, fontSize: "0.8rem",
                      textDecoration: "none", padding: "6px 12px",
                      background: "rgba(255,167,38,0.1)", borderRadius: "6px",
                      border: "1px solid rgba(255,167,38,0.25)",
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      color: "#E8F5E9", fontWeight: 700, fontSize: "0.8rem",
                      textDecoration: "none", padding: "6px 12px",
                      background: "rgba(102,187,106,0.15)", borderRadius: "6px",
                      border: "1px solid rgba(102,187,106,0.25)",
                    }}
                  >
                    Join EcoVerse
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── No Location Warning ───────────────────────────── */}
          {user && hasNoLocation && (
            <div style={{
              padding: "16px 20px",
              background: "rgba(255,167,38,0.08)",
              border: "1px solid rgba(255,167,38,0.25)",
              borderRadius: "12px",
              marginBottom: "24px",
              display: "flex", gap: "12px", alignItems: "flex-start",
            }}>
              <AlertCircle size={18} style={{ color: "#FFA726", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <div style={{ fontWeight: 700, color: "#FFA726", fontSize: "0.9rem" }}>Location Not Set</div>
                <p style={{ color: "rgba(232,245,233,0.6)", fontSize: "0.82rem", margin: "4px 0 8px 0" }}>
                  Your area is not configured. Set your State → City → Area in your profile to see location-isolated rescue cases.
                </p>
                <Link
                  href="/profile"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    color: "#FFA726", fontWeight: 700, fontSize: "0.8rem",
                    textDecoration: "none", padding: "6px 12px",
                    background: "rgba(255,167,38,0.1)", borderRadius: "6px",
                    border: "1px solid rgba(255,167,38,0.25)",
                  }}
                >
                  <MapPin size={13} /> Set My Location
                </Link>
              </div>
            </div>
          )}

          {/* ── Location Scope Switcher ───────────────────────── */}
          {user && userLocation?.area_id && (
            <div style={{
              background: "rgba(21,35,23,0.5)",
              border: "1px solid rgba(102,187,106,0.12)",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Layers size={14} style={{ color: "#66BB6A" }} />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "rgba(232,245,233,0.7)" }}>Showing cases in:</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["area", "city", "state"] as LocationScope[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScope(s)}
                    style={{
                      background: scope === s ? "rgba(102,187,106,0.18)" : "rgba(10,16,11,0.5)",
                      border: `1px solid ${scope === s ? "rgba(102,187,106,0.45)" : "rgba(102,187,106,0.1)"}`,
                      color: scope === s ? "#A5D6A7" : "rgba(232,245,233,0.45)",
                      borderRadius: "8px",
                      padding: "7px 14px",
                      fontSize: "0.8rem",
                      fontWeight: scope === s ? 700 : 500,
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                      transition: "all 0.15s",
                      textTransform: "capitalize",
                    }}
                  >
                    {s === "area" ? `📍 ${userLocation.area_name ?? "My Area"}` : s === "city" ? "🏙 My City" : "🗺 My State"}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: "0.72rem", color: "rgba(232,245,233,0.35)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Shield size={11} />
                {scope === "area" ? "Strictest — same area only" : scope === "city" ? "All areas in your city" : "All cities in your state"}
              </div>
            </div>
          )}

          {/* ── Filter Bar ────────────────────────────────────── */}
          <div style={{
            background: "rgba(21,35,23,0.5)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(102,187,106,0.1)",
            borderRadius: "14px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center",
          }}>
            <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
              <Search size={15} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "rgba(102,187,106,0.4)" }} />
              <input
                type="text"
                placeholder="Search condition, location, or animal type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%", background: "rgba(10,16,11,0.6)",
                  border: "1px solid rgba(102,187,106,0.18)", borderRadius: "9px",
                  padding: "9px 14px 9px 38px", color: "#E8F5E9",
                  fontSize: "0.875rem", fontFamily: "var(--font-sans)", outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <Filter size={13} style={{ color: "rgba(102,187,106,0.4)" }} />
              <select value={animalFilter} onChange={(e) => setAnimalFilter(e.target.value)} style={selectStyle}>
                <option value="all">All Animals</option>
                {Object.entries(ANIMAL_ICONS).map(([t, icon]) => (
                  <option key={t} value={t}>{icon} {t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
              <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} style={selectStyle}>
                <option value="all">All Severities</option>
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          {/* ── Cases Feed ────────────────────────────────────── */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div className="spinner-green" />
              <p style={{ color: "rgba(232,245,233,0.4)", fontSize: "0.875rem", marginTop: "16px" }}>
                Loading rescue cases...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              background: "rgba(21,35,23,0.3)",
              border: "1px solid rgba(102,187,106,0.08)",
              borderRadius: "16px", padding: "60px 24px", textAlign: "center",
            }}>
              <Activity size={40} style={{ color: "#66BB6A", opacity: 0.3, marginBottom: "16px" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px 0" }}>
                {user && hasNoLocation ? "Set your location to see cases" : `No Active Cases in Your ${scope === "area" ? "Area" : scope === "city" ? "City" : "State"}`}
              </h3>
              <p style={{ color: "rgba(232,245,233,0.4)", fontSize: "0.85rem", margin: "0 0 20px 0" }}>
                {user && hasNoLocation
                  ? "Update your profile to start receiving location-specific rescue alerts."
                  : "Great news! No active animal emergencies in your area right now."}
              </p>
              {user && !hasNoLocation && scope !== "state" && (
                <button
                  onClick={() => setScope(scope === "area" ? "city" : "state")}
                  style={{
                    background: "rgba(102,187,106,0.1)", border: "1px solid rgba(102,187,106,0.25)",
                    color: "#A5D6A7", padding: "8px 18px", borderRadius: "8px",
                    fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <ChevronDown size={14} /> Expand to {scope === "area" ? "City" : "State"} View
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Count + scope badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.5)" }}>
                  {filtered.length} active case{filtered.length !== 1 ? "s" : ""}
                </span>
                <span style={{
                  fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px",
                  borderRadius: "4px", background: "rgba(102,187,106,0.1)",
                  border: "1px solid rgba(102,187,106,0.2)", color: "#A5D6A7",
                }}>
                  {!user ? "Guest View" : scope === "area" ? "📍 Area" : scope === "city" ? "🏙 City" : "🗺 State"} scope
                </span>
              </div>

              {filtered.map((rescue) => {
                const sev = SEVERITY_COLORS[rescue.emergency_level] ?? { bg: "rgba(255,255,255,0.05)", text: "#E8F5E9" };
                const stat = STATUS_COLORS[rescue.status] ?? { bg: "rgba(255,255,255,0.05)", text: "#E8F5E9" };
                const isAssignedToMe = user && rescue.assigned_volunteer_id === user.uid;
                const isOpen = rescue.status === "open";
                const dateStr = rescue.created_at
                  ? new Date(rescue.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                  : "recently";

                return (
                  <div
                    key={rescue.id}
                    style={{
                      background: rescue.emergency_level === "critical"
                        ? "rgba(30,16,16,0.6)"
                        : "rgba(21,35,23,0.45)",
                      backdropFilter: "blur(16px)",
                      border: rescue.emergency_level === "critical"
                        ? "1px solid rgba(239,83,80,0.25)"
                        : isAssignedToMe
                        ? "1px solid rgba(102,187,106,0.35)"
                        : "1px solid rgba(102,187,106,0.1)",
                      borderRadius: "16px",
                      padding: "22px",
                      display: "flex", flexDirection: "column", gap: "12px",
                      transition: "all 0.2s",
                    }}
                    className="rescue-card"
                  >
                    {/* Header row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "1.2rem" }}>{ANIMAL_ICONS[rescue.animal_type ?? "other"] ?? "🐾"}</span>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, textTransform: "capitalize" }}>
                            {rescue.animal_type} Emergency
                          </h3>
                          <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", background: sev.bg, color: sev.text, textTransform: "uppercase" }}>
                            {rescue.emergency_level}
                          </span>
                          <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", background: stat.bg, color: stat.text, textTransform: "uppercase" }}>
                            {rescue.status}
                          </span>
                        </div>
                        <p style={{ color: "rgba(232,245,233,0.45)", fontSize: "0.72rem", marginTop: "5px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={11} /> {dateStr}
                        </p>
                      </div>
                      {isAssignedToMe && (
                        <span style={{ fontSize: "0.7rem", color: "#66BB6A", fontWeight: 700, padding: "4px 10px", background: "rgba(102,187,106,0.12)", borderRadius: "6px", border: "1px solid rgba(102,187,106,0.3)", whiteSpace: "nowrap" }}>
                          ✅ My Case
                        </span>
                      )}
                    </div>

                    {/* Condition */}
                    <p style={{ fontSize: "0.875rem", lineHeight: 1.55, color: "rgba(232,245,233,0.85)", margin: 0 }}>
                      {rescue.condition_summary}
                    </p>

                    {/* Location */}
                    <div style={{ borderTop: "1px solid rgba(102,187,106,0.07)", paddingTop: "10px", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "rgba(232,245,233,0.6)" }}>
                      <MapPin size={13} style={{ color: "#66BB6A", flexShrink: 0 }} />
                      <span>{rescue.display_zone}</span>
                    </div>

                    {/* Actions */}
                    {rescue.status !== "resolved" && rescue.status !== "closed" && (
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                        {isAssignedToMe ? (
                          <div style={{ fontSize: "0.8rem", color: "#A5D6A7", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}>
                            <CheckCircle size={14} /> You are assigned
                          </div>
                        ) : rescue.status === "in_progress" || rescue.status === "assigned" ? (
                          <span style={{ fontSize: "0.78rem", color: "rgba(232,245,233,0.35)", fontWeight: 600 }}>
                            🔒 Volunteer Dispatched
                          </span>
                        ) : isOpen ? (
                          <button
                            onClick={() => handleAcceptDispatch(rescue.id)}
                            style={{
                              background: !user ? "rgba(255,255,255,0.06)" : "rgba(102,187,106,0.12)",
                              border: !user ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(102,187,106,0.25)",
                              color: !user ? "rgba(255,255,255,0.5)" : "#A5D6A7",
                              padding: "8px 18px",
                              borderRadius: "9px", fontWeight: 600,
                              cursor: "pointer", fontSize: "0.82rem",
                              fontFamily: "var(--font-sans)", transition: "all 0.15s",
                            }}
                            className="accept-btn"
                          >
                            {!user ? "🔒 Login to Accept" : "Accept Dispatch"}
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style>{`
        .spinner-green {
          width: 36px; height: 36px;
          border: 3px solid rgba(102,187,106,0.15);
          border-radius: 50%;
          border-top-color: #66BB6A;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .rescue-card:hover {
          border-color: rgba(102,187,106,0.22) !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .accept-btn:hover {
          background: #388E3C !important;
          color: #FFFFFF !important;
          border-color: #388E3C !important;
          box-shadow: 0 4px 12px rgba(46,125,50,0.2);
        }
      `}</style>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: "rgba(10,16,11,0.6)",
  border: "1px solid rgba(102,187,106,0.18)",
  borderRadius: "9px",
  padding: "8px 14px",
  color: "#E8F5E9",
  fontSize: "0.8rem",
  fontWeight: 600,
  fontFamily: "var(--font-sans)",
  outline: "none",
  cursor: "pointer",
};

