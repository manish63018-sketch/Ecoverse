"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export interface Article {
  slug: string;
  category: string; // e.g. "Rescue Guide"
  title: string;
  excerpt: string;
  author: string;
  authorInitial: string;
  date: string;
  readTime: string;
}

interface ArticleCardProps {
  article: Article;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Rescue Guide": { bg: "rgba(239,83,80,0.12)", text: "#EF5350" },
  "Laws & Rights": { bg: "rgba(66,165,245,0.12)", text: "#42A5F5" },
  "Vegan Living": { bg: "rgba(102,187,106,0.12)", text: "#A5D6A7" },
  "Animal Health": { bg: "rgba(255,167,38,0.12)", text: "#FFA726" },
  "Adoption Tips": { bg: "rgba(171,71,188,0.12)", text: "#BA68C8" },
  News: { bg: "rgba(255,255,255,0.06)", text: "#E8F5E9" },
};

export default function ArticleCard({ article }: ArticleCardProps) {
  const catColors = CATEGORY_COLORS[article.category] || {
    bg: "rgba(102,187,106,0.08)",
    text: "#A5D6A7",
  };

  return (
    <div
      style={{
        background: "rgba(21, 35, 23, 0.45)",
        border: "1px solid rgba(102, 187, 106, 0.12)",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "all 0.2s ease",
      }}
      className="article-card"
    >
      {/* Category Tag */}
      <div>
        <span
          style={{
            background: catColors.bg,
            color: catColors.text,
            padding: "4px 10px",
            borderRadius: "4px",
            fontSize: "0.68rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {article.category}
        </span>
      </div>

      {/* Title & Excerpt */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <h3
          style={{
            fontSize: "1.2rem",
            fontWeight: 800,
            color: "#FFFFFF",
            margin: 0,
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </h3>
        <p
          style={{
            color: "rgba(232, 245, 233, 0.6)",
            fontSize: "0.85rem",
            lineHeight: 1.5,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.excerpt}
        </p>
      </div>

      {/* Author & Footer info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(102, 187, 106, 0.08)",
          paddingTop: "14px",
          marginTop: "4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "rgba(102,187,106,0.15)",
              color: "#A5D6A7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            {article.authorInitial}
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#FFFFFF" }}>
              {article.author}
            </div>
            <div style={{ fontSize: "0.68rem", color: "rgba(232,245,233,0.4)" }}>
              {article.date} · {article.readTime}
            </div>
          </div>
        </div>

        {/* Read Link */}
        <Link
          href={`/knowledge/${article.slug}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            color: "#A5D6A7",
            fontWeight: 700,
            fontSize: "0.82rem",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
          className="read-link"
        >
          Read <ArrowRight size={13} />
        </Link>
      </div>

      <style>{`
        .article-card:hover {
          border-color: rgba(102, 187, 106, 0.25) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .read-link:hover {
          color: #FFFFFF !important;
        }
      `}</style>
    </div>
  );
}
