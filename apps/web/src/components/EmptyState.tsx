"use client";

import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaHref?: string;
  onClick?: () => void;
}

export default function EmptyState({
  emoji,
  title,
  subtitle,
  ctaText,
  ctaHref,
  onClick,
}: EmptyStateProps) {
  return (
    <div
      style={{
        background: "rgba(21, 35, 23, 0.25)",
        border: "1px dashed rgba(102, 187, 106, 0.2)",
        borderRadius: "16px",
        padding: "48px 24px",
        textAlign: "center",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>{emoji}</div>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "8px" }}>
        {title}
      </h3>
      <p
        style={{
          color: "rgba(255, 255, 255, 0.55)",
          fontSize: "0.9rem",
          lineHeight: 1.5,
          marginBottom: ctaText ? "24px" : "0",
          maxWidth: "400px",
          margin: "0 auto 24px",
        }}
      >
        {subtitle}
      </p>

      {ctaText && (
        <>
          {ctaHref ? (
            <Link
              href={ctaHref}
              style={{
                display: "inline-flex",
                background: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
                color: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.85rem",
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(46,125,50,0.3)",
              }}
            >
              {ctaText}
            </Link>
          ) : (
            <button
              onClick={onClick}
              style={{
                display: "inline-flex",
                background: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
                color: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.85rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(46,125,50,0.3)",
              }}
            >
              {ctaText}
            </button>
          )}
        </>
      )}
    </div>
  );
}
