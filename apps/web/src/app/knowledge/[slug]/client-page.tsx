"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2, Twitter, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { STARTER_ARTICLES, ArticleData } from "@/lib/articles";

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const found = STARTER_ARTICLES.find((a) => a.slug === slug);
    if (found) {
      setArticle(found);
    } else {
      toast.error("Article not found");
      router.push("/knowledge");
    }
  }, [slug, router]);

  if (!article) return null;

  const related = STARTER_ARTICLES.filter((a) => a.category === article.category && a.slug !== article.slug).slice(0, 3);
  const fallbackRelated = related.length > 0 ? related : STARTER_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareText = `Check out this article on EcoVerse: ${article.title}`;

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif" }}>
      <Navbar />

      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", paddingTop: "120px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px" }}>
        
        <Link
          href="/knowledge"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "0.88rem", marginBottom: "24px" }}
        >
          <ArrowLeft size={16} /> Back to Knowledge Hub
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "3fr 1.2fr", gap: "40px" }} className="article-layout">
          
          <article>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "16px" }}>
              <span style={{ background: "rgba(102,187,106,0.12)", color: "#A5D6A7", padding: "4px 10px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {article.category}
              </span>
              <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                · {article.readTime}
              </span>
            </div>

            <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 2.6rem)", fontWeight: 900, lineHeight: 1.2, margin: "0 0 24px 0", letterSpacing: "-0.02em" }}>
              {article.title}
            </h1>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(102,187,106,0.1)", paddingBottom: "20px", marginBottom: "32px", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(102,187,106,0.15)", color: "#A5D6A7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                  {article.authorInitial}
                </div>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>{article.author}</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Published {article.date}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + (typeof window !== "undefined" ? window.location.href : ""))}`}
                  target="_blank"
                  rel="noreferrer"
                  style={shareBtnStyle}
                  title="Share on WhatsApp"
                >
                  <Share2 size={14} />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={shareBtnStyle}
                  title="Share on Twitter"
                >
                  <Twitter size={14} />
                </a>
                <button
                  onClick={handleCopy}
                  style={shareBtnStyle}
                  title="Copy Link"
                >
                  {copied ? <Check size={14} color="#66BB6A" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div
              className="article-content-body"
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.75,
                color: "rgba(255, 255, 255, 0.85)",
              }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>

          <aside style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ borderBottom: "1px solid rgba(102,187,106,0.15)", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: 0 }}>Related Articles</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {fallbackRelated.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/knowledge/${rel.slug}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    textDecoration: "none",
                    background: "rgba(21, 35, 23, 0.25)",
                    border: "1px solid rgba(102, 187, 106, 0.08)",
                    borderRadius: "12px",
                    padding: "16px",
                    transition: "all 0.2s",
                  }}
                  className="related-item"
                >
                  <span style={{ fontSize: "0.65rem", color: "#66BB6A", fontWeight: 700, textTransform: "uppercase" }}>
                    {rel.category}
                  </span>
                  <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.35 }}>
                    {rel.title}
                  </h4>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                    {rel.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </aside>

        </div>

      </div>

      <Footer />

      <style>{`
        .article-content-body h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #FFFFFF;
          margin-top: 36px;
          margin-bottom: 16px;
        }
        .article-content-body h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #A5D6A7;
          margin-top: 24px;
          margin-bottom: 12px;
        }
        .article-content-body p {
          margin-bottom: 20px;
        }
        .article-content-body ul {
          margin-bottom: 20px;
          padding-left: 20px;
        }
        .article-content-body li {
          margin-bottom: 8px;
        }
        .related-item:hover {
          border-color: rgba(102, 187, 106, 0.25) !important;
          background: rgba(21, 35, 23, 0.45) !important;
        }
        @media (max-width: 800px) {
          .article-layout { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </div>
  );
}

const shareBtnStyle: React.CSSProperties = {
  background: "rgba(102,187,106,0.1)",
  border: "1px solid rgba(102,187,106,0.25)",
  color: "#A5D6A7",
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.15s ease",
};
