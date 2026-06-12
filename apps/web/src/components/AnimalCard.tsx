"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Heart } from "lucide-react";

export interface AdoptionPet {
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
  stateId?: string;
  cityId?: string;
  areaId?: string;
  vaccinated: boolean;
  neutered: boolean;
  story: string;
  imageColor: string;
  emoji: string;
  status?: "Available" | "Pending" | "Adopted";
}

interface AnimalCardProps {
  pet: AdoptionPet;
}

export default function AnimalCard({ pet }: AnimalCardProps) {
  const petStatus = pet.status || "Available";

  return (
    <div
      style={{
        background: "rgba(21, 35, 23, 0.45)",
        border: "1px solid rgba(102, 187, 106, 0.12)",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease-in-out",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
      }}
      className="pet-card"
    >
      {/* Visual Header / Color Gradient */}
      <div
        style={{
          height: "180px",
          background: pet.imageColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "4.5rem",
          position: "relative",
        }}
      >
        <span style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))" }}>{pet.emoji}</span>
        
        {/* Status Badge */}
        <span
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            background: petStatus === "Available" ? "rgba(46, 125, 50, 0.9)" : "rgba(255, 167, 38, 0.9)",
            color: "#FFFFFF",
            padding: "4px 10px",
            borderRadius: "4px",
            fontSize: "0.7rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {petStatus}
        </span>

        {/* Gender Badge */}
        <span
          style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            background: "rgba(10, 16, 11, 0.75)",
            backdropFilter: "blur(4px)",
            color: "#FFFFFF",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 700,
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {pet.gender}
        </span>
      </div>

      {/* Info Block */}
      <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
          <div>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>{pet.name}</h3>
            <p style={{ color: "rgba(232, 245, 233, 0.5)", fontSize: "0.85rem", marginTop: "2px", marginBottom: 0 }}>
              {pet.breed} · {pet.age}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#66BB6A", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>
            <MapPin size={13} style={{ flexShrink: 0 }} />
            <span>{pet.city}</span>
          </div>
        </div>

        <p style={{ color: "rgba(232, 245, 233, 0.7)", fontSize: "0.85rem", lineHeight: 1.5, flex: 1, margin: 0 }}>
          {pet.story.length > 110 ? `${pet.story.slice(0, 107)}...` : pet.story}
        </p>

        {/* Medical Badges */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {pet.vaccinated && (
            <span style={{ fontSize: "0.65rem", background: "rgba(102,187,106,0.1)", border: "1px solid rgba(102,187,106,0.25)", color: "#A5D6A7", padding: "3px 8px", borderRadius: "4px", fontWeight: 700 }}>
              💉 Vaccinated
            </span>
          )}
          {pet.neutered && (
            <span style={{ fontSize: "0.65rem", background: "rgba(102,187,106,0.1)", border: "1px solid rgba(102,187,106,0.25)", color: "#A5D6A7", padding: "3px 8px", borderRadius: "4px", fontWeight: 700 }}>
              ✂️ Neutered
            </span>
          )}
        </div>

        {/* CTA link */}
        <Link
          href={`/adopt/${pet.id}`}
          style={{
            width: "100%",
            background: "rgba(102, 187, 106, 0.12)",
            border: "1px solid rgba(102, 187, 106, 0.25)",
            color: "#A5D6A7",
            padding: "12px",
            borderRadius: "8px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            textDecoration: "none",
            transition: "all 0.2s ease",
            boxSizing: "border-box",
          }}
          className="meet-btn"
        >
          <Heart size={14} /> Meet {pet.name} →
        </Link>
      </div>

      <style>{`
        .pet-card:hover {
          border-color: rgba(102, 187, 106, 0.25) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        }
        .meet-btn:hover {
          background: #66BB6A !important;
          color: #050f07 !important;
          border-color: #66BB6A !important;
        }
      `}</style>
    </div>
  );
}
