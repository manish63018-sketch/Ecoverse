"use client";

import React from "react";
import Link from "next/link";

interface CTA {
  label: string;
  href?: string;
  onClick?: () => void;
  variant: "primary" | "secondary" | "danger";
}

interface PageHeroProps {
  tag: string;
  h1: string;
  subtitle: string;
  ctas?: CTA[];
}

export default function PageHero({ tag, h1, subtitle, ctas = [] }: PageHeroProps) {
  return (
    <div
      style={{
        position: "relative",
        background: "linear-gradient(180deg, rgba(46,125,50,0.08) 0%, rgba(5,15,7,0) 100%)",
        borderBottom: "1px solid rgba(102,187,106,0.1)",
        padding: "100px 24px 60px",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* Decorative Glow */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "250px",
          background: "radial-gradient(ellipse, rgba(102,187,106,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "780px", margin: "0 auto" }}>
        {/* Tag Badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "rgba(102,187,106,0.08)",
            border: "1px solid rgba(102,187,106,0.2)",
            color: "#A5D6A7",
            padding: "6px 16px",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "18px",
          }}
        >
          {tag}
        </span>

        {/* H1 Heading */}
        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            marginBottom: "16px",
          }}
        >
          {h1}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: "rgba(255, 255, 255, 0.65)",
            fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
            lineHeight: 1.6,
            maxWidth: "600px",
            margin: "0 auto 28px",
          }}
        >
          {subtitle}
        </p>

        {/* Action Buttons */}
        {ctas.length > 0 && (
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            {ctas.map((cta, idx) => {
              const baseStyle: React.CSSProperties = {
                display: "inline-flex",
                alignItems: "center",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              };

              let style: React.CSSProperties = {};
              if (cta.variant === "primary") {
                style = {
                  ...baseStyle,
                  background: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
                  color: "#FFFFFF",
                  boxShadow: "0 6px 20px rgba(46,125,50,0.3)",
                };
              } else if (cta.variant === "danger") {
                style = {
                  ...baseStyle,
                  background: "linear-gradient(135deg, #ef5350 0%, #c62828 100%)",
                  color: "#FFFFFF",
                  boxShadow: "0 6px 20px rgba(239,83,80,0.3)",
                };
              } else {
                style = {
                  ...baseStyle,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(102,187,106,0.25)",
                  color: "#A5D6A7",
                };
              }

              if (cta.href) {
                return (
                  <Link key={idx} href={cta.href} style={style}>
                    {cta.label}
                  </Link>
                );
              }

              return (
                <button key={idx} onClick={cta.onClick} style={style}>
                  {cta.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
