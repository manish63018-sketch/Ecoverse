"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  ShieldCheck, Heart, Users, Sparkles, Building2, Flame, 
  MapPin, CheckCircle, ArrowRight, Instagram, Github 
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif", paddingBottom: "80px" }}>
      <Navbar />

      {/* Hero Section */}
      <div style={{ paddingTop: "120px", paddingBottom: "60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "40px", left: "50%", transform: "translateX(-50%)", width: "700px", height: "300px", background: "radial-gradient(ellipse, rgba(102,187,106,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        
        <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(102,187,106,0.08)", border: "1px solid rgba(102,187,106,0.2)", padding: "6px 16px", borderRadius: "20px", color: "#A5D6A7", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "24px" }}>
            <Sparkles size={13} fill="#A5D6A7" /> Our Story & Mission
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "20px" }}>
            One Earth. One Community.<br />
            <span style={{ background: "linear-gradient(135deg, #66BB6A 0%, #A5D6A7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Infinite Compassion.
            </span>
          </h1>

          <p style={{ color: "rgba(232,245,233,0.65)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: "680px", margin: "0 auto 32px" }}>
            EcoVerse is India&apos;s first unified community platform built specifically for animal welfare. We connect animal lovers, feeders, rescuers, veterinary doctors, and non-profit organizations onto a single coordinate-safe grid.
          </p>
        </div>
      </div>

      {/* Vision & Core Pillars */}
      <div className="container" style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "64px" }}>
          {[
            {
              icon: <Heart size={24} color="#66BB6A" />,
              title: "Compassion-First Coordination",
              desc: "Providing instant location-precise alert triggers for injured or sick stray animals so nearby helpers can reach within minutes."
            },
            {
              icon: <ShieldCheck size={24} color="#66BB6A" />,
              title: "Privacy-Safe Mapping",
              desc: "Ensuring exact reporter locations are never exposed. We mask coordinate inputs to broad neighborhood area boundaries for general safety."
            },
            {
              icon: <Users size={24} color="#66BB6A" />,
              title: "NGO & Partner Directory",
              desc: "Bringing verified Indian shelters, ambulances, and animal advocacy organizations onto a single indexed search grid."
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              style={{
                background: "rgba(21, 35, 23, 0.45)",
                border: "1px solid rgba(102, 187, 106, 0.12)",
                borderRadius: "20px",
                padding: "28px 24px",
                transition: "all 0.25s"
              }}
              className="about-pillar-card"
            >
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(102,187,106,0.08)", border: "1px solid rgba(102,187,106,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "8px", color: "#FFFFFF" }}>{item.title}</h3>
              <p style={{ fontSize: "0.9rem", color: "rgba(232, 245, 233, 0.55)", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Detailed Narrative Section */}
        <div 
          style={{
            background: "rgba(21, 35, 23, 0.3)",
            border: "1px solid rgba(102, 187, 106, 0.1)",
            borderRadius: "24px",
            padding: "40px",
            lineHeight: 1.75
          }}
        >
          <h2 style={{ fontSize: "1.65rem", fontWeight: 800, color: "#A5D6A7", marginBottom: "16px", marginTop: 0 }}>
            Why EcoVerse Exists
          </h2>
          <p style={{ color: "rgba(232, 245, 233, 0.75)", marginBottom: "18px" }}>
            Stray animal populations in Indian cities are frequently vulnerable to traffic accidents, severe weather, disease, and lack of clean food and water. While thousands of compassionate citizens want to help, coordination is often fragmented across localized messaging groups and social media channels.
          </p>
          <p style={{ color: "rgba(232, 245, 233, 0.75)", marginBottom: "18px" }}>
            EcoVerse provides the structural missing link. By building a platform with integrated state-level location indexes, real-time alert routing engines, vegan community directories, and a transparent medical donation stream (driven entirely by non-intrusive page-view ad revenue), we enable anyone to take action immediately.
          </p>

          {/* The Creator */}
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF", marginTop: "32px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} color="#66BB6A" fill="#66BB6A" /> The Creator
          </h3>

          <div style={{
            display: "flex", alignItems: "center", gap: "18px",
            background: "rgba(102, 187, 106, 0.05)",
            border: "1px solid rgba(102, 187, 106, 0.18)",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "24px"
          }}>
            {/* Avatar */}
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #2E7D32, #66BB6A)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", fontWeight: 900, color: "#FFFFFF",
              boxShadow: "0 0 0 3px rgba(102,187,106,0.25)"
            }}>
              M
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                <span style={{ fontSize: "1rem", fontWeight: 800, color: "#FFFFFF" }}>mannish_2323</span>
                <span style={{
                  fontSize: "0.68rem", fontWeight: 700, padding: "3px 10px",
                  borderRadius: "20px", background: "rgba(102,187,106,0.15)",
                  color: "#66BB6A", border: "1px solid rgba(102,187,106,0.3)",
                  textTransform: "uppercase", letterSpacing: "0.05em"
                }}>Founder</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(232, 245, 233, 0.6)", lineHeight: 1.55 }}>
                Animal lover, developer &amp; founder of EcoVerse — building tech that gives voice to those who cannot speak for themselves. 🐾
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
            <a
              href="https://instagram.com/mannish_2323"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "10px 18px",
                borderRadius: "10px",
                color: "#E8F5E9",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(102, 187, 106, 0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)"}
            >
              <Instagram size={15} color="#A5D6A7" /> Follow @mannish_2323
            </a>
            <a
              href="https://github.com/manish63018-sketch"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "10px 18px",
                borderRadius: "10px",
                color: "#E8F5E9",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(102, 187, 106, 0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)"}
            >
              <Github size={15} color="#A5D6A7" /> GitHub Profile
            </a>
          </div>
        </div>
      </div>

      <Footer />
      <style>{`
        .about-pillar-card:hover {
          border-color: rgba(102, 187, 106, 0.25) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 187, 106, 0.05);
        }
      `}</style>
    </div>
  );
}
