"use client";

import React, { useState } from "react";
import { Search, BookOpen, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PageHero from "@/components/PageHero";
import ArticleCard from "@/components/ArticleCard";
import { STARTER_ARTICLES } from "@/lib/articles";
import Link from "next/link";

const CATEGORIES = ["All", "Rescue Guide", "Laws & Rights", "Vegan Living", "Animal Health", "Adoption Tips", "News"];

export default function KnowledgePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Featured article (first one)
  const featuredArticle = STARTER_ARTICLES[0];

  // Filtering logic
  const filteredArticles = STARTER_ARTICLES.filter((art) => {
    const matchesCat = activeCategory === "All" || art.category === activeCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif" }}>
      <Navbar />

      <PageHero
        tag="📚 EcoVerse Learn"
        h1="Knowledge Hub & Guides"
        subtitle="Everything you need to know about animal rescue, Indian laws, and vegan living."
      />

      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px" }}>
        
        {/* Search & Category Filter Section */}
        <div
          style={{
            background: "rgba(21, 35, 23, 0.45)",
            border: "1px solid rgba(102, 187, 106, 0.12)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Search bar */}
          <div style={{ position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(102,187,106,0.5)" }} />
            <input
              type="text"
              placeholder="Search articles, guides, or laws..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(10, 16, 11, 0.6)",
                border: "1px solid rgba(102,187,106,0.22)",
                borderRadius: "10px",
                padding: "12px 14px 12px 42px",
                color: "#FFFFFF",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          {/* Categories Horizontal Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", borderTop: "1px solid rgba(102,187,106,0.08)", paddingTop: "16px" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? "rgba(102, 187, 106, 0.2)" : "rgba(10, 16, 11, 0.4)",
                  border: `1px solid ${activeCategory === cat ? "rgba(102, 187, 106, 0.5)" : "rgba(102, 187, 106, 0.15)"}`,
                  color: activeCategory === cat ? "#A5D6A7" : "rgba(232, 245, 233, 0.7)",
                  padding: "8px 16px",
                  borderRadius: "999px",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured article (large card) - shown only when category is 'All' and no search query */}
        {!searchQuery && activeCategory === "All" && featuredArticle && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(46,125,50,0.15) 0%, rgba(21,35,23,0.45) 100%)",
              border: "1px solid rgba(102, 187, 106, 0.25)",
              borderRadius: "20px",
              padding: "40px",
              marginBottom: "48px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
            className="featured-card"
          >
            <div>
              <span style={{ background: "rgba(239,83,80,0.15)", color: "#EF5350", padding: "4px 12px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Featured {featuredArticle.category}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1.25, margin: 0 }}>
                {featuredArticle.title}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: "700px", margin: 0 }}>
                {featuredArticle.excerpt}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(102,187,106,0.1)", paddingTop: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(102,187,106,0.15)", color: "#A5D6A7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                  {featuredArticle.authorInitial}
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{featuredArticle.author}</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{featuredArticle.date}</div>
                </div>
              </div>

              <Link
                href={`/knowledge/${featuredArticle.slug}`}
                style={{
                  background: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
                  color: "#FFFFFF",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(46,125,50,0.3)",
                }}
              >
                Read Article →
              </Link>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "28px" }}>
          {filteredArticles.map((art) => (
            <ArticleCard key={art.slug} article={art} />
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>No articles match your search criteria.</p>
          </div>
        )}

        {/* Emergency SOS Banner */}
        <div
          style={{
            marginTop: "64px",
            background: "linear-gradient(135deg, rgba(239,83,80,0.15) 0%, rgba(21,35,23,0.4) 100%)",
            border: "1px solid rgba(239,83,80,0.3)",
            borderRadius: "16px",
            padding: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
          className="emergency-banner"
        >
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ background: "#EF5350", padding: "10px", borderRadius: "10px", display: "flex" }}>
              <AlertTriangle size={24} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#EF5350", margin: 0 }}>
                Are you witnessing a life-threatening animal emergency?
              </h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.88rem", marginTop: "4px", margin: "4px 0 0 0" }}>
                Do not wait. Report the case immediately to dispatch alerts to nearby volunteer rescuers.
              </p>
            </div>
          </div>
          <Link
            href="/rescue"
            style={{
              background: "#EF5350",
              color: "#FFFFFF",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(239,83,80,0.35)",
            }}
          >
            🚨 Report Emergency SOS
          </Link>
        </div>

      </div>

      <Footer />

      <style>{`
        @media (max-width: 600px) {
          .featured-card { padding: 24px !important; }
          .emergency-banner { padding: 20px !important; }
        }
      `}</style>
    </div>
  );
}
