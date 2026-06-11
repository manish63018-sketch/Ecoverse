"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Building2, MapPin, Phone, Mail, Award, CheckCircle, 
  Search, X, Calendar, MessageSquare, AlertCircle, Info 
} from "lucide-react";
import toast from "react-hot-toast";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface NGO {
  id: string;
  name: string;
  city: "Hyderabad" | "Mumbai" | "Delhi" | "Bengaluru" | "Chennai";
  location: string;
  helpline: string;
  email: string;
  services: string[];
  description: string;
  verified: boolean;
  colorTheme: string; // Gradient for card accents
}

export default function NGOPage() {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "public_profiles"),
      where("roles", "array-contains", "ngo")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: NGO[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.ngoInfo) {
            const cityLower = data.city || "hyderabad";
            const cityProper = (cityLower.charAt(0).toUpperCase() + cityLower.slice(1)) as any;
            list.push({
              id: doc.id,
              name: data.ngoInfo.orgName || data.displayName || "Partner NGO",
              city: cityProper,
              location: data.ngoInfo.areaName || data.ngoInfo.causeType || "Main City Zone",
              helpline: data.ngoInfo.emergencyContact || "+91 99999 99999",
              email: data.ngoInfo.email || "support@ecoverse.org",
              services: data.ngoInfo.causeType ? [data.ngoInfo.causeType] : ["Stray Welfare", "Emergency Rescue"],
              description: data.ngoInfo.description || `Providing animal support services in ${cityProper}. Contact us for details.`,
              verified: data.ngoInfo.verified ?? true,
              colorTheme: "linear-gradient(135deg, rgba(102,187,106,0.15) 0%, rgba(56,142,60,0.15) 100%)",
            });
          }
        });
        setNgos(list);
        setLoading(false);
      },
      (error) => {
        console.warn("Failed to listen to NGOs:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);
  const [filterCity, setFilterCity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [selectedNgo, setSelectedNgo] = useState<NGO | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Form States
  const [reqReporterName, setReqReporterName] = useState("");
  const [reqReporterPhone, setReqReporterPhone] = useState("");
  const [reqCaseType, setReqCaseType] = useState("dog");
  const [reqSeverity, setReqSeverity] = useState("high");
  const [reqLocation, setReqLocation] = useState("");
  const [reqDescription, setReqDescription] = useState("");

  const filteredNgos = ngos.filter((ngo) => {
    const matchesCity = filterCity === "all" || ngo.city === filterCity;
    const matchesSearch = 
      ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.services.join(" ").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqReporterName.trim() || !reqReporterPhone.trim() || !reqLocation.trim() || !reqDescription.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success(`Assistance alert successfully dispatched to ${selectedNgo?.name}!`);
    setShowRequestModal(false);

    // Reset Form
    setReqReporterName("");
    setReqReporterPhone("");
    setReqLocation("");
    setReqDescription("");
  };

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif" }}>
      <Navbar />

      {/* Main Container */}
      <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#66BB6A", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <Building2 size={16} /> Partner Support Network
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-0.03em", marginTop: "8px", marginBottom: "8px" }}>
            NGOs & Animal Shelter Directory
          </h1>
          <p style={{ color: "var(--color-text-muted-dark)", fontSize: "1.05rem", maxWidth: "680px", lineHeight: 1.6 }}>
            Connect directly with verified local animal shelters, ambulances, and organizations in active Indian pilot cities.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div
          style={{
            background: "rgba(21, 35, 23, 0.45)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(102, 187, 106, 0.15)",
            borderRadius: "var(--radius-xl)",
            padding: "24px",
            marginBottom: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Search Row */}
          <div style={{ position: "relative" }}>
            <Search
              size={18}
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(102, 187, 106, 0.5)" }}
            />
            <input
              type="text"
              placeholder="Search NGOs by name, services (ambulance, shelter, etc.), or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(10, 16, 11, 0.6)",
                border: "1px solid rgba(102, 187, 106, 0.22)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px 12px 42px",
                color: "#FFFFFF",
                outline: "none",
                fontSize: "0.95rem",
              }}
            />
          </div>

          {/* City Filter Tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", borderTop: "1px solid rgba(102, 187, 106, 0.1)", paddingTop: "16px" }}>
            <span style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.4)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
              Filter City:
            </span>
            {[
              { id: "all", label: "All Cities" },
              { id: "Hyderabad", label: "Hyderabad" },
              { id: "Mumbai", label: "Mumbai" },
              { id: "Delhi", label: "Delhi" },
              { id: "Bengaluru", label: "Bengaluru" },
              { id: "Chennai", label: "Chennai" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilterCity(opt.id)}
                style={{
                  background: filterCity === opt.id ? "rgba(102, 187, 106, 0.2)" : "rgba(10, 16, 11, 0.4)",
                  border: `1px solid ${filterCity === opt.id ? "rgba(102, 187, 106, 0.5)" : "rgba(102, 187, 106, 0.15)"}`,
                  color: filterCity === opt.id ? "#A5D6A7" : "rgba(232, 245, 233, 0.7)",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{
              width: "36px", height: "36px",
              border: "3px solid rgba(102,187,106,0.15)",
              borderRadius: "50%",
              borderTopColor: "#66BB6A",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto",
            }} />
            <p style={{ color: "rgba(232,245,233,0.4)", fontSize: "0.875rem", marginTop: "16px" }}>
              Loading NGO partners...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredNgos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", background: "rgba(21, 35, 23, 0.2)", borderRadius: "var(--radius-xl)", border: "1px dashed rgba(102,187,106,0.1)" }}>
            <p style={{ color: "rgba(232, 245, 233, 0.5)", fontSize: "1.1rem" }}>No matching NGOs found in this city.</p>
            <p style={{ color: "rgba(232, 245, 233, 0.3)", fontSize: "0.9rem", marginTop: "4px" }}>Stay tuned! We are onboarding partners across India daily.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
            {filteredNgos.map((ngo) => (
              <div
                key={ngo.id}
                style={{
                  background: "rgba(21, 35, 23, 0.45)",
                  border: "1px solid rgba(102, 187, 106, 0.12)",
                  borderRadius: "var(--radius-xl)",
                  padding: "32px",
                  display: "grid",
                  gridTemplateColumns: "3fr 1fr",
                  gap: "24px",
                  alignItems: "center",
                }}
                className="ngo-row-card"
              >
                {/* Left side */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#FFFFFF" }}>{ngo.name}</h3>
                    {ngo.verified && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(102,187,106,0.1)", border: "1px solid rgba(102,187,106,0.3)", color: "#A5D6A7", padding: "3px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 700 }}>
                        <CheckCircle size={10} /> VERIFIED PARTNER
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "16px", color: "rgba(232,245,233,0.55)", fontSize: "0.85rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={13} style={{ color: "#66BB6A" }} />
                      {ngo.location}, {ngo.city}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Mail size={13} style={{ color: "#66BB6A" }} />
                      {ngo.email}
                    </span>
                  </div>

                  <p style={{ color: "rgba(232,245,233,0.75)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                    {ngo.description}
                  </p>

                  {/* Services Row */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                    {ngo.services.map((srv) => (
                      <span key={srv} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(232,245,233,0.7)", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600 }}>
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right side Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                  <a
                    href={`tel:${ngo.helpline.replace(/\s+/g, "")}`}
                    style={{
                      background: "linear-gradient(135deg, #EF5350 0%, #C62828 100%)",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "14px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      textDecoration: "none",
                      boxShadow: "0 4px 16px rgba(239,83,80,0.3)",
                      textAlign: "center",
                    }}
                  >
                    <Phone size={15} /> {ngo.helpline}
                  </a>

                  <button
                    onClick={() => { setSelectedNgo(ngo); setShowRequestModal(true); }}
                    style={{
                      background: "rgba(102,187,106,0.12)",
                      border: "1px solid rgba(102,187,106,0.25)",
                      color: "#A5D6A7",
                      padding: "12px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(102,187,106,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(102,187,106,0.12)";
                    }}
                  >
                    <MessageSquare size={14} /> Request Assistance
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── MODAL: Request Assistance ───────────────────────────────── */}
      {showRequestModal && selectedNgo && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Request NGO Assistance</h3>
              <button onClick={() => setShowRequestModal(false)} style={modalCloseBtnStyle}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: "rgba(102,187,106,0.06)", border: "1px solid rgba(102,187,106,0.2)", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px" }}>
              <div style={{ fontSize: "0.75rem", color: "rgba(232,245,233,0.5)" }}>Selected Partner:</div>
              <strong style={{ color: "#A5D6A7" }}>{selectedNgo.name}</strong>
              <div style={{ fontSize: "0.75rem", color: "rgba(232,245,233,0.5)", marginTop: "2px" }}>
                Helpline: {selectedNgo.helpline}
              </div>
            </div>

            <form onSubmit={handleRequestSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={reqReporterName}
                  onChange={(e) => setReqReporterName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Reporter Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 XXXXX XXXXX"
                  value={reqReporterPhone}
                  onChange={(e) => setReqReporterPhone(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Animal Type</label>
                  <select
                    value={reqCaseType}
                    onChange={(e) => setReqCaseType(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="cow">Cow / Cattle</option>
                    <option value="bird">Bird</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Case Severity</label>
                  <select
                    value={reqSeverity}
                    onChange={(e) => setReqSeverity(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="low">Low (injury/cut)</option>
                    <option value="medium">Medium (limping/disease)</option>
                    <option value="high">High (bleeding/fracture)</option>
                    <option value="critical">Critical (unconscious)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Incident Location / Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near KFC, Banjara Hills Metro Pillar 12"
                  value={reqLocation}
                  onChange={(e) => setReqLocation(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Condition Description *</label>
                <textarea
                  required
                  placeholder="Describe the animal's physical state, breed details, and what assistance is needed..."
                  rows={3}
                  value={reqDescription}
                  onChange={(e) => setReqDescription(e.target.value)}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>

              {reqSeverity === "critical" && (
                <div style={{ display: "flex", gap: "8px", background: "rgba(239,83,80,0.08)", border: "1px solid rgba(239,83,80,0.2)", padding: "10px 12px", borderRadius: "8px", fontSize: "0.75rem", color: "#EF9A9A" }}>
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong>For Critical cases:</strong> Please also call their emergency helpline directly after submitting this request.
                  </div>
                </div>
              )}

              <button
                type="submit"
                style={{
                  background: "linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "14px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                Send Assistance Request
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />

      {/* Responsive layout styles */}
      <style>{`
        @media (max-width: 768px) {
          .ngo-row-card { grid-template-columns: 1fr !important; gap: 20px !important; }
        }
      `}</style>
    </div>
  );
}

// Inline styles for convenience and stability
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

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(10, 16, 11, 0.8)",
  border: "1px solid rgba(102, 187, 106, 0.22)",
  borderRadius: "10px",
  padding: "11px 14px",
  color: "#FFFFFF",
  fontSize: "0.9rem",
  fontFamily: "var(--font-sans), sans-serif",
  outline: "none",
  boxSizing: "border-box",
  cursor: "pointer",
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(5, 8, 6, 0.8)",
  backdropFilter: "blur(8px)",
  zIndex: 1100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
};

const modalContentStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "500px",
  background: "#111f13",
  border: "1px solid rgba(102,187,106,0.2)",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
  maxHeight: "90vh",
  overflowY: "auto",
};

const modalCloseBtnStyle: React.CSSProperties = {
  background: "rgba(102,187,106,0.1)",
  border: "none",
  color: "#A5D6A7",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
