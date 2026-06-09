"use client";

import React from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "EcoVerse SOS saved a dog's life near my apartment. I reported it at 11pm, and within 8 minutes a volunteer was there. I cried seeing the notification 'Rescue Successful'.",
    name: "Meera Nair",
    role: "Animal Lover, Hyderabad",
    emoji: "🐕",
    color: "#66BB6A",
  },
  {
    quote:
      "As an NGO we were spending hours coordinating on WhatsApp groups. EcoVerse gave us a proper system — case tracking, volunteer dispatch, and public visibility. Game changer.",
    name: "Dr. Rajan Pillai",
    role: "Director, PAWS Hyderabad",
    emoji: "🏥",
    color: "#42A5F5",
  },
  {
    quote:
      "I volunteer every weekend and EcoVerse helps me find cases near my route. I've helped 12 animals in 2 months. The community pushes you to do more.",
    name: "Arjun Sharma",
    role: "Verified Volunteer, Bengaluru",
    emoji: "🤝",
    color: "#FFA726",
  },
  {
    quote:
      "Adopted my Indie dog Bruno through EcoVerse. The listing had full medical history, vaccination records. Adoption process was transparent and safe.",
    name: "Kavya Reddy",
    role: "Adopter, Pune",
    emoji: "🏡",
    color: "#AB47BC",
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      style={{
        background: "var(--color-bg-dark)",
        padding: "100px 24px",
      }}
    >
      <div className="container">
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
            From Our Community
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
            Stories that inspire us every day
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              style={{
                background: "var(--color-surface-dark)",
                border: "1px solid var(--color-border-dark)",
                borderRadius: "var(--radius-xl)",
                padding: "32px",
                position: "relative",
                overflow: "hidden",
                transition: "all var(--transition-base)",
                animationDelay: `${i * 100}ms`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.borderColor = `${t.color}44`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${t.color}18`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-dark)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Top color bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: `linear-gradient(90deg, transparent, ${t.color}, transparent)`,
                }}
              />

              {/* Quote icon */}
              <Quote size={24} color={t.color} style={{ marginBottom: "20px", opacity: 0.8 }} />

              {/* Quote text */}
              <p
                style={{
                  color: "var(--color-text-muted-dark)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.75,
                  marginBottom: "28px",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: `${t.color}18`,
                    border: `2px solid ${t.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    flexShrink: 0,
                  }}
                >
                  {t.emoji}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#E8F5E9" }}>{t.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted-dark)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
