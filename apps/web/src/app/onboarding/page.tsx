"use client";

/**
 * "Supabase is the only source of truth for authentication and app data."
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api";
import { INDIAN_CITIES } from "@/lib/cities";
import {
  Shield,
  Leaf,
  Users,
  Building2,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Check,
  MapPin,
  Home,
  CheckSquare
} from "lucide-react";
import { EcoVerseLogo } from "@/components/brand/Logo";
import toast from "react-hot-toast";

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const roleOptions: RoleOption[] = [
  { id: "rescuer", title: "Rescuer", description: "Directly saves distressed animals", icon: <Shield size={22} /> },
  { id: "adopter", title: "Adopter", description: "Wants to adopt or foster animals", icon: <Home size={22} /> },
  { id: "vegan", title: "Vegan / Animal Lover", description: "Dietary or lifestyle animal advocate", icon: <Leaf size={22} /> },
  { id: "volunteer", title: "Volunteer", description: "Offers time, transport, or first aid", icon: <Users size={22} /> },
  { id: "ngo", title: "NGO / Organization", description: "Registered shelter or NGO", icon: <Building2 size={22} /> },
  { id: "feeder", title: "Feeder / Caretaker", description: "Feeds street animals daily", icon: <Calendar size={22} /> }
];

export default function OnboardingPage() {
  const { user, loading, refetchProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form states
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [city, setCity] = useState("hyderabad");
  const [pincode, setPincode] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Role details states
  const [volunteerSkills, setVolunteerSkills] = useState<string[]>([]);
  const [volunteerHours, setVolunteerHours] = useState(5);
  const [volunteerRadius, setVolunteerRadius] = useState(10);
  const [volunteerAvailable, setVolunteerAvailable] = useState(true);

  const [rescuerExp, setRescuerExp] = useState("beginner");
  const [rescuerArea, setRescuerArea] = useState("");

  const [adopterHousing, setAdopterHousing] = useState("apartment");
  const [adopterOtherPets, setAdopterOtherPets] = useState(false);
  const [adopterPreferred, setAdopterPreferred] = useState("dog");

  const [veganStatus, setVeganStatus] = useState("curious");
  const [veganInterests, setVeganInterests] = useState("");

  const [ngoName, setNgoName] = useState("");
  const [ngoEmergencyContact, setNgoEmergencyContact] = useState("");
  const [ngoCause, setNgoCause] = useState("");

  const [feederLocation, setFeederLocation] = useState("");
  const [feederTiming, setFeederTiming] = useState("08:00 AM");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (user) {
      setDisplayName(user.user_metadata?.full_name || "");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F1A10", color: "#FFFFFF" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", margin: "auto" }}>
          <div className="spinner"></div>
          <p style={{ color: "rgba(232, 245, 233, 0.6)" }}>Loading setup wizard...</p>
          <style>{`.spinner { width: 32px; height: 32px; border: 2px solid rgba(102,187,106,0.2); border-radius: 50%; border-top-color: #66BB6A; animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const handleRoleToggle = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter((id) => id !== roleId));
    } else {
      if (selectedRoles.length >= 3) {
        toast.error("You can select up to 3 roles maximum");
        return;
      }
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const handleSkillToggle = (skill: string) => {
    if (volunteerSkills.includes(skill)) {
      setVolunteerSkills(volunteerSkills.filter((s) => s !== skill));
    } else {
      setVolunteerSkills([...volunteerSkills, skill]);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (selectedRoles.length === 0) {
        toast.error("Please select at least 1 role to proceed");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!displayName.trim()) {
        toast.error("Please enter your display name");
        return;
      }
      if (!pincode.trim() || pincode.length !== 6) {
        toast.error("Please enter a valid 6-digit pincode");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      // Validate conditional fields
      if (selectedRoles.includes("ngo")) {
        if (!ngoName.trim() || !ngoEmergencyContact.trim() || !ngoCause.trim()) {
          toast.error("Please fill in all NGO profile details");
          return;
        }
      }
      if (selectedRoles.includes("rescuer") && !rescuerArea.trim()) {
        toast.error("Please specify your rescue operations area");
        return;
      }
      if (selectedRoles.includes("feeder") && !feederLocation.trim()) {
        toast.error("Please specify your daily feeding location");
        return;
      }
      setStep(4);
    } else {
      setStep(5);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const targetStateCode = INDIAN_CITIES.find((c) => c.id === city)?.state || "India";
      const primaryRole = selectedRoles[0] || "volunteer";
      const isVeganPledged = selectedRoles.includes("vegan") && veganStatus !== "curious";

      // Update user details in Supabase profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: displayName,
          city_name: city,
          state_name: targetStateCode,
          pincode: pincode,
          roles: selectedRoles,
          primary_role: primaryRole,
          available_now: selectedRoles.includes("volunteer") ? volunteerAvailable : false,
          rescue_radius_km: volunteerRadius,
          skills: selectedRoles.includes("volunteer") ? volunteerSkills : [],
          vegan_streak_days: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast.success("Profile setup completed successfully!");
      await refetchProfile();
      router.push("/dashboard");

    } catch (error: any) {
      console.error("Error saving profile details:", error);
      toast.error(error.message || "Failed to save profile details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top, #121e14 0%, #050806 100%)",
        padding: "24px 16px",
        fontFamily: "var(--font-sans), sans-serif",
        color: "#FFFFFF"
      }}
    >
      <div style={{ marginBottom: "28px" }}>
        <EcoVerseLogo theme="dark" size={42} />
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "580px",
          background: "rgba(21, 35, 23, 0.45)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(102, 187, 106, 0.15)",
          borderRadius: "16px",
          padding: "36px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.45)"
        }}
      >
        {/* Step Indicators */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 5 ? 1 : "initial" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  background: step >= i ? "linear-gradient(135deg, #66BB6A, #388E3C)" : "rgba(232, 245, 233, 0.08)",
                  border: step >= i ? "none" : "1px solid rgba(232,245,233,0.15)",
                  color: step >= i ? "#FFFFFF" : "rgba(232,245,233,0.4)"
                }}
              >
                {step > i ? <Check size={16} /> : i}
              </div>
              {i < 5 && (
                <div
                  style={{
                     flex: 1,
                     height: "2px",
                     background: step > i ? "#388E3C" : "rgba(232,245,233,0.08)",
                     margin: "0 8px"
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Roles */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>Select Your Community Roles</h2>
            <p style={{ color: "rgba(232,245,233,0.6)", fontSize: "0.875rem", marginBottom: "24px" }}>
              Choose 1 to 3 roles to personalize your dashboard and receive dispatches.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="roles-grid">
              {roleOptions.map((opt) => {
                const active = selectedRoles.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleRoleToggle(opt.id)}
                    style={{
                      background: active ? "rgba(102, 187, 106, 0.08)" : "rgba(10, 16, 11, 0.4)",
                      border: active ? "2px solid #66BB6A" : "1px solid rgba(102,187,106,0.15)",
                      borderRadius: "12px",
                      padding: "16px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                    className="role-card"
                  >
                    <div style={{ color: active ? "#66BB6A" : "rgba(232,245,233,0.5)", display: "flex" }}>
                      {opt.icon}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: "0.95rem", color: active ? "#A5D6A7" : "#FFFFFF" }}>{opt.title}</h4>
                      <p style={{ fontSize: "0.75rem", color: "rgba(232,245,233,0.5)", marginTop: "4px", lineHeight: 1.4 }}>{opt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Location & Name */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>Location & General Details</h2>
            <p style={{ color: "rgba(232,245,233,0.6)", fontSize: "0.875rem", marginBottom: "24px" }}>
              Enter your display name and location to map you with nearby rescue alerts.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(232, 245, 233, 0.85)" }}>
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manish Sharma"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(10, 16, 11, 0.6)",
                    border: "1px solid rgba(102, 187, 106, 0.25)",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    color: "#FFFFFF",
                    fontSize: "0.95rem"
                  }}
                  className="auth-input"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(232, 245, 233, 0.85)" }}>
                  Select City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(10, 16, 11, 0.8)",
                    border: "1px solid rgba(102, 187, 106, 0.25)",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    color: "#FFFFFF",
                    fontSize: "0.95rem"
                  }}
                  className="auth-input"
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: "#0a100b", color: "#FFFFFF" }}>
                      {c.name} ({c.state})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(232, 245, 233, 0.85)" }}>
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500032"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  style={{
                    width: "100%",
                    background: "rgba(10, 16, 11, 0.6)",
                    border: "1px solid rgba(102, 187, 106, 0.25)",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    color: "#FFFFFF",
                    fontSize: "0.95rem"
                  }}
                  className="auth-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Role Specific Fields */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>Role Attributes</h2>
            <p style={{ color: "rgba(232,245,233,0.6)", fontSize: "0.875rem", marginBottom: "24px" }}>
              Provide information regarding your selected roles.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {selectedRoles.includes("volunteer") && (
                <div style={{ borderBottom: "1px solid rgba(102,187,106,0.15)", paddingBottom: "24px" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#66BB6A", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Users size={18} /> Volunteer Profile
                  </h3>
                  <div>
                    <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(232, 245, 233, 0.85)", display: "block", marginBottom: "8px" }}>
                      Volunteer Skills
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {["first_aid", "transport", "foster_care", "social_media", "admin_coordination"].map((skill) => {
                        const active = volunteerSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleSkillToggle(skill)}
                            style={{
                              background: active ? "#388E3C" : "rgba(10, 16, 11, 0.6)",
                              border: "1px solid rgba(102,187,106,0.25)",
                              borderRadius: "20px",
                              padding: "6px 14px",
                              color: "#FFFFFF",
                              fontSize: "0.8rem",
                              cursor: "pointer",
                            }}
                          >
                            {skill.replace("_", " ").toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {selectedRoles.includes("rescuer") && (
                <div style={{ borderBottom: "1px solid rgba(102,187,106,0.15)", paddingBottom: "24px" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#66BB6A", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Shield size={18} /> Rescuer Profile
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(232,245,233,0.8)" }}>Experience Level</label>
                      <select
                        value={rescuerExp}
                        onChange={(e) => setRescuerExp(e.target.value)}
                        style={{ background: "#0a100b", border: "1px solid rgba(102,187,106,0.25)", borderRadius: "8px", padding: "10px", color: "#FFFFFF" }}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(232,245,233,0.8)" }}>Rescue Area</label>
                      <input
                        type="text"
                        placeholder="e.g. Gachibowli"
                        value={rescuerArea}
                        onChange={(e) => setRescuerArea(e.target.value)}
                        style={{ background: "rgba(10, 16, 11, 0.6)", border: "1px solid rgba(102,187,106,0.25)", borderRadius: "8px", padding: "10px", color: "#FFFFFF" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedRoles.includes("ngo") && (
                <div style={{ borderBottom: "1px solid rgba(102,187,106,0.15)", paddingBottom: "24px" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#66BB6A", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Building2 size={18} /> NGO Profile
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input
                      type="text"
                      placeholder="NGO Name"
                      value={ngoName}
                      onChange={(e) => setNgoName(e.target.value)}
                      style={{ background: "rgba(10, 16, 11, 0.6)", border: "1px solid rgba(102, 187, 106, 0.25)", borderRadius: "8px", padding: "10px", color: "#FFFFFF" }}
                    />
                    <input
                      type="text"
                      placeholder="Emergency Phone"
                      value={ngoEmergencyContact}
                      onChange={(e) => setNgoEmergencyContact(e.target.value)}
                      style={{ background: "rgba(10, 16, 11, 0.6)", border: "1px solid rgba(102, 187, 106, 0.25)", borderRadius: "8px", padding: "10px", color: "#FFFFFF" }}
                    />
                    <input
                      type="text"
                      placeholder="NGO Cause"
                      value={ngoCause}
                      onChange={(e) => setNgoCause(e.target.value)}
                      style={{ background: "rgba(10, 16, 11, 0.6)", border: "1px solid rgba(102, 187, 106, 0.25)", borderRadius: "8px", padding: "10px", color: "#FFFFFF" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Availability Details (for Volunteer) */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>Availability & Coverage</h2>
            <p style={{ color: "rgba(232,245,233,0.6)", fontSize: "0.875rem", marginBottom: "24px" }}>
              Configure your volunteer response parameters.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {selectedRoles.includes("volunteer") ? (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Response Radius ({volunteerRadius} km)</label>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="50"
                      value={volunteerRadius}
                      onChange={(e) => setVolunteerRadius(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#66BB6A" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Weekly Hours ({volunteerHours} hours)</label>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="40"
                      value={volunteerHours}
                      onChange={(e) => setVolunteerHours(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#66BB6A" }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(10, 16, 11, 0.4)",
                      border: "1px solid rgba(102,187,106,0.15)",
                      borderRadius: "12px",
                      padding: "18px"
                    }}
                  >
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Available for SOS dispatches now</h4>
                    </div>
                    <input
                      type="checkbox"
                      checked={volunteerAvailable}
                      onChange={(e) => setVolunteerAvailable(e.target.checked)}
                      style={{ width: "20px", height: "20px", accentColor: "#66BB6A", cursor: "pointer" }}
                    />
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(232,245,233,0.6)" }}>
                  <CheckSquare size={40} style={{ color: "#66BB6A", marginBottom: "12px" }} />
                  <p>You did not select the <strong>Volunteer</strong> role.</p>
                  <p style={{ fontSize: "0.8rem", marginTop: "8px" }}>Please click next to verify your details.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>Review Your Profiles</h2>
            <p style={{ color: "rgba(232,245,233,0.6)", fontSize: "0.875rem", marginBottom: "24px" }}>
              Verify details before saving your EcoVerse member record.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "rgba(10, 16, 11, 0.4)", border: "1px solid rgba(102,187,106,0.15)", borderRadius: "12px", padding: "20px", fontSize: "0.9rem" }}>
              <div>
                <strong style={{ color: "rgba(232,245,233,0.6)" }}>Display Name:</strong>
                <span style={{ marginLeft: "8px", fontWeight: 600 }}>{displayName}</span>
              </div>
              <div>
                <strong style={{ color: "rgba(232,245,233,0.6)" }}>Selected City:</strong>
                <span style={{ marginLeft: "8px", fontWeight: 600 }}>{INDIAN_CITIES.find(c => c.id === city)?.name} ({pincode})</span>
              </div>
              <div>
                <strong style={{ color: "rgba(232, 245, 233, 0.6)" }}>Selected Roles:</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {selectedRoles.map(r => (
                    <span key={r} style={{ background: "rgba(102, 187, 106, 0.15)", border: "1px solid rgba(102, 187, 106, 0.3)", color: "#A5D6A7", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>
                      {r.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "36px" }}>
          {step > 1 ? (
            <button
              onClick={prevStep}
              style={{ padding: "12px 24px", background: "transparent", color: "#FFFFFF", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <ChevronLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={nextStep}
              style={{
                background: "linear-gradient(135deg,#388E3C,#1B5E20)",
                color: "#FFFFFF",
                padding: "12px 28px",
                borderRadius: "8px",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                background: "linear-gradient(135deg,#66BB6A,#388E3C)",
                color: "#FFFFFF",
                padding: "12px 32px",
                borderRadius: "8px",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {saving ? <span className="spinner-small"></span> : "Complete Setup"}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .role-card:hover {
          border-color: #66BB6A !important;
          transform: translateY(-2px);
        }
        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #FFFFFF;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
