"use client";

/**
 * "Supabase is the only source of truth for authentication and app data."
 */

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useDashboardStats } from "@/lib/hooks/useDashboardStats";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { 
  LogOut, MapPin, Shield, Activity, Plus, 
  Bell, BookOpen, Clock, AlertCircle, Layers, CheckCircle, Users 
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api";
import type { RescueCase } from "@/types/rescue";

interface ReporterDetails {
  name: string;
  phone: string;
}

export default function DashboardPage() {
  const { user, profile, loading, signOut, refetchProfile } = useAuth();
  const router = useRouter();
  const { data: stats, loading: statsLoading } = useDashboardStats();
  const { notifications, markAsRead } = useNotifications(user?.id);
  const [isAvailable, setIsAvailable] = useState(false);
  const [togglingAvail, setTogglingAvail] = useState(false);
  
  const [rescues, setRescues] = useState<RescueCase[]>([]);
  const [scope, setScope] = useState<"area" | "city">("area");
  const [loadingCases, setLoadingCases] = useState(true);
  const [reporterDetails, setReporterDetails] = useState<Record<string, ReporterDetails>>({});

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (profile && !profile.full_name) {
      toast("Please complete your onboarding profile first");
      router.push("/onboarding");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (profile) {
      setIsAvailable(profile.available_now || false);
    }
  }, [profile]);

  // Fetch rescue cases from Supabase
  const fetchRescues = useCallback(async () => {
    if (!user || !profile) return;
    setLoadingCases(true);

    try {
      let query = supabase
        .from("rescue_cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (profile.area_name && scope === "area") {
        query = query.eq("area_name", profile.area_name);
      } else if (profile.city_name && scope === "city") {
        query = query.eq("city_name", profile.city_name);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Map Supabase rescue cases to UI format
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

      setRescues(mapped);
    } catch (err: any) {
      console.error("Failed to fetch rescue cases from Supabase", err);
      setRescues([]);
      toast.error("Failed to load rescue feed");
    } finally {
      setLoadingCases(false);
    }
  }, [user, profile, scope]);

  useEffect(() => {
    if (!profile) return;
    fetchRescues();

    // Poll every 15 seconds for realtime experience
    const interval = setInterval(fetchRescues, 15000);
    return () => clearInterval(interval);
  }, [profile, fetchRescues]);

  // Load reporter contact info on demand for assigned rescue cases
  useEffect(() => {
    if (!user || rescues.length === 0) return;

    const fetchReporters = async () => {
      const missingIds = rescues
        .filter(r => r.assigned_volunteer_id === user.id && r.reporter_user_id && !reporterDetails[r.reporter_user_id])
        .map(r => r.reporter_user_id) as string[];

      if (missingIds.length === 0) return;

      const newDetails = { ...reporterDetails };
      let updated = false;

      for (const repId of missingIds) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", repId)
            .maybeSingle();

          if (error) throw error;

          if (data) {
            newDetails[repId] = {
              name: data.full_name || "Anonymous",
              phone: data.phone || "Not provided",
            };
            updated = true;
          } else {
            newDetails[repId] = { name: "Anonymous", phone: "Not provided" };
            updated = true;
          }
        } catch (err) {
          console.error("Error loading reporter details from Supabase:", err);
        }
      }
      if (updated) {
        setReporterDetails(newDetails);
      }
    };

    fetchReporters();
  }, [rescues, user, reporterDetails]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at top, #121e14 0%, #050806 100%)",
          color: "#E8F5E9",
          fontFamily: "var(--font-sans), sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div className="spinner"></div>
          <p style={{ color: "rgba(232, 245, 233, 0.6)", fontSize: "0.95rem" }}>Verifying session...</p>
          <style>{`
            .spinner {
              width: 40px;
              height: 40px;
              border: 3px solid rgba(102, 187, 106, 0.2);
              border-radius: 50%;
              border-top-color: #66BB6A;
              animation: spin 0.8s linear infinite;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Successfully logged out");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleAcceptDispatch = async (caseId: string) => {
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

      toast.success("✅ Rescue case accepted! You are now dispatched.");
      fetchRescues();
    } catch (error: any) {
      console.error("Error accepting rescue case:", error);
      toast.error(error.message || "Failed to accept rescue case");
    }
  };

  const handleResolveCase = async (caseId: string) => {
    try {
      const { error } = await supabase
        .from("rescue_cases")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", caseId);

      if (error) throw error;

      toast.success("Rescue marked as completed!");
      fetchRescues();
    } catch (error: any) {
      console.error("Error resolving rescue case:", error);
      toast.error(error.message || "Failed to resolve rescue case");
    }
  };

  const toggleAvailability = async () => {
    if (!user || !profile) return;
    setTogglingAvail(true);
    try {
      const newVal = !isAvailable;
      
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          available_now: newVal,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (profileErr) throw profileErr;

      setIsAvailable(newVal);
      toast.success(newVal ? "You're now showing as available 🟢" : "Availability set to offline");
      refetchProfile();
    } catch (err) {
      console.error("Availability toggle error:", err);
      toast.error("Failed to update availability");
    } finally {
      setTogglingAvail(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #121e14 0%, #050806 100%)",
        color: "#FFFFFF",
        fontFamily: "var(--font-sans), sans-serif",
        padding: "40px 24px",
      }}
    >
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Top Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(102, 187, 106, 0.15)",
            paddingBottom: "24px",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.025em" }}>EcoVerse Dashboard</h1>
            <p style={{ color: "rgba(232, 245, 233, 0.6)", marginTop: "4px" }}>
              Welcome back, <span style={{ color: "#A5D6A7", fontWeight: 600 }}>{profile.full_name}</span>!
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/"
              style={{
                color: "rgba(232, 245, 233, 0.8)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              Back to Home
            </Link>
            <Link
              href="/profile"
              style={{
                color: "rgba(232, 245, 233, 0.8)",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-ghost"
              style={{
                padding: "10px 20px",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="dashboard-grid">
          {/* Top Row: User Card + Quick Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }} className="top-row">
            {/* User Profile Info Card */}
            <div
              style={{
                background: "rgba(21, 35, 23, 0.45)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(102, 187, 106, 0.15)",
                borderRadius: "16px",
                padding: "28px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "24px",
              }}
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || ""}
                  style={{ width: "80px", height: "80px", borderRadius: "50%", border: "3px solid #66BB6A" }}
                />
              ) : (
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "rgba(102, 187, 106, 0.15)",
                    border: "3px solid #66BB6A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#A5D6A7",
                    fontSize: "2rem",
                    fontWeight: 800,
                  }}
                >
                  {(profile.full_name || "E").charAt(0).toUpperCase()}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{profile.full_name}</h2>
                  <span
                    style={{
                      background: "rgba(102, 187, 106, 0.15)",
                      color: "#A5D6A7",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      border: "1px solid rgba(102, 187, 106, 0.3)",
                    }}
                  >
                    EcoVerse Member
                  </span>
                </div>
                <p style={{ color: "rgba(232, 245, 233, 0.6)", fontSize: "0.9rem", marginTop: "4px" }}>
                  Email: {user.email}
                </p>
                <div style={{ display: "flex", gap: "16px", marginTop: "12px", fontSize: "0.85rem", color: "rgba(232, 245, 233, 0.8)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={14} style={{ color: "#66BB6A" }} />
                    {profile.area_name ? `${profile.area_name}, ${profile.city_name}` : (profile.city_name ? `${profile.city_name}, IN` : "India")}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Shield size={14} style={{ color: "#66BB6A" }} />
                    UID: {user.id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Display Roles & Volunteer Availability Toggle */}
            <div
              style={{
                background: "rgba(21, 35, 23, 0.45)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(102, 187, 106, 0.15)",
                borderRadius: "16px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                justifyContent: "center",
              }}
            >
              <div>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(232, 245, 233, 0.6)", margin: "0 0 10px 0" }}>My Roles</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {(profile.roles || []).map((role: string) => (
                    <span
                      key={role}
                      style={{
                        background: "rgba(102, 187, 106, 0.1)",
                        border: "1px solid rgba(102, 187, 106, 0.25)",
                        color: "#A5D6A7",
                        borderRadius: "12px",
                        padding: "4px 12px",
                        fontWeight: 600,
                        fontSize: "0.72rem",
                      }}
                    >
                      {role.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {(profile.roles || []).includes("volunteer") && (
                <div style={{ borderTop: "1px solid rgba(102, 187, 106, 0.15)", paddingTop: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#FFFFFF" }}>Volunteer Status</div>
                      <div style={{ fontSize: "0.7rem", color: "rgba(232, 245, 233, 0.45)", marginTop: "2px" }}>
                        {isAvailable ? "🟢 Available on live map" : "🔴 Offline / Hidden"}
                      </div>
                    </div>
                    
                    <button
                      onClick={toggleAvailability}
                      disabled={togglingAvail}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: isAvailable ? "rgba(102,187,106,0.15)" : "rgba(255,255,255,0.06)",
                        border: `1px solid ${isAvailable ? "rgba(102,187,106,0.4)" : "rgba(255,255,255,0.1)"}`,
                        color: isAvailable ? "#66BB6A" : "rgba(232,245,233,0.4)",
                        borderRadius: "20px",
                        padding: "6px 14px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {isAvailable ? "Go Offline" : "Go Online"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            {[
              { title: "Active Volunteers", value: stats?.volunteers ?? 0, icon: <Users size={18} style={{ color: "#66BB6A" }} /> },
              { title: "NGO Partners", value: stats?.ngos ?? 0, icon: <Shield size={18} style={{ color: "#42A5F5" }} /> },
              { title: "Total Rescues", value: stats?.rescues ?? 0, icon: <Activity size={18} style={{ color: "#EF5350" }} /> },
              { title: "Completed Rescues", value: stats?.resolvedRescues ?? 0, icon: <CheckCircle size={18} style={{ color: "#81C784" }} /> }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="stat-card"
                style={{
                  background: "rgba(21, 35, 23, 0.45)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(102, 187, 106, 0.15)",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <span style={{ fontSize: "0.8rem", color: "rgba(232, 245, 233, 0.6)", fontWeight: 600, textTransform: "uppercase" }}>{stat.title}</span>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: "6px" }}>{stat.value}</div>
                </div>
                <div style={{ background: "rgba(102, 187, 106, 0.1)", padding: "10px", borderRadius: "12px" }}>
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row: Active Cases Feed + Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="bottom-row-grid">
            {/* Active Cases Feed */}
            <div
              style={{
                background: "rgba(21, 35, 23, 0.45)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(102, 187, 106, 0.15)",
                borderRadius: "16px",
                padding: "28px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Nearby Rescue Feed ({rescues.length} Cases)</h3>
                  {profile.area_name && (
                    <span style={{
                      fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px",
                      borderRadius: "4px", background: "rgba(102,187,106,0.1)",
                      border: "1px solid rgba(102,187,106,0.2)", color: "#A5D6A7",
                      display: "inline-block", marginTop: "4px"
                    }}>
                      {scope === "area" ? `📍 Area: ${profile.area_name}` : `🏙 City: ${profile.city_name}`} isolated
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Link href="/rescue" style={{ fontSize: "0.85rem", color: "#66BB6A", textDecoration: "none", fontWeight: 600 }}>
                    Rescue Board
                  </Link>
                  <Link href="/map" style={{ fontSize: "0.85rem", color: "#66BB6A", textDecoration: "none", fontWeight: 600 }}>
                    View Live Map
                  </Link>
                </div>
              </div>

              {/* Location Scope Warning if not configured */}
              {!profile.area_name && (
                <div style={{
                  padding: "16px 20px",
                  background: "rgba(255,167,38,0.08)",
                  border: "1px solid rgba(255,167,38,0.25)",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  display: "flex", gap: "12px", alignItems: "flex-start",
                }}>
                  <AlertCircle size={18} style={{ color: "#FFA726", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <div style={{ fontWeight: 700, color: "#FFA726", fontSize: "0.9rem" }}>Location Alert Zone Not Set</div>
                    <p style={{ color: "rgba(232, 245, 233, 0.6)", fontSize: "0.82rem", margin: "4px 0 8px 0" }}>
                      Your area is not configured. Set your Alert Zone in your profile to see location-isolated rescue cases.
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
                      <MapPin size={13} /> Configure Alert Zone
                    </Link>
                  </div>
                </div>
              )}

              {/* Scope Switcher if location set */}
              {profile.area_name && (
                <div style={{
                  background: "rgba(10,16,11,0.5)",
                  border: "1px solid rgba(102, 187, 106, 0.1)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                  display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Layers size={13} style={{ color: "#66BB6A" }} />
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(232,245,233,0.6)" }}>Show cases in:</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {(["area", "city"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setScope(s)}
                        style={{
                          background: scope === s ? "rgba(102,187,106,0.18)" : "rgba(10,16,11,0.5)",
                          border: `1px solid ${scope === s ? "rgba(102,187,106,0.4)" : "rgba(102,187,106,0.08)"}`,
                          color: scope === s ? "#A5D6A7" : "rgba(232,245,233,0.4)",
                          borderRadius: "6px",
                          padding: "5px 12px",
                          fontSize: "0.75rem",
                          fontWeight: scope === s ? 700 : 500,
                          cursor: "pointer",
                          fontFamily: "var(--font-sans)",
                          transition: "all 0.15s",
                          textTransform: "capitalize",
                        }}
                      >
                        {s === "area" ? `📍 ${profile.area_name ?? "My Area"}` : "🏙 My City"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loadingCases ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div className="spinner-green" />
                  <p style={{ color: "rgba(232, 245, 233, 0.4)", fontSize: "0.85rem", marginTop: "12px" }}>Loading rescues...</p>
                </div>
              ) : rescues.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(232, 245, 233, 0.5)" }}>
                  <Activity size={32} style={{ color: "#66BB6A", marginBottom: "12px", opacity: 0.7 }} />
                  <p>{profile.area_name ? `No active rescues in your ${scope === "area" ? "area" : "city"} right now.` : "No active rescues found."}</p>
                  <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>Report a case to alert nearby volunteers!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {rescues.map((rescue) => {
                    const isAssignedToMe = rescue.assigned_volunteer_id === user.id;
                    const isDispatched = rescue.status === "in_progress" || rescue.status === "assigned";
                    const reporter = rescue.reporter_user_id ? reporterDetails[rescue.reporter_user_id] : null;
                    const animalIcon = { dog: "🐶", cat: "🐱", cow: "🐮", bird: "🐦", other: "🐾" }[rescue.animal_type] || "🐾";
                    const severity = rescue.emergency_level || "medium";
                    const displayLocation = rescue.display_zone || rescue.area_name;

                    return (
                      <div key={rescue.id} className="case-item">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                          <span style={{ fontWeight: 600, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>{animalIcon}</span>
                            <span style={{ textTransform: "capitalize" }}>{rescue.animal_type} Rescue</span>
                          </span>
                          <span
                            style={{
                              color: severity === "critical" ? "#EF5350" : severity === "high" ? "#FFA726" : severity === "medium" ? "#FFE082" : "#A5D6A7",
                              background: severity === "critical" ? "rgba(239, 83, 80, 0.15)" : severity === "high" ? "rgba(255, 167, 38, 0.15)" : severity === "medium" ? "rgba(255, 213, 79, 0.12)" : "rgba(102, 187, 106, 0.12)",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              textTransform: "uppercase"
                            }}
                          >
                            {severity}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <p style={{ fontSize: "0.875rem", color: "rgba(232, 245, 233, 0.95)", margin: "0 0 4px 0" }}>
                            {rescue.condition_summary}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "rgba(232, 245, 233, 0.6)" }}>
                            <MapPin size={13} style={{ color: "#66BB6A" }} />
                            <span>{displayLocation}</span>
                          </div>
                          
                          {/* Reporter Details (only visible if accepted by current volunteer) */}
                          {isAssignedToMe && reporter && (
                            <div style={{
                              marginTop: "8px",
                              padding: "10px 14px",
                              background: "rgba(102, 187, 106, 0.08)",
                              border: "1px solid rgba(102, 187, 106, 0.2)",
                              borderRadius: "8px",
                              fontSize: "0.8rem",
                            }}>
                              <div style={{ fontWeight: 600, color: "#A5D6A7", marginBottom: "4px" }}>📞 Reporter Contact Details:</div>
                              <div>Name: {reporter.name}</div>
                              <div>Phone: <a href={`tel:${reporter.phone}`} style={{ color: "#66BB6A", fontWeight: 700, textDecoration: "none" }}>{reporter.phone}</a></div>
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", fontSize: "0.75rem", color: "rgba(232, 245, 233, 0.5)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                            <Clock size={12} />
                            Reported {rescue.created_at ? new Date(rescue.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "recently"}
                            {isAssignedToMe && reporter && (
                              <span style={{ color: "rgba(232, 245, 233, 0.45)", marginLeft: "6px" }}>
                                by {reporter.name.split(" ")[0]}
                              </span>
                            )}
                          </span>
                          
                          {isAssignedToMe ? (
                            <button
                              onClick={() => handleResolveCase(rescue.id)}
                              className="action-btn resolve-btn"
                            >
                              Complete Rescue
                            </button>
                          ) : isDispatched ? (
                            <span style={{ color: "#42A5F5", fontWeight: 600 }}>Volunteer Dispatched</span>
                          ) : (
                            <button
                              onClick={() => handleAcceptDispatch(rescue.id)}
                              className="action-btn"
                            >
                              Accept Dispatch
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <Link href="/rescue?sos=true" style={{ textDecoration: "none" }}>
                <div className="action-card" style={{ background: "linear-gradient(135deg, rgba(239, 83, 80, 0.15) 0%, rgba(21, 35, 23, 0.45) 100%)", border: "1px solid rgba(239, 83, 80, 0.3)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ background: "#EF5350", color: "#FFFFFF", padding: "10px", borderRadius: "12px", display: "flex" }}>
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 style={{ color: "#EF5350", fontWeight: 700, margin: 0 }}>🚨 Report SOS Case</h4>
                      <p style={{ color: "rgba(232, 245, 233, 0.6)", fontSize: "0.8rem", margin: "4px 0 0 0" }}>Instantly alert rescuers and dispatch team</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/adopt" style={{ textDecoration: "none" }}>
                <div className="action-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ background: "rgba(102, 187, 106, 0.15)", color: "#66BB6A", padding: "10px", borderRadius: "12px", display: "flex" }}>
                      <Plus size={20} />
                    </div>
                    <div>
                      <h4 style={{ color: "#A5D6A7", fontWeight: 700, margin: 0 }}>List Animal for Adoption</h4>
                      <p style={{ color: "rgba(232, 245, 233, 0.6)", fontSize: "0.8rem", margin: "4px 0 0 0" }}>Find a loving, permanent home for an animal</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/knowledge" style={{ textDecoration: "none" }}>
                <div className="action-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ background: "rgba(102, 187, 106, 0.15)", color: "#66BB6A", padding: "10px", borderRadius: "12px", display: "flex" }}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 style={{ color: "#A5D6A7", fontWeight: 700, margin: 0 }}>First Aid & Knowledge Hub</h4>
                      <p style={{ color: "rgba(232, 245, 233, 0.6)", fontSize: "0.8rem", margin: "4px 0 0 0" }}>Guides on animal first-aid, laws, and care tips</p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Notifications & Alerts Card */}
              <div
                style={{
                  background: "rgba(21, 35, 23, 0.45)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(102, 187, 106, 0.15)",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}
              >
                <h4 style={{ color: "#A5D6A7", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Bell size={18} style={{ color: "#66BB6A" }} /> Notifications & Alerts
                </h4>
                {notifications.length === 0 ? (
                  <p style={{ color: "rgba(232, 245, 233, 0.45)", fontSize: "0.82rem", margin: 0 }}>No new notifications.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "200px", overflowY: "auto" }}>
                    {notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                        style={{
                          padding: "10px 12px",
                          background: notif.is_read ? "rgba(10, 16, 11, 0.3)" : "rgba(102, 187, 106, 0.08)",
                          border: `1px solid ${notif.is_read ? "rgba(102, 187, 106, 0.05)" : "rgba(102, 187, 106, 0.2)"}`,
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: "0.8rem", color: notif.is_read ? "rgba(232, 245, 233, 0.85)" : "#A5D6A7" }}>{notif.title}</div>
                        {notif.body && <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "rgba(232, 245, 233, 0.55)" }}>{notif.body}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-grid {
          margin-top: 10px;
        }
        .stat-card {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
        }
        .case-item {
          background: rgba(10, 16, 11, 0.5);
          border: 1px solid rgba(102, 187, 106, 0.1);
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s;
        }
        .case-item:hover {
          border-color: rgba(102, 187, 106, 0.25);
          background: rgba(10, 16, 11, 0.75);
        }
        .action-btn {
          background: rgba(102, 187, 106, 0.12);
          border: 1px solid rgba(102, 187, 106, 0.25);
          color: #A5D6A7;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.75rem;
          font-family: var(--font-sans);
          transition: all 0.15s;
        }
        .action-btn:hover {
          background: #388E3C;
          color: #FFFFFF;
          border-color: #388E3C;
          box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
        }
        .resolve-btn {
          background: rgba(66, 165, 245, 0.15);
          border-color: rgba(66, 165, 245, 0.3);
          color: #90CAF9;
        }
        .resolve-btn:hover {
          background: #1976D2;
          border-color: #1976D2;
        }
        .action-card {
          background: rgba(21, 35, 23, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(102, 187, 106, 0.15);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-card:hover {
          transform: translateY(-2px);
          border-color: rgba(102, 187, 106, 0.35);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
        }
        .spinner-green {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(102, 187, 106, 0.2);
          border-radius: 50%;
          border-top-color: #66BB6A;
          animation: spin 0.8s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 992px) {
          .top-row {
            grid-template-columns: 2fr 1fr !important;
          }
          .bottom-row-grid {
            grid-template-columns: 2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
