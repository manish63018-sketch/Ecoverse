"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { ArrowLeft, Plus, Shield, Search, Filter, Layers, Navigation, X, Upload, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import type { RescueCase, EmergencyLevel } from "@/types/rescue";
import type { LocationSelection } from "@/types/location";
import PageHero from "@/components/PageHero";
import EmptyState from "@/components/EmptyState";
import CaseCard from "@/components/CaseCard";

const LocationPicker = dynamic(
  () => import("@/components/sections/LocationPicker"),
  { ssr: false }
);

type LocationScope = "area" | "city" | "state";
type TabType = "all" | "open" | "in_progress" | "resolved" | "my_cases";

export default function RescuePage() {
  const { user, profile, loading: authLoading } = useAuth();

  const [cases, setCases] = useState<RescueCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<LocationScope>("area");
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [animalFilter, setAnimalFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  // SOS Modal
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosStep, setSosStep] = useState(1);
  const [sosLocation, setSosLocation] = useState<LocationSelection | null>(null);
  const [sosAnimal, setSosAnimal] = useState("dog");
  const [sosCondition, setSosCondition] = useState("");
  const [sosSeverity, setSosSeverity] = useState<EmergencyLevel>("medium");
  const [sosDesc, setSosDesc] = useState("");
  const [sosPhone, setSosPhone] = useState("");
  const [sosAddress, setSosAddress] = useState("");
  const [sosSubmitting, setSosSubmitting] = useState(false);

  // Active acceptance tracking
  const [submittingCaseId, setSubmittingCaseId] = useState<string | null>(null);

  // Fetch cases from Supabase
  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("rescue_cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (user && profile) {
        if (scope === "area" && profile.area_name) {
          query = query.eq("area_name", profile.area_name);
        } else if (scope === "city" && profile.city_name) {
          query = query.eq("city_name", profile.city_name);
        } else if (scope === "state" && profile.state_name) {
          query = query.eq("state_name", profile.state_name);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      // Map Supabase rescue cases to fits what UI components expect
      const mapped = (data || []).map((c: any) => ({
        id: c.id,
        reporter_user_id: c.reporter_id || undefined,
        reporter_name: c.reporter_name,
        state_id: c.state_name,
        city_id: c.city_name,
        area_id: c.area_name,
        area_name: c.area_name,
        display_zone: c.display_zone || `${c.area_name}, ${c.city_name}`,
        animal_type: c.animal_type,
        condition_summary: c.condition_summary,
        emergency_level: c.emergency_level,
        description: c.description,
        status: c.status,
        assigned_volunteer_id: c.assigned_volunteer_id || undefined,
        assigned_ngo_id: c.assigned_ngo_id || undefined,
        created_at: c.created_at,
        assigned_at: c.assigned_at || undefined,
        resolved_at: c.resolved_at || undefined,
      })) as RescueCase[];

      setCases(mapped);
    } catch (err: any) {
      console.error("Failed to fetch rescue cases", err);
      setCases([]);
      toast.error("Failed to load rescue feed");
    } finally {
      setLoading(false);
    }
  }, [user, profile, scope]);

  useEffect(() => {
    if (authLoading) return;
    fetchCases();

    // Setup realtime subscription
    const channel = supabase
      .channel("rescue_cases_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rescue_cases" },
        () => {
          fetchCases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authLoading, fetchCases]);

  const handleAcceptDispatch = async (caseId: string) => {
    if (!user) return toast.error("Please login to accept dispatches");
    if (submittingCaseId) return;
    setSubmittingCaseId(caseId);
    try {
      const { error } = await supabase
        .from("rescue_cases")
        .update({
          status: "assigned",
          assigned_volunteer_id: user.id,
          assigned_at: new Date().toISOString(),
        })
        .eq("id", caseId);

      if (error) throw error;

      toast.success("✅ Rescue case accepted! You are now assigned.");
      fetchCases();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept rescue case");
    } finally {
      setSubmittingCaseId(null);
    }
  };

  // SOS wizard submission
  const handleSosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sosLocation) return toast.error("Please select location details");
    if (!sosCondition.trim() || !sosPhone.trim()) return toast.error("Fill in condition and contact phone");

    setSosSubmitting(true);
    try {
      const { error } = await supabase
        .from("rescue_cases")
        .insert([{
          reporter_id: user?.id || null,
          reporter_name: profile?.full_name || "EcoVerse Reporter",
          state_name: sosLocation.stateName,
          city_name: sosLocation.cityName,
          area_name: sosLocation.areaName,
          display_zone: sosLocation.displayZone,
          animal_type: sosAnimal,
          condition_summary: sosCondition,
          emergency_level: sosSeverity,
          description: [
            sosDesc,
            sosAddress ? `Address details: ${sosAddress}` : "",
            sosPhone ? `Contact phone: ${sosPhone}` : "",
          ].filter(Boolean).join("\n"),
          status: "open",
        }]);

      if (error) throw error;

      toast.success("🚨 SOS alert successfully dispatched!");
      setShowSosModal(false);
      // Reset wizard
      setSosStep(1);
      setSosCondition("");
      setSosDesc("");
      setSosPhone("");
      setSosAddress("");
      fetchCases();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit SOS report");
    } finally {
      setSosSubmitting(false);
    }
  };

  // Tab Filtering & Counts
  const openCasesCount = cases.filter((c) => c.status === "open").length;
  const inProgressCount = cases.filter((c) => c.status === "in_progress" || c.status === "assigned").length;
  const resolvedCount = cases.filter((c) => c.status === "resolved").length;
  const myCasesCount = user ? cases.filter((c) => c.assigned_volunteer_id === user.id || c.reporter_user_id === user.id).length : 0;

  const tabFiltered = cases.filter((c) => {
    if (activeTab === "open") return c.status === "open";
    if (activeTab === "in_progress") return c.status === "in_progress" || c.status === "assigned";
    if (activeTab === "resolved") return c.status === "resolved";
    if (activeTab === "my_cases") return user && (c.assigned_volunteer_id === user.id || c.reporter_user_id === user.id);
    return true;
  });

  // Client-side Filters (Search & Animal Select)
  const filtered = tabFiltered.filter((r) => {
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      if (
        !r.condition_summary?.toLowerCase().includes(t) &&
        !r.display_zone?.toLowerCase().includes(t) &&
        !r.animal_type?.toLowerCase().includes(t)
      )
        return false;
    }
    if (animalFilter !== "all" && r.animal_type !== animalFilter) return false;
    if (severityFilter !== "all" && r.emergency_level !== severityFilter) return false;
    return true;
  });

  const hasNoLocation = user && !profile?.area_name;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050f07",
        color: "#E8F5E9",
        fontFamily: "var(--font-sans), sans-serif",
      }}
    >
      <Navbar />

      {/* Hero */}
      <PageHero
        tag="🐾 Rescue Board"
        h1="Animal Rescue Board"
        subtitle="Report, track, and resolve animal rescue cases across India."
        ctas={[
          { label: "🚨 Report Emergency", variant: "danger", onClick: () => setShowSosModal(true) },
          { label: "+ New Rescue Case", variant: "primary", onClick: () => setShowSosModal(true) },
        ]}
      />

      {/* Location scope selection */}
      {user && profile?.area_name && (
        <div style={{ borderBottom: "1px solid rgba(102,187,106,0.1)" }} className="scope-switcher-wrapper">
          <div className="container" style={{ maxWidth: "1000px", margin: "0 auto", padding: "16px 24px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={14} style={{ color: "#66BB6A" }} />
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "rgba(232,245,233,0.7)" }}>Scope:</span>
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
                    padding: "6px 14px",
                    fontSize: "0.8rem",
                    fontWeight: scope === s ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textTransform: "capitalize",
                  }}
                >
                  {s === "area" ? `📍 ${profile.area_name ?? "My Area"}` : s === "city" ? "🏙 My City" : "🗺 My State"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="container" style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px 24px 80px" }}>
        
        {/* Warning Banner */}
        {hasNoLocation && (
          <div style={{ padding: "16px 20px", background: "rgba(255,167,38,0.08)", border: "1px solid rgba(255,167,38,0.25)", borderRadius: "12px", marginBottom: "24px" }}>
            <div style={{ fontWeight: 700, color: "#FFA726", fontSize: "0.9rem" }}>Location Zone Not Configured</div>
            <p style={{ color: "rgba(232,245,233,0.6)", fontSize: "0.82rem", margin: "4px 0 8px" }}>
              Define your State, City, and Area in your profile to enable strict geographical alerts filtering.
            </p>
            <Link href="/profile" style={{ color: "#FFA726", textDecoration: "underline", fontWeight: 700, fontSize: "0.8rem" }}>Set Location Zone →</Link>
          </div>
        )}

        {/* Tab Selection */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(102,187,106,0.12)", marginBottom: "24px", overflowX: "auto" }}>
          {[
            { id: "all", label: "All Cases", count: cases.length },
            { id: "open", label: "Open", count: openCasesCount },
            { id: "in_progress", label: "In Progress", count: inProgressCount },
            { id: "resolved", label: "Resolved", count: resolvedCount },
            { id: "my_cases", label: "My Cases", count: myCasesCount, hideGuest: true },
          ].map((tab) => {
            if (tab.hideGuest && !user) return null;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: active ? "2px solid #66BB6A" : "2px solid transparent",
                  color: active ? "#66BB6A" : "rgba(232,245,233,0.55)",
                  padding: "12px 18px",
                  fontSize: "0.9rem",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "var(--font-sans)",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
                <span style={{ fontSize: "0.75rem", background: "rgba(102,187,106,0.1)", color: "#A5D6A7", padding: "1px 6px", borderRadius: "8px" }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls */}
        <div style={{ background: "rgba(21,35,23,0.45)", border: "1px solid rgba(102,187,106,0.1)", borderRadius: "14px", padding: "16px", marginBottom: "24px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(102,187,106,0.4)" }} />
            <input
              type="text"
              placeholder="Search by animal, conditions, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(10,16,11,0.6)",
                border: "1px solid rgba(102,187,106,0.18)",
                borderRadius: "8px",
                padding: "8px 12px 8px 34px",
                color: "#E8F5E9",
                fontSize: "0.85rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <Filter size={13} style={{ color: "rgba(102,187,106,0.4)" }} />
            <select
              value={animalFilter}
              onChange={(e) => setAnimalFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Animals</option>
              <option value="dog">🐕 Dogs</option>
              <option value="cat">🐈 Cats</option>
              <option value="cow">🐄 Cattle</option>
              <option value="bird">🐦 Birds</option>
              <option value="other">🐾 Other</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Severities</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
        </div>

        {/* Rescue Feed */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div className="spinner-green" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="🐾"
            title="No rescue cases yet."
            subtitle="Be the first to report an emergency or respond."
            ctaText="🚨 Report SOS Case"
            onClick={() => setShowSosModal(true)}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filtered.map((rescue) => (
              <CaseCard
                key={rescue.id}
                rescueCase={rescue}
                currentUserId={user?.id}
                onAccept={() => handleAcceptDispatch(rescue.id)}
                isAccepting={submittingCaseId === rescue.id}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* SOS Modal Overlay */}
      {showSosModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5, 15, 7, 0.95)",
            backdropFilter: "blur(12px)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#111f13",
              border: "1px solid rgba(102,187,106,0.25)",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#EF5350", margin: 0 }}>
                  🚨 Report SOS Emergency
                </h3>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                  Step {sosStep} of 5
                </span>
              </div>
              <button
                onClick={() => setShowSosModal(false)}
                style={{
                  background: "rgba(102,187,106,0.08)",
                  border: "none",
                  color: "#A5D6A7",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSosSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Step 1: Location Cascade */}
              {sosStep === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <label style={labelStyle}>Select Emergency Zone *</label>
                  <LocationPicker onChange={(sel: LocationSelection | null) => setSosLocation(sel)} required={true} compact={true} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                    <label style={labelStyle}>Specific Landmark / Address *</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Metro Pillar 12, Banjara Hills"
                      value={sosAddress}
                      onChange={(e) => setSosAddress(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Animal Details */}
              {sosStep === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle}>Animal Type *</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {[
                        { id: "dog", label: "Dog", emoji: "🐕" },
                        { id: "cat", label: "Cat", emoji: "🐈" },
                        { id: "cow", label: "Cow", emoji: "🐄" },
                        { id: "bird", label: "Bird", emoji: "🐦" },
                        { id: "other", label: "Other", emoji: "🐾" },
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => setSosAnimal(item.id)}
                          style={{
                            background: sosAnimal === item.id ? "rgba(102,187,106,0.2)" : "rgba(10,16,11,0.6)",
                            border: `1px solid ${sosAnimal === item.id ? "rgba(102,187,106,0.5)" : "rgba(102,187,106,0.15)"}`,
                            borderRadius: "8px",
                            padding: "8px 14px",
                            color: "#FFFFFF",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                        >
                          {item.emoji} {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle}>Condition Summary *</label>
                    <input
                      type="text"
                      placeholder="e.g. Dog with bleeding hind leg, unable to stand"
                      value={sosCondition}
                      onChange={(e) => setSosCondition(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Emergency Level */}
              {sosStep === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <label style={labelStyle}>Select Severity Level *</label>
                  {[
                    { id: "low", label: "Low", desc: "Minor scratch, active but needs check", icon: "🟢", color: "#A5D6A7" },
                    { id: "medium", label: "Medium", desc: "Limping, skin disease, minor infection", icon: "🟡", color: "#FFE082" },
                    { id: "high", label: "High", desc: "Severe bleeding, open bone fracture", icon: "🟠", color: "#FFA726" },
                    { id: "critical", label: "Critical", desc: "Life-threatening shock, unconscious", icon: "🔴", color: "#EF5350" },
                  ].map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setSosSeverity(level.id as any)}
                      style={{
                        background: sosSeverity === level.id ? "rgba(102,187,106,0.1)" : "rgba(10,16,11,0.4)",
                        border: `1px solid ${sosSeverity === level.id ? level.color : "rgba(102,187,106,0.12)"}`,
                        borderRadius: "10px",
                        padding: "12px 16px",
                        textAlign: "left",
                        cursor: "pointer",
                        color: sosSeverity === level.id ? level.color : "#FFFFFF",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong>{level.icon} {level.label}</strong>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                          {level.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 4: Photo upload simulator */}
              {sosStep === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <label style={labelStyle}>Photo Upload (Optional)</label>
                  <div
                    style={{
                      border: "2px dashed rgba(102,187,106,0.25)",
                      borderRadius: "12px",
                      padding: "32px 16px",
                      textAlign: "center",
                      background: "rgba(10,16,11,0.4)",
                      cursor: "pointer",
                    }}
                    onClick={() => toast.success("Photo upload simulator activated")}
                  >
                    <Upload size={32} style={{ color: "#66BB6A", margin: "0 auto 12px", opacity: 0.7 }} />
                    <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                      Drag and drop files here, or click to upload
                    </span>
                    <span style={{ display: "block", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>
                      Max size: 5MB (PNG, JPG)
                    </span>
                  </div>
                </div>
              )}

              {/* Step 5: Confirm & Contact */}
              {sosStep === 5 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle}>Your Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={sosPhone}
                      onChange={(e) => setSosPhone(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={labelStyle}>Incident Description (Optional)</label>
                    <textarea
                      placeholder="Add any extra details..."
                      rows={3}
                      value={sosDesc}
                      onChange={(e) => setSosDesc(e.target.value)}
                      style={{ ...inputStyle, resize: "none" }}
                    />
                  </div>

                  {/* Warning summary */}
                  <div style={{ display: "flex", gap: "8px", background: "rgba(239,83,80,0.06)", border: "1px solid rgba(239,83,80,0.2)", padding: "10px", borderRadius: "8px", fontSize: "0.75rem", color: "#EF9A9A" }}>
                    <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      This alert will dispatch to verified volunteers in{" "}
                      <strong>{sosLocation?.areaName || "the chosen area"}</strong>. Make sure details are accurate.
                    </div>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", gap: "10px" }}>
                {sosStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setSosStep(sosStep - 1)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(102,187,106,0.3)",
                      color: "#A5D6A7",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    ← Back
                  </button>
                ) : (
                  <div />
                )}

                {sosStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (sosStep === 1 && (!sosLocation || !sosAddress.trim())) {
                        return toast.error("Please fill in location and address");
                      }
                      if (sosStep === 2 && !sosCondition.trim()) {
                        return toast.error("Please fill in condition summary");
                      }
                      setSosStep(sosStep + 1);
                    }}
                    style={{
                      background: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={sosSubmitting}
                    style={{
                      background: "linear-gradient(135deg, #EF5350 0%, #C62828 100%)",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {sosSubmitting ? "Dispatching..." : "Submit 🚨"}
                  </button>
                )}
              </div>

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
      `}</style>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: "rgba(10,16,11,0.6)",
  border: "1px solid rgba(102,187,106,0.18)",
  borderRadius: "8px",
  padding: "8px 12px",
  color: "#E8F5E9",
  fontSize: "0.8rem",
  fontWeight: 600,
  outline: "none",
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "rgba(232, 245, 233, 0.7)",
  textTransform: "uppercase",
  letterSpacing: "0.02em",
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
