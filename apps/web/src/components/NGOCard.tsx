"use client";

import React from "react";
import { MapPin, Mail, CheckCircle, Phone, MessageSquare } from "lucide-react";

export interface NGO {
  id: string;
  name: string;
  city: string;
  location: string;
  helpline: string;
  email: string;
  services: string[];
  description: string;
  verified: boolean;
}

interface NGOCardProps {
  ngo: NGO;
  onRequestAssistance?: () => void;
  isLoggedIn?: boolean;
}

export default function NGOCard({ ngo, onRequestAssistance, isLoggedIn = false }: NGOCardProps) {
  return (
    <div
      style={{
        background: "rgba(21, 35, 23, 0.45)",
        border: "1px solid rgba(102, 187, 106, 0.12)",
        borderRadius: "16px",
        padding: "24px",
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "20px",
        transition: "all 0.2s ease",
      }}
      className="ngo-row-card"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* NGO Name + Verified */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
            {ngo.name}
          </h3>
          {ngo.verified && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "rgba(102,187,106,0.1)",
                border: "1px solid rgba(102,187,106,0.3)",
                color: "#A5D6A7",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "0.68rem",
                fontWeight: 700,
              }}
            >
              <CheckCircle size={10} /> Verified NGO
            </span>
          )}
        </div>

        {/* Location & Email */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", color: "rgba(232,245,233,0.55)", fontSize: "0.82rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <MapPin size={13} style={{ color: "#66BB6A" }} />
            {ngo.location}, {ngo.city}
          </span>
          {isLoggedIn && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Mail size={13} style={{ color: "#66BB6A" }} />
              {ngo.email}
            </span>
          )}
        </div>

        {/* Description */}
        <p style={{ color: "rgba(232,245,233,0.75)", fontSize: "0.88rem", lineHeight: 1.55, margin: 0 }}>
          {ngo.description}
        </p>

        {/* Focus Services Tags */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
          {ngo.services.map((srv) => (
            <span
              key={srv}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(232,245,233,0.7)",
                padding: "3px 8px",
                borderRadius: "6px",
                fontSize: "0.72rem",
                fontWeight: 600,
              }}
            >
              {srv}
            </span>
          ))}
        </div>
      </div>

      {/* Helpline & Message CTAs */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "4px" }}>
        <a
          href={isLoggedIn ? `tel:${ngo.helpline.replace(/\s+/g, "")}` : "/login"}
          style={{
            flex: 1,
            minWidth: "150px",
            background: "linear-gradient(135deg, #EF5350 0%, #C62828 100%)",
            color: "#FFFFFF",
            padding: "12px 18px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.85rem",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(239,83,80,0.25)",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <Phone size={14} /> {isLoggedIn ? ngo.helpline : "Login to view Contact"}
        </a>

        {onRequestAssistance && (
          <button
            onClick={onRequestAssistance}
            style={{
              flex: 1,
              minWidth: "150px",
              background: "rgba(102,187,106,0.12)",
              border: "1px solid rgba(102,187,106,0.25)",
              color: "#A5D6A7",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(102,187,106,0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(102,187,106,0.12)")}
          >
            <MessageSquare size={14} /> Request Assistance
          </button>
        )}
      </div>
    </div>
  );
}
