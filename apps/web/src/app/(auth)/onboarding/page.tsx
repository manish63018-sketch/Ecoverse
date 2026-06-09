"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { INDIAN_CITIES } from "@/lib/cities";
import {
  Shield,
  Heart,
  Leaf,
  Users,
  Building2,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Check,
  MapPin,
  Clock,
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
  const { user, loading } = useAuth();
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
      router.push("/login");
    } else if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F1A10", color: "#FFFFFF" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
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
      const userRef = doc(db, "users", user.uid);

      const profilePayload: any = {
        uid: user.uid,
        displayName,
        email: user.email,
        city,
        pincode,
        roles: selectedRoles,
        profileSetupComplete: true,
        lastActive: new Date().toISOString(),
        joinedAt: new Date().toISOString()
      };

      if (selectedRoles.includes("volunteer")) {
        profilePayload.volunteerInfo = {
          availableNow: volunteerAvailable,
          skills: volunteerSkills,
          radiusKm: volunteerRadius,
          hoursPerWeek: volunteerHours,
          currentLocation: {
            latitude: 17.4485, // Hyderabad defaults for simulation
            longitude: 78.3741,
            geohash: "tgf7hg"
          }
        };
      }

      if (selectedRoles.includes("rescuer")) {
        profilePayload.rescuerInfo = {
          experienceLevel: rescuerExp,
          area: rescuerArea,
          verified: true
        };
      }

      if (selectedRoles.includes("adopter")) {
        profilePayload.adopterInfo = {
          housingType: adopterHousing,
          hasOtherPets: adopterOtherPets,
          preferredAnimal: adopterPreferred
        };
      }

      if (selectedRoles.includes("vegan")) {
        profilePayload.veganInfo = {
          status: veganStatus,
          interests: veganInterests,
          pledgeDate: veganStatus !== "curious" ? new Date().toISOString() : null,
          challengeDay: 1
        };
      }

      if (selectedRoles.includes("ngo")) {
        profilePayload.ngoInfo = {
          orgName: ngoName,
          emergencyContact: ngoEmergencyContact,
          causeType: ngoCause,
          verified: false // Awaits admin validation
        };
      }

      if (selectedRoles.includes("feeder")) {
        profilePayload.feederInfo = {
          feedLocation: feederLocation,
          routineTiming: feederTiming
        };
      }

      await setDoc(userRef, profilePayload, { merge: true });

      // Create and save public profile (PII-free)
      const publicProfilePayload: any = {
        uid: user.uid,
        displayName,
        city,
        roles: selectedRoles,
      };

      if (selectedRoles.includes("volunteer")) {
        publicProfilePayload.volunteerInfo = profilePayload.volunteerInfo;
      }
      if (selectedRoles.includes("rescuer")) {
        publicProfilePayload.rescuerInfo = profilePayload.rescuerInfo;
      }
      if (selectedRoles.includes("ngo")) {
        publicProfilePayload.ngoInfo = profilePayload.ngoInfo;
      }
      if (selectedRoles.includes("feeder")) {
        publicProfilePayload.feederInfo = profilePayload.feederInfo;
      }

      await setDoc(doc(db, "public_profiles", user.uid), publicProfilePayload, { merge: true });

      // If vegan pledge was taken, register a document in vegan_pledges
      if (selectedRoles.includes("vegan") && veganStatus !== "curious") {
        const pledgeRef = doc(db, "vegan_pledges", `${user.uid}_pledge`);
        await setDoc(pledgeRef, {
          pledgeId: `${user.uid}_pledge`,
          uid: user.uid,
          city,
          createdAt: new Date().toISOString()
        });
      }

      toast.success("Profile setup completed successfully!");
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

      {/* Main card */}
      <div
        style={{
          width: "100%",
          maxWidth: "580px",
          background: "rgba(21, 35, 23, 0.45)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(102, 187, 106, 0.15)",
          borderRadius: "var(--radius-2xl)",
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
              Choose 1 to 3 roles to personalize your dashboard and receive relevant dispatches.
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
                      borderRadius: "var(--radius-xl)",
                      padding: "16px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      transition: "all var(--transition-base)"
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
                    borderRadius: "var(--radius-lg)",
                    padding: "12px 14px",
                    color: "#FFFFFF",
                    fontSize: "0.95rem"
                  }}
                  className="auth-input"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(232, 245, 233, 0.85)" }}>
                  Select City (48 Active Pilot Cities)
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(10, 16, 11, 0.8)",
                    border: "1px solid rgba(102, 187, 106, 0.25)",
                    borderRadius: "var(--radius-lg)",
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
                    borderRadius: "var(--radius-lg)",
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
              {/* Volunteer Details */}
              {selectedRoles.includes("volunteer") && (
                <div style={{ borderBottom: "1px solid rgba(102,187,106,0.15)", paddingBottom: "24px" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#66BB6A", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Users size={18} /> Volunteer Profile
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(232, 245, 233, 0.85)", display: "block", marginBottom: "8px" }}>
                        Volunteer Skills (Select all that apply)
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
                                borderRadius: "var(--radius-full)",
                                padding: "6px 14px",
                                color: "#FFFFFF",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                                transition: "all var(--transition-fast)"
                              }}
                            >
                              {skill.replace("_", " ").toUpperCase()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rescuer Details */}
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
                        style={{ background: "#0a100b", border: "1px solid rgba(102,187,106,0.25)", borderRadius: "var(--radius-lg)", padding: "10px", color: "#FFFFFF" }}
                      >
                        <option value="beginner">Beginner (Under 1 year)</option>
                        <option value="intermediate">Intermediate (1-3 years)</option>
                        <option value="advanced">Advanced (3+ years)</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(232,245,233,0.8)" }}>Rescue Area / Neighborhood</label>
                      <input
                        type="text"
                        placeholder="e.g. Gachibowli, Hyderabad"
                        value={rescuerArea}
                        onChange={(e) => setRescuerArea(e.target.value)}
                        style={{ background: "rgba(10, 16, 11, 0.6)", border: "1px solid rgba(102,187,106,0.25)", borderRadius: "var(--radius-lg)", padding: "10px", color: "#FFFFFF" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NGO Details */}
              {selectedRoles.includes("ngo") && (
                <div style={{ borderBottom: "1px solid rgba(102,187,106,0.15)", paddingBottom: "24px" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#66BB6A", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Building2 size={18} /> NGO / Org Details
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input
                      type="text"
                      placeholder="NGO/Shelter Name"
                      value={ngoName}
                      onChange={(e) => setNgoName(e.target.value)}
                      style={{ background: "rgba(10, 16, 11, 0.6)", border: "1px solid rgba(102,187,106,0.25)", borderRadius: "var(--radius-lg)", padding: "10px", color: "#FFFFFF" }}
                    />
                    <input
                      type="text"
                      placeholder="Emergency Contact Phone"
                      value={ngoEmergencyContact}
                      onChange={(e) => setNgoEmergencyContact(e.target.value)}
                      style={{ background: "rgba(10, 16, 11, 0.6)", border: "1px solid rgba(102,187,106,0.25)", borderRadius: "var(--radius-lg)", padding: "10px", color: "#FFFFFF" }}
                    />
                    <input
                      type="text"
                      placeholder="Main Cause (e.g. Stray Medical Shelter)"
                      value={ngoCause}
                      onChange={(e) => setNgoCause(e.target.value)}
                      style={{ background: "rgba(10, 16, 11, 0.6)", border: "1px solid rgba(102,187,106,0.25)", borderRadius: "var(--radius-lg)", padding: "10px", color: "#FFFFFF" }}
                    />
                  </div>
                </div>
              )}

              {/* Adopter Details */}
              {selectedRoles.includes("adopter") && (
                <div style={{ borderBottom: "1px solid rgba(102,187,106,0.15)", paddingBottom: "24px" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#66BB6A", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Home size={18} /> Adoption Profile
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(232,245,233,0.8)" }}>Housing Type</label>
                      <select
                        value={adopterHousing}
                        onChange={(e) => setAdopterHousing(e.target.value)}
                        style={{ background: "#0a100b", border: "1px solid rgba(102,187,106,0.25)", borderRadius: "var(--radius-lg)", padding: "10px", color: "#FFFFFF" }}
                      >
                        <option value="apartment">Apartment</option>
                        <option value="independent_house">Independent House</option>
                        <option value="farm">Farm / Open Area</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(232,245,233,0.8)" }}>Preferred Animal</label>
                      <select
                        value={adopterPreferred}
                        onChange={(e) => setAdopterPreferred(e.target.value)}
                        style={{ background: "#0a100b", border: "1px solid rgba(102,187,106,0.25)", borderRadius: "var(--radius-lg)", padding: "10px", color: "#FFFFFF" }}
                      >
                        <option value="dog">Dogs</option>
                        <option value="cat">Cats</option>
                        <option value="other">Cows / Birds / Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Vegan Details */}
              {selectedRoles.includes("vegan") && (
                <div style={{ borderBottom: "1px solid rgba(102,187,106,0.15)", paddingBottom: "24px" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#66BB6A", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Leaf size={18} /> Vegan Movement
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(232,245,233,0.8)" }}>Lifestyle Status</label>
                      <select
                        value={veganStatus}
                        onChange={(e) => setVeganStatus(e.target.value)}
                        style={{ background: "#0a100b", border: "1px solid rgba(102,187,106,0.25)", borderRadius: "var(--radius-lg)", padding: "10px", color: "#FFFFFF" }}
                      >
                        <option value="vegan">I am Vegan</option>
                        <option value="going_vegan">Going Vegan</option>
                        <option value="curious">Vegan Curious</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(232,245,233,0.8)" }}>Diet / Cause Interests</label>
                      <input
                        type="text"
                        placeholder="e.g. recipes, activism, volunteering"
                        value={veganInterests}
                        onChange={(e) => setVeganInterests(e.target.value)}
                        style={{ background: "rgba(10, 16, 11, 0.6)", border: "1px solid rgba(102, 187, 106, 0.25)", borderRadius: "var(--radius-lg)", padding: "10px", color: "#FFFFFF" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Feeder Details */}
              {selectedRoles.includes("feeder") && (
                <div style={{ paddingBottom: "10px" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#66BB6A", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar size={18} /> Daily Feeder Settings
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(232,245,233,0.8)" }}>Feeding Spot</label>
                      <input
                        type="text"
                        placeholder="e.g. sector 2 park street"
                        value={feederLocation}
                        onChange={(e) => setFeederLocation(e.target.value)}
                        style={{ background: "rgba(10, 16, 11, 0.6)", border: "1px solid rgba(102, 187, 106, 0.25)", borderRadius: "var(--radius-lg)", padding: "10px", color: "#FFFFFF" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(232, 245, 233, 0.8)" }}>Time Scheduled</label>
                      <input
                        type="text"
                        placeholder="e.g. 08:30 PM"
                        value={feederTiming}
                        onChange={(e) => setFeederTiming(e.target.value)}
                        style={{ background: "rgba(10, 16, 11, 0.6)", border: "1px solid rgba(102, 187, 106, 0.25)", borderRadius: "var(--radius-lg)", padding: "10px", color: "#FFFFFF" }}
                      />
                    </div>
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
              Configure your volunteer response dispatch parameters.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {selectedRoles.includes("volunteer") ? (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Response Radius ({volunteerRadius} km)</label>
                      <span style={{ fontSize: "0.85rem", color: "#66BB6A", fontWeight: 600 }}>Local Zone</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="50"
                      value={volunteerRadius}
                      onChange={(e) => setVolunteerRadius(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#66BB6A", height: "6px", borderRadius: "3px", outline: "none" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Weekly Hours Committed ({volunteerHours} hours)</label>
                      <span style={{ fontSize: "0.85rem", color: "#66BB6A", fontWeight: 600 }}>Flexible</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="40"
                      value={volunteerHours}
                      onChange={(e) => setVolunteerHours(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#66BB6A", height: "6px", borderRadius: "3px", outline: "none" }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(10, 16, 11, 0.4)",
                      border: "1px solid rgba(102,187,106,0.15)",
                      borderRadius: "var(--radius-xl)",
                      padding: "18px"
                    }}
                  >
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: "0.95rem" }}>Available for SOS alerts now</h4>
                      <p style={{ fontSize: "0.75rem", color: "rgba(232,245,233,0.5)", marginTop: "4px" }}>Receive real-time push dispatches immediately</p>
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
                  <p style={{ fontSize: "0.8rem", marginTop: "8px", color: "rgba(232,245,233,0.4)" }}>Please click next to verify your details.</p>
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

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "rgba(10, 16, 11, 0.4)", border: "1px solid rgba(102,187,106,0.15)", borderRadius: "var(--radius-xl)", padding: "20px", fontSize: "0.9rem" }}>
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
                    <span key={r} style={{ background: "rgba(102, 187, 106, 0.15)", border: "1px solid rgba(102, 187, 106, 0.3)", color: "#A5D6A7", padding: "4px 10px", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 600 }}>
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
              className="btn btn-ghost"
              style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: "6px" }}
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
              className="btn"
              style={{
                background: "linear-gradient(135deg,#388E3C,#1B5E20)",
                color: "#FFFFFF",
                padding: "12px 28px",
                borderRadius: "var(--radius-lg)",
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
              className="btn"
              style={{
                background: "linear-gradient(135deg,#66BB6A,#388E3C)",
                color: "#FFFFFF",
                padding: "12px 32px",
                borderRadius: "var(--radius-lg)",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 6px 16px rgba(102, 187, 106, 0.3)"
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
          box-shadow: 0 8px 16px rgba(0,0,0,0.2);
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
      `}</style>
    </div>
  );
}
