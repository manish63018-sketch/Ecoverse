"use client";

import React from "react";
import type { RescueStatus } from "@/types/rescue";

interface StatusBadgeProps {
  status: RescueStatus | "reported";
}

const CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  open: { label: "Open", bg: "rgba(239,83,80,0.1)", text: "#EF5350", dot: "#EF5350" },
  reported: { label: "Open", bg: "rgba(239,83,80,0.1)", text: "#EF5350", dot: "#EF5350" },
  assigned: { label: "Assigned", bg: "rgba(66,165,245,0.1)", text: "#42A5F5", dot: "#42A5F5" },
  in_progress: { label: "In Progress", bg: "rgba(255,167,38,0.1)", text: "#FFA726", dot: "#FFA726" },
  escalated: { label: "Escalated", bg: "rgba(255,61,0,0.12)", text: "#FF6D00", dot: "#FF6D00" },
  resolved: { label: "Resolved", bg: "rgba(102,187,106,0.1)", text: "#66BB6A", dot: "#66BB6A" },
  closed: { label: "Closed", bg: "rgba(255,255,255,0.05)", text: "rgba(232,245,233,0.4)", dot: "rgba(232,245,233,0.4)" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = CONFIG[status] || {
    label: status.toUpperCase(),
    bg: "rgba(255,255,255,0.05)",
    text: "#FFFFFF",
    dot: "#FFFFFF",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: cfg.bg,
        color: cfg.text,
        padding: "3px 8px",
        borderRadius: "4px",
        fontSize: "0.7rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.03em",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: cfg.dot,
          display: "inline-block",
        }}
      />
      {cfg.label}
    </span>
  );
}
