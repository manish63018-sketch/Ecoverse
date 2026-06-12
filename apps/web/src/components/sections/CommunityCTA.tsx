"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function CommunityCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [counts, setCounts] = useState<Record<string, number | null>>({
    rescuer: null,
    vegan: null,
    adopter: null,
    ngo: null,
    feeder: null,
    volunteer: null,
  });

  useEffect(() => {
    async function loadCounts() {
      try {
        const [rescuerRes, veganRes, adopterRes, ngoRes, feederRes, volunteerRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }).contains("roles", ["rescuer"]),
          supabase.from("profiles").select("id", { count: "exact", head: true }).contains("roles", ["vegan"]),
          supabase.from("profiles").select("id", { count: "exact", head: true }).contains("roles", ["adopter"]),
          supabase.from("profiles").select("id", { count: "exact", head: true }).contains("roles", ["ngo"]),
          supabase.from("profiles").select("id", { count: "exact", head: true }).contains("roles", ["feeder"]),
          supabase.from("profiles").select("id", { count: "exact", head: true }).contains("roles", ["volunteer"]),
        ]);
        setCounts({
          rescuer: rescuerRes.count,
          vegan: veganRes.count,
          adopter: adopterRes.count,
          ngo: ngoRes.count,
          feeder: feederRes.count,
          volunteer: volunteerRes.count,
        });
      } catch (err) {
        console.error("Error loading community CTA counts:", err);
      }
    }
    loadCounts();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  const roles = [
    { emoji: "🐾", label: "Animal Rescuer", count: counts.rescuer !== null ? String(counts.rescuer) : "..." },
    { emoji: "🌱", label: "Vegan Advocate", count: counts.vegan !== null ? String(counts.vegan) : "..." },
    { emoji: "🏡", label: "Foster / Adopter", count: counts.adopter !== null ? String(counts.adopter) : "..." },
    { emoji: "🏥", label: "NGO / Org", count: counts.ngo !== null ? String(counts.ngo) : "..." },
    { emoji: "🥣", label: "Street Feeder", count: counts.feeder !== null ? String(counts.feeder) : "..." },
    { emoji: "🤝", label: "Volunteer", count: counts.volunteer !== null ? String(counts.volunteer) : "..." },
  ];

  return (
    <section
      id="join"
      style={{
        background: `
          radial-gradient(ellipse 70% 60% at 50% 100%, rgba(46,125,50,0.35) 0%, transparent 60%),
          rgba(15, 26, 16, 0.80)
        `,
        borderTop: "1px solid var(--color-border-dark)",
        padding: "120px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative top wave */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, #66BB6A, #2E7D32, #66BB6A, transparent)",
        }}
      />

      <div className="container" style={{ textAlign: "center" }}>
        {/* Badge */}
        <div
          className="early-member-badge"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(102,187,106,0.1)",
            border: "1px solid rgba(102,187,106,0.3)",
            borderRadius: "var(--radius-full)",
            padding: "8px 20px",
            marginBottom: "32px",
          }}
        >
          <span style={{ fontSize: "1rem" }}>🚀</span>
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Now Accepting Early Members
          </span>
        </div>

        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 800,
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            color: "#E8F5E9",
            letterSpacing: "-0.03em",
            marginBottom: "20px",
            lineHeight: 1.1,
          }}
        >
          Be the change India&apos;s
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #A5D6A7, #66BB6A, #2E7D32)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            animals need.
          </span>
        </h2>

        <p
          style={{
            color: "var(--color-text-muted-dark)",
            fontSize: "1.15rem",
            lineHeight: 1.7,
            maxWidth: "540px",
            margin: "0 auto 48px",
          }}
        >
          Join thousands of compassionate Indians building a real network of care — one rescue, one adoption, one community at a time.
        </p>

        {/* Role pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "48px",
          }}
        >
          {roles.map((role) => (
            <div
              key={role.label}
              className="role-pill"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(102,187,106,0.08)",
                border: "1px solid rgba(102,187,106,0.2)",
                borderRadius: "var(--radius-full)",
                padding: "10px 18px",
                color: "var(--color-text-muted-dark)",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(102,187,106,0.15)";
                (e.currentTarget as HTMLElement).style.color = "#A5D6A7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(102,187,106,0.08)";
                (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted-dark)";
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{role.emoji}</span>
              <span>{role.label}</span>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  color: "var(--color-accent)",
                }}
              >
                {role.count}
              </span>
            </div>
          ))}
        </div>

        {/* Email signup */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="cta-email-form"
            style={{
              display: "flex",
              gap: "12px",
              maxWidth: "480px",
              margin: "0 auto 32px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <input
              type="email"
              id="cta-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              style={{
                flex: "1",
                minWidth: "240px",
                padding: "14px 20px",
                borderRadius: "var(--radius-full)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(102,187,106,0.3)",
                color: "#E8F5E9",
                fontFamily: "var(--font-sans)",
                fontSize: "0.9375rem",
                outline: "none",
                transition: "border-color var(--transition-fast)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#66BB6A")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(102,187,106,0.3)")}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: "14px 28px" }}>
              Get Early Access
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(102,187,106,0.15)",
              border: "1px solid rgba(102,187,106,0.4)",
              borderRadius: "var(--radius-full)",
              padding: "14px 28px",
              marginBottom: "32px",
            }}
          >
            <Check size={20} color="#66BB6A" />
            <span style={{ color: "#A5D6A7", fontWeight: 700, fontSize: "0.9375rem" }}>
              You&apos;re on the list! We&apos;ll reach out soon. 🎉
            </span>
          </div>
        )}

        {/* Or join directly */}
        <p style={{ color: "var(--color-text-muted-dark)", fontSize: "0.875rem", marginBottom: "24px" }}>
          or
        </p>
        <div className="cta-buttons" style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
          <Link href="/signup" className="btn btn-accent" style={{ fontSize: "1rem", padding: "15px 36px" }}>
            🚀 Join Now — It&apos;s Free
          </Link>
          <Link href="/sos" className="btn btn-sos" style={{ fontSize: "1rem", padding: "15px 28px" }}>
            🚨 Report Emergency
          </Link>
        </div>

        {/* Privacy note */}
        <p
          style={{
            marginTop: "32px",
            color: "var(--color-text-subtle)",
            fontSize: "0.8rem",
          }}
        >
          🔒 No spam. No sharing. 100% free. By joining, you agree to our{" "}
          <Link href="/privacy" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
