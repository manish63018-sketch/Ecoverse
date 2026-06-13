"use client";

import React from "react";
import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top, #121e14 0%, #050806 100%)",
        color: "#FFFFFF",
        fontFamily: "var(--font-sans), sans-serif",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "rgba(21, 35, 23, 0.45)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(102, 187, 106, 0.15)",
          borderRadius: "24px",
          padding: "48px 32px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <div
          style={{
            background: "rgba(102, 187, 106, 0.1)",
            padding: "16px",
            borderRadius: "50%",
            border: "1px solid rgba(102, 187, 106, 0.25)",
            color: "#66BB6A",
            display: "flex",
          }}
        >
          <Compass size={48} className="animate-spin-slow" />
        </div>

        <div>
          <h1
            style={{
              fontSize: "4rem",
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              background: "linear-gradient(to right, #A5D6A7, #66BB6A)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </h1>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "12px", marginBottom: "8px" }}>
            Lost in the Wilderness?
          </h2>
          <p style={{ color: "rgba(232, 245, 233, 0.6)", fontSize: "0.95rem", lineHeight: 1.5, margin: 0 }}>
            The page you are looking for doesn't exist or has been relocated to another territory.
          </p>
        </div>

        <div style={{ width: "100%", marginTop: "8px" }}>
          <Link
            href="/dashboard"
            style={{
              background: "linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "12px",
              padding: "14px 28px",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 8px 20px rgba(46, 125, 50, 0.3)",
              textDecoration: "none",
              width: "100%",
              boxSizing: "border-box",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            className="home-btn"
          >
            <Home size={18} />
            Go to Dashboard
          </Link>
        </div>
      </div>

      <style>{`
        .home-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(46, 125, 50, 0.45) !important;
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
}
