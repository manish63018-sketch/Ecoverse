"use client";

import React from "react";
import Link from "next/link";
import { EcoVerseLogo } from "@/components/brand/Logo";
import { Heart, MapPin, Mail, Github, Twitter, Instagram } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "EcoVerse SOS", href: "/sos" },
    { label: "Rescue Cases", href: "/rescue" },
    { label: "Community Map", href: "/map" },
    { label: "Adopt Animals", href: "/adopt" },
    { label: "Knowledge Hub", href: "/knowledge" },
  ],
  Community: [
    { label: "NGO Directory", href: "/ngos" },
    { label: "Volunteer Network", href: "/volunteers" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "About EcoVerse", href: "/about" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Moderation Policy", href: "/moderation" },
    { label: "Contact Us", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--color-bg-dark)",
        borderTop: "1px solid var(--color-border-dark)",
        paddingTop: "80px",
        paddingBottom: "40px",
      }}
    >
      <div className="container">
        {/* Top grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "48px",
            marginBottom: "64px",
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "20px" }}>
              <EcoVerseLogo theme="dark" size={40} />
            </Link>
            <p style={{ color: "var(--color-text-muted-dark)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "24px", maxWidth: "300px" }}>
              One Earth. One Community. Infinite Compassion.
              <br />
              India&apos;s first unified platform for animal welfare — rescue, adopt, connect, and protect together.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-subtle)" }}>
              <MapPin size={14} />
              <span style={{ fontSize: "0.8125rem" }}>Hyderabad, India 🇮🇳</span>
            </div>
            {/* Social links */}
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              {[
                { icon: <Twitter size={18} />, href: "https://twitter.com/ecoversein", label: "Twitter" },
                { icon: <Instagram size={18} />, href: "https://instagram.com/ecoversein", label: "Instagram" },
                { icon: <Github size={18} />, href: "https://github.com/ecoverse-in", label: "GitHub" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(102,187,106,0.08)",
                    border: "1px solid rgba(102,187,106,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-text-muted-dark)",
                    transition: "all var(--transition-base)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(102,187,106,0.15)";
                    (e.currentTarget as HTMLElement).style.color = "#66BB6A";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(102,187,106,0.08)";
                    (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted-dark)";
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  marginBottom: "20px",
                }}
              >
                {title}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{
                        color: "var(--color-text-muted-dark)",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        transition: "color var(--transition-fast)",
                      }}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.color = "#A5D6A7"}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.color = "var(--color-text-muted-dark)"}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--color-border-dark)", marginBottom: "32px" }} />

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <p style={{ color: "var(--color-text-subtle)", fontSize: "0.875rem" }}>
            © {new Date().getFullYear()} EcoVerse by{" "}
            <a
              href="https://instagram.com/mannish_2323"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#66BB6A", textDecoration: "none", fontWeight: 600 }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.textDecoration = "underline"}
              onMouseLeave={(e) => (e.target as HTMLElement).style.textDecoration = "none"}
            >
              mannish_2323
            </a>
            . All rights reserved.
          </p>

          <p
            style={{
              color: "var(--color-text-subtle)",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Made with <Heart size={14} color="#E53935" fill="#E53935" /> for every animal in India
          </p>
        </div>
      </div>

      <style>{`
        .footer-grid {
          grid-template-columns: 2fr 1fr 1fr 1fr;
        }
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
