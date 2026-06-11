"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Users, Clock } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/api";

// Haversine distance calculator
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Relative time formatter
function getRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const getFeatures = (stats: any, loading: boolean) => [
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
    visual: <SOSVisual stats={stats} loading={loading} />,
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
    visual: <RescueVisual stats={stats} loading={loading} />,
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
    visual: <MapVisual stats={stats} loading={loading} />,
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

function SOSCard({ card, position }: { card: any; position: any }) {
  const [displayName, setDisplayName] = useState(card.name);

  useEffect(() => {
    if (card.type === "volunteer" && card.id) {
      const fetchProfile = async () => {
        try {
          const docRef = doc(db, "users", card.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.displayName) {
              setDisplayName(data.displayName);
            }
          }
        } catch (err) {
          console.warn("Could not load name from Firestore, using default:", err);
        }
      };
      fetchProfile();
    }
  }, [card]);

  return (
    <div
      style={{
        position: "absolute",
        ...position,
        background: "rgba(15,26,16,0.9)",
        border: "1px solid rgba(229,57,53,0.3)",
        borderRadius: "var(--radius-lg)",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minWidth: "150px",
        backdropFilter: "blur(12px)",
        zIndex: 3,
      }}
    >
      <span style={{ fontSize: "1.25rem" }}>{card.emoji}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#E8F5E9" }}>{displayName}</div>
        <div style={{ fontSize: "0.7rem", color: "#E53935" }}>
          {card.type === "area" ? card.dist : `📍 ${card.dist} away`}
        </div>
      </div>
    </div>
  );
}

function SOSVisual({ stats, loading }: { stats: any; loading: boolean }) {
  if (loading) {
    return (
      <div style={{ width: "100%", height: "280px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ borderColor: "#E53935" }} />
      </div>
    );
  }

  const members = stats?.members || [];
  const sampleAreas = stats?.sampleAreas || [];

  let displayCards: any[] = [];
  if (members.length > 0) {
    displayCards = members.slice(0, 3).map((m: any, idx: number) => {
      let distanceStr = `${((idx + 1) * 0.7).toFixed(1)}km`;
      if (m.lat && m.lng) {
        // default center is Hyderabad
        const centerLat = 17.385;
        const centerLng = 78.4867;
        const dist = getDistance(centerLat, centerLng, m.lat, m.lng);
        distanceStr = dist < 0.1 ? "Nearby" : `${dist.toFixed(1)}km`;
      }
      const emojiDisplay = m.type === "ngo" ? "🏥" : idx % 2 === 0 ? "👩‍⚕️" : "🧑‍🌾";
      return {
        id: m.id,
        name: m.type === "ngo" ? m.name : "Verified Volunteer",
        type: m.type,
        emoji: emojiDisplay,
        dist: distanceStr,
      };
    });
  } else {
    // Fallback to seeded active areas
    const fallbackAreas = sampleAreas.length > 0 ? sampleAreas : ["Banjara Hills", "Jubilee Hills", "Secunderabad"];
    displayCards = fallbackAreas.slice(0, 3).map((area: string, idx: number) => ({
      id: `area-${idx}`,
      name: area,
      type: "area",
      emoji: "📍",
      dist: "Covered Zone",
    }));
  }

  const positions = [
    { top: "10%", right: "5%" },
    { bottom: "15%", right: "0%" },
    { top: "40%", left: "0%" },
  ];

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
      {displayCards.map((card, idx) => (
        <SOSCard key={card.id} card={card} position={positions[idx % positions.length]} />
      ))}
    </div>
  );
}

function RescueVisual({ stats, loading }: { stats: any; loading: boolean }) {
  if (loading) {
    return (
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: "rgba(15,26,16,0.5)",
              border: "1px solid rgba(102,187,106,0.1)",
              borderRadius: "var(--radius-lg)",
              padding: "16px",
              height: "76px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "60%" }}>
              <div style={{ height: "14px", background: "rgba(232, 245, 233, 0.1)", borderRadius: "4px" }} />
              <div style={{ height: "10px", background: "rgba(232, 245, 233, 0.05)", borderRadius: "4px", width: "40%" }} />
            </div>
            <div style={{ height: "12px", background: "rgba(102, 187, 106, 0.2)", borderRadius: "4px", width: "60px" }} />
          </div>
        ))}
      </div>
    );
  }

  const cases = stats?.recentCases || [];

  if (cases.length === 0) {
    return (
      <div
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          background: "rgba(15,26,16,0.6)",
          border: "1px dashed rgba(102,187,106,0.3)",
          borderRadius: "var(--radius-xl)",
          minHeight: "180px",
          backdropFilter: "blur(12px)",
        }}
      >
        <span style={{ fontSize: "2rem", marginBottom: "12px" }}>🐾</span>
        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#E8F5E9", marginBottom: "4px" }}>
          All Quiet In Your Area
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted-dark)", maxWidth: "260px", lineHeight: 1.5 }}>
          0 active animal emergencies. Network is online and volunteers are standing by.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
      {cases.slice(0, 3).map((c: any) => {
        let statusText = "⚪ Standby";
        let statusColor = "var(--color-text-muted-dark)";
        switch (c.status) {
          case "resolved":
            statusText = "🟢 Resolved";
            statusColor = "#66BB6A";
            break;
          case "in_progress":
          case "assigned":
            statusText = "🟡 In Progress";
            statusColor = "#FFA726";
            break;
          case "escalated":
            statusText = "🟠 Escalated";
            statusColor = "#FF7043";
            break;
          case "open":
            statusText = "🔴 Open";
            statusColor = "#E53935";
            break;
        }

        const animalTitle = `${
          c.animal_type ? c.animal_type.charAt(0).toUpperCase() + c.animal_type.slice(1) : "Animal"
        } - ${c.condition_summary || "Urgent Case"}`;
        const relativeTime = getRelativeTime(c.created_at);

        return (
          <div
            key={c.id}
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
                {animalTitle}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted-dark)" }}>
                📍 {c.area_name || "Hyderabad"} · {relativeTime}
              </div>
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: statusColor }}>{statusText}</span>
          </div>
        );
      })}
    </div>
  );
}

function MapVisual({ stats, loading }: { stats: any; loading: boolean }) {
  const counts = stats?.counts || { states: 1, cities: 1, areas: 39 };

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
      <svg viewBox="0 0 300 350" style={{ width: "200px", opacity: 0.6 }}>
        <path
          d="M150 20 L220 60 L250 120 L240 180 L210 240 L180 300 L150 330 L120 300 L90 240 L60 180 L50 120 L80 60 Z"
          fill="rgba(46,125,50,0.3)"
          stroke="#66BB6A"
          strokeWidth="2"
        />
      </svg>

      {[
        { top: "30%", left: "52%", color: "#E53935", label: `🚨 ${counts.rescues || 0} active cases` },
        { top: "45%", left: "45%", color: "#66BB6A", label: `🤝 ${counts.volunteers || 0} volunteers` },
        { top: "60%", left: "55%", color: "#42A5F5", label: `🏥 ${counts.ngos || 0} NGOs` },
        { top: "50%", left: "38%", color: "#FFA726", label: `📍 ${counts.areas || 39} zones` },
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
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingStats = async () => {
      try {
        let url = "/api/landing-stats";
        if (user) {
          try {
            const locRes = await fetch(getApiUrl(`/api/users/location?firebase_uid=${user.uid}`));
            if (locRes.ok) {
              const locData = await locRes.json();
              if (locData.profile?.city_id) {
                url += `?city_id=${locData.profile.city_id}`;
              } else if (locData.profile?.state_id) {
                url += `?state_id=${locData.profile.state_id}`;
              }
            }
          } catch (locErr) {
            console.warn("Failed to fetch user location profile for spotlight:", locErr);
          }
        }
        const res = await fetch(getApiUrl(url));
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch landing stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingStats();
  }, [user]);

  const features = getFeatures(stats, loading);

  return (
    <section
      id="features"
      style={{
        background: "rgba(15, 26, 16, 0.80)",
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
                gridTemplateColumns: "1fr 1fr",
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
              <div style={{ order: i % 2 === 0 ? 2 : 1 }}>{feature.visual}</div>
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
