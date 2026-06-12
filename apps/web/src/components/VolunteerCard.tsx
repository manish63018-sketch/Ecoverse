"use client";

import React from "react";
import { MessageSquare, MapPin, Award } from "lucide-react";

export interface Volunteer {
  id: string;
  name: string;
  avatarUrl?: string;
  roles: string[];
  city: string;
  area: string;
  rescuesCount?: number;
}

interface VolunteerCardProps {
  volunteer: Volunteer;
  onMessage?: () => void;
  isLoggedIn?: boolean;
}

export default function VolunteerCard({ volunteer, onMessage, isLoggedIn = false }: VolunteerCardProps) {
  const initials = volunteer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        background: "rgba(21, 35, 23, 0.45)",
        border: "1px solid rgba(102, 187, 106, 0.12)",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        transition: "all 0.2s ease",
      }}
      className="volunteer-card"
    >
      {/* Avatar Circle */}
      {volunteer.avatarUrl ? (
        <img
          src={volunteer.avatarUrl}
          alt={volunteer.name}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            border: "2px solid #66BB6A",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "rgba(102,187,106,0.15)",
            border: "2px solid #66BB6A",
            color: "#A5D6A7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "1.2rem",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
      )}

      {/* Info Block */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
            {volunteer.name}
          </h4>
          {volunteer.rescuesCount !== undefined && volunteer.rescuesCount > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "rgba(255, 213, 79, 0.12)",
                border: "1px solid rgba(255, 213, 79, 0.25)",
                color: "#FFE082",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "0.65rem",
                fontWeight: 700,
              }}
            >
              <Award size={10} /> {volunteer.rescuesCount} Rescues
            </span>
          )}
        </div>

        {/* Location */}
        <p style={{ color: "rgba(232,245,233,0.55)", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "4px", margin: 0 }}>
          <MapPin size={13} style={{ color: "#66BB6A" }} />
          {volunteer.area}, {volunteer.city}
        </p>

        {/* Role Tags */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "2px" }}>
          {volunteer.roles.map((role) => (
            <span
              key={role}
              style={{
                background: "rgba(102,187,106,0.08)",
                border: "1px solid rgba(102,187,106,0.18)",
                color: "#A5D6A7",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            >
              {role.replace("_", " ")}
            </span>
          ))}
        </div>
      </div>

      {/* Message Button */}
      {onMessage && (
        <button
          onClick={onMessage}
          disabled={!isLoggedIn}
          style={{
            background: isLoggedIn ? "rgba(102,187,106,0.12)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${isLoggedIn ? "rgba(102,187,106,0.3)" : "rgba(255,255,255,0.1)"}`,
            color: isLoggedIn ? "#A5D6A7" : "rgba(232,245,233,0.3)",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isLoggedIn ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
          title={isLoggedIn ? `Message ${volunteer.name}` : "Login to send messages"}
        >
          <MessageSquare size={16} />
        </button>
      )}

      <style>{`
        .volunteer-card:hover {
          border-color: rgba(102, 187, 106, 0.22) !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
