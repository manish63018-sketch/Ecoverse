"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Users, Clock } from "lucide-react";

const features = [
  {
    id: "sos",
    badge: "🚨 Live Now",
    badgeColor: "#E53935",
    title: "EcoVerse SOS",
    subtitle: "Emergency Rescue Alerts",
    description:
      "Spot an animal in danger? Report it in 30 seconds. Our smart algorithm instantly alerts verified volunteers within 10km radius — expanding automatically if no one responds.",
    bullets: [
      { icon: <Zap size={14} />, text: "Instant push notification to nearby volunteers" },
      { icon: <Clock size={14} />, text: "Smart ring expansion after 5 min no response" },
      { icon: <Shield size={14} />, text: "NGO escalation for critical cases" },
    ],
    cta: { label: "Report Emergency", href: "/sos" },
    ctaStyle: "btn-sos",
    visual: <SOSVisual />,
    gradient: "linear-gradient(135deg, rgba(229,57,53,0.12) 0%, rgba(183,28,28,0.05) 100%)",
    border: "rgba(229,57,53,0.2)",
  },
  {
    id: "rescue",
    badge: "🐾 Core Feature",
    badgeColor: "#66BB6A",
    title: "Rescue Case Manager",
    subtitle: "End-to-end Rescue Tracking",
    description:
      "From first report to final resolution — every step tracked. Volunteers update status in real-time. Community follows the journey. NGOs can take over when needed.",
    bullets: [
      { icon: <Users size={14} />, text: "Volunteer accepts and tracks in real-time" },
      { icon: <Shield size={14} />, text: "Media upload — photos, videos, location" },
      { icon: <Zap size={14} />, text: "Full case history & resolution record" },
    ],
    cta: { label: "See Live Rescues", href: "/rescue" },
    ctaStyle: "btn-primary",
    visual: <RescueVisual />,
    gradient: "linear-gradient(135deg, rgba(102,187,106,0.1) 0%, rgba(46,125,50,0.04) 100%)",
    border: "rgba(102,187,106,0.2)",
  },
  {
    id: "map",
    badge: "📍 India-wide",
    badgeColor: "#42A5F5",
    title: "Live Community Map",
    subtitle: "India's Animal Welfare Network",
    description:
      "See every volunteer, rescue case, NGO, and adoption listing on an interactive India map. Filter by city, emergency level, animal type. Your city, visualized.",
    bullets: [
      { icon: <MapPinIcon size={14} />, text: "State-level member density choropleth" },
      { icon: <Users size={14} />, text: "Volunteer availability dots, NGO pins" },
      { icon: <Zap size={14} />, text: "Active rescue markers with pulsing alerts" },
    ],
    cta: { label: "Explore Map", href: "/map" },
    ctaStyle: "btn-ghost",
    visual: <MapVisual />,
    gradient: "linear-gradient(135deg, rgba(66,165,245,0.1) 0%, rgba(2,119,189,0.04) 100%)",
    border: "rgba(66,165,245,0.2)",
  },
];

function MapPinIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function SOSVisual() {
  return (
    <div
      style={{
        width: "100%",
        height: "280px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Pulsing rings */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: `${i * 80}px`,
            height: `${i * 80}px`,
            borderRadius: "50%",
            border: `2px solid rgba(229,57,53,${0.5 - i * 0.12})`,
            animation: `pulse-ring 2s ${i * 0.4}s cubic-bezier(0.455,0.03,0.515,0.955) infinite`,
          }}
        />
      ))}

      {/* Center SOS button */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #E53935, #B71C1C)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          boxShadow: "0 0 40px rgba(229,57,53,0.5)",
          zIndex: 2,
          animation: "float 3s ease-in-out infinite",
        }}
      >
        🚨
      </div>

      {/* Notification cards */}
      {[
        { emoji: "🐕", name: "Raju M.", dist: "0.8km", top: "10%", right: "5%" },
        { emoji: "🏥", name: "PAWS NGO", dist: "1.2km", bottom: "15%", right: "0%" },
        { emoji: "👩‍⚕️", name: "Priya K.", dist: "2.1km", top: "40%", left: "0%" },
      ].map((card) => (
        <div
          key={card.name}
          style={{
            position: "absolute",
            top: card.top,
            bottom: card.bottom,
            left: card.left,
            right: card.right,
            background: "rgba(15,26,16,0.9)",
            border: "1px solid rgba(229,57,53,0.3)",
            borderRadius: "var(--radius-lg)",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "140px",
            backdropFilter: "blur(12px)",
          }}
        >
          <span style={{ fontSize: "1.25rem" }}>{card.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#E8F5E9" }}>{card.name}</div>
            <div style={{ fontSize: "0.7rem", color: "#E53935" }}>📍 {card.dist} away</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RescueVisual() {
  const cases = [
    { status: "🟢 Resolved", animal: "Dog - Leg injury", time: "2 hrs ago", vol: "Amit S." },
    { status: "🟡 In Progress", animal: "Cat - Trapped", time: "Active now", vol: "Priya K." },
    { status: "🔴 Open", animal: "Cow - Hit by vehicle", time: "Just now", vol: "Assigning..." },
  ];
  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
      {cases.map((c, i) => (
        <div
          key={i}
          style={{
            background: "rgba(15,26,16,0.8)",
            border: "1px solid rgba(102,187,106,0.2)",
            borderRadius: "var(--radius-lg)",
            padding: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backdropFilter: "blur(12px)",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#E8F5E9", marginBottom: "4px" }}>
              {c.animal}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted-dark)" }}>
              🧑 {c.vol} · {c.time}
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>{c.status}</span>
        </div>
      ))}
    </div>
  );
}

function MapVisual() {
  return (
    <div
      style={{
        width: "100%",
        height: "280px",
        background: "rgba(15,26,16,0.6)",
        borderRadius: "var(--radius-xl)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Simplified India map outline */}
      <svg viewBox="0 0 300 350" style={{ width: "200px", opacity: 0.6 }}>
        <path
          d="M150 20 L220 60 L250 120 L240 180 L210 240 L180 300 L150 330 L120 300 L90 240 L60 180 L50 120 L80 60 Z"
          fill="rgba(46,125,50,0.3)"
          stroke="#66BB6A"
          strokeWidth="2"
        />
      </svg>

      {/* Map pins */}
      {[
        { top: "30%", left: "52%", color: "#E53935", label: "🚨 SOS" },
        { top: "45%", left: "45%", color: "#66BB6A", label: "🤝 Volunteer" },
        { top: "60%", left: "55%", color: "#42A5F5", label: "🏥 NGO" },
        { top: "50%", left: "38%", color: "#FFA726", label: "🏡 Adopt" },
      ].map((pin) => (
        <div
          key={pin.label}
          style={{
            position: "absolute",
            top: pin.top,
            left: pin.left,
            transform: "translate(-50%, -50%)",
            background: `${pin.color}22`,
            border: `2px solid ${pin.color}`,
            borderRadius: "var(--radius-full)",
            padding: "4px 10px",
            fontSize: "0.65rem",
            fontWeight: 700,
            color: pin.color,
            whiteSpace: "nowrap",
            backdropFilter: "blur(8px)",
            animation: "float 3s ease-in-out infinite",
          }}
        >
          {pin.label}
        </div>
      ))}
    </div>
  );
}

export function FeatureSpotlight() {
  return (
    <section
      id="features"
      style={{
        background: "var(--color-bg-dark)",
        padding: "100px 24px",
      }}
    >
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
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
            Platform Features
          </span>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#E8F5E9",
              letterSpacing: "-0.02em",
            }}
          >
            Built for real impact, on the ground
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {features.map((feature, i) => (
            <div
              key={feature.id}
              style={{
                display: "grid",
                gridTemplateColumns: i % 2 === 0 ? "1fr 1fr" : "1fr 1fr",
                gap: "40px",
                background: feature.gradient,
                border: `1px solid ${feature.border}`,
                borderRadius: "var(--radius-2xl)",
                overflow: "hidden",
                padding: "48px",
                alignItems: "center",
              }}
              className="feature-grid"
            >
              {/* Content */}
              <div style={{ order: i % 2 === 0 ? 1 : 2 }}>
                <div style={{ marginBottom: "20px" }}>
                  <span
                    className="badge"
                    style={{
                      background: `${feature.badgeColor}15`,
                      color: feature.badgeColor,
                      border: `1px solid ${feature.badgeColor}30`,
                    }}
                  >
                    {feature.badge}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 800,
                    fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                    color: "#E8F5E9",
                    letterSpacing: "-0.02em",
                    marginBottom: "8px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: feature.badgeColor,
                    marginBottom: "20px",
                    letterSpacing: "0.02em",
                  }}
                >
                  {feature.subtitle}
                </p>
                <p
                  style={{
                    color: "var(--color-text-muted-dark)",
                    fontSize: "1rem",
                    lineHeight: 1.75,
                    marginBottom: "28px",
                  }}
                >
                  {feature.description}
                </p>

                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "36px" }}>
                  {feature.bullets.map((b, j) => (
                    <li
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        color: "var(--color-text-muted-dark)",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span style={{ color: feature.badgeColor }}>{b.icon}</span>
                      {b.text}
                    </li>
                  ))}
                </ul>

                <Link href={feature.cta.href} className={`btn ${feature.ctaStyle}`}>
                  {feature.cta.label}
                  <ArrowRight size={18} />
                </Link>
              </div>

              {/* Visual */}
              <div style={{ order: i % 2 === 0 ? 2 : 1 }}>
                {feature.visual}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .feature-grid {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .feature-grid {
            grid-template-columns: 1fr !important;
            padding: 28px !important;
          }
        }
      `}</style>
    </section>
  );
}
