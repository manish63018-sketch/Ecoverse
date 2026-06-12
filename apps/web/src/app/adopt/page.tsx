"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Heart, Search, Filter, PlusCircle, MapPin, 
  Check, Calendar, Info, X, Phone, User, Home, Sparkles 
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import type { LocationSelection } from "@/types/location";
import AnimalCard from "@/components/AnimalCard";
import EmptyState from "@/components/EmptyState";

const LocationPicker = dynamic(
  () => import("@/components/sections/LocationPicker"),
  { ssr: false }
);

interface AdoptionPet {
  id: string;
  name: string;
  type: "dog" | "cat" | "bird" | "other";
  breed: string;
  age: string; // e.g. "2 months", "1 year"
  ageGroup: "puppy_kitten" | "adult" | "senior";
  gender: "Male" | "Female";
  location: string;
  city: string;
  state?: string;
  stateId?: string;
  cityId?: string;
  areaId?: string;
  vaccinated: boolean;
  neutered: boolean;
  story: string;
  imageColor: string; // CSS gradient for avatar card
  emoji: string;
}




export default function AdoptPage() {
  const { user } = useAuth();
  const [pets, setPets] = useState<AdoptionPet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const { data, error } = await supabase
          .from("adoptions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const list: AdoptionPet[] = (data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          type: d.animal_type || "other",
          breed: d.breed || "Indie Mix",
          age: d.age_years ? `${d.age_years} years` : d.age_months ? `${d.age_months} months` : "Unknown age",
          ageGroup: d.age_years && d.age_years > 7 ? "senior" : d.age_years && d.age_years >= 1 ? "adult" : "puppy_kitten",
          gender: d.gender === "Female" ? "Female" : "Male",
          location: d.area_name || "Unknown",
          city: d.city_name || "Unknown",
          state: d.state_name || "India",
          vaccinated: !!d.vaccinated,
          neutered: !!d.neutered,
          story: d.description || "No description provided",
          imageColor: "linear-gradient(135deg, #FF9D6C 0%, #BB4E75 100%)",
          emoji: d.animal_type === "dog" ? "🐶" : d.animal_type === "cat" ? "🐱" : "🐾",
        }));
        setPets(list);
      } catch (err) {
        console.warn("Failed to fetch adoptions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("live-adoptions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "adoptions",
        },
        () => {
          fetchPets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAge, setFilterAge] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [selectedPet, setSelectedPet] = useState<AdoptionPet | null>(null);
  const [showInquireModal, setShowInquireModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);

  // Form states
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryHousing, setInquiryHousing] = useState("apartment");
  const [inquiryMessage, setInquiryMessage] = useState("");

  const [newPetName, setNewPetName] = useState("");
  const [newPetType, setNewPetType] = useState<"dog" | "cat" | "bird" | "other">("dog");
  const [newPetBreed, setNewPetBreed] = useState("");
  const [newPetAge, setNewPetAge] = useState("");
  const [newPetAgeGroup, setNewPetAgeGroup] = useState<"puppy_kitten" | "adult" | "senior">("adult");
  const [newPetGender, setNewPetGender] = useState<"Male" | "Female">("Male");
  const [selectedLocation, setSelectedLocation] = useState<LocationSelection | null>(null);
  const [newPetLocation, setNewPetLocation] = useState(""); // Landmark / detailed address
  const [newPetStory, setNewPetStory] = useState("");
  const [newPetVaccinated, setNewPetVaccinated] = useState(false);
  const [newPetNeutered, setNewPetNeutered] = useState(false);

  // Filter logic
  const filteredPets = pets.filter((pet) => {
    const matchesType = filterType === "all" || pet.type === filterType;
    const matchesAge = filterAge === "all" || pet.ageGroup === filterAge;
    const matchesSearch = 
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pet.state?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    return matchesType && matchesAge && matchesSearch;
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) {
      toast.error("Please enter your name and phone number");
      return;
    }
    toast.success(`Inquiry submitted for ${selectedPet?.name}! Rescuer will contact you shortly.`);
    setShowInquireModal(false);
    setInquiryName("");
    setInquiryPhone("");
    setInquiryMessage("");
  };

  const handleListPetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to list animals for adoption");
      return;
    }
    if (!newPetName.trim() || !newPetBreed.trim() || !newPetAge.trim() || !selectedLocation) {
      toast.error("Please select a complete location (State, City, and Area)");
      return;
    }

    const gradients = [
      "linear-gradient(135deg, #FF9D6C 0%, #BB4E75 100%)",
      "linear-gradient(135deg, #65799B 0%, #5E2563 100%)",
      "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      "linear-gradient(135deg, #F9D423 0%, #FF4E50 100%)",
      "linear-gradient(135deg, #70A1FF 0%, #1E90FF 100%)",
    ];
    const emojis = { dog: "🐶", cat: "🐱", bird: "🦜", other: "🐾" };

    const petId = `pet-${Date.now()}`;
    const newPet: AdoptionPet = {
      id: petId,
      name: newPetName,
      type: newPetType,
      breed: newPetBreed,
      age: newPetAge,
      ageGroup: newPetAgeGroup,
      gender: newPetGender,
      location: newPetLocation.trim() || selectedLocation.areaName,
      city: selectedLocation.cityName,
      state: selectedLocation.stateName,
      stateId: selectedLocation.stateId,
      cityId: selectedLocation.cityId,
      areaId: selectedLocation.areaId,
      vaccinated: newPetVaccinated,
      neutered: newPetNeutered,
      story: newPetStory || "No story provided",
      imageColor: gradients[Math.floor(Math.random() * gradients.length)],
      emoji: emojis[newPetType] || "🐾",
    };

    let ageYears = 1;
    let ageMonths = 0;
    if (newPetAge.toLowerCase().includes("month")) {
      ageYears = 0;
      ageMonths = parseInt(newPetAge) || 3;
    } else {
      ageYears = parseInt(newPetAge) || 1;
    }

    try {
      const { error } = await supabase
        .from("adoptions")
        .insert({
          id: petId,
          poster_id: user.uid,
          name: newPetName,
          animal_type: newPetType,
          breed: newPetBreed,
          age_years: ageYears,
          age_months: ageMonths,
          gender: newPetGender,
          state_name: selectedLocation.stateName,
          city_name: selectedLocation.cityName,
          area_name: selectedLocation.areaName,
          vaccinated: newPetVaccinated,
          neutered: newPetNeutered,
          description: newPetStory || "No story provided",
          color: "orange",
          status: "available",
        });

      if (error) throw error;

      toast.success(`${newPetName} has been listed for adoption!`);
      setShowListModal(false);

      // Reset Form
      setNewPetName("");
      setNewPetBreed("");
      setNewPetAge("");
      setSelectedLocation(null);
      setNewPetLocation("");
      setNewPetStory("");
      setNewPetVaccinated(false);
      setNewPetNeutered(false);
    } catch (err) {
      console.error("Failed to list pet in Supabase:", err);
      toast.error("Failed to save pet listing. Make sure you are logged in.");
    }
  };

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif" }}>
      <Navbar />

      {/* Main Container */}
      <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px", marginBottom: "40px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#66BB6A", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <Sparkles size={16} /> Give a Second Chance
            </div>
            <h1 style={{ fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-0.03em", marginTop: "8px", marginBottom: "8px" }}>
              Adopt a Companion
            </h1>
            <p style={{ color: "var(--color-text-muted-dark)", fontSize: "1.05rem", maxWidth: "600px", lineHeight: 1.6 }}>
              Connect with local stray animal rescuers, find compassionate pets, and welcome infinite loyalty into your family.
            </p>
          </div>

          <button
            onClick={() => setShowListModal(true)}
            style={{
              background: "linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "var(--radius-lg)",
              padding: "14px 24px",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 8px 20px rgba(46, 125, 50, 0.3)",
              transition: "transform 0.2s, filter 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            <PlusCircle size={18} /> List Animal for Adoption
          </button>
        </div>

        {/* Filter & Search Bar */}
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
          {/* Top Search Row */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, position: "relative", minWidth: "280px" }}>
              <Search
                size={18}
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(102, 187, 106, 0.5)" }}
              />
              <input
                type="text"
                placeholder="Search by name, breed, city, or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
          </div>

          {/* Bottom Filter Controls */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", borderTop: "1px solid rgba(102, 187, 106, 0.1)", paddingTop: "16px" }}>
            
            {/* Animal Type Filters */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { id: "all", label: "All Animals", emoji: "🐾" },
                { id: "dog", label: "Dogs", emoji: "🐶" },
                { id: "cat", label: "Cats", emoji: "🐱" },
                { id: "bird", label: "Birds", emoji: "🦜" },
                { id: "other", label: "Others", emoji: "🐮" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFilterType(opt.id)}
                  style={{
                    background: filterType === opt.id ? "rgba(102, 187, 106, 0.2)" : "rgba(10, 16, 11, 0.4)",
                    border: `1px solid ${filterType === opt.id ? "rgba(102, 187, 106, 0.5)" : "rgba(102, 187, 106, 0.15)"}`,
                    color: filterType === opt.id ? "#A5D6A7" : "rgba(232, 245, 233, 0.7)",
                    padding: "8px 16px",
                    borderRadius: "var(--radius-full)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s",
                  }}
                >
                  <span>{opt.emoji}</span> {opt.label}
                </button>
              ))}
            </div>

            {/* Age Filters */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.4)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                Age Group:
              </span>
              {[
                { id: "all", label: "Any Age" },
                { id: "puppy_kitten", label: "Puppy / Kitten" },
                { id: "adult", label: "Adult" },
                { id: "senior", label: "Senior" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFilterAge(opt.id)}
                  style={{
                    background: filterAge === opt.id ? "rgba(102, 187, 106, 0.2)" : "transparent",
                    border: "none",
                    color: filterAge === opt.id ? "#66BB6A" : "rgba(232, 245, 233, 0.6)",
                    padding: "6px 12px",
                    borderRadius: "var(--radius-md)",
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
        </div>

        {/* Listings Grid */}
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
              Loading adoption listings...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredPets.length === 0 ? (
          <EmptyState
            emoji="😿"
            title="No animals listed yet"
            subtitle="Are you rescuing an animal? List it for adoption."
            ctaText="Add Animal for Adoption →"
            onClick={() => setShowListModal(true)}
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "28px" }}>
            {filteredPets.map((pet) => (
              <AnimalCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}

      </div>

      {/* ── MODAL 1: Inquire to Adopt ───────────────────────────────── */}
      {showInquireModal && selectedPet && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Inquire About {selectedPet.name}</h3>
              <button onClick={() => setShowInquireModal(false)} style={modalCloseBtnStyle}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", gap: "12px", background: "rgba(102,187,106,0.06)", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(102,187,106,0.2)", marginBottom: "20px" }}>
              <span style={{ fontSize: "2rem" }}>{selectedPet.emoji}</span>
              <div>
                <strong style={{ color: "#A5D6A7" }}>{selectedPet.name}</strong> ({selectedPet.breed})
                <div style={{ fontSize: "0.75rem", color: "rgba(232,245,233,0.5)", marginTop: "2px" }}>
                  Currently fostered in {selectedPet.location}, {selectedPet.city}
                </div>
              </div>
            </div>

            <form onSubmit={handleInquirySubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Your Name *</label>
                <div style={{ position: "relative" }}>
                  <User size={15} style={inputIconStyle} />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Contact Number *</label>
                <div style={{ position: "relative" }}>
                  <Phone size={15} style={inputIconStyle} />
                  <input
                    type="tel"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: "42px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Housing Type</label>
                <div style={{ position: "relative" }}>
                  <Home size={15} style={inputIconStyle} />
                  <select
                    value={inquiryHousing}
                    onChange={(e) => setInquiryHousing(e.target.value)}
                    style={{ ...selectStyle, paddingLeft: "42px" }}
                  >
                    <option value="apartment">Apartment</option>
                    <option value="independent_house">Independent House</option>
                    <option value="farm">Farm / Open Area</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Introduce Yourself (Optional)</label>
                <textarea
                  placeholder="Tell us a little bit about yourself, why you want to adopt, and if you have previous pet experience..."
                  rows={3}
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
                Send Adoption Inquiry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: List Animal for Adoption ───────────────────────── */}
      {showListModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: "640px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 800 }}>List an Animal for Adoption</h3>
              <button onClick={() => setShowListModal(false)} style={modalCloseBtnStyle}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleListPetSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="modal-form-grid">
                
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Animal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kaalu"
                    value={newPetName}
                    onChange={(e) => setNewPetName(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Animal Type *</label>
                  <select
                    value={newPetType}
                    onChange={(e) => setNewPetType(e.target.value as any)}
                    style={selectStyle}
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="other">Other / Farm Animal</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Breed / Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indian Stray, Indie Mix"
                    value={newPetBreed}
                    onChange={(e) => setNewPetBreed(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Age Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 months, 2 years"
                    value={newPetAge}
                    onChange={(e) => setNewPetAge(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Age Group *</label>
                  <select
                    value={newPetAgeGroup}
                    onChange={(e) => setNewPetAgeGroup(e.target.value as any)}
                    style={selectStyle}
                  >
                    <option value="puppy_kitten">Puppy / Kitten</option>
                    <option value="adult">Adult</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Gender *</label>
                  <select
                    value={newPetGender}
                    onChange={(e) => setNewPetGender(e.target.value as any)}
                    style={selectStyle}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <LocationPicker 
                    onChange={(sel) => setSelectedLocation(sel)} 
                    compact={true} 
                  />
                </div>

                <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={labelStyle}>Specific Landmark / Address (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Behind Metro Station, Lane 4, or Shelter Name"
                    value={newPetLocation}
                    onChange={(e) => setNewPetLocation(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div style={{ display: "flex", gap: "20px", marginTop: "4px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={newPetVaccinated}
                    onChange={(e) => setNewPetVaccinated(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "#66BB6A" }}
                  />
                  Vaccinated
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={newPetNeutered}
                    onChange={(e) => setNewPetNeutered(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "#66BB6A" }}
                  />
                  Neutered / Spayed
                </label>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Brief Story / Description *</label>
                <textarea
                  required
                  placeholder="Describe the animal's temperament, how they were rescued, and what kind of home they need..."
                  rows={4}
                  value={newPetStory}
                  onChange={(e) => setNewPetStory(e.target.value)}
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
                Submit Listing
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />

      {/* Responsive adjustments */}
      <style>{`
        @media (max-width: 600px) {
          .modal-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// Inline styles for convenience and stability
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
  transition: "border-color 0.2s",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(10, 16, 11, 0.8)",
  border: "1px solid rgba(102, 187, 106, 0.22)",
  borderRadius: "10px",
  padding: "11px 14px",
  color: "#FFFFFF",
  fontSize: "0.9rem",
  fontFamily: "var(--font-sans), sans-serif",
  outline: "none",
  boxSizing: "border-box",
  cursor: "pointer",
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

const inputIconStyle: React.CSSProperties = {
  position: "absolute",
  left: "14px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "rgba(102, 187, 106, 0.5)",
};
