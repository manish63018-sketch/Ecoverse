"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, AlertTriangle, Pin, Trash2, ArrowLeft, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface CommunityPost {
  id: string;
  author_name: string | null;
  author_id: string | null;
  content: string;
  category: string;
  is_pinned: boolean;
  is_reported: boolean;
  like_count: number;
  expires_at: string | null;
  created_at: string;
}

export default function AdminCommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moderationFilter, setModerationFilter] = useState("all");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch community posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleTogglePin = async (postId: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from("community_posts")
        .update({ is_pinned: !current })
        .eq("id", postId);

      if (error) throw error;
      toast.success(current ? "Post unpinned successfully" : "Post pinned to top of the feed!");

      await supabase.from("admin_logs").insert([{
        action: "toggle_pin",
        detail: `Toggled pin for post ${postId}`
      }]);

      fetchPosts();
    } catch (err) {
      toast.error("Pin action failed");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post from the community feed?")) return;
    try {
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
      toast.success("Post deleted successfully");

      await supabase.from("admin_logs").insert([{
        action: "delete_post",
        detail: `Deleted community post ${postId}`
      }]);

      fetchPosts();
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  const handleDismissFlags = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("community_posts")
        .update({ is_reported: false })
        .eq("id", postId);

      if (error) throw error;
      toast.success("Moderation flags dismissed");

      await supabase.from("admin_logs").insert([{
        action: "dismiss_flags",
        detail: `Dismissed report flags for post ${postId}`
      }]);

      fetchPosts();
    } catch (err) {
      toast.error("Dismiss flags failed");
    }
  };

  const filtered = posts.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.author_name?.toLowerCase().includes(q) || false;
      const matchContent = p.content?.toLowerCase().includes(q) || false;
      if (!matchName && !matchContent) return false;
    }
    if (moderationFilter === "reported" && !p.is_reported) return false;
    if (moderationFilter === "pinned" && !p.is_pinned) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", background: "#050f07", minHeight: "100vh", color: "#E8F5E9", fontFamily: "var(--font-sans), sans-serif" }}>
      {/* Sidebar Navigation */}
      <aside style={{ width: "260px", borderRight: "1px solid rgba(102, 187, 106, 0.15)", background: "rgba(10, 16, 11, 0.65)", display: "flex", flexDirection: "column", padding: "32px 24px" }}>
        <Link href="/" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#66BB6A", textDecoration: "none", marginBottom: "40px", display: "block" }}>
          ∞ EcoVerse Admin
        </Link>
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <Link href="/admin" style={linkStyle(false)}>📊 Overview</Link>
          <Link href="/admin/users" style={linkStyle(false)}>👥 Users Directory</Link>
          <Link href="/admin/rescue" style={linkStyle(false)}>🐾 Rescue Board</Link>
          <Link href="/admin/community" style={linkStyle(true)}>💬 Community Feed</Link>
          <Link href="/dashboard" style={linkStyle(false)}>🏠 User Dashboard</Link>
        </nav>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: "40px" }}>
        <div style={{ marginBottom: "32px" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#66BB6A", textDecoration: "none", fontSize: "0.85rem", fontWeight: 700, marginBottom: "12px" }}>
            <ArrowLeft size={14} /> Back to Overview
          </Link>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Community Moderation</h1>
          <p style={{ color: "rgba(232, 245, 233, 0.6)", marginTop: "4px" }}>Pin announcements, moderate reported posts, and review post auto-deletion schedules</p>
        </div>

        {/* Filters */}
        <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.15)", borderRadius: "14px", padding: "16px", marginBottom: "24px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(102, 187, 106, 0.4)" }} />
            <input
              type="text"
              placeholder="Search by author or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchStyle}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select value={moderationFilter} onChange={(e) => setModerationFilter(e.target.value)} style={selectStyle}>
              <option value="all">All Posts</option>
              <option value="reported">⚠️ Reported / Flagged</option>
              <option value="pinned">📌 Pinned Posts</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ width: "32px", height: "32px", border: "3px solid rgba(102,187,106,0.15)", borderRadius: "50%", borderTopColor: "#66BB6A", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filtered.map((p) => {
              const isExpired = p.expires_at ? new Date(p.expires_at).getTime() < Date.now() : false;

              return (
                <div key={p.id} style={{ background: "rgba(21, 35, 23, 0.45)", border: p.is_reported ? "1px solid rgba(239, 83, 80, 0.45)" : "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "16px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "0.95rem" }}>{p.author_name || "Anonymous"}</strong>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: "rgba(102, 187, 106, 0.1)", color: "#A5D6A7", textTransform: "capitalize" }}>
                        {p.category}
                      </span>
                      {p.is_pinned && (
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: "rgba(102,187,106,0.15)", color: "#66BB6A", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Pin size={10} /> PINNED
                        </span>
                      )}
                      {p.is_reported && (
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: "rgba(239, 83, 80, 0.15)", color: "#EF5350", display: "flex", alignItems: "center", gap: "4px" }}>
                          <ShieldAlert size={10} /> FLAGGED
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "rgba(232, 245, 233, 0.4)" }}>
                      {isExpired ? (
                        <span style={{ color: "rgba(255,255,255,0.25)" }}>⏱ Auto-deleted</span>
                      ) : (
                        <span>⏱ Expires: {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "Never"}</span>
                      )}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.9rem", color: "rgba(232, 245, 233, 0.95)", margin: "0 0 12px 0", whiteSpace: "pre-wrap" }}>
                    {p.content}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", borderTop: "1px solid rgba(102, 187, 106, 0.08)", paddingTop: "14px", fontSize: "0.8rem" }}>
                    <div style={{ color: "rgba(232, 245, 233, 0.4)" }}>
                      Likes: {p.like_count || 0} • Created: {new Date(p.created_at).toLocaleDateString()}
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {p.is_reported && (
                        <button onClick={() => handleDismissFlags(p.id)} style={{ ...pillActionStyle, color: "#66BB6A", borderColor: "rgba(102, 187, 106, 0.25)" }}>
                          Dismiss Flags
                        </button>
                      )}
                      <button onClick={() => handleTogglePin(p.id, p.is_pinned)} style={pillActionStyle}>
                        {p.is_pinned ? "Unpin Post" : "Pin Post"}
                      </button>
                      <button onClick={() => handleDeletePost(p.id)} style={{ ...pillActionStyle, color: "#EF5350", borderColor: "rgba(239, 83, 80, 0.25)" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

const linkStyle = (active: boolean): React.CSSProperties => ({
  textDecoration: "none",
  color: active ? "#66BB6A" : "rgba(232, 245, 233, 0.65)",
  fontSize: "0.9rem",
  fontWeight: active ? 700 : 500,
  padding: "10px 14px",
  background: active ? "rgba(102, 187, 106, 0.12)" : "transparent",
  borderRadius: "8px",
  transition: "all 0.15s",
});

const searchStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(10, 16, 11, 0.6)",
  border: "1px solid rgba(102, 187, 106, 0.18)",
  borderRadius: "8px",
  padding: "8px 12px 8px 32px",
  color: "#E8F5E9",
  fontSize: "0.85rem",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  background: "rgba(10, 16, 11, 0.6)",
  border: "1px solid rgba(102, 187, 106, 0.18)",
  borderRadius: "8px",
  padding: "6px 10px",
  color: "#E8F5E9",
  fontSize: "0.8rem",
  fontWeight: 600,
  outline: "none",
  cursor: "pointer",
};

const pillActionStyle: React.CSSProperties = {
  background: "rgba(10, 16, 11, 0.4)",
  border: "1px solid rgba(102, 187, 106, 0.22)",
  color: "#A5D6A7",
  borderRadius: "6px",
  padding: "5px 12px",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
};
