"use client";

import React from "react";
import Link from "next/link";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import type { RescueCase } from "@/types/rescue";
import StatusBadge from "./StatusBadge";

interface CaseCardProps {
  rescueCase: RescueCase;
  volunteerName?: string;
  volunteerActive?: boolean;
  onAccept?: () => void;
  isAccepting?: boolean;
  currentUserId?: string;
}

const ANIMAL_ICONS: Record<string, string> = {
  dog: "🐶", cat: "🐱", cow: "🐮", bird: "🐦", pigeon: "🕊️", other: "🐾",
};

const SEVERITY_BORDERS: Record<string, string> = {
  critical: "1px solid rgba(239,83,80,0.35)",
  high: "1px solid rgba(255,167,38,0.25)",
  medium: "1px solid rgba(255,213,79,0.2)",
  low: "1px solid rgba(102,187,106,0.18)",
};

export default function CaseCard({
  rescueCase,
  volunteerName,
  volunteerActive,
  onAccept,
  isAccepting,
  currentUserId,
}: CaseCardProps) {
  const isAssignedToMe = currentUserId && rescueCase.assigned_volunteer_id === currentUserId;
  const isAvailable = rescueCase.status === "open";
  const dateStr = rescueCase.created_at
    ? new Date(rescueCase.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "recently";

  const severityBorder = SEVERITY_BORDERS[rescueCase.emergency_level] || "1px solid rgba(102,187,106,0.1)";

  return (
    <div
      style={{
        background:
          rescueCase.emergency_level === "critical"
            ? "rgba(30,16,16,0.55)"
            : "rgba(21,35,23,0.45)",
        backdropFilter: "blur(16px)",
        border: isAssignedToMe ? "1px solid rgba(102,187,106,0.4)" : severityBorder,
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "all 0.25s ease",
      }}
      className="case-card"
    >
      {/* Top Details */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.25rem" }}>
            {ANIMAL_ICONS[rescueCase.animal_type?.toLowerCase()] || "🐾"}
          </span>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, textTransform: "capitalize" }}>
            {rescueCase.animal_type} Rescue
          </h4>
          <StatusBadge status={rescueCase.status} />
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 800,
              padding: "2px 6px",
              borderRadius: "4px",
              background:
                rescueCase.emergency_level === "critical"
                  ? "rgba(239,83,80,0.15)"
                  : rescueCase.emergency_level === "high"
                  ? "rgba(255,167,38,0.15)"
                  : "rgba(255,255,255,0.05)",
              color:
                rescueCase.emergency_level === "critical"
                  ? "#EF5350"
                  : rescueCase.emergency_level === "high"
                  ? "#FFA726"
                  : "#FFFFFF",
              textTransform: "uppercase",
            }}
          >
            {rescueCase.emergency_level}
          </span>
        </div>

        {isAssignedToMe && (
          <span
            style={{
              fontSize: "0.68rem",
              color: "#66BB6A",
              fontWeight: 700,
              padding: "2px 6px",
              background: "rgba(102,187,106,0.12)",
              borderRadius: "4px",
              border: "1px solid rgba(102,187,106,0.25)",
            }}
          >
            My Case
          </span>
        )}
      </div>

      {/* Description text */}
      <p style={{ fontSize: "0.85rem", lineHeight: 1.5, color: "rgba(232, 245, 233, 0.8)", margin: 0 }}>
        {rescueCase.condition_summary || "No summary provided"}
      </p>

      {/* Meta location and time */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
          fontSize: "0.78rem",
          color: "rgba(232, 245, 233, 0.5)",
          borderTop: "1px solid rgba(102, 187, 106, 0.08)",
          paddingTop: "10px",
          marginTop: "4px",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <MapPin size={12} style={{ color: "#66BB6A" }} />
          {rescueCase.display_zone}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Clock size={12} />
          {dateStr}
        </span>
      </div>

      {/* Assignment row and CTAs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
        {/* Volunteer dispatch status */}
        <div style={{ fontSize: "0.78rem" }}>
          {rescueCase.status !== "open" ? (
            <span style={{ color: "rgba(232,245,233,0.5)" }}>
              Assigned:{" "}
              <strong style={{ color: "#FFFFFF" }}>{volunteerName || "EcoVerse Rescuer"}</strong>
              {volunteerActive && (
                <span
                  style={{
                    display: "inline-block",
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#66BB6A",
                    marginLeft: "6px",
                  }}
                  title="Volunteer Available"
                />
              )}
            </span>
          ) : (
            <span style={{ color: "rgba(239, 83, 80, 0.7)", fontWeight: 600 }}>Awaiting responder...</span>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "8px" }}>
          {isAvailable && onAccept && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAccept();
              }}
              disabled={isAccepting}
              style={{
                background: "rgba(102, 187, 106, 0.12)",
                border: "1px solid rgba(102, 187, 106, 0.3)",
                color: "#A5D6A7",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {isAccepting ? "Accepting..." : "Accept"}
            </button>
          )}

          <Link
            href={`/rescue/${rescueCase.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#FFFFFF",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "0.78rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Details <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <style>{`
        .case-card:hover {
          border-color: rgba(102, 187, 106, 0.25) !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
