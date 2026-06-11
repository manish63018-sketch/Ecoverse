"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  AlertCircle, MapPin, Send, ArrowLeft, Phone,
  Shield, ChevronRight, Zap, Info
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { LocationSelection } from "@/types/location";
import type { EmergencyLevel } from "@/types/rescue";
import { getApiUrl } from "@/lib/api";

const LeafletMapPicker = dynamic(
  () => import("@/components/sections/MapPicker"),
  { ssr: false }
);
const LocationPicker = dynamic(
  () => import("@/components/sections/LocationPicker"),
  { ssr: false }
);

// ── Severity config ───────────────────────────────────────────────
const SEVERITY_CONFIG: Record<
  EmergencyLevel,
  { label: string; color: string; bg: string; icon: string; desc: string }
> = {
  low:      { label: "Low",      color: "#A5D6A7", bg: "rgba(102,187,106,0.1)",  icon: "🟢", desc: "Minor cut or scratch" },
  medium:   { label: "Medium",   color: "#FFE082", bg: "rgba(255,213,79,0.1)",   icon: "🟡", desc: "Limping or skin disease" },
  high:     { label: "High",     color: "#FFA726", bg: "rgba(255,167,38,0.12)",  icon: "🟠", desc: "Severe bleeding or fracture" },
  critical: { label: "Critical", color: "#EF5350", bg: "rgba(239,83,80,0.12)",   icon: "🔴", desc: "Life-threatening / unconscious" },
};

const ANIMAL_ICONS: Record<string, string> = {
  dog: "🐶", cat: "🐱", cow: "🐮", bird: "🐦", pigeon: "🕊️", other: "🐾",
};

export default function SOSReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Form state
  const [animalType, setAnimalType]     = useState("dog");
  const [condition, setCondition]       = useState("");
  const [severity, setSeverity]         = useState<EmergencyLevel>("medium");
  const [description, setDescription]   = useState("");
  const [phone, setPhone]               = useState("");
  const [address, setAddress]           = useState("");
  const [latitude, setLatitude]         = useState(17.4156);
  const [longitude, setLongitude]       = useState(78.4347);
  const [submitting, setSubmitting]     = useState(false);

  // Location selection (3-level)
  const [locationSelection, setLocationSelection] = useState<LocationSelection | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const handleLocationChange = useCallback((sel: LocationSelection | null) => {
    setLocationSelection(sel);
    // Auto-update map to area center if area has coordinates
    if (sel?.areaId) {
      // The area center coordinates could be fetched, but for now
      // the reporter's GPS or manual pick is the primary location
    }
  }, []);

  const handleAutoLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const areaLat = Math.round(pos.coords.latitude * 100) / 100;
          const areaLng = Math.round(pos.coords.longitude * 100) / 100;
          setLatitude(areaLat);
          setLongitude(areaLng);
          toast.success("Area location detected! (Exact GPS is not stored for privacy)");
        },
        () => toast.error("Could not access GPS. Please select location manually.")
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!locationSelection) {
      toast.error("Please select your State, City, and Area before submitting");
      return;
    }

    if (!condition.trim() || !phone.trim()) {
      toast.error("Please fill in the condition and contact phone number");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(getApiUrl("/api/rescues"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporter_user_id: user?.uid ?? null,
          state_id: locationSelection.stateId,
          city_id:  locationSelection.cityId,
          area_id:  locationSelection.areaId,
          exact_lat: latitude,
          exact_lng: longitude,
          animal_type: animalType,
          condition_summary: condition,
          emergency_level: severity,
          description: [
            description,
            address ? `Landmark: ${address}` : "",
            phone ? `Reporter phone: ${phone}` : "",
          ].filter(Boolean).join("\n"),
          reporter_name: user?.displayName || 'Ecoverse User',
          reporter_phone: phone || 'Not provided',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to submit rescue report");
      }

      // Sync to Firestore on the client side
      try {
        const newCase = data.case;
        await setDoc(doc(db, "rescues", newCase.id), {
          caseId: newCase.id,
          reporterId: user?.uid ?? "anonymous",
          reporterContact: {
            name: user?.displayName || "Ecoverse User",
            phone: phone || "Not provided",
          },
          animalType: animalType,
          conditionDescription: condition || "No description provided",
          severity: severity,
          status: "reported",
          location: {
            latitude: latitude,
            longitude: longitude,
            addressText: newCase.display_zone || locationSelection.areaName,
          },
          createdAt: newCase.created_at || new Date().toISOString(),
        });
      } catch (fsErr) {
        console.error("Client failed to sync new case to Firestore:", fsErr);
      }

      toast.success(
        `🚨 SOS reported in ${locationSelection.areaName}! Volunteers are being alerted.`,
        { duration: 5000 }
      );
      router.push("/rescue");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  const sevConfig = SEVERITY_CONFIG[severity];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #121e14 0%, #050806 100%)",
        color: "#FFFFFF",
        fontFamily: "var(--font-sans), sans-serif",
        padding: "40px 24px 60px",
      }}
    >
      <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Back Link */}
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            color: "rgba(232, 245, 233, 0.55)", textDecoration: "none",
            fontSize: "0.875rem", marginBottom: "28px", transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#66BB6A")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232, 245, 233, 0.55)")}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Page Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ background: "#EF5350", padding: "10px", borderRadius: "12px", display: "flex" }}>
              <AlertCircle size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#EF5350", letterSpacing: "-0.025em", margin: 0 }}>
                Report Animal Emergency
              </h1>
              <p style={{ color: "rgba(232,245,233,0.55)", marginTop: "4px", fontSize: "0.875rem" }}>
                Alerts are strictly contained — only volunteers in your selected area will be notified
              </p>
            </div>
          </div>

          {/* Isolation guarantee banner */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "12px 16px",
            background: "rgba(102,187,106,0.06)",
            border: "1px solid rgba(102,187,106,0.2)",
            borderRadius: "10px",
            fontSize: "0.8rem", color: "rgba(232,245,233,0.65)",
          }}>
            <Shield size={15} style={{ color: "#66BB6A", flexShrink: 0 }} />
            <span>
              <strong style={{ color: "#A5D6A7" }}>Location Isolation Active: </strong>
              A Banjara Hills SOS will NEVER appear in Secunderabad, Mumbai, or any other area.
              Our 3-level system guarantees strict zone separation.
            </span>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* ── SECTION 1: Location (Most Important) ────────────────── */}
          <div style={sectionStyle}>
            <SectionHeader
              icon={<MapPin size={16} color="#66BB6A" />}
              title="Emergency Location"
              subtitle="Select all 3 levels — this determines who gets alerted"
              step={1}
            />

            <LocationPicker onChange={handleLocationChange} required={true} />

            {/* Map */}
            <div style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(232,245,233,0.7)" }}>
                  Drop pin on map (area-level accuracy only)
                </span>
                <button
                  type="button"
                  onClick={handleAutoLocate}
                  style={{
                    background: "rgba(102,187,106,0.12)",
                    border: "1px solid rgba(102,187,106,0.3)",
                    color: "#A5D6A7",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "5px",
                  }}
                >
                  <MapPin size={13} /> Auto-detect GPS
                </button>
              </div>
              <div style={{ height: "200px", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(102,187,106,0.18)" }}>
                <LeafletMapPicker
                  lat={latitude}
                  lng={longitude}
                  onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
                />
              </div>
              <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "0.72rem", color: "rgba(232,245,233,0.4)" }}>
                <span>Area Lat: {latitude.toFixed(2)} (±~1.1km)</span>
                <span>Area Lng: {longitude.toFixed(2)} (±~1.1km)</span>
                <span style={{ color: "rgba(102,187,106,0.5)" }}>• Exact GPS never stored publicly</span>
              </div>
            </div>

            {/* Landmark / Address */}
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Landmark or Address Description</label>
              <input
                type="text"
                placeholder="e.g. Opposite Metro Pillar 124, Near KFC, Banjara Hills"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* ── SECTION 2: Animal & Emergency Details ───────────────── */}
          <div style={sectionStyle}>
            <SectionHeader
              icon={<AlertCircle size={16} color="#EF5350" />}
              title="Emergency Details"
              subtitle="Describe the animal and situation"
              step={2}
            />

            {/* Animal type + Severity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="detail-grid">
              {/* Animal Type */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Animal Type *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {Object.entries(ANIMAL_ICONS).map(([type, icon]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAnimalType(type)}
                      style={{
                        background: animalType === type ? "rgba(102,187,106,0.2)" : "rgba(10,16,11,0.6)",
                        border: `1px solid ${animalType === type ? "rgba(102,187,106,0.5)" : "rgba(102,187,106,0.15)"}`,
                        borderRadius: "8px",
                        padding: "7px 12px",
                        color: animalType === type ? "#A5D6A7" : "rgba(232,245,233,0.6)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "5px",
                        fontFamily: "var(--font-sans), sans-serif",
                        transition: "all 0.15s",
                        textTransform: "capitalize",
                      }}
                    >
                      {icon} {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Emergency Severity *</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {(Object.keys(SEVERITY_CONFIG) as EmergencyLevel[]).map((level) => {
                    const cfg = SEVERITY_CONFIG[level];
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSeverity(level)}
                        style={{
                          background: severity === level ? cfg.bg : "rgba(10,16,11,0.4)",
                          border: `1px solid ${severity === level ? cfg.color + "55" : "rgba(102,187,106,0.12)"}`,
                          borderRadius: "8px",
                          padding: "7px 12px",
                          color: severity === level ? cfg.color : "rgba(232,245,233,0.55)",
                          fontSize: "0.8rem",
                          fontWeight: severity === level ? 700 : 500,
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          fontFamily: "var(--font-sans), sans-serif",
                          transition: "all 0.15s",
                          textAlign: "left",
                        }}
                      >
                        <span>{cfg.icon} {cfg.label}</span>
                        <span style={{ fontSize: "0.72rem", opacity: 0.7 }}>{cfg.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Condition Summary */}
            <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Condition Summary *</label>
              <input
                type="text"
                placeholder="e.g. Dog with bleeding hind leg, cannot walk"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            {/* Full Description */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Additional Details</label>
              <textarea
                placeholder="Any extra details that will help rescuers... (colour, breed, what happened, nearby vehicles, etc.)"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          </div>

          {/* ── SECTION 3: Contact ───────────────────────────────────── */}
          <div style={sectionStyle}>
            <SectionHeader
              icon={<Phone size={16} color="#66BB6A" />}
              title="Your Contact"
              subtitle="Shared only with the volunteer assigned to this case"
              step={3}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={labelStyle}>Contact Phone Number *</label>
              <div style={{ position: "relative" }}>
                <Phone
                  size={15}
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(102,187,106,0.5)" }}
                />
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingLeft: "42px" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", fontSize: "0.72rem", color: "rgba(232,245,233,0.4)" }}>
                <Info size={12} />
                Your contact is only visible to the volunteer who accepts this rescue
              </div>
            </div>
          </div>

          {/* ── Submit ───────────────────────────────────────────────── */}
          <div>
            {/* Pre-submit summary */}
            {locationSelection && (
              <div style={{
                padding: "14px 16px",
                background: "rgba(239,83,80,0.06)",
                border: "1px solid rgba(239,83,80,0.2)",
                borderRadius: "10px",
                marginBottom: "16px",
                fontSize: "0.8rem",
              }}>
                <div style={{ fontWeight: 700, color: "#EF9A9A", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Zap size={13} /> Alert Preview
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", color: "rgba(232,245,233,0.65)" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <ChevronRight size={13} style={{ color: "#EF5350", flexShrink: 0, marginTop: "2px" }} />
                    Alerting: <strong style={{ color: "#E8F5E9" }}>Volunteers in {locationSelection.areaName}</strong> only
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <ChevronRight size={13} style={{ color: "#FFA726", flexShrink: 0, marginTop: "2px" }} />
                    Animal: <strong style={{ color: "#E8F5E9" }}>{ANIMAL_ICONS[animalType]} {animalType}</strong>
                    <span> · </span>Severity: <strong style={{ color: sevConfig.color }}>{sevConfig.icon} {sevConfig.label}</strong>
                  </div>
                  {severity === "critical" && (
                    <div style={{ display: "flex", gap: "6px", color: "#EF5350", fontWeight: 600 }}>
                      <ChevronRight size={13} style={{ flexShrink: 0, marginTop: "2px" }} />
                      NGO escalation will be triggered if no volunteer responds in 20 minutes
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !locationSelection}
              style={{
                width: "100%",
                background: locationSelection
                  ? "linear-gradient(135deg, #EF5350 0%, #C62828 100%)"
                  : "rgba(100,100,100,0.3)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: locationSelection ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                boxShadow: locationSelection ? "0 8px 24px rgba(239,83,80,0.35)" : "none",
                transition: "all 0.2s",
                fontFamily: "var(--font-sans), sans-serif",
              }}
              className={locationSelection ? "sos-submit-btn" : ""}
            >
              {submitting ? (
                <span className="spinner-white" />
              ) : (
                <>
                  <Send size={18} />
                  {locationSelection
                    ? `Dispatch Emergency Alert — ${locationSelection.areaName}`
                    : "Select location to continue"}
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      <style>{`
        .spinner-white {
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #FFFFFF;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sos-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow: 0 12px 28px rgba(239,83,80,0.45);
        }
        @media (max-width: 600px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Helper UI components ──────────────────────────────────────────

function SectionHeader({
  icon, title, subtitle, step,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  step: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "20px" }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "50%",
        background: "rgba(102,187,106,0.15)",
        border: "1px solid rgba(102,187,106,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.78rem", fontWeight: 800, color: "#A5D6A7",
        flexShrink: 0,
      }}>
        {step}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {icon}
          <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#E8F5E9" }}>{title}</h2>
        </div>
        <p style={{ fontSize: "0.78rem", color: "rgba(232,245,233,0.5)", margin: "3px 0 0 0" }}>{subtitle}</p>
      </div>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  background: "rgba(21, 35, 23, 0.45)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(102, 187, 106, 0.13)",
  borderRadius: "16px",
  padding: "28px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 700,
  color: "rgba(232, 245, 233, 0.75)",
  letterSpacing: "0.02em",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(10, 16, 11, 0.6)",
  border: "1px solid rgba(102, 187, 106, 0.22)",
  borderRadius: "10px",
  padding: "11px 14px",
  color: "#FFFFFF",
  fontSize: "0.9rem",
  fontFamily: "var(--font-sans), sans-serif",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};
