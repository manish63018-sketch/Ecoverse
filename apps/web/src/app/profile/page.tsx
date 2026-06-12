"use client";

/**
 * "Supabase is the only source of truth for authentication and app data."
 */

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  MapPin, Shield, Activity, Settings, ArrowLeft,
  ToggleLeft, ToggleRight, CheckCircle, Navigation,
} from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import type { LocationSelection } from "@/types/location";
import type { Profile, RescueCase } from "@/lib/types";

const LocationPicker = dynamic(
  () => import("@/components/sections/LocationPicker"),
  { ssr: false }
);

interface UserProfile {
  displayName: string;
  email: string;
  city: string;
  roles: string[];
  profileSetupComplete: boolean;
  rescueCasesReported?: number;
  rescuesHelped?: number;
  animalsAdopted?: number;
  points?: number;
  createdAt?: string;
  bio?: string;
  availableNow?: boolean;
  rescueRadiusKm?: number;
  skills?: string[];
  instagramHandle?: string;
}

interface RecentCase {
  caseId: string;
  animalType: string;
  status: string;
  severity: string;
  location: { addressText: string };
  createdAt: string;
}

const ALL_BADGES = [
  {
    id: "animal_rescuer",
    emoji: "🏅",
    title: "Animal Rescuer",
    desc: "Helped rescue at least one animal",
    color: "#66BB6A",
    earnCondition: (p: UserProfile) => (p.rescuesHelped ?? 0) > 0,
  },
  {
    id: "first_reporter",
    emoji: "🚨",
    title: "First Responder",
    desc: "Reported your first SOS case",
    color: "#EF5350",
    earnCondition: (p: UserProfile) => (p.rescueCasesReported ?? 0) > 0,
  },
  {
    id: "vegan_warrior",
    emoji: "🌱",
    title: "Vegan Warrior",
    desc: "Joined as a vegan / animal lover",
    color: "#26A69A",
    earnCondition: (p: UserProfile) => p.roles?.includes("vegan_advocate") || p.roles?.includes("vegan"),
  },
  {
    id: "active_volunteer",
    emoji: "🙋",
    title: "Active Volunteer",
    desc: "Signed up as a volunteer",
    color: "#42A5F5",
    earnCondition: (p: UserProfile) => p.roles?.includes("volunteer"),
  },
  {
    id: "community_leader",
    emoji: "⭐",
    title: "Community Leader",
    desc: "Earn 100+ impact points",
    color: "#FFA726",
    earnCondition: (p: UserProfile) => (p.points ?? 0) >= 100,
  },
  {
    id: "ngo_partner",
    emoji: "🏢",
    title: "NGO Partner",
    desc: "Joined as an NGO / Organization",
    color: "#AB47BC",
    earnCondition: (p: UserProfile) => p.roles?.includes("ngo_staff") || p.roles?.includes("ngo"),
  },
];

const ROLE_MAP: Record<string, { emoji: string; label: string; color: string }> = {
  rescuer:   { emoji: "🐾", label: "Rescuer",            color: "#66BB6A" },
  adopter:   { emoji: "🏡", label: "Adopter",            color: "#FFA726" },
  vegan_advocate: { emoji: "🌱", label: "Vegan / Animal Lover", color: "#26A69A" },
  vegan:     { emoji: "🌱", label: "Vegan / Animal Lover", color: "#26A69A" },
  volunteer: { emoji: "🤝", label: "Volunteer",          color: "#42A5F5" },
  ngo_staff: { emoji: "🏢", label: "NGO Staff",          color: "#AB47BC" },
  ngo:       { emoji: "🏢", label: "NGO Staff",          color: "#AB47BC" },
  feeder:    { emoji: "🐦", label: "Feeder / Caretaker", color: "#FF7043" },
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const { data: rawProfile, loading: profileLoading, refetch } = useProfile(user?.id);
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [togglingAvail, setTogglingAvail] = useState(false);

  const [locationSelection, setLocationSelection] = useState<LocationSelection | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const profile: UserProfile | null = rawProfile ? {
    displayName: rawProfile.full_name || "EcoVerse Supporter",
    email: rawProfile.email || user?.email || "",
    city: rawProfile.city_name || "",
    roles: rawProfile.roles || [],
    profileSetupComplete: !!rawProfile.full_name,
    rescueCasesReported: rawProfile.rescue_count || 0,
    rescuesHelped: rawProfile.volunteer_hours || 0,
    animalsAdopted: rawProfile.adopt_count || 0,
    points: (rawProfile.rescue_count || 0) * 10 + (rawProfile.adopt_count || 0) * 15,
    createdAt: rawProfile.created_at,
    bio: rawProfile.bio || "",
    availableNow: rawProfile.available_now || false,
    rescueRadiusKm: rawProfile.rescue_radius_km || 10,
    skills: rawProfile.skills || [],
    instagramHandle: rawProfile.instagram_handle || "",
  } : null;

  const currentLocation = rawProfile?.area_name ? {
    display_zone: `${rawProfile.area_name}, ${rawProfile.city_name || ""}`,
    area_name: rawProfile.area_name
  } : null;

  useEffect(() => {
    if (!user) return;

    const fetchRecentCases = async () => {
      try {
        const { data, error } = await supabase
          .from("rescue_cases")
          .select("*")
          .eq("reporter_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;

        const mapped: RecentCase[] = (data || []).map((c: any) => ({
          caseId: c.id,
          animalType: c.animal_type,
          status: c.status,
          severity: c.emergency_level,
          location: { addressText: c.area_name ? `${c.area_name}, ${c.city_name}` : c.city_name },
          createdAt: c.created_at
        }));

        setRecentCases(mapped);
      } catch (err) {
        console.error("Failed to load user rescue cases:", err);
      } finally {
        setRecentLoading(false);
      }
    };

    fetchRecentCases();
  }, [user]);

  const handleSaveLocation = useCallback(async () => {
    if (!user || !locationSelection) return;
    setSavingLocation(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          state_name: locationSelection.stateName || locationSelection.stateId,
          city_name: locationSelection.cityName || locationSelection.cityId,
          area_name: locationSelection.areaName || locationSelection.areaId,
        })
        .eq("id", user.id);

      if (error) throw error;

      setShowLocationPicker(false);
      setLocationSelection(null);
      refetch();
      toast.success(`📍 Location set to ${locationSelection.areaName}!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save location");
    } finally {
      setSavingLocation(false);
    }
  }, [user, locationSelection, refetch]);

  const toggleAvailability = async () => {
    if (!user || !rawProfile) return;
    setTogglingAvail(true);
    try {
      const newVal = !rawProfile.available_now;
      const { error } = await supabase
        .from("profiles")
        .update({ available_now: newVal })
        .eq("id", user.id);

      if (error) throw error;

      refetch();
      toast.success(newVal ? "You're now showing as available 🟢" : "Availability set to offline");
    } catch (err) {
      toast.error("Failed to update availability");
    } finally {
      setTogglingAvail(false);
    }
  };

  if (loading || profileLoading) return <LoadingScreen />;
  if (!user || !profile) return null;

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "June 2026";

  const earnedBadges = ALL_BADGES.filter((b) => b.earnCondition(profile));
  const lockedBadges = ALL_BADGES.filter((b) => !b.earnCondition(profile));

  const isVolunteer = profile.roles?.includes("volunteer");
  const isAvailable = profile.availableNow ?? false;

  const userAvatar = rawProfile?.avatar_url || user?.user_metadata?.avatar_url || null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a1a0e",
        color: "#E8F5E9",
        fontFamily: "var(--font-sans), sans-serif",
        paddingBottom: "80px",
      }}
    >
      <div
        style={{
          height: "180px",
          background: `
            radial-gradient(ellipse 80% 100% at 50% 20%, rgba(46,125,50,0.35) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 80% 50%, rgba(27,94,32,0.2) 0%, transparent 60%),
            #0a1a0e
          `,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle at 1px 1px, #2E7D32 1.5px, transparent 0)",
            backgroundSize: "20px 20px",
            opacity: 0.12,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "24px",
            right: "24px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "rgba(232,245,233,0.7)",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <Link
            href="/settings"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "rgba(232,245,233,0.7)",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              background: "rgba(102,187,106,0.1)",
              border: "1px solid rgba(102,187,106,0.2)",
              padding: "6px 14px",
              borderRadius: "100px",
            }}
          >
            <Settings size={14} /> Edit Profile
          </Link>
        </div>
      </div>

      <div
        className="container"
        style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            gap: "20px",
            marginTop: "-50px",
            marginBottom: "32px",
            position: "relative",
            zIndex: 5,
          }}
        >
          <div style={{ position: "relative" }}>
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={profile.displayName}
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  border: "4px solid #0a1a0e",
                  boxShadow: "0 0 0 3px #66BB6A",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2E7D32, #66BB6A)",
                  border: "4px solid #0a1a0e",
                  boxShadow: "0 0 0 3px #66BB6A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  color: "#FFFFFF",
                }}
              >
                {profile.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            {isVolunteer && isAvailable && (
              <span
                style={{
                  position: "absolute",
                  bottom: "6px",
                  right: "6px",
                  width: "16px",
                  height: "16px",
                  background: "#66BB6A",
                  borderRadius: "50%",
                  border: "3px solid #0a1a0e",
                  boxShadow: "0 0 8px #66BB6A",
                  animation: "profilePulse 1.8s ease-in-out infinite",
                }}
              />
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
                {profile.displayName}
              </h1>
              <span
                style={{
                  background: "rgba(102,187,106,0.15)",
                  border: "1px solid rgba(102,187,106,0.3)",
                  color: "#A5D6A7",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: "20px",
                }}
              >
                EcoVerse Member
              </span>
              {isVolunteer && (
                <button
                  onClick={toggleAvailability}
                  disabled={togglingAvail}
                  title="Toggle volunteer availability"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: isAvailable ? "rgba(102,187,106,0.15)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${isAvailable ? "rgba(102,187,106,0.4)" : "rgba(255,255,255,0.1)"}`,
                    color: isAvailable ? "#66BB6A" : "rgba(232,245,233,0.4)",
                    borderRadius: "20px",
                    padding: "4px 12px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {isAvailable ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {isAvailable ? "Available Now" : "Set Available"}
                </button>
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginTop: "8px",
                flexWrap: "wrap",
                color: "rgba(232,245,233,0.55)",
                fontSize: "0.85rem",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={13} style={{ color: "#66BB6A" }} />
                {profile.city
                  ? profile.city.charAt(0).toUpperCase() + profile.city.slice(1) + ", India"
                  : "India"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Shield size={13} style={{ color: "#66BB6A" }} />
                Member since {memberSince}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          {[
            { label: "Cases Reported", value: profile.rescueCasesReported ?? 0, emoji: "📋", color: "#EF5350" },
            { label: "Rescues Helped", value: profile.rescuesHelped ?? 0, emoji: "🐾", color: "#66BB6A" },
            { label: "Animals Adopted", value: profile.animalsAdopted ?? 0, emoji: "🏡", color: "#FFA726" },
            { label: "Impact Points", value: profile.points ?? 0, emoji: "⭐", color: "#FFD54F" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(21,35,23,0.5)",
                border: "1px solid rgba(102,187,106,0.12)",
                borderRadius: "16px",
                padding: "18px",
                textAlign: "center",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: "4px" }}>{s.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: "1.4rem", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(232,245,233,0.5)", marginTop: "2px", fontWeight: 600 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }} className="profile-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <Card title="📍 My Alert Zone">
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{
                  padding: "14px 16px",
                  background: currentLocation?.display_zone
                    ? "rgba(102,187,106,0.07)"
                    : "rgba(255,167,38,0.06)",
                  border: `1px solid ${currentLocation?.display_zone ? "rgba(102,187,106,0.25)" : "rgba(255,167,38,0.2)"}`,
                  borderRadius: "10px",
                  display: "flex", alignItems: "flex-start", gap: "10px",
                }}>
                  {currentLocation?.display_zone ? (
                    <>
                      <CheckCircle size={16} style={{ color: "#66BB6A", flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <div style={{ fontWeight: 700, color: "#A5D6A7", fontSize: "0.9rem" }}>
                          {currentLocation.display_zone}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "rgba(232,245,233,0.5)", marginTop: "3px" }}>
                          ✅ Rescue alerts are isolated to <strong>{currentLocation.area_name}</strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Navigation size={16} style={{ color: "#FFA726", flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <div style={{ fontWeight: 700, color: "#FFA726", fontSize: "0.875rem" }}>No Alert Zone Set</div>
                        <div style={{ fontSize: "0.75rem", color: "rgba(232,245,233,0.5)", marginTop: "3px" }}>
                          Set your area below to receive location-isolated rescue notifications
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {!showLocationPicker ? (
                  <button
                    onClick={() => setShowLocationPicker(true)}
                    style={{
                      background: "rgba(102,187,106,0.1)",
                      border: "1px solid rgba(102,187,106,0.25)",
                      color: "#A5D6A7", padding: "9px 18px",
                      borderRadius: "9px", fontWeight: 600,
                      cursor: "pointer", fontSize: "0.85rem",
                      display: "flex", alignItems: "center", gap: "6px", width: "fit-content",
                    }}
                  >
                    <MapPin size={14} />
                    {currentLocation?.display_zone ? "Change My Area" : "Set My Area"}
                  </button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <LocationPicker
                      onChange={setLocationSelection}
                      required={false}
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={handleSaveLocation}
                        disabled={!locationSelection || savingLocation}
                        style={{
                          background: locationSelection ? "linear-gradient(135deg, #2E7D32, #66BB6A)" : "rgba(100,100,100,0.2)",
                          border: "none", color: "#FFFFFF",
                          padding: "10px 20px", borderRadius: "9px",
                          fontWeight: 700, cursor: locationSelection ? "pointer" : "not-allowed",
                          fontSize: "0.85rem",
                          display: "flex", alignItems: "center", gap: "6px",
                        }}
                      >
                        {savingLocation ? "Saving..." : "Save Location"}
                      </button>
                      <button
                        onClick={() => { setShowLocationPicker(false); setLocationSelection(null); }}
                        style={{
                          background: "rgba(10,16,11,0.5)",
                          border: "1px solid rgba(102,187,106,0.15)",
                          color: "rgba(232,245,233,0.5)", padding: "10px 16px",
                          borderRadius: "9px", fontWeight: 600,
                          cursor: "pointer", fontSize: "0.85rem",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card title="My Roles">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {(profile.roles || []).map((role) => {
                  const info = ROLE_MAP[role] || { emoji: "🌍", label: role, color: "#66BB6A" };
                  return (
                    <div
                      key={role}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: `${info.color}18`,
                        border: `1px solid ${info.color}40`,
                        borderRadius: "20px",
                        padding: "8px 16px",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: info.color,
                      }}
                    >
                      <span>{info.emoji}</span>
                      <span>{info.label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {isVolunteer && (
              <Card title="Volunteer Availability">
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.9rem", color: "rgba(232,245,233,0.8)", fontWeight: 600 }}>
                      Available Now
                    </span>
                    <button
                      onClick={toggleAvailability}
                      disabled={togglingAvail}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: isAvailable ? "#2E7D32" : "rgba(255,255,255,0.06)",
                        border: `1px solid ${isAvailable ? "#388E3C" : "rgba(255,255,255,0.1)"}`,
                        color: "#FFFFFF",
                        borderRadius: "20px",
                        padding: "6px 16px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {isAvailable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      {isAvailable ? "ON — Live on map" : "OFF — Hidden"}
                    </button>
                  </div>
                </div>
              </Card>
            )}

            <Card title={`Recent Activity (${recentCases.length} reports)`}>
              {recentCases.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <Activity size={28} style={{ color: "#66BB6A", opacity: 0.4, marginBottom: "12px" }} />
                  <p style={{ color: "rgba(232,245,233,0.4)", fontSize: "0.875rem" }}>
                    No rescue cases reported yet.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recentCases.map((c) => (
                    <div
                      key={c.caseId}
                      style={{
                        background: "rgba(10,16,11,0.5)",
                        border: "1px solid rgba(102,187,106,0.1)",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                          🐾 {c.animalType?.toUpperCase() || "Animal"} rescue
                        </span>
                        <p style={{ fontSize: "0.78rem", color: "rgba(232,245,233,0.45)", marginTop: "3px" }}>
                          {c.location?.addressText || "Location not specified"}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: "20px",
                          background: c.status === "resolved" ? "rgba(102,187,106,0.15)" : "rgba(239,83,80,0.15)",
                          color: c.status === "resolved" ? "#66BB6A" : "#EF5350",
                          border: `1px solid ${c.status === "resolved" ? "rgba(102,187,106,0.3)" : "rgba(239,83,80,0.3)"}`,
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card title="Badges &amp; Achievements">
              {earnedBadges.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#66BB6A", marginBottom: "12px" }}>
                    ✅ Earned
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px" }}>
                    {earnedBadges.map((b) => (
                      <BadgeCard key={b.id} badge={b} earned />
                    ))}
                  </div>
                </div>
              )}
              {lockedBadges.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(232,245,233,0.3)", marginBottom: "12px" }}>
                    🔒 Locked
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px" }}>
                    {lockedBadges.map((b) => (
                      <BadgeCard key={b.id} badge={b} earned={false} />
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/rescue?sos=true" style={quickLinkStyle("#EF5350")}>🚨 Report an SOS Case →</Link>
              <Link href="/map" style={quickLinkStyle("#42A5F5")}>🗺️ View Live India Map →</Link>
              <Link href="/settings" style={quickLinkStyle("#66BB6A")}>⚙️ Edit Profile / Settings →</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes profilePulse {
          0%, 100% { box-shadow: 0 0 6px #66BB6A; }
          50% { box-shadow: 0 0 14px #66BB6A; }
        }
        @media (min-width: 768px) {
          .profile-grid { grid-template-columns: 3fr 2fr !important; }
        }
      `}</style>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(21,35,23,0.5)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(102,187,106,0.12)",
        borderRadius: "16px",
        padding: "24px",
      }}
    >
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          color: "#A5D6A7",
          marginBottom: "16px",
          letterSpacing: "0.01em",
        }}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {children}
    </div>
  );
}

function BadgeCard({
  badge,
  earned,
}: {
  badge: typeof ALL_BADGES[0];
  earned: boolean;
}) {
  return (
    <div
      title={badge.desc}
      style={{
        background: earned ? `${badge.color}14` : "rgba(255,255,255,0.03)",
        border: `1px solid ${earned ? badge.color + "40" : "rgba(255,255,255,0.06)"}`,
        borderRadius: "12px",
        padding: "12px 8px",
        textAlign: "center",
        opacity: earned ? 1 : 0.45,
        transition: "all 0.2s",
        cursor: "default",
      }}
    >
      <div style={{ fontSize: "1.6rem", marginBottom: "6px", filter: earned ? "none" : "grayscale(1)" }}>
        {badge.emoji}
      </div>
      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: earned ? badge.color : "rgba(232,245,233,0.4)", lineHeight: 1.3 }}>
        {badge.title}
      </div>
    </div>
  );
}

function quickLinkStyle(color: string): React.CSSProperties {
  return {
    display: "block",
    background: `${color}0f`,
    border: `1px solid ${color}30`,
    borderRadius: "12px",
    padding: "14px 16px",
    color: color,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.875rem",
    transition: "all 0.2s",
  };
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a1a0e",
        color: "#E8F5E9",
        fontFamily: "var(--font-sans), sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div className="spinner-green" />
        <p style={{ color: "rgba(232,245,233,0.5)", fontSize: "0.9rem" }}>Loading your profile...</p>
      </div>
      <style>{`
        .spinner-green {
          width: 36px; height: 36px;
          border: 3px solid rgba(102,187,106,0.15);
          border-radius: 50%;
          border-top-color: #66BB6A;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
