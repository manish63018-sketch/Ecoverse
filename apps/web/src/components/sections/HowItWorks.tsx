"use client";

import React from "react";
import { UserPlus, MapPin, Bell, CheckCircle } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: <UserPlus size={28} />,
    title: "Join & Set Your Role",
    description:
      "Sign up in 60 seconds. Tell us who you are — rescuer, volunteer, feeder, NGO, or animal lover. Set your city and availability.",
    color: "#66BB6A",
    bgColor: "rgba(102,187,106,0.08)",
  },
  {
    step: "02",
    icon: <MapPin size={28} />,
    title: "Spot an Animal in Need",
    description:
      "See a stray in distress? Tap 'Report SOS'. Upload a photo, drop a pin, describe the situation. Takes 30 seconds.",
    color: "#E53935",
    bgColor: "rgba(229,57,53,0.08)",
  },
  {
    step: "03",
    icon: <Bell size={28} />,
    title: "Volunteers Get Alerted",
    description:
      "Nearby verified volunteers and NGOs instantly receive push notifications. Smart radius expansion ensures someone always responds.",
    color: "#42A5F5",
    bgColor: "rgba(66,165,245,0.08)",
  },
  {
    step: "04",
    icon: <CheckCircle size={28} />,
    title: "Animal Gets Rescued",
    description:
      "Track the case live. Volunteer updates status. Community celebrates. Every resolved case builds a stronger network.",
    color: "#FFA726",
    bgColor: "rgba(255,167,38,0.08)",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        background: "rgba(21, 35, 23, 0.82)",
        borderTop: "1px solid var(--color-border-dark)",
        padding: "100px 24px",
      }}
    >
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
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
            How EcoVerse Works
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
            From crisis to rescue in minutes
          </h2>
          <p style={{ color: "var(--color-text-muted-dark)", fontSize: "1.1rem", maxWidth: "520px", margin: "0 auto" }}>
            A simple flow that empowers every citizen to be a hero for animals in need.
          </p>
        </div>

        {/* Steps */}
        <div
          className="steps-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "32px",
            position: "relative",
          }}
        >
          {/* Connector line (desktop only) */}
          <div
            style={{
              position: "absolute",
              top: "80px",
              left: "calc(12.5%)",
              right: "calc(12.5%)",
              height: "2px",
              background: "linear-gradient(90deg, rgba(102,187,106,0.1), rgba(102,187,106,0.4), rgba(102,187,106,0.1))",
              zIndex: 0,
            }}
          />

          {steps.map((step, i) => (
            <div
              key={step.step}
              className="step-card"
              style={{
                position: "relative",
                zIndex: 1,
                background: step.bgColor,
                border: `1px solid ${step.color}33`,
                borderRadius: "var(--radius-xl)",
                padding: "36px 28px",
                transition: "all var(--transition-base)",
                animationDelay: `${i * 120}ms`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px ${step.color}22`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Step number */}
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 800,
                  fontSize: "0.6875rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: step.color,
                  marginBottom: "20px",
                  opacity: 0.8,
                }}
              >
                STEP {step.step}
              </div>

              {/* Icon */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "var(--radius-lg)",
                  background: `${step.color}15`,
                  border: `1px solid ${step.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: step.color,
                  marginBottom: "24px",
                }}
              >
                {step.icon}
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: "#E8F5E9",
                  marginBottom: "12px",
                  letterSpacing: "-0.01em",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  color: "var(--color-text-muted-dark)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.7,
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
