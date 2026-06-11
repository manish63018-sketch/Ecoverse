"use client";

import React, { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Heart, Eye, Stethoscope, HandHeart, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";

// ── AdSense Component ─────────────────────────────────────────────
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

function AdSenseAd() {
  const pushed = useRef(false);
  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div
      style={{
        margin: "40px auto",
        maxWidth: "800px",
        borderRadius: "16px",
        overflow: "hidden",
        background: "rgba(21, 35, 23, 0.4)",
        border: "1px solid rgba(102,187,106,0.12)",
        padding: "10px 0 6px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "0.65rem", color: "rgba(232,245,233,0.25)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
        Sponsored — Revenue funds animal care
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8150181705727957"
        data-ad-slot="7016537317"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// ── Live stats hook ───────────────────────────────────────────────
interface LiveStats {
  totalRescues: number;
  resolvedRescues: number;
  volunteers: number;
  registeredUsers: number;
  loading: boolean;
}

function useLiveStats(): LiveStats {
  const [stats, setStats] = useState<LiveStats>({
    totalRescues: 0,
    resolvedRescues: 0,
    volunteers: 0,
    registeredUsers: 0,
    loading: true,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          totalRescuesSnap,
          resolvedRescuesSnap,
          volunteersSnap,
          usersSnap,
        ] = await Promise.all([
          // Total rescue cases reported
          getCountFromServer(collection(db, "rescues")),
          // Resolved / helped animals
          getCountFromServer(query(collection(db, "rescues"), where("status", "==", "resolved"))),
          // Volunteers registered
          getCountFromServer(query(collection(db, "public_profiles"), where("roles", "array-contains", "volunteer"))),
          // All registered users
          getCountFromServer(collection(db, "users")),
        ]);

        setStats({
          totalRescues: totalRescuesSnap.data().count,
          resolvedRescues: resolvedRescuesSnap.data().count,
          volunteers: volunteersSnap.data().count,
          registeredUsers: usersSnap.data().count,
          loading: false,
        });
      } catch (err) {
        console.error("Failed to fetch live stats:", err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
    fetchStats();
  }, []);

  return stats;
}

// ── How it works steps ────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "You visit Ecoverse",
    desc: "Every page view on our platform counts. Reading guides, browsing the rescue map, or checking NGO listings — it all helps.",
    icon: <Eye size={22} />,
  },
  {
    step: "02",
    title: "Ads are shown",
    desc: "Google AdSense displays responsible, relevant ads to visitors. We carefully review ad content to keep the experience clean.",
    icon: <TrendingUp size={22} />,
  },
  {
    step: "03",
    title: "Revenue is collected",
    desc: "100% of ad revenue generated on Ecoverse is ring-fenced exclusively for animal welfare — not for server costs, salaries, or anything else.",
    icon: <HandHeart size={22} />,
  },
  {
    step: "04",
    title: "Animals get treated",
    desc: "Funds are disbursed directly to partner vet clinics for treatments: wound care, fracture splinting, de-worming, and emergency surgery.",
    icon: <Stethoscope size={22} />,
  },
];

// ── What funds cover ──────────────────────────────────────────────
const FUND_USES = [
  "Emergency wound stitching & bandaging",
  "Fracture splinting & bone repair",
  "Rabies & distemper vaccinations",
  "Deworming & tick/flea treatments",
  "IV fluids for heat stroke & dehydration",
  "Post-surgery recovery care & food",
  "Sterilization (ABC) programme support",
  "Transport to vet clinics for critical cases",
];

export default function DonatePage() {
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const liveStats = useLiveStats();

  // Build stat cards from live data
  const STATS = [
    {
      icon: "🆘",
      label: "Rescue Cases Reported",
      value: liveStats.loading ? "—" : String(liveStats.totalRescues),
      sub: "Total cases on Ecoverse",
    },
    {
      icon: "✅",
      label: "Cases Resolved",
      value: liveStats.loading ? "—" : String(liveStats.resolvedRescues),
      sub: "Animals helped successfully",
    },
    {
      icon: "🌱",
      label: "Volunteers",
      value: liveStats.loading ? "—" : String(liveStats.volunteers),
      sub: "Active on Ecoverse",
    },
    {
      icon: "👥",
      label: "Registered Members",
      value: liveStats.loading ? "—" : String(liveStats.registeredUsers),
      sub: "Community on the platform",
    },
  ];

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif" }}>
      <Navbar />


      {/* ── Hero ── */}
      <div style={{ paddingTop: "120px", paddingBottom: "0", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Glow */}
        <div style={{ position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(102,187,106,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "760px", margin: "0 auto", padding: "0 24px" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(102,187,106,0.08)", border: "1px solid rgba(102,187,106,0.2)", padding: "6px 16px", borderRadius: "20px", color: "#A5D6A7", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "24px" }}>
            <Heart size={13} fill="#A5D6A7" /> Support Animal Medical Care
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "20px" }}>
            Every page you visit<br />
            <span style={{ background: "linear-gradient(135deg, #66BB6A 0%, #A5D6A7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              heals an animal
            </span>
          </h1>

          <p style={{ color: "rgba(232,245,233,0.65)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: "580px", margin: "0 auto 40px" }}>
            Ecoverse is built on a simple promise: <strong style={{ color: "#A5D6A7" }}>100% of our ad revenue</strong> goes directly to funding veterinary treatment for injured and sick stray animals across India. No middlemen. No overhead cuts.
          </p>

          <a
            href="/knowledge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #66BB6A, #43A047)",
              color: "#050f07",
              fontWeight: 800,
              fontSize: "0.95rem",
              padding: "14px 28px",
              borderRadius: "14px",
              textDecoration: "none",
              boxShadow: "0 8px 32px rgba(102,187,106,0.3)",
              transition: "all 0.25s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(102,187,106,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(102,187,106,0.3)"; }}
          >
            Read our guides & support us <ArrowRight size={17} />
          </a>
        </div>
      </div>

      {/* ── Paw divider ── */}
      <div style={{ textAlign: "center", fontSize: "2rem", padding: "48px 0 16px", opacity: 0.3 }}>🐾 🐾 🐾</div>

      {/* ── Stats ── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 64px" }}>
        {/* Live badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "28px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(102,187,106,0.08)", border: "1px solid rgba(102,187,106,0.2)",
            padding: "5px 12px", borderRadius: "20px", fontSize: "0.75rem",
            fontWeight: 700, color: "#A5D6A7", textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%", background: "#66BB6A",
              boxShadow: "0 0 0 0 rgba(102,187,106,0.4)",
              animation: "livePulse 1.5s ease-in-out infinite",
              display: "inline-block",
            }} />
            Live Data from Ecoverse
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredStat(idx)}
              onMouseLeave={() => setHoveredStat(null)}
              style={{
                background: hoveredStat === idx ? "rgba(102,187,106,0.1)" : "rgba(21,35,23,0.5)",
                border: `1px solid ${hoveredStat === idx ? "rgba(102,187,106,0.35)" : "rgba(102,187,106,0.12)"}`,
                borderRadius: "20px",
                padding: "28px 24px",
                textAlign: "center",
                transition: "all 0.25s",
                cursor: "default",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>{stat.icon}</div>
              <div style={{
                fontSize: "2.4rem", fontWeight: 900, color: "#66BB6A", letterSpacing: "-0.02em",
                minHeight: "2.8rem", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {liveStats.loading ? (
                  <span style={{
                    display: "inline-block", width: "64px", height: "2rem", borderRadius: "8px",
                    background: "linear-gradient(90deg, rgba(102,187,106,0.08) 25%, rgba(102,187,106,0.18) 50%, rgba(102,187,106,0.08) 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.4s ease-in-out infinite",
                  }} />
                ) : stat.value}
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem", marginTop: "4px" }}>{stat.label}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.45)", marginTop: "4px" }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>


      {/* ── AdSense Ad ── */}
      <div style={{ padding: "0 24px" }}>
        <AdSenseAd />
      </div>

      {/* ── How it works ── */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(102,187,106,0.08)", border: "1px solid rgba(102,187,106,0.2)", padding: "6px 14px", borderRadius: "20px", color: "#A5D6A7", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "16px" }}>
            Transparency
          </div>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 900, letterSpacing: "-0.02em" }}>How ads help animals</h2>
          <p style={{ color: "rgba(232,245,233,0.5)", marginTop: "10px", fontSize: "1rem" }}>A simple, honest cycle — from your screen to an animal's treatment.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {HOW_IT_WORKS.map((step, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: "24px",
                alignItems: "flex-start",
                paddingBottom: idx < HOW_IT_WORKS.length - 1 ? "0" : "0",
              }}
            >
              {/* Left: step number + connector line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: "56px" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(102,187,106,0.2), rgba(102,187,106,0.05))",
                  border: "1.5px solid rgba(102,187,106,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#66BB6A", flexShrink: 0,
                }}>
                  {step.icon}
                </div>
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div style={{ width: "1.5px", flex: 1, minHeight: "40px", background: "linear-gradient(to bottom, rgba(102,187,106,0.3), transparent)", margin: "8px 0" }} />
                )}
              </div>
              {/* Right: content */}
              <div style={{ paddingBottom: "36px" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(102,187,106,0.5)", letterSpacing: "0.1em" }}>STEP {step.step}</span>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginTop: "4px", marginBottom: "8px" }}>{step.title}</h3>
                <p style={{ color: "rgba(232,245,233,0.55)", fontSize: "0.9rem", lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── What funds cover ── */}
      <div style={{ background: "rgba(21,35,23,0.45)", borderTop: "1px solid rgba(102,187,106,0.1)", borderBottom: "1px solid rgba(102,187,106,0.1)", padding: "64px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
              🏥 What your visit funds
            </h2>
            <p style={{ color: "rgba(232,245,233,0.5)", marginTop: "10px", fontSize: "0.95rem" }}>
              Ad revenue is used exclusively for these veterinary needs:
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
            {FUND_USES.map((use, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "rgba(21,35,23,0.6)",
                  border: "1px solid rgba(102,187,106,0.12)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  fontSize: "0.88rem",
                  color: "rgba(232,245,233,0.8)",
                }}
              >
                <CheckCircle size={16} style={{ color: "#66BB6A", flexShrink: 0 }} />
                {use}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AdSense Ad 2 ── */}
      <div style={{ padding: "0 24px" }}>
        <AdSenseAd />
      </div>

      {/* ── Pledge / CTA ── */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "64px 24px 100px", textAlign: "center" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(102,187,106,0.1) 0%, rgba(21,35,23,0.7) 100%)",
          border: "1px solid rgba(102,187,106,0.25)",
          borderRadius: "24px",
          padding: "48px 40px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* decorative paw */}
          <div style={{ position: "absolute", bottom: "-20px", right: "-10px", fontSize: "8rem", opacity: 0.04, userSelect: "none" }}>🐾</div>

          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>💚</div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: "12px" }}>
            Our promise to you
          </h2>
          <p style={{ color: "rgba(232,245,233,0.6)", fontSize: "1rem", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto 32px" }}>
            We will always be transparent about how ad funds are used. We publish updates on treatments funded and animals helped. Ecoverse will never profit from animal suffering — we exist to end it.
          </p>

          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/rescue"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "linear-gradient(135deg, #66BB6A, #43A047)",
                color: "#050f07", fontWeight: 800, fontSize: "0.9rem",
                padding: "12px 24px", borderRadius: "12px", textDecoration: "none",
                boxShadow: "0 6px 24px rgba(102,187,106,0.3)", transition: "all 0.25s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
            >
              🚑 Report a Rescue Case
            </a>
            <a
              href="/knowledge"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "transparent",
                border: "1px solid rgba(102,187,106,0.35)",
                color: "#A5D6A7", fontWeight: 700, fontSize: "0.9rem",
                padding: "12px 24px", borderRadius: "12px", textDecoration: "none",
                transition: "all 0.25s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(102,187,106,0.7)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(102,187,106,0.35)"; }}
            >
              📖 Read Knowledge Guides
            </a>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 600px) {
          h1 { font-size: 2rem !important; }
          h2 { font-size: 1.6rem !important; }
        }
      `}</style>
    </div>
  );
}
