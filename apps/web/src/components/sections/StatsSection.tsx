"use client";

import React, { useEffect, useRef, useState } from "react";

const stats = [
  {
    value: 0,
    suffix: "",
    label: "Animals Helped",
    emoji: "🐾",
    color: "#66BB6A",
    zeroLabel: "Be the first",
  },
  {
    value: 1,
    suffix: "",
    label: "Active Volunteers",
    emoji: "🤝",
    color: "#42A5F5",
    zeroLabel: "That's you — join now",
  },
  {
    value: 1,
    suffix: "",
    label: "Cities Covered",
    emoji: "📍",
    color: "#FF7043",
    zeroLabel: "Hyderabad launching",
  },
  {
    value: 0,
    suffix: "",
    label: "NGO Partners",
    emoji: "🏥",
    color: "#AB47BC",
    zeroLabel: "Partner with us",
  },
  {
    value: 0,
    suffix: "",
    label: "Rescue Cases Resolved",
    emoji: "✅",
    color: "#26A69A",
    zeroLabel: "Every rescue starts somewhere",
  },
  {
    value: 0,
    suffix: "",
    label: "Animals Adopted",
    emoji: "🏡",
    color: "#FFA726",
    zeroLabel: "Your home could be first",
  },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (value === 0) { setDisplay(0); return; }
    const duration = 1800;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [started, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section
      id="impact"
      style={{
        background: "var(--color-bg-dark)",
        padding: "100px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background accent */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(46,125,50,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
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
            Where We Are Now — Day One
          </span>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#E8F5E9",
              letterSpacing: "-0.02em",
              marginBottom: "16px",
            }}
          >
            Every number starts at zero.
          </h2>
          <p style={{
            color: "var(--color-text-muted-dark)",
            fontSize: "1rem",
            maxWidth: "560px",
            margin: "0 auto",
            lineHeight: 1.7,
          }}>
            Be the first to make a difference. Each life saved here is a real story — not a placeholder. These numbers are honest because you deserve honest.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "24px",
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--color-surface-dark)",
                border: "1px solid var(--color-border-dark)",
                borderRadius: "var(--radius-xl)",
                padding: "36px 28px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                transition: "all var(--transition-base)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${stat.color}22`;
                (e.currentTarget as HTMLElement).style.borderColor = `${stat.color}44`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-dark)";
              }}
            >
              {/* Glow top bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)`,
                }}
              />

              <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>{stat.emoji}</div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 800,
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  color: stat.color,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  marginBottom: "10px",
                }}
              >
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted-dark)",
                  letterSpacing: "0.02em",
                  marginBottom: "8px",
                }}
              >
                {stat.label}
              </div>
              {stat.value === 0 || stat.value <= 1 ? (
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: `${stat.color}bb`,
                    fontStyle: "italic",
                    letterSpacing: "0.01em",
                  }}
                >
                  {stat.zeroLabel}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Honest note */}
        <div style={{
          textAlign: "center",
          marginTop: "48px",
          padding: "16px 28px",
          background: "rgba(46,125,50,0.06)",
          border: "1px solid rgba(46,125,50,0.15)",
          borderRadius: "var(--radius-xl)",
          color: "var(--color-text-muted-dark)",
          fontSize: "0.85rem",
          lineHeight: 1.6,
        }}>
          🌱 <strong style={{ color: "#66BB6A" }}>This is day one.</strong> Numbers here will only ever reflect real animals helped, real rescues done, and real communities formed. No inflated statistics, ever.
        </div>
      </div>
    </section>
  );
}
