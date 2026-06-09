"use client";

import React from "react";

export function MapPreview() {
  const cities = [
    { name: "Hyderabad", lat: "61%", lng: "52%", volunteers: 340, rescues: 28, color: "#E53935" },
    { name: "Mumbai", lat: "48%", lng: "28%", volunteers: 620, rescues: 45, color: "#E53935" },
    { name: "Delhi", lat: "28%", lng: "44%", volunteers: 510, rescues: 39, color: "#E53935" },
    { name: "Bangalore", lat: "72%", lng: "44%", volunteers: 280, rescues: 21, color: "#66BB6A" },
    { name: "Chennai", lat: "78%", lng: "55%", volunteers: 195, rescues: 14, color: "#66BB6A" },
    { name: "Pune", lat: "54%", lng: "33%", volunteers: 210, rescues: 18, color: "#42A5F5" },
    { name: "Kolkata", lat: "45%", lng: "72%", volunteers: 175, rescues: 12, color: "#42A5F5" },
    { name: "Ahmedabad", lat: "38%", lng: "26%", volunteers: 145, rescues: 9, color: "#FFA726" },
  ];

  return (
    <section
      id="map-preview"
      style={{
        background: "var(--color-bg-dark-alt)",
        borderTop: "1px solid var(--color-border-dark)",
        padding: "100px 24px",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: "60px",
            alignItems: "center",
          }}
          className="map-layout"
        >
          {/* Left text */}
          <div>
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
              Live India Map
            </span>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 800,
                fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                color: "#E8F5E9",
                letterSpacing: "-0.02em",
                marginBottom: "20px",
              }}
            >
              Your city&apos;s animal welfare network — live
            </h2>
            <p
              style={{
                color: "var(--color-text-muted-dark)",
                fontSize: "1rem",
                lineHeight: 1.75,
                marginBottom: "32px",
              }}
            >
              Every rescue case, volunteer, NGO, and adoption listing pinned on an interactive map. Filter by what matters to you.
            </p>

            {/* Filter pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "40px" }}>
              {[
                { label: "🤝 Volunteers", color: "#66BB6A" },
                { label: "🚨 SOS Cases", color: "#E53935" },
                { label: "🏥 NGOs", color: "#42A5F5" },
                { label: "🏡 Adoptions", color: "#FFA726" },
                { label: "🌱 Vegans", color: "#AB47BC" },
              ].map((filter) => (
                <span
                  key={filter.label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: filter.color,
                    background: `${filter.color}12`,
                    border: `1px solid ${filter.color}30`,
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {filter.label}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { value: "48", label: "Cities", icon: "📍" },
                { value: "3,800+", label: "Active Volunteers", icon: "🤝" },
                { value: "240+", label: "NGO Partners", icon: "🏥" },
                { value: "Real-time", label: "Live Updates", icon: "⚡" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(102,187,106,0.06)",
                    border: "1px solid rgba(102,187,106,0.15)",
                    borderRadius: "var(--radius-lg)",
                    padding: "16px",
                  }}
                >
                  <div style={{ fontSize: "1.2rem", marginBottom: "6px" }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: "1.25rem", color: "#E8F5E9", marginBottom: "4px" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted-dark)", fontWeight: 600 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map visual */}
          <div
            style={{
              position: "relative",
              background: "rgba(15,26,16,0.6)",
              border: "1px solid rgba(102,187,106,0.15)",
              borderRadius: "var(--radius-2xl)",
              overflow: "hidden",
              height: "480px",
            }}
          >
            {/* Map grid */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(102,187,106,0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(102,187,106,0.05) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />

            {/* India outline */}
            <svg
              viewBox="0 0 400 500"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                opacity: 0.25,
              }}
            >
              <path
                d="M200 30 L280 70 L320 140 L330 220 L300 300 L250 380 L220 440 L190 480 L160 440 L130 380 L80 300 L50 220 L60 140 L100 70 Z"
                fill="rgba(46,125,50,0.4)"
                stroke="#66BB6A"
                strokeWidth="2"
              />
              {/* State lines */}
              <line x1="140" y1="180" x2="260" y2="180" stroke="#66BB6A" strokeWidth="0.7" opacity="0.5" />
              <line x1="120" y1="280" x2="280" y2="280" stroke="#66BB6A" strokeWidth="0.7" opacity="0.5" />
              <line x1="200" y1="30" x2="200" y2="480" stroke="#66BB6A" strokeWidth="0.7" opacity="0.4" />
            </svg>

            {/* City pins */}
            {cities.map((city) => (
              <div
                key={city.name}
                style={{
                  position: "absolute",
                  top: city.lat,
                  left: city.lng,
                  transform: "translate(-50%, -50%)",
                  zIndex: 5,
                }}
              >
                {/* Pulse ring */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: `2px solid ${city.color}`,
                    animation: "pulse-ring 2s cubic-bezier(0.455,0.03,0.515,0.955) infinite",
                    opacity: 0.6,
                  }}
                />
                {/* Pin dot */}
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: city.color,
                    border: "2px solid rgba(15,26,16,0.8)",
                    boxShadow: `0 0 12px ${city.color}88`,
                    position: "relative",
                    zIndex: 2,
                    cursor: "pointer",
                  }}
                  title={`${city.name}: ${city.volunteers} volunteers, ${city.rescues} active rescues`}
                />
              </div>
            ))}

            {/* Legend */}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                background: "rgba(15,26,16,0.9)",
                border: "1px solid rgba(102,187,106,0.2)",
                borderRadius: "var(--radius-lg)",
                padding: "12px 16px",
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--color-accent)", marginBottom: "8px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Map Legend
              </div>
              {[
                { color: "#E53935", label: "Active SOS" },
                { color: "#66BB6A", label: "Rescue in Progress" },
                { color: "#42A5F5", label: "Volunteer Hub" },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: l.color }} />
                  <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted-dark)" }}>{l.label}</span>
                </div>
              ))}
            </div>

            {/* Live indicator */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(15,26,16,0.9)",
                border: "1px solid rgba(102,187,106,0.2)",
                borderRadius: "var(--radius-full)",
                padding: "6px 14px",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#66BB6A",
                  animation: "pulse-ring 1.5s ease infinite",
                }}
              />
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#66BB6A" }}>LIVE</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .map-layout {
          grid-template-columns: 1fr 1.6fr;
        }
        @media (max-width: 900px) {
          .map-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
