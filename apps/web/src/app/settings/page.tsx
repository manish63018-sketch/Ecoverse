"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from "@/lib/hooks/useProfile";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, User, Bell, Lock, Heart, Save } from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserSettings {
  displayName: string;
  bio?: string;
  city: string;
  instagramHandle?: string;
  roles: string[];
  availableNow?: boolean;
  rescueRadiusKm?: number;
  skills?: string[];
  notificationPreferences?: {
    rescueSos: boolean;
    adoptionListings: boolean;
    volunteerRequests: boolean;
    weeklyDigest: boolean;
    sound: boolean;
  };
  privacyPreferences?: {
    profileVisibility: "public" | "members";
    showCity: boolean;
    allowMessages: "everyone" | "members" | "nobody";
    showOnlineStatus: boolean;
  };
}

type TabId = "profile" | "notifications" | "privacy" | "volunteer";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User size={15} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={15} /> },
  { id: "privacy", label: "Privacy", icon: <Lock size={15} /> },
  { id: "volunteer", label: "Volunteer", icon: <Heart size={15} /> },
];

const ALL_SKILLS = [
  "Dog Rescue", "Cat Rescue", "Bird Rescue", "Veterinary Assist",
  "Transport", "First Aid", "Trapping", "Foster Care",
  "Night Rescue", "Fundraising",
];

const ROLE_OPTIONS = [
  { id: "rescuer", emoji: "🐾", label: "Rescuer" },
  { id: "adopter", emoji: "🏡", label: "Adopter" },
  { id: "vegan_advocate", emoji: "🌱", label: "Vegan / Animal Lover" },
  { id: "volunteer", emoji: "🤝", label: "Volunteer" },
  { id: "feeder", emoji: "🐦", label: "Feeder / Caretaker" },
  { id: "ngo_staff", emoji: "🏢", label: "NGO Staff" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const { data: rawProfile, loading: profileLoading, refetch } = useProfile(user?.id);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (rawProfile) {
      setSettings({
        displayName: rawProfile.full_name || "",
        bio: rawProfile.bio || "",
        city: rawProfile.city_name || "",
        instagramHandle: rawProfile.instagram_handle || "",
        roles: rawProfile.roles || [],
        availableNow: rawProfile.available_now || false,
        rescueRadiusKm: rawProfile.rescue_radius_km || 10,
        skills: rawProfile.skills || [],
        notificationPreferences: {
          rescueSos: true,
          adoptionListings: true,
          volunteerRequests: true,
          weeklyDigest: true,
          sound: true,
        },
        privacyPreferences: {
          profileVisibility: "public",
          showCity: true,
          allowMessages: "members",
          showOnlineStatus: true,
        },
      });
      setSettingsLoading(false);
    }
  }, [rawProfile]);

  const saveSettings = async () => {
    if (!user || !settings) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: settings.displayName,
          bio: settings.bio,
          city_name: settings.city,
          instagram_handle: settings.instagramHandle,
          roles: settings.roles,
          available_now: settings.availableNow,
          rescue_radius_km: settings.rescueRadiusKm,
          skills: settings.skills,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      refetch();
      toast.success("Settings saved ✅");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof UserSettings>(key: K, val: UserSettings[K]) => {
    setSettings((prev) => prev ? { ...prev, [key]: val } : prev);
  };

  const updateNotif = (key: keyof NonNullable<UserSettings["notificationPreferences"]>, val: boolean) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            notificationPreferences: { ...(prev.notificationPreferences!), [key]: val },
          }
        : prev
    );
  };

  const updatePrivacy = (key: keyof NonNullable<UserSettings["privacyPreferences"]>, val: string | boolean) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            privacyPreferences: { ...(prev.privacyPreferences!), [key]: val },
          }
        : prev
    );
  };

  const toggleSkill = (skill: string) => {
    const current = settings?.skills || [];
    const next = current.includes(skill) ? current.filter((s) => s !== skill) : [...current, skill];
    updateField("skills", next);
  };

  const toggleRole = (roleId: string) => {
    const current = settings?.roles || [];
    const next = current.includes(roleId) ? current.filter((r) => r !== roleId) : [...current, roleId];
    updateField("roles", next);
  };

  if (loading || settingsLoading) return <LoadingScreen />;
  if (!user || !settings) return null;

  const isVolunteer = settings.roles.includes("volunteer");

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
      {/* Header */}
      <div
        style={{
          background: "rgba(15,26,16,0.95)",
          borderBottom: "1px solid rgba(102,187,106,0.12)",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(16px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/profile"
            style={{ color: "rgba(232,245,233,0.6)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem" }}
          >
            <ArrowLeft size={16} /> Profile
          </Link>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
            Settings
          </h1>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #2E7D32, #388E3C)",
            border: "none",
            color: "#FFFFFF",
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "0.875rem",
            padding: "10px 22px",
            borderRadius: "var(--radius-full)",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            boxShadow: "0 4px 12px rgba(46,125,50,0.3)",
          }}
        >
          <Save size={15} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "rgba(21,35,23,0.5)",
            border: "1px solid rgba(102,187,106,0.1)",
            borderRadius: "var(--radius-xl)",
            padding: "4px",
            marginBottom: "28px",
            overflowX: "auto",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 18px",
                borderRadius: "var(--radius-lg)",
                border: "none",
                background: activeTab === tab.id ? "rgba(102,187,106,0.15)" : "transparent",
                color: activeTab === tab.id ? "#A5D6A7" : "rgba(232,245,233,0.5)",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                borderBottom: activeTab === tab.id ? "2px solid #66BB6A" : "2px solid transparent",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Profile ───────────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <SettingsCard title="Account Info">
              <FormField label="Display Name">
                <input
                  value={settings.displayName}
                  onChange={(e) => updateField("displayName", e.target.value)}
                  placeholder="Your name"
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Bio (optional)">
                <textarea
                  value={settings.bio || ""}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="Tell your community about yourself..."
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </FormField>
              <FormField label="City">
                <input
                  value={settings.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Hyderabad"
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Instagram handle (optional)">
                <input
                  value={settings.instagramHandle || ""}
                  onChange={(e) => updateField("instagramHandle", e.target.value)}
                  placeholder="@yourhandle"
                  style={inputStyle}
                />
              </FormField>
            </SettingsCard>

            <SettingsCard title="My Roles">
              <p style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.45)", marginBottom: "14px" }}>
                Select all roles that apply to you. Notifications will target the right people.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "10px" }}>
                {ROLE_OPTIONS.map((role) => {
                  const active = settings.roles.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 14px",
                        borderRadius: "var(--radius-xl)",
                        border: `1px solid ${active ? "rgba(102,187,106,0.4)" : "rgba(102,187,106,0.12)"}`,
                        background: active ? "rgba(102,187,106,0.12)" : "transparent",
                        color: active ? "#A5D6A7" : "rgba(232,245,233,0.5)",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>{role.emoji}</span>
                      {role.label}
                      {active && <span style={{ marginLeft: "auto", color: "#66BB6A", fontSize: "0.7rem" }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </SettingsCard>
          </div>
        )}

        {/* ── Tab: Notifications ─────────────────────────────────────────── */}
        {activeTab === "notifications" && (
          <SettingsCard title="Notification Preferences">
            <p style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.45)", marginBottom: "20px" }}>
              Control which notifications EcoVerse sends you.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                { key: "rescueSos" as const, label: "🚨 Rescue SOS near me", desc: "Get alerts when an animal emergency is reported nearby" },
                { key: "adoptionListings" as const, label: "🐶 New adoption listings", desc: "Animals available for adoption in your city" },
                { key: "volunteerRequests" as const, label: "🤝 Volunteer requests", desc: "When rescuers need help nearby" },
                { key: "weeklyDigest" as const, label: "📰 Weekly digest email", desc: "Summary of EcoVerse activity in your area" },
                { key: "sound" as const, label: "🔊 Notification sounds", desc: "Play sound for rescue alerts" },
              ].map((item, i, arr) => (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(102,187,106,0.08)" : "none",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{item.label}</div>
                    <div style={{ color: "rgba(232,245,233,0.45)", fontSize: "0.78rem", marginTop: "2px" }}>{item.desc}</div>
                  </div>
                  <ToggleSwitch
                    checked={settings.notificationPreferences?.[item.key] ?? true}
                    onChange={(v) => updateNotif(item.key, v)}
                  />
                </div>
              ))}
            </div>
          </SettingsCard>
        )}

        {/* ── Tab: Privacy ───────────────────────────────────────────────── */}
        {activeTab === "privacy" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <SettingsCard title="Privacy Settings">
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                <PrivacyToggleRow
                  label="Show city on profile"
                  desc="Displays your city publicly (not your exact address)"
                  checked={settings.privacyPreferences?.showCity ?? true}
                  onChange={(v) => updatePrivacy("showCity", v)}
                />
                <PrivacyToggleRow
                  label="Show online status"
                  desc="Let others see if you're currently active"
                  checked={settings.privacyPreferences?.showOnlineStatus ?? true}
                  onChange={(v) => updatePrivacy("showOnlineStatus", v)}
                />
              </div>
            </SettingsCard>

            <SettingsCard title="Profile Visibility">
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(["public", "members"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updatePrivacy("profileVisibility", opt)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 16px",
                      borderRadius: "var(--radius-xl)",
                      border: `1px solid ${settings.privacyPreferences?.profileVisibility === opt ? "rgba(102,187,106,0.4)" : "rgba(102,187,106,0.1)"}`,
                      background: settings.privacyPreferences?.profileVisibility === opt ? "rgba(102,187,106,0.1)" : "transparent",
                      color: "#E8F5E9",
                      fontFamily: "var(--font-sans)",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>{opt === "public" ? "🌍" : "🔒"}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.875rem", textTransform: "capitalize" }}>{opt}</div>
                      <div style={{ fontSize: "0.75rem", color: "rgba(232,245,233,0.45)" }}>
                        {opt === "public" ? "Anyone can see your profile" : "Only EcoVerse members can see your profile"}
                      </div>
                    </div>
                    {settings.privacyPreferences?.profileVisibility === opt && (
                      <span style={{ marginLeft: "auto", color: "#66BB6A" }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </SettingsCard>

            <SettingsCard title="Messages">
              <p style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.45)", marginBottom: "12px" }}>
                Who can send you direct messages?
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(["everyone", "members", "nobody"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updatePrivacy("allowMessages", opt)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "var(--radius-full)",
                      border: `1px solid ${settings.privacyPreferences?.allowMessages === opt ? "#66BB6A" : "rgba(102,187,106,0.15)"}`,
                      background: settings.privacyPreferences?.allowMessages === opt ? "rgba(102,187,106,0.15)" : "transparent",
                      color: settings.privacyPreferences?.allowMessages === opt ? "#66BB6A" : "rgba(232,245,233,0.5)",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </SettingsCard>
          </div>
        )}

        {/* ── Tab: Volunteer ─────────────────────────────────────────────── */}
        {activeTab === "volunteer" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {!isVolunteer && (
              <div style={{
                background: "rgba(102,187,106,0.06)",
                border: "1px solid rgba(102,187,106,0.15)",
                borderRadius: "var(--radius-xl)",
                padding: "16px 20px",
                fontSize: "0.875rem",
                color: "rgba(232,245,233,0.6)",
              }}>
                💡 To access volunteer settings, first add the <strong style={{ color: "#66BB6A" }}>🤝 Volunteer</strong> role in the Profile tab.
              </div>
            )}

            <SettingsCard title="Availability">
              <PrivacyToggleRow
                label="Available Now"
                desc="Show yourself as available on the live map. Turn off when you're busy."
                checked={settings.availableNow ?? false}
                onChange={(v) => updateField("availableNow", v)}
                disabled={!isVolunteer}
              />
            </SettingsCard>

            <SettingsCard title="Rescue Radius">
              <p style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.45)", marginBottom: "14px" }}>
                Maximum distance you&apos;re willing to travel for a rescue.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                {[5, 10, 25, 50].map((km) => (
                  <button
                    key={km}
                    disabled={!isVolunteer}
                    onClick={() => updateField("rescueRadiusKm", km)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "var(--radius-full)",
                      border: `1px solid ${settings.rescueRadiusKm === km ? "#66BB6A" : "rgba(102,187,106,0.15)"}`,
                      background: settings.rescueRadiusKm === km ? "rgba(102,187,106,0.15)" : "transparent",
                      color: settings.rescueRadiusKm === km ? "#66BB6A" : "rgba(232,245,233,0.4)",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      cursor: isVolunteer ? "pointer" : "not-allowed",
                      opacity: isVolunteer ? 1 : 0.5,
                    }}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </SettingsCard>

            <SettingsCard title="Skills">
              <p style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.45)", marginBottom: "14px" }}>
                Select all your rescue skills. Helps match you to the right emergencies.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {ALL_SKILLS.map((skill) => {
                  const active = settings.skills?.includes(skill);
                  return (
                    <button
                      key={skill}
                      disabled={!isVolunteer}
                      onClick={() => toggleSkill(skill)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "var(--radius-full)",
                        border: `1px solid ${active ? "rgba(102,187,106,0.4)" : "rgba(102,187,106,0.12)"}`,
                        background: active ? "rgba(102,187,106,0.15)" : "transparent",
                        color: active ? "#A5D6A7" : "rgba(232,245,233,0.45)",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: isVolunteer ? "pointer" : "not-allowed",
                        opacity: isVolunteer ? 1 : 0.5,
                        transition: "all 0.15s",
                      }}
                    >
                      {active ? "✓ " : ""}{skill}
                    </button>
                  );
                })}
              </div>
            </SettingsCard>

            <div style={{ padding: "16px", background: "rgba(239,83,80,0.06)", border: "1px solid rgba(239,83,80,0.15)", borderRadius: "var(--radius-xl)" }}>
              <h4 style={{ color: "#EF5350", fontWeight: 700, marginBottom: "8px", fontSize: "0.9rem" }}>⚠️ Danger Zone</h4>
              <p style={{ color: "rgba(232,245,233,0.5)", fontSize: "0.8rem", marginBottom: "12px" }}>
                Permanently delete your EcoVerse account and all associated data.
              </p>
              <a
                href="mailto:manish63018@gmail.com?subject=Account Deletion Request"
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid rgba(239,83,80,0.3)",
                  color: "#EF5350",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Request Account Deletion
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(21,35,23,0.5)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(102,187,106,0.12)",
        borderRadius: "var(--radius-2xl)",
        padding: "24px",
      }}
    >
      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#A5D6A7", marginBottom: "18px" }}>{title}</h3>
      {children}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "rgba(232,245,233,0.7)", marginBottom: "6px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        border: "none",
        background: checked ? "#2E7D32" : "rgba(255,255,255,0.1)",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "#FFFFFF",
          top: "3px",
          left: checked ? "23px" : "3px",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

function PrivacyToggleRow({
  label,
  desc,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 0",
        borderBottom: "1px solid rgba(102,187,106,0.08)",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{label}</div>
        <div style={{ color: "rgba(232,245,233,0.45)", fontSize: "0.78rem", marginTop: "2px" }}>{desc}</div>
      </div>
      <ToggleSwitch checked={checked} onChange={disabled ? () => {} : onChange} />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(10,16,11,0.6)",
  border: "1px solid rgba(102,187,106,0.2)",
  borderRadius: "var(--radius-lg)",
  padding: "11px 14px",
  color: "#E8F5E9",
  fontSize: "0.9rem",
  fontFamily: "var(--font-sans)",
  outline: "none",
  boxSizing: "border-box",
};

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a1a0e" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
        <div className="spinner-g" />
        <p style={{ color: "rgba(232,245,233,0.4)", fontSize: "0.875rem", fontFamily: "var(--font-sans)" }}>Loading settings...</p>
      </div>
      <style>{`
        .spinner-g { width: 34px; height: 34px; border: 3px solid rgba(102,187,106,0.15); border-radius: 50%; border-top-color: #66BB6A; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
