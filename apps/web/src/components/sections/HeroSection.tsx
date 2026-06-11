"use client";

import React from "react";
import Link from "next/link";
import { EcoVerseLogo } from "@/components/brand/Logo";
import { ArrowRight, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";

export function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        position:        "relative",
        width:           "100vw",
        minHeight:       "100vh",
        overflow:        "hidden",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "flex-start",
        backgroundColor: "transparent",
      }}
    >

      {/* ── Layer 1: Left-side overlay so text is readable against the globe ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset:    0,
          background: `
            linear-gradient(
              105deg,
              rgba(5,15,7,0.92) 0%,
              rgba(5,15,7,0.75) 35%,
              rgba(5,15,7,0.15) 58%,
              transparent 70%
            )
          `,
          pointerEvents: "none",
          zIndex:        1,
        }}
      />

      {/* ── Layer 2: Bottom fade into next section ── */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          bottom:        0,
          left:          0,
          right:         0,
          height:        "180px",
          background:    "linear-gradient(to bottom, transparent, rgba(5,15,7,0.98))",
          pointerEvents: "none",
          zIndex:        2,
        }}
      />

      {/* ── Layer 3: Top fade so navbar is visible ── */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          top:           0,
          left:          0,
          right:         0,
          height:        "110px",
          background:    "linear-gradient(to bottom, rgba(5,15,7,0.75), transparent)",
          pointerEvents: "none",
          zIndex:        2,
        }}
      />

      {/* ── Layer 4: Hero content — left-aligned, floats over globe ── */}
      <div
        className="hero-content"
        style={{
          position:  "relative",
          zIndex:    3,
          maxWidth:  "760px",
          padding:   "140px 56px 100px",
        }}
      >
        {/* Launch badge */}
        <div
          className="hero-badge"
          style={{
            display:       "inline-flex",
            alignItems:    "center",
            gap:           "8px",
            background:    "rgba(102,187,106,0.1)",
            border:        "1px solid rgba(102,187,106,0.3)",
            borderRadius:  "999px",
            padding:       "8px 20px",
            marginBottom:  "28px",
            animation:     "fade-up 0.5s 0.05s ease both",
            backdropFilter:"blur(8px)",
          }}
        >
          <span style={{ fontSize: "0.9rem" }}>🌿</span>
          <span
            style={{
              fontFamily:    "var(--font-sans)",
              fontWeight:    600,
              fontSize:      "0.8rem",
              color:         "var(--color-accent)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Launching in Hyderabad — Join the Movement
          </span>
        </div>

        {/* Logo */}
        <div className="hero-logo" style={{ marginBottom: "28px", animation: "fade-up 0.6s 0.15s ease both" }}>
          <EcoVerseLogo theme="dark" size={56} />
        </div>

        {/* Headline */}
        <h1
          className="hero-title"
          style={{
            fontFamily:    "var(--font-sans)",
            fontWeight:    900,
            fontSize:      "clamp(2rem, 5.5vw, 6rem)",
            lineHeight:    1.0,
            letterSpacing: "-0.04em",
            color:         "#E8F5E9",
            marginBottom:  "22px",
            animation:     "fade-up 0.7s 0.2s ease both",
            textShadow:    "0 2px 40px rgba(0,0,0,0.8)",
          }}
        >
          <span style={{ display: "block" }}>One Earth.</span>
          <span
            style={{
              display:              "block",
              background:           "linear-gradient(120deg, #A5D6A7 0%, #66BB6A 50%, #2E7D32 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
              backgroundClip:       "text",
            }}
          >
            One Community.
          </span>
          <span style={{ display: "block", fontSize: "0.62em", fontWeight: 700, color: "rgba(232,245,233,0.7)" }}>
            Infinite Compassion.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="hero-desc"
          style={{
            fontFamily:    "var(--font-sans)",
            color:         "rgba(165,200,167,0.80)",
            fontSize:      "clamp(1rem, 1.8vw, 1.2rem)",
            lineHeight:    1.7,
            maxWidth:      "520px",
            marginBottom:  "44px",
            animation:     "fade-up 0.7s 0.35s ease both",
          }}
        >
          India&apos;s first unified platform for animal welfare — connecting
          rescuers, volunteers, NGOs and animal lovers to rescue faster, adopt
          better, and protect together.
        </p>

        {/* CTA buttons */}
        <div
          className="hero-actions"
          style={{
            display:   "flex",
            gap:       "14px",
            flexWrap:  "wrap",
            animation: "fade-up 0.7s 0.5s ease both",
          }}
        >
          <Link
            href="/signup"
            className="btn btn-primary"
            style={{ fontSize: "1rem", padding: "15px 32px" }}
          >
            Join EcoVerse Free
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/sos"
            className="btn btn-sos"
            style={{ fontSize: "1rem", padding: "15px 28px" }}
          >
            <AlertCircle size={18} />
            Report Emergency SOS
          </Link>
          <Link
            href="/map"
            className="btn btn-ghost"
            style={{ fontSize: "1rem", padding: "15px 26px" }}
          >
            🗺️ Live Map
          </Link>
        </div>

        {/* Trust indicators */}
        <div
          className="hero-tags"
          style={{
            display:    "flex",
            gap:        "28px",
            flexWrap:   "wrap",
            marginTop:  "40px",
            animation:  "fade-up 0.7s 0.68s ease both",
          }}
        >
          {[
            { emoji: "🐕", text: "Animal Rescuers" },
            { emoji: "🌱", text: "Vegan Community" },
            { emoji: "🏥", text: "NGO Network" },
            { emoji: "🤝", text: "Volunteers" },
          ].map((item) => (
            <div
              key={item.text}
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        "6px",
                color:      "rgba(165,200,167,0.65)",
                fontSize:   "0.82rem",
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: "1rem" }}>{item.emoji}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .hero-content {
            padding: 90px 16px 60px !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .hero-logo svg {
            width: 44px !important;
            height: 44px !important;
          }
          .hero-title {
            font-size: 2.2rem !important;
            line-height: 1.06 !important;
            margin-bottom: 16px !important;
            letter-spacing: -0.035em !important;
          }
          .hero-desc {
            font-size: 0.9rem !important;
            line-height: 1.65 !important;
            margin-bottom: 28px !important;
            max-width: 100% !important;
          }
          .hero-actions {
            flex-direction: column !important;
            width: 100% !important;
            gap: 10px !important;
          }
          .hero-actions .btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 14px 20px !important;
            font-size: 0.9375rem !important;
            min-height: 52px !important;
          }
          .hero-drag-hint {
            display: none !important;
          }
          .hero-badge {
            padding: 7px 14px !important;
            margin-bottom: 20px !important;
          }
          .hero-badge span:last-of-type {
            font-size: 0.72rem !important;
            letter-spacing: 0.03em !important;
          }
          .hero-tags {
            gap: 12px 16px !important;
            margin-top: 28px !important;
            justify-content: flex-start !important;
          }
          .hero-tags > div {
            flex: 0 0 calc(50% - 8px) !important;
          }
        }
        @media (max-width: 400px) {
          .hero-title {
            font-size: 1.9rem !important;
          }
          .hero-tags > div {
            flex: 0 0 100% !important;
          }
        }
      `}</style>
    </section>
  );
}
