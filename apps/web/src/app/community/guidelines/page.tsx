"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { COMMUNITY_PILLARS, COMMUNITY_RULES } from "@/lib/community-guidelines";
import Link from "next/link";
import { Heart, Shield, HelpCircle, ArrowRight } from "lucide-react";

export default function GuidelinesPage() {
  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif", paddingBottom: "80px" }}>
      <Navbar />

      <div className="container" style={{ paddingTop: "120px", maxWidth: "800px", margin: "0 auto", paddingLeft: "24px", paddingRight: "24px" }}>
        
        {/* HERO */}
        <div style={{ textAlign: "center", marginBottom: "48px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#66BB6A", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
            <Heart size={16} fill="#66BB6A" /> OUR PROMISE
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-0.03em", marginTop: "8px", marginBottom: "16px", textAlign: "center", background: "linear-gradient(to right, #A5D6A7, #66BB6A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            One Community. One Standard. Compassion.
          </h1>
          <p style={{ color: "rgba(232, 245, 233, 0.65)", fontSize: "1.1rem", lineHeight: 1.6, textAlign: "center", maxWidth: "650px" }}>
            EcoVerse is built on the belief that how we treat each other reflects how we treat animals.
          </p>
        </div>

        {/* Quote Block */}
        <div 
          style={{
            borderLeft: "4px solid #66BB6A",
            padding: "20px 24px",
            background: "rgba(102, 187, 106, 0.04)",
            borderRadius: "0 16px 16px 0",
            marginBottom: "48px",
            fontStyle: "italic",
            lineHeight: 1.7,
            color: "#A5D6A7"
          }}
        >
          <p style={{ fontSize: "1.15rem", fontWeight: 600, margin: 0 }}>
            "थोड़ा सा समय किसी जानवर की जान बचा सकता है।<br/>
            A few minutes of your time can save an animal's life.<br/>
            That same time, spent in anger, saves no one."
          </p>
        </div>

        {/* 4 Pillars Section */}
        <div style={{ marginBottom: "56px" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>🌟</span> The Four Pillars of EcoVerse
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="pillars-grid">
            {COMMUNITY_PILLARS.map((pillar, i) => (
              <div 
                key={i} 
                style={{ 
                  background: "rgba(21, 35, 23, 0.45)", 
                  border: "1px solid rgba(102, 187, 106, 0.12)", 
                  borderRadius: "16px", 
                  padding: "24px" 
                }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: "12px" }}>{pillar.icon}</div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>{pillar.title}</h3>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.5, color: "rgba(232, 245, 233, 0.6)" }}>{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rules Section */}
        <div style={{ marginBottom: "56px" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Shield size={22} className="text-green-400" /> Community Rules & Conduct
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {COMMUNITY_RULES.map((rule, idx) => (
              <div 
                key={idx}
                style={{ 
                  background: "rgba(21, 35, 23, 0.3)", 
                  borderRadius: "16px", 
                  padding: "24px",
                  border: "1px solid rgba(102, 187, 106, 0.08)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF" }}>{rule.rule}</h3>
                  <span style={{ fontSize: "0.72rem", background: "rgba(255, 167, 38, 0.12)", color: "#FFA726", border: "1px solid rgba(255, 167, 38, 0.2)", padding: "4px 10px", borderRadius: "6px", fontWeight: 600 }}>
                    Consequence: {rule.consequence}
                  </span>
                </div>
                <p style={{ fontSize: "0.9rem", color: "rgba(232, 245, 233, 0.65)", marginTop: "12px", lineHeight: 1.6 }}>
                  {rule.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* If you see a conflict section */}
        <div 
          style={{ 
            background: "rgba(21, 35, 23, 0.45)", 
            border: "1px solid rgba(102, 187, 106, 0.12)", 
            borderRadius: "20px", 
            padding: "32px",
            marginBottom: "56px"
          }}
        >
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <HelpCircle size={20} className="text-green-400" /> If You Witness Conflict
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(102,187,106,0.15)", border: "1px solid #66BB6A", display: "flex", alignItems: "center", justifyContent: "center", color: "#A5D6A7", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                1
              </div>
              <p style={{ fontSize: "0.9rem", color: "rgba(232, 245, 233, 0.7)", margin: 0, lineHeight: 1.5 }}>
                <strong>Don't engage publicly.</strong> Step away from the comment or thread. Responding with anger escalates tension and diverts focus from saving animals.
              </p>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(102,187,106,0.15)", border: "1px solid #66BB6A", display: "flex", alignItems: "center", justifyContent: "center", color: "#A5D6A7", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                2
              </div>
              <p style={{ fontSize: "0.9rem", color: "rgba(232, 245, 233, 0.7)", margin: 0, lineHeight: 1.5 }}>
                <strong>Click ⚑ Report.</strong> Use the report flag on the post or comment card to notify the community moderator queue.
              </p>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(102,187,106,0.15)", border: "1px solid #66BB6A", display: "flex", alignItems: "center", justifyContent: "center", color: "#A5D6A7", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                3
              </div>
              <p style={{ fontSize: "0.9rem", color: "rgba(232, 245, 233, 0.7)", margin: 0, lineHeight: 1.5 }}>
                <strong>Moderator review.</strong> Our moderation team will review the flagged item within 24 hours to check rules compliance.
              </p>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(102,187,106,0.15)", border: "1px solid #66BB6A", display: "flex", alignItems: "center", justifyContent: "center", color: "#A5D6A7", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                4
              </div>
              <p style={{ fontSize: "0.9rem", color: "rgba(232, 245, 233, 0.7)", margin: 0, lineHeight: 1.5 }}>
                <strong>Private resolution.</strong> If rules were broken, the authors are contacted privately. We do not participate in public callouts or arguments.
              </p>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(102,187,106,0.15)", border: "1px solid #66BB6A", display: "flex", alignItems: "center", justifyContent: "center", color: "#A5D6A7", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                5
              </div>
              <p style={{ fontSize: "0.9rem", color: "rgba(232, 245, 233, 0.7)", margin: 0, lineHeight: 1.5 }}>
                <strong>Collective learning.</strong> Periodically, guidelines and resolutions are shared anonymously as general case studies to help members learn constructive paths.
              </p>
            </div>
          </div>
        </div>

        {/* Closing card */}
        <div 
          style={{
            background: "linear-gradient(135deg, rgba(46, 125, 50, 0.2), rgba(102, 187, 106, 0.08))",
            border: "1px solid rgba(102, 187, 106, 0.22)",
            borderRadius: "24px",
            padding: "40px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>
            You are here because you care.
          </h2>
          <h3 style={{ fontSize: "1.25rem", color: "#A5D6A7", fontWeight: 600, marginBottom: "16px" }}>
            That already makes you extraordinary.
          </h3>
          <p style={{ color: "rgba(232, 245, 233, 0.6)", fontSize: "0.92rem", marginBottom: "32px", maxWidth: "550px" }}>
            हम सब मिलकर बदलाव ला सकते हैं। Together, we can change everything. Choose your voice and let's work as one family.
          </p>

          <Link 
            href="/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#2E7D32",
              color: "#FFFFFF",
              textDecoration: "none",
              padding: "14px 32px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "0.95rem",
              boxShadow: "0 4px 14px rgba(46, 125, 50, 0.3)",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            Join the Movement <ArrowRight size={16} />
          </Link>
        </div>

      </div>

      <Footer />
      <style>{`
        @media (max-width: 640px) {
          .pillars-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
