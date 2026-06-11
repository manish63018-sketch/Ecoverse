"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { 
  MessageSquare, Heart, Share2, Send, Flame, Sparkles, 
  User, Calendar, Filter, HeartHandshake, BookOpen, Eye, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  collection, query, orderBy, limit, onSnapshot, addDoc, 
  doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface Post {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  category: "general" | "rescue" | "veganism" | "adoption";
  createdAt: any;
  likes: number;
  likedBy: string[];
}

const CATEGORY_TAGS = {
  general: { label: "General", emoji: "🌿", color: "#66BB6A", bg: "rgba(102,187,106,0.1)" },
  rescue: { label: "Rescue Update", emoji: "🐾", color: "#EF5350", bg: "rgba(239,83,80,0.1)" },
  veganism: { label: "Veganism", emoji: "🌱", color: "#81C784", bg: "rgba(129,199,132,0.1)" },
  adoption: { label: "Adoption Story", emoji: "🏡", color: "#FFA726", bg: "rgba(255,167,38,0.1)" },
};

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  
  // Post Form states
  const [newContent, setNewContent] = useState("");
  const [category, setCategory] = useState<"general" | "rescue" | "veganism" | "adoption">("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load posts in real time
  useEffect(() => {
    const q = query(
      collection(db, "community_posts"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Post[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            authorName: data.authorName || "Anonymous Friend",
            authorRole: data.authorRole || "EcoVerse Supporter",
            content: data.content || "",
            category: data.category || "general",
            createdAt: data.createdAt,
            likes: data.likes || 0,
            likedBy: data.likedBy || [],
          });
        });
        setPosts(list);
        setLoading(false);
      },
      (error) => {
        console.warn("Failed to listen to community posts:", error);
        setLoading(false);
        
        // Seed fallback mock posts if database listener fails
        setPosts([
          {
            id: "mock-1",
            authorName: "Anjali Mehta",
            authorRole: "Verified Rescuer",
            content: "Just released a healthy pigeon back to the wild today! Thanks to Pune volunteers for the rehabilitation assistance. 🕊️❤️",
            category: "rescue",
            createdAt: { toDate: () => new Date(Date.now() - 3600000) },
            likes: 12,
            likedBy: [],
          },
          {
            id: "mock-2",
            authorName: "Rahul Verma",
            authorRole: "Vegan Advocate",
            content: "Found an amazing plant-based cafe in Hyderabad with delicious vegan cheese pizza! Highly recommend everyone to check out 'The Green Plate'. 🍕🌱",
            category: "veganism",
            createdAt: { toDate: () => new Date(Date.now() - 7200000) },
            likes: 8,
            likedBy: [],
          },
          {
            id: "mock-3",
            authorName: "Sanjana Sen",
            authorRole: "Foster Parent",
            content: "Little Bruno is officially adopted! From being hit by a car on the highway to finding a loving family, his journey has been nothing short of miraculous. Thank you EcoVerse! 🐶🏡",
            category: "adoption",
            createdAt: { toDate: () => new Date(Date.now() - 14400000) },
            likes: 24,
            likedBy: [],
          }
        ]);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle new post submit
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to post a message.");
      return;
    }
    if (!newContent.trim()) {
      toast.error("Post content cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Find role description
      let userRole = "Community Supporter";
      if (user.uid) {
        try {
          const profileRes = await fetch(`/api/users/location?firebase_uid=${user.uid}`);
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.profile?.roles?.length > 0) {
              const primaryRole = profileData.profile.roles[0];
              userRole = primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1);
            }
          }
        } catch (err) {
          console.warn("Could not fetch user role for post, using default.", err);
        }
      }

      await addDoc(collection(db, "community_posts"), {
        authorName: user.displayName || "EcoVerse Member",
        authorRole: userRole,
        content: newContent.trim(),
        category,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
      });

      toast.success("Post successfully shared on the feed!");
      setNewContent("");
      setCategory("general");
    } catch (err) {
      console.error("Failed to add post:", err);
      toast.error("Failed to share post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle like toggle
  const handleLikeToggle = async (post: Post) => {
    if (!user) {
      toast.error("Please login to like posts.");
      return;
    }

    const postRef = doc(db, "community_posts", post.id);
    const hasLiked = post.likedBy.includes(user.uid);

    try {
      if (hasLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(user.uid),
          likes: Math.max(0, post.likes - 1)
        });
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(user.uid),
          likes: post.likes + 1
        });
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  // Filter posts client-side
  const filteredPosts = posts.filter((post) => {
    if (filterCategory === "all") return true;
    return post.category === filterCategory;
  });

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif", paddingBottom: "80px" }}>
      <Navbar />

      <div className="container" style={{ paddingTop: "120px", maxWidth: "800px", margin: "0 auto", paddingLeft: "24px", paddingRight: "24px" }}>
        
        {/* Header (single h1 per page SEO rule) */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#66BB6A", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <MessageSquare size={16} /> Social Hub
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-0.03em", marginTop: "8px", marginBottom: "8px" }}>
            EcoVerse Community Social Feed
          </h1>
          <p style={{ color: "var(--color-text-muted-dark)", fontSize: "1.05rem", lineHeight: 1.6 }}>
            Share your animal welfare stories, celebrate successful rescues, post plant-based advocacy thoughts, or list foster updates in real time.
          </p>
        </div>

        {/* Post Creation Form */}
        <div 
          style={{
            background: "rgba(21, 35, 23, 0.45)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(102, 187, 106, 0.18)",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "32px"
          }}
        >
          {user ? (
            <form onSubmit={handlePostSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "50%",
                  background: "rgba(102, 187, 106, 0.2)", border: "1.5px solid #66BB6A",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#A5D6A7", fontWeight: "bold", fontSize: "0.95rem"
                }}>
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{user.displayName || "EcoVerse Member"}</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(232, 245, 233, 0.4)" }}>Posting publicly</div>
                </div>
              </div>

              <textarea
                placeholder="What's happening in your local animal community? Share updates, queries, or stories..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  background: "rgba(10, 16, 11, 0.6)",
                  border: "1px solid rgba(102, 187, 106, 0.22)",
                  borderRadius: "10px",
                  padding: "12px",
                  color: "#FFFFFF",
                  outline: "none",
                  fontSize: "0.92rem",
                  fontFamily: "var(--font-sans), sans-serif",
                  resize: "none",
                  boxSizing: "border-box"
                }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.8rem", color: "rgba(232, 245, 233, 0.5)" }}>Category:</span>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value as any)}
                    style={{
                      background: "rgba(10, 16, 11, 0.8)",
                      border: "1px solid rgba(102, 187, 106, 0.22)",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      color: "#FFFFFF",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      outline: "none"
                    }}
                  >
                    <option value="general">🌿 General Discussion</option>
                    <option value="rescue">🐾 Rescue Update</option>
                    <option value="veganism">🌱 Veganism & Care</option>
                    <option value="adoption">🏡 Adoption / Foster</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "linear-gradient(135deg, #66BB6A, #388E3C)",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)",
                    transition: "opacity 0.2s"
                  }}
                >
                  <Send size={14} />
                  {isSubmitting ? "Posting..." : "Share Post"}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: "center", padding: "16px" }}>
              <AlertCircle size={24} style={{ color: "#FFA726", margin: "0 auto 10px" }} />
              <p style={{ margin: "0 0 12px 0", fontSize: "0.92rem", color: "rgba(232,245,233,0.6)" }}>
                You must be logged in to share community updates.
              </p>
              <Link 
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "rgba(102, 187, 106, 0.12)",
                  border: "1px solid rgba(102, 187, 106, 0.3)",
                  borderRadius: "8px",
                  padding: "8px 18px",
                  color: "#A5D6A7",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textDecoration: "none"
                }}
              >
                Sign In to Post
              </Link>
            </div>
          )}
        </div>

        {/* Filter Row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "rgba(232, 245, 233, 0.45)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
            <Filter size={12} /> Filter Feed:
          </span>
          <button 
            onClick={() => setFilterCategory("all")}
            style={filterTabStyle(filterCategory === "all")}
          >
            All Updates
          </button>
          {Object.entries(CATEGORY_TAGS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              style={filterTabStyle(filterCategory === key)}
            >
              {value.emoji} {value.label}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{
              width: "36px", height: "36px",
              border: "3px solid rgba(102,187,106,0.15)",
              borderRadius: "50%",
              borderTopColor: "#66BB6A",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto",
            }} />
            <p style={{ color: "rgba(232,245,233,0.4)", fontSize: "0.875rem", marginTop: "16px" }}>
              Loading social feed...
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{
            background: "rgba(21, 35, 23, 0.2)",
            border: "1px dashed rgba(102, 187, 106, 0.12)",
            borderRadius: "16px",
            padding: "48px 24px",
            textAlign: "center"
          }}>
            <p style={{ color: "rgba(232, 245, 233, 0.5)", fontSize: "1rem" }}>No posts found in this category.</p>
            <p style={{ color: "rgba(232, 245, 233, 0.3)", fontSize: "0.85rem", marginTop: "4px" }}>Be the first one to write a community post!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredPosts.map((post) => {
              const tag = CATEGORY_TAGS[post.category] || CATEGORY_TAGS.general;
              const hasLiked = user && post.likedBy.includes(user.uid);
              const postDateStr = post.createdAt?.toDate 
                ? post.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                : "recently";

              return (
                <div
                  key={post.id}
                  style={{
                    background: "rgba(21, 35, 23, 0.45)",
                    border: "1px solid rgba(102, 187, 106, 0.12)",
                    borderRadius: "16px",
                    padding: "24px",
                    transition: "all 0.2s"
                  }}
                  className="post-card"
                >
                  {/* Card Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "14px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "rgba(102, 187, 106, 0.1)", border: "1px solid rgba(102, 187, 106, 0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#A5D6A7", fontWeight: 700, fontSize: "0.9rem"
                      }}>
                        {post.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#FFFFFF" }}>{post.authorName}</span>
                          <span style={{ fontSize: "0.68rem", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", background: tag.bg, color: tag.color }}>
                            {tag.label}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "rgba(232, 245, 233, 0.4)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={10} />
                          <span>{postDateStr}</span>
                          <span style={{ color: "rgba(255,255,255,0.15)" }}>•</span>
                          <span>{post.authorRole}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "rgba(232, 245, 233, 0.85)", margin: "0 0 16px 0", whiteSpace: "pre-wrap" }}>
                    {post.content}
                  </p>

                  {/* Actions Bar */}
                  <div style={{ borderTop: "1px solid rgba(102, 187, 106, 0.08)", paddingTop: "12px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <button
                      onClick={() => handleLikeToggle(post)}
                      style={{
                        background: "none",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.8rem",
                        color: hasLiked ? "#EF5350" : "rgba(232,245,233,0.5)",
                        cursor: "pointer",
                        fontWeight: 600,
                        padding: "4px 8px",
                        borderRadius: "6px",
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={(e) => {
                        if (!hasLiked) e.currentTarget.style.color = "#EF5350";
                      }}
                      onMouseLeave={(e) => {
                        if (!hasLiked) e.currentTarget.style.color = "rgba(232,245,233,0.5)";
                      }}
                    >
                      <Heart size={14} fill={hasLiked ? "#EF5350" : "none"} />
                      <span>{post.likes} Likes</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .post-card:hover {
          border-color: rgba(102, 187, 106, 0.25) !important;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}

const filterTabStyle = (active: boolean): React.CSSProperties => ({
  background: active ? "rgba(102, 187, 106, 0.18)" : "rgba(10, 16, 11, 0.4)",
  border: `1px solid ${active ? "rgba(102, 187, 106, 0.45)" : "rgba(102, 187, 106, 0.15)"}`,
  color: active ? "#A5D6A7" : "rgba(232, 245, 233, 0.7)",
  padding: "6px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.8rem",
  fontWeight: 600,
  transition: "all 0.15s",
});
