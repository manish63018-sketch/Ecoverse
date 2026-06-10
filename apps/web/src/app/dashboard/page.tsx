"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  LogOut, MapPin, Shield, Activity, Users, Plus, 
  Bell, BookOpen, Clock, AlertCircle, Layers, CheckCircle, Navigation 
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import type { RescueCase } from "@/types/rescue";

interface UserProfile {
  displayName: string;
  email: string;
  city: string;
  roles: string[];
  profileSetupComplete: boolean;
  availableNow?: boolean;
}

interface ReporterDetails {
  name: string;
  phone: string;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [togglingAvail, setTogglingAvail] = useState(false);
  
  // PostgreSQL location and feed states
  const [rescues, setRescues] = useState<RescueCase[]>([]);
  const [userLocation, setUserLocation] = useState<{
    area_id?: string;
    city_id?: string;
    state_id?: string;
    display_zone?: string;
    area_name?: string;
  } | null>(null);
  const [scope, setScope] = useState<"area" | "city">("area");
  const [loadingCases, setLoadingCases] = useState(true);
  const [reporterDetails, setReporterDetails] = useState<Record<string, ReporterDetails>>({});

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    // Load profile from Firestore
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().profileSetupComplete === true) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setIsAvailable(data.availableNow ?? false);
        } else {
          // Profile incomplete, redirect to onboarding
          toast("Please complete your onboarding profile first");
          router.push("/onboarding");
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
        toast.error("Failed to load user profile");
      } finally {
        setVerifying(false);
      }
    };

    // Load location profile from Postgres
    const fetchUserLocation = async () => {
      try {
        const res = await fetch(`/api/users/location?firebase_uid=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          const locProfile = data.profile;
          if (locProfile) {
            setUserLocation({
              area_id: locProfile.area_id ?? undefined,
              city_id: locProfile.city_id ?? undefined,
              state_id: locProfile.state_id ?? undefined,
              display_zone: locProfile.display_zone,
              area_name: locProfile.area_name,
            });
          }
        }
      } catch (err) {
        console.error("Error loading user Postgres location profile:", err);
      }
    };

    fetchProfile();
    fetchUserLocation();
  }, [user, loading, router]);

  // Fetch rescue cases from Postgres via the API route
  const fetchRescues = useCallback(async () => {
    if (!user || !profile) return;
    setLoadingCases(true);

    try {
      let url = "/api/rescues";
      if (userLocation) {
        if (scope === "area" && userLocation.area_id) {
          url += `?area_id=${userLocation.area_id}`;
        } else if (scope === "city" && userLocation.city_id) {
          url += `?city_id=${userLocation.city_id}`;
        } else {
          url += `?firebase_uid=${user.uid}`;
        }
      } else {
        url += `?firebase_uid=${user.uid}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setRescues(data.cases ?? []);
    } catch (err) {
      console.error("Failed to fetch rescue cases", err);
      toast.error("Failed to load rescue feed");
    } finally {
      setLoadingCases(false);
    }
  }, [user, profile, scope, userLocation]);

  useEffect(() => {
    if (!profile) return;
    fetchRescues();
    const interval = setInterval(fetchRescues, 30000);
    return () => clearInterval(interval);
  }, [profile, fetchRescues]);

  // Load reporter contact info on demand for assigned rescue cases
  useEffect(() => {
    if (!user || rescues.length === 0) return;

    const fetchReporters = async () => {
      const missingIds = rescues
        .filter(r => r.assigned_volunteer_id === user.uid && r.reporter_user_id && !reporterDetails[r.reporter_user_id])
        .map(r => r.reporter_user_id) as string[];

      if (missingIds.length === 0) return;

      const newDetails = { ...reporterDetails };
      let updated = false;

      for (const repId of missingIds) {
        try {
          const docRef = doc(db, "users", repId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            newDetails[repId] = {
              name: data.displayName || "Anonymous",
              phone: data.phoneNumber || data.phone || "Not provided",
            };
            updated = true;
          } else {
            newDetails[repId] = { name: "Anonymous", phone: "Not provided" };
            updated = true;
          }
        } catch (err) {
          console.error("Error loading reporter details:", err);
        }
      }
      if (updated) {
        setReporterDetails(newDetails);
      }
    };

    fetchReporters();
  }, [rescues, user, reporterDetails]);

  if (loading || verifying) {
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
      await logout();
      toast.success("Successfully logged out");
      router.push("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleAcceptDispatch = async (caseId: string) => {
    try {
      const res = await fetch(`/api/rescues/${caseId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteer_id: user.uid, response: "accepted" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to accept");
      toast.success("✅ Rescue case accepted! You are now dispatched.");
      fetchRescues();
    } catch (error: any) {
      console.error("Error accepting rescue case:", error);
      toast.error(error.message || "Failed to accept rescue case");
    }
  };

  const handleResolveCase = async (caseId: string) => {
    try {
      const res = await fetch(`/api/rescues/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to resolve");
      toast.success("Rescue marked as completed! Awarded 🏅 Rescue Badge.");
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
      await updateDoc(doc(db, "users", user.uid), { availableNow: newVal });
      // Also update public profile for map
      await updateDoc(doc(db, "public_profiles", user.uid), {
        "volunteerInfo.availableNow": newVal,
      }).catch(() => {});
      setIsAvailable(newVal);
      toast.success(newVal ? "You're now showing as available 🟢" : "Availability set to offline");
    } catch (err) {
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
              Welcome back, <span style={{ color: "#A5D6A7", fontWeight: 600 }}>{profile.displayName}</span>!
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
                borderRadius: "var(--radius-2xl)",
                padding: "28px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "24px",
              }}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={profile.displayName}
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
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{profile.displayName}</h2>
                  <span
                    style={{
                      background: "rgba(102, 187, 106, 0.15)",
                      color: "#A5D6A7",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      border: "1px solid rgba(102, 187, 106, 0.3)",
                    }}
                  >
                    EcoVerse Member
                  </span>
                </div>
                <p style={{ color: "rgba(232, 245, 233, 0.6)", fontSize: "0.9rem", marginTop: "4px" }}>
                  Email: {profile.email}
                </p>
                <div style={{ display: "flex", gap: "16px", marginTop: "12px", fontSize: "0.85rem", color: "rgba(232, 245, 233, 0.8)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={14} style={{ color: "#66BB6A" }} />
                    {userLocation?.display_zone || (profile.city ? profile.city.charAt(0).toUpperCase() + profile.city.slice(1) + ", IN" : "India")}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Shield size={14} style={{ color: "#66BB6A" }} />
                    UID: {user.uid.substring(0, 8)}...
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
                borderRadius: "var(--radius-2xl)",
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
                  {profile.roles.map((role) => (
                    <span
                      key={role}
                      style={{
                        background: "rgba(102, 187, 106, 0.1)",
                        border: "1px solid rgba(102, 187, 106, 0.25)",
                        color: "#A5D6A7",
                        borderRadius: "var(--radius-full)",
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

              {profile.roles.includes("volunteer") && (
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
                        borderRadius: "var(--radius-full)",
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

          {/* Bottom Row: Active Cases Feed + Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="bottom-row-grid">
            {/* Active Cases Feed */}
            <div
              style={{
                background: "rgba(21, 35, 23, 0.45)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(102, 187, 106, 0.15)",
                borderRadius: "var(--radius-2xl)",
                padding: "28px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Nearby Rescue Feed ({rescues.length} Cases)</h3>
                  {userLocation?.display_zone && (
                    <span style={{
                      fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px",
                      borderRadius: "4px", background: "rgba(102,187,106,0.1)",
                      border: "1px solid rgba(102,187,106,0.2)", color: "#A5D6A7",
                      display: "inline-block", marginTop: "4px"
                    }}>
                      {scope === "area" ? `📍 Area: ${userLocation.area_name}` : `🏙 City: ${userLocation.display_zone.split(",")[1]?.trim() || "My City"}`} isolated
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
              {!userLocation?.area_id && (
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
              {userLocation?.area_id && (
                <div style={{
                  background: "rgba(10,16,11,0.5)",
                  border: "1px solid rgba(102,187,106,0.1)",
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
                        {s === "area" ? `📍 ${userLocation.area_name ?? "My Area"}` : "🏙 My City"}
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
                  <p>{userLocation?.area_id ? `No active rescues in your ${scope === "area" ? "area" : "city"} right now.` : "No active rescues found."}</p>
                  <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>Report a case to alert nearby volunteers!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {rescues.map((rescue) => {
                    const isAssignedToMe = rescue.assigned_volunteer_id === user.uid;
                    const isDispatched = rescue.status === "in_progress" || rescue.status === "assigned";
                    const reporter = rescue.reporter_user_id ? reporterDetails[rescue.reporter_user_id] : null;
                    const animalIcon = { dog: "🐶", cat: "🐱", cow: "🐮", bird: "🐦", pigeon: "🕊️" }[rescue.animal_type] || "🐾";
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
                              borderRadius: "var(--radius-lg)",
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
              <Link href="/sos" style={{ textDecoration: "none" }}>
                <div className="action-card" style={{ background: "linear-gradient(135deg, rgba(239, 83, 80, 0.15) 0%, rgba(21, 35, 23, 0.45) 100%)", border: "1px solid rgba(239, 83, 80, 0.3)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ background: "#EF5350", color: "#FFFFFF", padding: "10px", borderRadius: "12px", display: "flex" }}>
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 style={{ color: "#EF5350", fontWeight: 700, margin: 0 }}>🚨 Report SOS Case</h4>
                      <p style={{ color: "rgba(232, 245, 233, 0.6)", fontSize: "0.8rem", margin: "4px 0 0 0" }}>Instantly alert nearby rescuers and dispatch team</p>
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
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-grid {
          margin-top: 10px;
        }
        .stat-card {
          background: rgba(21, 35, 23, 0.45);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(102, 187, 106, 0.15);
          border-radius: var(--radius-xl);
          padding: 24px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
        }
        .case-item {
          background: rgba(10, 16, 11, 0.5);
          border: 1px solid rgba(102, 187, 106, 0.1);
          border-radius: var(--radius-xl);
          padding: 16px;
          transition: all var(--transition-base);
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
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          font-size: 0.75rem;
          font-family: var(--font-sans);
          transition: all var(--transition-fast);
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
          border-radius: var(--radius-xl);
          padding: 20px;
          cursor: pointer;
          transition: all var(--transition-base);
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
