"use client";

import React from "react";
import Link from "next/link";

const modules = [
  {
    id: "sos",
    emoji: "🚨",
    label: "EcoVerse SOS",
    description: "Emergency rescue alerts",
    href: "/sos",
    color: "#E53935",
    bg: "rgba(229,57,53,0.12)",
    border: "rgba(229,57,53,0.3)",
  },
  {
    id: "rescue",
    emoji: "🐾",
    label: "EcoVerse Rescue",
    description: "Full case management",
    href: "/rescue",
    color: "#66BB6A",
    bg: "rgba(102,187,106,0.12)",
    border: "rgba(102,187,106,0.3)",
  },
  {
    id: "map",
    emoji: "📍",
    label: "EcoVerse Map",
    description: "Live India community map",
    href: "/map",
    color: "#0288D1",
    bg: "rgba(2,136,209,0.12)",
    border: "rgba(2,136,209,0.3)",
  },
  {
    id: "adopt",
    emoji: "🏡",
    label: "EcoVerse Adopt",
    description: "Animal adoption listings",
    href: "/adopt",
    color: "#F57C00",
    bg: "rgba(245,124,0,0.12)",
    border: "rgba(245,124,0,0.3)",
  },
  {
    id: "community",
    emoji: "🌱",
    label: "EcoVerse Community",
    description: "Vegans & animal lovers feed",
    href: "/community",
    color: "#43A047",
    bg: "rgba(67,160,71,0.12)",
    border: "rgba(67,160,71,0.3)",
  },
  {
    id: "ngo",
    emoji: "🤝",
    label: "NGO Network",
    description: "NGO & volunteer directory",
    href: "/ngos",
    color: "#7B1FA2",
    bg: "rgba(123,31,162,0.12)",
    border: "rgba(123,31,162,0.3)",
  },
];

export function MissionStrip() {
  return (
    <section
      id="mission"
      style={{
        background: "rgba(21, 35, 23, 0.82)",
        borderTop: "1px solid var(--color-border-dark)",
        borderBottom: "1px solid var(--color-border-dark)",
        padding: "60px 24px",
      }}
    >
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-accent)",
              display: "block",
              marginBottom: "12px",
            }}
          >
            The EcoVerse Ecosystem
          </span>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 800,
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              color: "#E8F5E9",
              letterSpacing: "-0.02em",
            }}
          >
            One platform. Every action that matters.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          {modules.map((mod, i) => (
            <Link
              key={mod.id}
              href={mod.href}
              style={{
                display: "block",
                textDecoration: "none",
                background: mod.bg,
                border: `1px solid ${mod.border}`,
                borderRadius: "var(--radius-xl)",
                padding: "24px 20px",
                transition: "all var(--transition-base)",
                animation: `fade-up 0.5s ${i * 80}ms ease both`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${mod.bg}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{mod.emoji}</div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  color: "#E8F5E9",
                  marginBottom: "6px",
                }}
              >
                {mod.label}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted-dark)", lineHeight: 1.5 }}>
                {mod.description}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
