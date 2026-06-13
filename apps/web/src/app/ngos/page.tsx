"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Building2, Search, X, CheckCircle, Upload, MapPin, Award, User, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PageHero from "@/components/PageHero";
import EmptyState from "@/components/EmptyState";
import NGOCard, { NGO } from "@/components/NGOCard";
import VolunteerCard, { Volunteer } from "@/components/VolunteerCard";
import { INDIA_STATES, getCitiesForState } from "@/data/india-locations";

type TabPanel = "ngo_dir" | "vol_net" | "join_ngo" | "join_vol";

export default function NGOPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabPanel>("ngo_dir");
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loadingNgos, setLoadingNgos] = useState(true);
  const [loadingVols, setLoadingVols] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("all");

  // NGO Registration Form States
  const [ngoName, setNgoName] = useState("");
  const [ngoRegNo, setNgoRegNo] = useState("");
  const [ngoCity, setNgoCity] = useState("");
  const [ngoState, setNgoState] = useState("");
  const [ngoPincode, setNgoPincode] = useState("");
  const [ngoEmail, setNgoEmail] = useState("");
  const [ngoPhone, setNgoPhone] = useState("");
  const [ngoDesc, setNgoDesc] = useState("");
  const [ngoFocus, setNgoFocus] = useState<string[]>([]);
  const [submittingNgo, setSubmittingNgo] = useState(false);

  // Volunteer Registration Form States
  const [volName, setVolName] = useState("");
  const [volEmail, setVolEmail] = useState("");
  const [volPhone, setVolPhone] = useState("");
  const [volState, setVolState] = useState("");
  const [volCity, setVolCity] = useState("");
  const [volArea, setVolArea] = useState("");
  const [volRoles, setVolRoles] = useState<string[]>([]);
  const [volAvailable, setVolAvailable] = useState(true);
  const [volBio, setVolBio] = useState("");
  const [submittingVol, setSubmittingVol] = useState(false);

  // Request Assistance modal
  const [selectedNgo, setSelectedNgo] = useState<NGO | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqName, setReqName] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqDesc, setReqDesc] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  // Fetch NGOs from Supabase
  useEffect(() => {
    async function fetchNgos() {
      setLoadingNgos(true);
      try {
        const { data, error } = await supabase
          .from("ngos")
          .select("*")
          .eq("is_active", true);

        if (error) throw error;

        const list: NGO[] = (data || []).map((ngo: any) => ({
          id: ngo.id,
          name: ngo.name,
          city: ngo.city_name || "India",
          location: ngo.state_name || "Active Zone",
          helpline: ngo.contact_phone || "+91 99999 99999",
          email: ngo.contact_email || "support@ecoverse.org",
          services: ngo.focus_areas || ["Rescue", "Stray Welfare"],
          description: ngo.description || `Providing services in ${ngo.city_name}`,
          verified: ngo.is_verified,
        }));

        setNgos(list);
      } catch (err) {
        console.warn("Failed to fetch NGOs from Supabase:", err);
        setNgos([]);
      } finally {
        setLoadingNgos(false);
      }
    }

    fetchNgos();
  }, []);

  // Fetch Volunteers from Supabase
  useEffect(() => {
    async function fetchVolunteers() {
      setLoadingVols(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .contains("roles", ["volunteer"]);

        if (error) throw error;

        const list: Volunteer[] = (data || []).map((prof: any) => ({
          id: prof.id,
          name: prof.full_name || "EcoVerse Volunteer",
          roles: prof.roles || ["volunteer"],
          city: prof.city_name || "India",
          area: prof.area_name || "Active Zone",
          rescuesCount: prof.rescue_count || 0,
        }));

        setVolunteers(list);
      } catch (err) {
        console.warn("Failed to fetch volunteers from Supabase:", err);
        setVolunteers([]);
      } finally {
        setLoadingVols(false);
      }
    }

    fetchVolunteers();
  }, []);

  // Filter lists
  const filteredNgos = ngos.filter((ngo) => {
    const matchesCity = filterCity === "all" || ngo.city.toLowerCase() === filterCity.toLowerCase();
    const matchesSearch =
      ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.services.join(" ").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const filteredVols = volunteers.filter((vol) => {
    const matchesCity = filterCity === "all" || vol.city.toLowerCase() === filterCity.toLowerCase();
    const matchesSearch =
      vol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vol.roles.join(" ").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const handleNgoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ngoName.trim() || !ngoRegNo.trim() || !ngoCity.trim() || !ngoEmail.trim()) {
      return toast.error("Please fill in all required fields marked with *");
    }
    setSubmittingNgo(true);
    setTimeout(() => {
      toast.success("NGO registration submitted! We will verify details in 48 hours.");
      setNgoName("");
      setNgoRegNo("");
      setNgoCity("");
      setNgoState("");
      setNgoPincode("");
      setNgoEmail("");
      setNgoPhone("");
      setNgoDesc("");
      setNgoFocus([]);
      setSubmittingNgo(false);
    }, 1500);
  };

  const handleVolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volName.trim() || !volEmail.trim() || !volPhone.trim() || !volCity.trim() || !volState.trim()) {
      return toast.error("Please fill in all required fields marked with *");
    }
    setSubmittingVol(true);
    setTimeout(() => {
      toast.success("Successfully joined the EcoVerse Volunteer Network!");
      setVolName("");
      setVolEmail("");
      setVolPhone("");
      setVolState("");
      setVolCity("");
      setVolArea("");
      setVolRoles([]);
      setVolBio("");
      setSubmittingVol(false);
    }, 1200);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim() || !reqPhone.trim() || !reqDesc.trim()) {
      return toast.error("Please fill in all required fields");
    }
    setSendingRequest(true);
    setTimeout(() => {
      toast.success(`Assistance alert successfully dispatched to ${selectedNgo?.name}!`);
      setShowRequestModal(false);
      setReqName("");
      setReqPhone("");
      setReqDesc("");
      setSendingRequest(false);
    }, 1200);
  };

  const toggleFocus = (item: string) => {
    setNgoFocus((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const toggleVolRole = (item: string) => {
    setVolRoles((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif" }}>
      <Navbar />

      <PageHero
        tag="🤝 NGO & Volunteer Network"
        h1="NGO & Volunteer Network"
        subtitle="Connect with verified animal welfare organizations and passionate volunteers across India."
      />

      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px" }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(102,187,106,0.12)", marginBottom: "32px", overflowX: "auto" }}>
          {[
            { id: "ngo_dir", label: "NGO Directory" },
            { id: "vol_net", label: "Volunteer Network" },
            { id: "join_ngo", label: "Join as NGO" },
            { id: "join_vol", label: "Become Volunteer" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabPanel);
                  setSearchQuery("");
                  setFilterCity("all");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: active ? "2px solid #66BB6A" : "2px solid transparent",
                  color: active ? "#66BB6A" : "rgba(232,245,233,0.55)",
                  padding: "12px 18px",
                  fontSize: "0.9rem",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* SEARCH BAR (Only for Directory/Network tabs) */}
        {(activeTab === "ngo_dir" || activeTab === "vol_net") && (
          <div
            style={{
              background: "rgba(21, 35, 23, 0.45)",
              border: "1px solid rgba(102, 187, 106, 0.12)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div style={{ position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(102,187,106,0.5)" }} />
              <input
                type="text"
                placeholder={activeTab === "ngo_dir" ? "Search NGOs by name or focus..." : "Search volunteers by name or skills..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(10, 16, 11, 0.6)",
                  border: "1px solid rgba(102, 187, 106, 0.22)",
                  borderRadius: "10px",
                  padding: "12px 14px 12px 42px",
                  color: "#FFFFFF",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>

            {/* City filters */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", borderTop: "1px solid rgba(102, 187, 106, 0.08)", paddingTop: "16px" }}>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                Filter City:
              </span>
              {["All", "Hyderabad", "Mumbai", "Delhi", "Bengaluru", "Pune", "Chennai"].map((city) => (
                <button
                  key={city}
                  onClick={() => setFilterCity(city.toLowerCase())}
                  style={{
                    background: filterCity === city.toLowerCase() ? "rgba(102, 187, 106, 0.2)" : "rgba(10, 16, 11, 0.4)",
                    border: `1px solid ${filterCity === city.toLowerCase() ? "rgba(102, 187, 106, 0.5)" : "rgba(102, 187, 106, 0.15)"}`,
                    color: filterCity === city.toLowerCase() ? "#A5D6A7" : "rgba(232, 245, 233, 0.7)",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PANEL 1: NGO Directory ── */}
        {activeTab === "ngo_dir" && (
          <>
            {loadingNgos ? (
              <div style={{ textAlign: "center", padding: "40px" }}><div className="spinner-green" /></div>
            ) : filteredNgos.length === 0 ? (
              <EmptyState emoji="🏢" title="No NGO partners yet" subtitle="Be the first NGO to join." />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
                {filteredNgos.map((ngo) => (
                  <NGOCard
                    key={ngo.id}
                    ngo={ngo}
                    isLoggedIn={!!user}
                    onRequestAssistance={() => {
                      setSelectedNgo(ngo);
                      setShowRequestModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PANEL 2: Volunteer Network ── */}
        {activeTab === "vol_net" && (
          <>
            {loadingVols ? (
              <div style={{ textAlign: "center", padding: "40px" }}><div className="spinner-green" /></div>
            ) : filteredVols.length === 0 ? (
              <EmptyState emoji="🤝" title="No volunteers in this city" subtitle="Join the platform as a volunteer now!" />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
                {filteredVols.map((vol) => (
                  <VolunteerCard
                    key={vol.id}
                    volunteer={vol}
                    isLoggedIn={!!user}
                    onMessage={() => toast.success(`Chat opened with ${vol.name} (Simulation)`)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PANEL 3: Join as NGO (Form) ── */}
        {activeTab === "join_ngo" && (
          <div style={formWrapperStyle}>
            <h3 style={{ fontSize: "1.45rem", fontWeight: 800, marginBottom: "8px" }}>Register Your Organization</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", marginBottom: "28px" }}>
              Connect with local rescuers and receive critical case escalations in your operational zones.
            </p>

            <form onSubmit={handleNgoSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-grid">
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Organization Name *</label>
                  <input type="text" required placeholder="e.g. Hope For Animals" value={ngoName} onChange={(e) => setNgoName(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Registration Certificate Number *</label>
                  <input type="text" required placeholder="e.g. 1234/XYZ/2026" value={ngoRegNo} onChange={(e) => setNgoRegNo(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>State *</label>
                  <select
                    required
                    value={ngoState}
                    onChange={(e) => {
                      setNgoState(e.target.value);
                      setNgoCity("");
                    }}
                    style={{ ...inputStyle, background: "#0a1a0e" }}
                  >
                    <option value="">Select State</option>
                    {INDIA_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>City *</label>
                  <select
                    required
                    value={ngoCity}
                    onChange={(e) => setNgoCity(e.target.value)}
                    disabled={!ngoState}
                    style={{ ...inputStyle, background: "#0a1a0e" }}
                  >
                    <option value="">Select City</option>
                    {getCitiesForState(ngoState).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Pincode *</label>
                  <input type="text" required placeholder="e.g. 500034" value={ngoPincode} onChange={(e) => setNgoPincode(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Contact Email *</label>
                  <input type="email" required placeholder="e.g. shelter@hope.org" value={ngoEmail} onChange={(e) => setNgoEmail(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Helpline Contact Phone *</label>
                  <input type="tel" required placeholder="e.g. +91 99999 88888" value={ngoPhone} onChange={(e) => setNgoPhone(e.target.value)} style={inputStyle} />
                </div>
              </div>

              {/* Focus checkboxes */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={labelStyle}>Services/Focus Areas *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {["Dogs Rescue", "Cats Shelter", "Cattle Rescue", "Birds Ambulance", "Wildlife Support"].map((item) => {
                    const active = ngoFocus.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleFocus(item)}
                        style={{
                          background: active ? "rgba(102,187,106,0.18)" : "rgba(10,16,11,0.5)",
                          border: `1px solid ${active ? "#66BB6A" : "rgba(102,187,106,0.15)"}`,
                          borderRadius: "8px",
                          padding: "8px 14px",
                          color: active ? "#A5D6A7" : "rgba(255,255,255,0.6)",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                        }}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Upload Registration Certificate (PDF/Image)</label>
                <div style={fileUploadBoxStyle}>
                  <Upload size={20} style={{ color: "#66BB6A", opacity: 0.7 }} />
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>Drag file or click to select</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Brief Description (Max 200 chars)</label>
                <textarea rows={3} placeholder="Describe the shelter facilities or ambulance coverage details..." value={ngoDesc} onChange={(e) => setNgoDesc(e.target.value)} style={{ ...inputStyle, resize: "none" }} />
              </div>

              <button type="submit" disabled={submittingNgo} style={submitButtonStyle}>
                {submittingNgo ? "Submitting..." : "Submit for Verification →"}
              </button>
            </form>
          </div>
        )}

        {/* ── PANEL 4: Become Volunteer (Form) ── */}
        {activeTab === "join_vol" && (
          <div style={formWrapperStyle}>
            <h3 style={{ fontSize: "1.45rem", fontWeight: 800, marginBottom: "8px" }}>Join the Volunteer Network</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", marginBottom: "28px" }}>
              Help local strays by becoming an active rescuer, feeder, foster owner, or outreach supporter.
            </p>

            <form onSubmit={handleVolSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-grid">
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Full Name *</label>
                  <input type="text" required placeholder="Enter name" value={volName} onChange={(e) => setVolName(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Email Address *</label>
                  <input type="email" required placeholder="Enter email" value={volEmail} onChange={(e) => setVolEmail(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Contact Phone *</label>
                  <input type="tel" required placeholder="e.g. +91 99999 XXXXX" value={volPhone} onChange={(e) => setVolPhone(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>State *</label>
                  <select
                    required
                    value={volState}
                    onChange={(e) => {
                      setVolState(e.target.value);
                      setVolCity("");
                    }}
                    style={{ ...inputStyle, background: "#0a1a0e" }}
                  >
                    <option value="">Select State</option>
                    {INDIA_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>City *</label>
                  <select
                    required
                    value={volCity}
                    onChange={(e) => setVolCity(e.target.value)}
                    disabled={!volState}
                    style={{ ...inputStyle, background: "#0a1a0e" }}
                  >
                    <option value="">Select City</option>
                    {getCitiesForState(volState).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Area / Zone *</label>
                  <input type="text" required placeholder="e.g. Banjara Hills" value={volArea} onChange={(e) => setVolArea(e.target.value)} style={inputStyle} />
                </div>

                {/* Available now toggle */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px" }}>
                  <label style={labelStyle}>Availability Status</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="checkbox"
                      checked={volAvailable}
                      onChange={(e) => setVolAvailable(e.target.checked)}
                      style={{ width: "18px", height: "18px", accentColor: "#66BB6A", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: volAvailable ? "#66BB6A" : "rgba(255,255,255,0.4)" }}>
                      {volAvailable ? "Available Now (Active Rescuer)" : "Standby (Feeder/Outreach)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={labelStyle}>Select Roles *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {["Animal Rescuer", "Vegan Advocate", "Foster / Adopter", "NGO Staff", "Street Feeder", "General Volunteer"].map((role) => {
                    const active = volRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleVolRole(role)}
                        style={{
                          background: active ? "rgba(102,187,106,0.18)" : "rgba(10,16,11,0.5)",
                          border: `1px solid ${active ? "#66BB6A" : "rgba(102,187,106,0.15)"}`,
                          borderRadius: "8px",
                          padding: "8px 14px",
                          color: active ? "#A5D6A7" : "rgba(255,255,255,0.6)",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                        }}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Brief Bio / Motivation</label>
                <textarea rows={3} placeholder="Tell us why you want to support stray animals..." value={volBio} onChange={(e) => setVolBio(e.target.value)} style={{ ...inputStyle, resize: "none" }} />
              </div>

              <button type="submit" disabled={submittingVol} style={submitButtonStyle}>
                {submittingVol ? "Registering..." : "Join EcoVerse →"}
              </button>
            </form>
          </div>
        )}

      </div>

      <Footer />

      {/* ── Request Assistance Modal ── */}
      {showRequestModal && selectedNgo && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Request Assistance</h3>
              <button onClick={() => setShowRequestModal(false)} style={modalCloseBtnStyle}><X size={16} /></button>
            </div>

            <div style={{ background: "rgba(102,187,106,0.06)", border: "1px solid rgba(102,187,106,0.2)", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px" }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Selected Partner:</span>
              <div style={{ fontWeight: 700, color: "#A5D6A7" }}>{selectedNgo.name}</div>
            </div>

            <form onSubmit={handleRequestSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Your Name *</label>
                <input type="text" required placeholder="Enter name" value={reqName} onChange={(e) => setReqName(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Phone Number *</label>
                <input type="tel" required placeholder="Enter phone" value={reqPhone} onChange={(e) => setReqPhone(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Explain the Emergency *</label>
                <textarea required rows={3} placeholder="Describe the animal condition and exact location details..." value={reqDesc} onChange={(e) => setReqDesc(e.target.value)} style={{ ...inputStyle, resize: "none" }} />
              </div>
              <button type="submit" disabled={sendingRequest} style={submitButtonStyle}>
                {sendingRequest ? "Sending..." : "Send Request Alert"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .spinner-green {
          width: 32px; height: 32px;
          border: 3px solid rgba(102,187,106,0.15);
          border-radius: 50%;
          border-top-color: #66BB6A;
          animation: spin 0.8s linear infinite;
          margin: 40px auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const formWrapperStyle: React.CSSProperties = {
  background: "rgba(21, 35, 23, 0.45)",
  border: "1px solid rgba(102, 187, 106, 0.12)",
  borderRadius: "20px",
  padding: "32px",
  maxWidth: "720px",
  margin: "0 auto",
  boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  fontWeight: 700,
  color: "rgba(255, 255, 255, 0.45)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(10, 16, 11, 0.6)",
  border: "1px solid rgba(102, 187, 106, 0.22)",
  borderRadius: "8px",
  padding: "10px 12px",
  color: "#FFFFFF",
  fontSize: "0.88rem",
  outline: "none",
  boxSizing: "border-box",
};

const fileUploadBoxStyle: React.CSSProperties = {
  border: "2px dashed rgba(102, 187, 106, 0.2)",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center",
  background: "rgba(10,16,11,0.3)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6px",
  cursor: "pointer",
};

const submitButtonStyle: React.CSSProperties = {
  width: "100%",
  background: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
  color: "#FFFFFF",
  border: "none",
  padding: "14px",
  borderRadius: "8px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "0.9rem",
  marginTop: "12px",
  boxShadow: "0 4px 14px rgba(46,125,50,0.3)",
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
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
  maxWidth: "460px",
  background: "#111f13",
  border: "1px solid rgba(102,187,106,0.2)",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
};

const modalCloseBtnStyle: React.CSSProperties = {
  background: "rgba(102,187,106,0.1)",
  border: "none",
  color: "#A5D6A7",
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
