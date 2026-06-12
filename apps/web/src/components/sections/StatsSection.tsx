"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface LiveStats {
  animalsHelped: number;
  activeVolunteers: number;
  citiesCovered: number;
  ngoPartners: number;
  rescueCasesResolved: number;
  totalMembers: number;
}

const STAT_CONFIG = [
  {
    key: "animalsHelped" as keyof LiveStats,
    suffix: "",
    label: "Animals Helped",
    emoji: "🐾",
    color: "#66BB6A",
    zeroMsg: "Be the first rescue",
  },
  {
    key: "activeVolunteers" as keyof LiveStats,
    suffix: "",
    label: "Active Volunteers",
    emoji: "🤝",
    color: "#42A5F5",
    zeroMsg: "Join — you could be first",
  },
  {
    key: "citiesCovered" as keyof LiveStats,
    suffix: "",
    label: "Cities Covered",
    emoji: "📍",
    color: "#FF7043",
    zeroMsg: "Hyderabad launching",
  },
  {
    key: "ngoPartners" as keyof LiveStats,
    suffix: "",
    label: "NGO Partners",
    emoji: "🏥",
    color: "#AB47BC",
    zeroMsg: "Partner with us",
  },
  {
    key: "rescueCasesResolved" as keyof LiveStats,
    suffix: "",
    label: "Rescue Cases Resolved",
    emoji: "✅",
    color: "#26A69A",
    zeroMsg: "Every rescue starts somewhere",
  },
  {
    key: "totalMembers" as keyof LiveStats,
    suffix: "",
    label: "Community Members",
    emoji: "👥",
    color: "#FFA726",
    zeroMsg: "Be the first to join",
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
  const [stats, setStats] = useState<LiveStats>({
    animalsHelped: 0,
    activeVolunteers: 0,
    citiesCovered: 1,
    ngoPartners: 0,
    rescueCasesResolved: 0,
    totalMembers: 0,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [membersRes, volunteersRes, ngosRes, rescuesRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }).contains("roles", ["volunteer"]),
          supabase.from("profiles").select("id", { count: "exact", head: true }).contains("roles", ["ngo"]),
          supabase.from("rescue_cases").select("id", { count: "exact", head: true }).eq("status", "resolved"),
        ]);

        setStats({
          animalsHelped: rescuesRes.count || 0,
          activeVolunteers: volunteersRes.count || 0,
          citiesCovered: 1,
          ngoPartners: ngosRes.count || 0,
          rescueCasesResolved: rescuesRes.count || 0,
          totalMembers: membersRes.count || 0,
        });
        setLoaded(true);
      } catch (err) {
        console.error("Error loading stats:", err);
      }
    };

    fetchStats();

    // Set up realtime subscription to profiles and rescue cases
    const channel = supabase
      .channel("stats-db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        fetchStats();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "rescue_cases" }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section
      id="impact"
      style={{
        background: "rgba(15, 26, 16, 0.80)",
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
            {loaded && (stats.animalsHelped > 0 || stats.activeVolunteers > 0 || stats.totalMembers > 0)
              ? "Our Impact So Far"
              : "Where We Are Now — Day One"}
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
            {loaded && (stats.animalsHelped > 0 || stats.activeVolunteers > 0 || stats.totalMembers > 0)
              ? "Every number is a life that matters"
              : "Every number starts at zero."}
          </h2>
          <p
            style={{
              color: "var(--color-text-muted-dark)",
              fontSize: "1rem",
              maxWidth: "560px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            {loaded && (stats.animalsHelped > 0 || stats.activeVolunteers > 0 || stats.totalMembers > 0)
              ? "Real animals rescued, real volunteers active, real lives changed — every stat here comes from the database."
              : "Be the first to make a difference. These numbers are honest because you deserve honest. No inflated statistics, ever."}
          </p>
        </div>

        <div className="stats-grid">
          {STAT_CONFIG.map((cfg) => {
            const value = stats[cfg.key];
            return (
              <div
                key={cfg.key}
                className="stats-card"
                style={{
                  background: "rgba(26, 46, 27, 0.65)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
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
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${cfg.color}22`;
                  (e.currentTarget as HTMLElement).style.borderColor = `${cfg.color}44`;
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
                    background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
                  }}
                />
                <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>{cfg.emoji}</div>
                <div
                  className="stats-value"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 800,
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    color: cfg.color,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    marginBottom: "10px",
                  }}
                >
                  {!loaded ? (
                    <span style={{ opacity: 0.3, fontSize: "1.5rem" }}>—</span>
                  ) : (
                    <AnimatedNumber value={value} suffix={cfg.suffix} />
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted-dark)",
                    letterSpacing: "0.02em",
                    marginBottom: "6px",
                  }}
                >
                  {cfg.label}
                </div>
                {loaded && value === 0 && (
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: `${cfg.color}bb`,
                      fontStyle: "italic",
                    }}
                  >
                    {cfg.zeroMsg}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Honest transparency note */}
        <div
          style={{
            textAlign: "center",
            marginTop: "48px",
            padding: "16px 28px",
            background: "rgba(46,125,50,0.06)",
            border: "1px solid rgba(46,125,50,0.15)",
            borderRadius: "var(--radius-xl)",
            color: "var(--color-text-muted-dark)",
            fontSize: "0.85rem",
            lineHeight: 1.6,
          }}
        >
          🌱{" "}
          <strong style={{ color: "#66BB6A" }}>Live data from our database.</strong>{" "}
          These numbers update automatically as the community grows. No inflated statistics — ever.
        </div>
      </div>
    </section>
  );
}
