"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { EcoVerseLogo } from "@/components/brand/Logo";
import { ArrowRight, AlertCircle } from "lucide-react";

const floatingParticles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 2,
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 5,
  duration: Math.random() * 5 + 5,
  opacity: Math.random() * 0.5 + 0.1,
}));

export function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a1a0e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "120px 24px 80px",
      }}
    >
      {/* ── Pixel dot grid background (CSS via style tag below) ── */}
      <div className="hero-pixel-grid" aria-hidden="true" />

      {/* ── Radial depth vignette ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 50% 30%, rgba(46,125,50,0.22) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(27,94,32,0.16) 0%, transparent 60%),
            radial-gradient(ellipse 50% 30% at 10% 70%, rgba(102,187,106,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 90% 70% at 50% 50%, transparent 40%, #0a1a0e 100%)
          `,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Floating particles */}
      {floatingParticles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background: "var(--color-accent)",
            opacity: p.opacity,
            animation: `float ${p.duration}s ${p.delay}s ease-in-out infinite`,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      ))}

      {/* Globe Illustration */}
      <div
        style={{
          position: "absolute",
          right: "-5%",
          top: "10%",
          width: "500px",
          height: "500px",
          opacity: 0.12,
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <GlobeSVG />
      </div>

      <div style={{ position: "relative", zIndex: 3, textAlign: "center", maxWidth: "900px" }}>
        {/* Launch badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(102,187,106,0.1)",
            border: "1px solid rgba(102,187,106,0.3)",
            borderRadius: "var(--radius-full)",
            padding: "8px 20px",
            marginBottom: "32px",
            animation: "fade-up 0.5s ease forwards",
          }}
        >
          <span style={{ fontSize: "1rem" }}>🌿</span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: "0.8125rem",
              color: "var(--color-accent)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Launching in Hyderabad — Join the Movement
          </span>
        </div>

        {/* Logo centered */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px", animation: "fade-up 0.5s 0.1s ease both" }}>
          <EcoVerseLogo theme="dark" size={64} />
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#E8F5E9",
            marginBottom: "16px",
            animation: "fade-up 0.6s 0.2s ease both",
          }}
        >
          One Earth.
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #A5D6A7 0%, #66BB6A 40%, #2E7D32 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            One Community.
          </span>
          <br />
          Infinite Compassion.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: "var(--color-text-muted-dark)",
            fontSize: "clamp(1.05rem, 2.2vw, 1.3rem)",
            lineHeight: 1.7,
            maxWidth: "650px",
            margin: "0 auto 48px",
            animation: "fade-up 0.6s 0.35s ease both",
          }}
        >
          India&apos;s first unified platform for animal welfare — connecting rescuers, volunteers, NGOs, and animal lovers to rescue faster, adopt better, and protect together.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "56px",
            animation: "fade-up 0.6s 0.5s ease both",
          }}
        >
          <Link href="/signup" className="btn btn-primary" style={{ fontSize: "1.05rem", padding: "16px 36px" }}>
            Join EcoVerse Free
            <ArrowRight size={20} />
          </Link>
          <Link href="/sos" className="btn btn-sos" style={{ fontSize: "1.05rem", padding: "16px 32px" }}>
            <AlertCircle size={20} />
            Report Emergency SOS
          </Link>
          <Link href="/map" className="btn btn-ghost" style={{ fontSize: "1.05rem", padding: "16px 32px" }}>
            🗺️ Explore Live Map
          </Link>
        </div>

        {/* Trust indicators */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "32px",
            flexWrap: "wrap",
            animation: "fade-up 0.6s 0.65s ease both",
          }}
        >
          {[
            { emoji: "🐕", text: "Animal Rescuers" },
            { emoji: "🌱", text: "Vegan Community" },
            { emoji: "🏥", text: "NGO Network" },
            { emoji: "🤝", text: "Volunteers Ready" },
          ].map((item) => (
            <div
              key={item.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--color-text-muted-dark)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{item.emoji}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "120px",
          background: "linear-gradient(to bottom, transparent, rgba(10,26,14,0.9))",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Pixel grid CSS + animations */}
      <style>{`
        .hero-pixel-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 1px 1px, #2E7D32 1.5px, transparent 0);
          background-size: 22px 22px;
          opacity: 0.14;
          animation: pixelShift 10s linear infinite;
          pointer-events: none;
          z-index: 0;
        }
        @keyframes pixelShift {
          0%   { background-position: 0 0; }
          100% { background-position: 22px 22px; }
        }
      `}</style>
    </section>
  );
}

function GlobeSVG() {
  return (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="200" r="190" stroke="#66BB6A" strokeWidth="1.5" />
      <ellipse cx="200" cy="200" rx="90" ry="190" stroke="#66BB6A" strokeWidth="1" />
      <ellipse cx="200" cy="200" rx="190" ry="60" stroke="#66BB6A" strokeWidth="1" />
      <ellipse cx="200" cy="200" rx="190" ry="110" stroke="#66BB6A" strokeWidth="0.7" opacity="0.6" />
      <line x1="10" y1="200" x2="390" y2="200" stroke="#66BB6A" strokeWidth="1" />
      <line x1="200" y1="10" x2="200" y2="390" stroke="#66BB6A" strokeWidth="1" />
      {/* Continents simplified */}
      <ellipse cx="160" cy="160" rx="45" ry="30" fill="#2E7D32" opacity="0.4" transform="rotate(-15 160 160)" />
      <ellipse cx="250" cy="140" rx="30" ry="20" fill="#2E7D32" opacity="0.35" transform="rotate(10 250 140)" />
      <ellipse cx="220" cy="240" rx="40" ry="25" fill="#2E7D32" opacity="0.38" transform="rotate(-5 220 240)" />
      <ellipse cx="140" cy="250" rx="25" ry="18" fill="#2E7D32" opacity="0.3" transform="rotate(15 140 250)" />
    </svg>
  );
}
