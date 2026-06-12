"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ArrowLeft, CheckCircle2, Shield, Heart, MapPin, ClipboardList, Info, Mail, Phone, User, Home, X } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface AdoptionPet {
  id: string;
  name: string;
  type: "dog" | "cat" | "bird" | "other";
  breed: string;
  age: string;
  ageGroup: "puppy_kitten" | "adult" | "senior";
  gender: "Male" | "Female";
  location: string;
  city: string;
  state?: string;
  vaccinated: boolean;
  neutered: boolean;
  story: string;
  imageColor: string;
  emoji: string;
}

export default function PetDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const router = useRouter();

  const [pet, setPet] = useState<AdoptionPet | null>(null);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [adopterName, setAdopterName] = useState("");
  const [adopterPhone, setAdopterPhone] = useState("");
  const [adopterMessage, setAdopterMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPet = async () => {
      try {
        const { data, error } = await supabase
          .from("adoptions")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setPet({
            id: data.id,
            name: data.name,
            type: data.animal_type || "other",
            breed: data.breed || "Mixed Breed",
            age: data.age_years ? `${data.age_years} years` : data.age_months ? `${data.age_months} months` : "Unknown age",
            ageGroup: data.age_years && data.age_years > 7 ? "senior" : data.age_years && data.age_years >= 1 ? "adult" : "puppy_kitten",
            gender: data.gender === "Female" ? "Female" : "Male",
            location: data.area_name || "Unknown",
            city: data.city_name || "Unknown",
            state: data.state_name || "India",
            vaccinated: !!data.vaccinated,
            neutered: !!data.neutered,
            story: data.description || "No description provided.",
            imageColor: "linear-gradient(135deg, #FF9D6C 0%, #BB4E75 100%)",
            emoji: data.animal_type === "dog" ? "🐕" : data.animal_type === "cat" ? "🐈" : "🐾",
          });
        }
      } catch (err) {
        console.warn("Failed to fetch pet detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleInterestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adopterName.trim() || !adopterPhone.trim()) {
      return toast.error("Please fill in your name and phone number");
    }

    setSubmitting(true);
    setTimeout(() => {
      toast.success(`Adoption inquiry sent! The foster owner for ${pet?.name} will contact you.`);
      setShowFormModal(false);
      setAdopterName("");
      setAdopterPhone("");
      setAdopterMessage("");
      setSubmitting(false);
    }, 1200);
  };

  if (loading) {
    return (
      <div style={{ background: "#050f07", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid rgba(102,187,106,0.15)", borderRadius: "50%", borderTopColor: "#66BB6A", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!pet) {
    return (
      <div style={{ background: "#050f07", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "120px 24px", textAlign: "center" }}>
          <h2>Pet profile not found</h2>
          <Link href="/adopt" style={{ color: "#66BB6A" }}>Back to adopt listings</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif" }}>
      <Navbar />

      <div className="container" style={{ maxWidth: "840px", margin: "0 auto", paddingTop: "120px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px" }}>
        
        <Link
          href="/adopt"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "0.88rem", marginBottom: "28px" }}
        >
          <ArrowLeft size={16} /> Back to Adopt
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "32px" }} className="pet-layout">
          
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div
              style={{
                background: pet.imageColor,
                borderRadius: "20px",
                height: "280px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "7rem",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              <span style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))" }}>{pet.emoji}</span>
            </div>

            <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "16px", padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <span style={labelStyle}>Breed</span>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "2px" }}>{pet.breed}</div>
              </div>
              <div>
                <span style={labelStyle}>Age</span>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "2px" }}>{pet.age}</div>
              </div>
              <div>
                <span style={labelStyle}>Gender</span>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "2px" }}>{pet.gender}</div>
              </div>
              <div>
                <span style={labelStyle}>Weight</span>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "2px" }}>N/A (Medium)</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h1 style={{ fontSize: "2.4rem", fontWeight: 900, margin: 0 }}>Meet {pet.name}</h1>
              <p style={{ color: "#66BB6A", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.9rem", fontWeight: 700, marginTop: "6px", marginBottom: 0 }}>
                <MapPin size={15} /> Fostered in {pet.location}, {pet.city}
              </p>
            </div>

            <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: "0 0 10px 0", color: "#A5D6A7" }}>My Story</h3>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                {pet.story}
              </p>
            </div>

            <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: "0 0 16px 0", color: "#A5D6A7" }}>Medical Records</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem" }}>
                  <CheckCircle2 size={16} color={pet.vaccinated ? "#66BB6A" : "rgba(255,255,255,0.2)"} />
                  <span style={{ color: pet.vaccinated ? "#FFFFFF" : "rgba(255,255,255,0.4)" }}>
                    {pet.vaccinated ? "Fully Vaccinated — Records available" : "Vaccination status not logged"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem" }}>
                  <CheckCircle2 size={16} color={pet.neutered ? "#66BB6A" : "rgba(255,255,255,0.2)"} />
                  <span style={{ color: pet.neutered ? "#FFFFFF" : "rgba(255,255,255,0.4)" }}>
                    {pet.neutered ? "Spayed / Neutered" : "Not yet spayed / neutered"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem" }}>
                  <CheckCircle2 size={16} color="#66BB6A" />
                  <span>Dewormed regularly</span>
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: "0 0 12px 0", color: "#A5D6A7" }}>Requirements</h3>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.88rem", color: "rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>Owner must be committed to lifelong veterinary needs.</li>
                <li>Fenced yard or secure indoor living required.</li>
                <li>Must sign EcoVerse Adoption Agreement form.</li>
              </ul>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={() => setShowFormModal(true)}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "16px",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(46,125,50,0.3)",
                }}
              >
                Express Interest to Adopt {pet.name}
              </button>

              <div style={{ textAlign: "center" }}>
                <span
                  onClick={() => toast.error("Report received. Thank you.")}
                  style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", textDecoration: "underline", cursor: "pointer" }}
                >
                  Report listing as fraudulent or inaccurate
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      <Footer />

      {showFormModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5, 8, 6, 0.8)",
            backdropFilter: "blur(8px)",
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
              maxWidth: "480px",
              background: "#111f13",
              border: "1px solid rgba(102,187,106,0.2)",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Express Interest in {pet.name}</h3>
              <button
                onClick={() => setShowFormModal(false)}
                style={{
                  background: "rgba(102,187,106,0.1)",
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

            <form onSubmit={handleInterestSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={adopterName}
                  onChange={(e) => setAdopterName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Contact Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 XXXXX XXXXX"
                  value={adopterPhone}
                  onChange={(e) => setAdopterPhone(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Introduce yourself *</label>
                <textarea
                  required
                  placeholder="Describe your family size, if you have other pets, and why you want to adopt..."
                  rows={3}
                  value={adopterMessage}
                  onChange={(e) => setAdopterMessage(e.target.value)}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "14px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                {submitting ? "Sending Inquiry..." : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .pet-layout { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "rgba(255, 255, 255, 0.4)",
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
