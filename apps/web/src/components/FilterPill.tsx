"use client";

import React from "react";

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export default function FilterPill({ label, active, onClick, icon }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "rgba(102, 187, 106, 0.2)" : "rgba(10, 16, 11, 0.4)",
        border: `1px solid ${active ? "rgba(102, 187, 106, 0.5)" : "rgba(102, 187, 106, 0.15)"}`,
        color: active ? "#A5D6A7" : "rgba(232, 245, 233, 0.7)",
        padding: "8px 16px",
        borderRadius: "999px",
        cursor: "pointer",
        fontSize: "0.85rem",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.15s ease",
        fontFamily: "var(--font-sans), sans-serif",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = "rgba(102, 187, 106, 0.35)";
          e.currentTarget.style.background = "rgba(102, 187, 106, 0.05)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = "rgba(102, 187, 106, 0.15)";
          e.currentTarget.style.background = "rgba(10, 16, 11, 0.4)";
        }
      }}
    >
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      {label}
    </button>
  );
}
