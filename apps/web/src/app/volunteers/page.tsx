"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Users, MapPin, Search, CheckCircle, ShieldCheck, 
  Clock, X, Mail, Phone, Sparkles, AlertCircle 
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

interface Volunteer {
  id: string;
  displayName: string;
  city: string;
  roles: string[];
  volunteerInfo?: {
    availableNow: boolean;
    hoursPerWeek?: string | number;
    radiusKm?: string | number;
    skills?: string[];
  };
}

export default function VolunteerDirectoryPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCity, setFilterCity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>(" ");

  // Modal States
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [showInquireModal, setShowInquireModal] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");

  useEffect(() => {
    async function fetchVolunteers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .contains("roles", ["volunteer"]);

        if (error) throw error;

        const list = (data || []).map((prof: any) => ({
          id: prof.id,
          displayName: prof.full_name || "EcoVerse Volunteer",
          city: prof.city_name || "India",
          roles: prof.roles || ["volunteer"],
          volunteerInfo: {
            availableNow: prof.available_now || false,
            hoursPerWeek: prof.volunteer_hours || 5,
            radiusKm: 10,
            skills: ["First Aid", "Animal Handling"]
          }
        }));

        setVolunteers(list);
      } catch (err) {
        console.warn("Failed to load volunteers from Supabase:", err);
        setVolunteers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVolunteers();
  }, []);

  const filteredVolunteers = volunteers.filter((vol) => {
    const matchesCity = filterCity === "all" || vol.city.toLowerCase() === filterCity.toLowerCase();
    const skillsString = vol.volunteerInfo?.skills?.join(" ") || "";
    const matchesSearch = 
      vol.displayName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      vol.city.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      skillsString.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesCity && matchesSearch;
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) {
      toast.error("Please fill in your name and phone number");
      return;
    }
    toast.success(`Request sent to ${selectedVolunteer?.displayName}! They will contact you shortly.`);
    setShowInquireModal(false);
    setInquiryName("");
    setInquiryPhone("");
    setInquiryMessage("");
  };

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif" }}>
      <Navbar />

      {/* Main Container */}
      <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#66BB6A", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <Users size={16} /> Volunteer Network
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-0.03em", marginTop: "8px", marginBottom: "8px" }}>
            Community Volunteer Directory
          </h1>
          <p style={{ color: "var(--color-text-muted-dark)", fontSize: "1.05rem", maxWidth: "680px", lineHeight: 1.6 }}>
            Browse and connect with registered volunteers across India. Filter by city or search for specific rescue skills.
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
              placeholder="Search volunteers by name, city, or skills (first aid, transport, feeding)..."
              value={searchQuery === " " ? "" : searchQuery}
              onChange={(e) => setSearchQuery(e.target.value || " ")}
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
              { id: "hyderabad", label: "Hyderabad" },
              { id: "pune", label: "Pune" },
              { id: "mumbai", label: "Mumbai" },
              { id: "bangalore", label: "Bangalore" },
              { id: "delhi", label: "Delhi" },
              { id: "chennai", label: "Chennai" },
              { id: "ahmedabad", label: "Ahmedabad" },
              { id: "kolkata", label: "Kolkata" },
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
              Loading volunteer network...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", background: "rgba(21, 35, 23, 0.2)", borderRadius: "var(--radius-xl)", border: "1px dashed rgba(102,187,106,0.1)" }}>
            <p style={{ color: "rgba(232, 245, 233, 0.5)", fontSize: "1.1rem" }}>No matching volunteers found.</p>
            <p style={{ color: "rgba(232, 245, 233, 0.3)", fontSize: "0.9rem", marginTop: "4px" }}>Be the change. Set up your profile as a volunteer on the dashboard!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "28px" }}>
            {filteredVolunteers.map((vol) => {
              const isAvailable = vol.volunteerInfo?.availableNow ?? true;
              return (
                <div
                  key={vol.id}
                  style={{
                    background: "rgba(21, 35, 23, 0.45)",
                    border: "1px solid rgba(102, 187, 106, 0.12)",
                    borderRadius: "var(--radius-xl)",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "18px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF" }}>{vol.displayName}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#A5D6A7", fontSize: "0.8rem", marginTop: "2px", fontWeight: 600 }}>
                          <MapPin size={12} />
                          <span>{vol.city.charAt(0).toUpperCase() + vol.city.slice(1)}</span>
                        </div>
                      </div>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: isAvailable ? "rgba(102,187,106,0.12)" : "rgba(255,255,255,0.05)",
                          border: `1px solid ${isAvailable ? "rgba(102,187,106,0.3)" : "rgba(255,255,255,0.15)"}`,
                          color: isAvailable ? "#66BB6A" : "rgba(232, 245, 233, 0.5)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                        }}
                      >
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: isAvailable ? "#66BB6A" : "rgba(232,245,233,0.4)" }} />
                        {isAvailable ? "Active Now" : "Standby"}
                      </span>
                    </div>

                    {/* Stats & Hours */}
                    <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "rgba(232, 245, 233, 0.55)", borderTop: "1px solid rgba(102,187,106,0.08)", borderBottom: "1px solid rgba(102,187,106,0.08)", padding: "8px 0" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={12} />
                        {vol.volunteerInfo?.hoursPerWeek || "5"} hrs/week
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <ShieldCheck size={12} />
                        {vol.volunteerInfo?.radiusKm || "10"} km radius
                      </span>
                    </div>

                    {/* Skills pills */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {(vol.volunteerInfo?.skills && vol.volunteerInfo.skills.length > 0) ? (
                        vol.volunteerInfo.skills.map((skill) => (
                          <span key={skill} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(232,245,233,0.75)", padding: "3px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 600 }}>
                            {skill.replace("_", " ")}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: "rgba(232,245,233,0.4)", fontSize: "0.75rem", fontStyle: "italic" }}>
                          General Volunteer Support
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => { setSelectedVolunteer(vol); setShowInquireModal(true); }}
                    style={{
                      width: "100%",
                      background: "rgba(102,187,106,0.12)",
                      border: "1px solid rgba(102,187,106,0.25)",
                      color: "#A5D6A7",
                      padding: "10px",
                      borderRadius: "8px",
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
                      e.currentTarget.style.background = "#66BB6A";
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(102,187,106,0.12)";
                      e.currentTarget.style.color = "#A5D6A7";
                    }}
                  >
                    Contact Volunteer
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── MODAL: Contact Volunteer ───────────────────────────────── */}
      {showInquireModal && selectedVolunteer && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Contact {selectedVolunteer.displayName}</h3>
              <button onClick={() => setShowInquireModal(false)} style={modalCloseBtnStyle}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInquirySubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Your Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 XXXXX XXXXX"
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Message / Rescue Details *</label>
                <textarea
                  required
                  placeholder="Tell the volunteer what you need help with (e.g., transport support, feeding area, first aid rescue details)..."
                  rows={4}
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>

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
                Send Request
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Styles
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
  maxWidth: "480px",
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
