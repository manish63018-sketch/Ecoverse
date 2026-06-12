"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCommunityFeed } from "@/lib/hooks/useCommunityFeed";
import { canViewAdmin } from "@/lib/permissions";
import { 
  MessageSquare, Heart, Share2, Send, Flame, Sparkles, 
  User, Calendar, Filter, HeartHandshake, BookOpen, Eye, AlertCircle,
  Plus, Search, Trophy, CheckCircle, HelpCircle, Shield, ArrowRight, X, Sparkle
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { ECOVERSE_ROLES } from "@/lib/roles";
import { detectConflictWords, rephraseHarshText, MOTIVATIONAL_LINES, COMMUNITY_PILLARS, COMMUNITY_RULES } from "@/lib/community-guidelines";
import Link from "next/link";
import type { Profile, CommunityPost } from "@/lib/types";

// Category configuration
const CATEGORY_TAGS = {
  general: { label: "General", emoji: "🌿", color: "#66BB6A", bg: "rgba(102,187,106,0.1)" },
  rescue: { label: "Rescue Update", emoji: "🐾", color: "#EF5350", bg: "rgba(239,83,80,0.1)" },
  veganism: { label: "Veganism", emoji: "🌱", color: "#81C784", bg: "rgba(129,199,132,0.1)" },
  adoption: { label: "Adoption Story", emoji: "🏡", color: "#FFA726", bg: "rgba(255,167,38,0.1)" },
  tips: { label: "Tips & Care", emoji: "💡", color: "#29B6F6", bg: "rgba(41,182,246,0.1)" },
  celebration: { label: "Celebration", emoji: "🎉", color: "#AB47BC", bg: "rgba(171,71,188,0.1)" },
  news: { label: "News", emoji: "📰", color: "#26A69A", bg: "rgba(38,166,154,0.1)" },
};

// Static tips & recipes for Vegan Challenge
const VEGAN_CHALLENGE_STEPS = [
  { day: 1, tip: "Add one plant-based meal today. Try starting with breakfast: oatmeal with fruit and nuts.", recipe: "Fruit Oats Bowl: Oats + Almond Milk + Banana + Chia Seeds." },
  { day: 2, tip: "Replace dairy milk with soy, oat, or almond milk in your tea or coffee.", recipe: "Vegan Ginger Chai: Black Tea + Oat Milk + Fresh Crushed Ginger." },
  { day: 3, tip: "Explore plant protein. Add lentils, chickpeas, or tofu to your lunch or dinner.", recipe: "Spiced Chickpea Salad: Boiled Chickpeas + Cucumbers + Tomatoes + Lemon Juice." },
  { day: 4, tip: "Check food packaging labels for hidden dairy (whey, casein) or honey.", recipe: "Tofu Bhurji: Scrambled Tofu + Onions + Tomatoes + Turmeric + Green Chillies." },
  { day: 5, tip: "Discover vegan cheese. Nutritional yeast is a great cheese substitute for pasta or popcorn.", recipe: "Cheesy Vegan Pasta: Whole Wheat Pasta + Nutritional Yeast + Garlic + Olive Oil." },
  { day: 6, tip: "Cook a fully plant-based meal for your family or friends to share the love.", recipe: "Soya Chunk Curry: Soya Chunks + Tomato-Onion Gravy + Indian Spices + Rice." },
  { day: 7, tip: "Celebrate your milestone! Plan your journey ahead and explore local vegan eateries.", recipe: "Avocado Toast: Sourdough + Mashed Avocado + Cherry Tomatoes + Chili Flakes." },
];

export default function CommunityPage() {
  const { user, profile, loading: authLoading, refetchProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"feed" | "members" | "vegans" | "events" | "guidelines">("feed");
  
  // Rotating Quote
  const [dailyQuote, setDailyQuote] = useState("");
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    setDailyQuote(MOTIVATIONAL_LINES[dayOfYear % MOTIVATIONAL_LINES.length]);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // FEED TAB STATE & EFFECTS
  // ─────────────────────────────────────────────────────────────
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { posts, loading: postsLoading, refetch: fetchPosts, setPosts } = useCommunityFeed(filterCategory === "all" ? undefined : filterCategory);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  
  // Composer Form
  const [newContent, setNewContent] = useState("");
  const [postCategory, setPostCategory] = useState<string>("general");
  const [postImage, setPostImage] = useState("");
  const [postTags, setPostTags] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [detectedHarsh, setDetectedHarsh] = useState<string[]>([]);

  // Load liked posts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ecoverse_liked_posts");
    if (saved) {
      setLikedPosts(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (activeTab === "feed") {
      fetchPosts();
    }
  }, [activeTab, filterCategory]);

  const handleTextChange = (text: string) => {
    setNewContent(text);
    const harsh = detectConflictWords(text);
    setDetectedHarsh(harsh);
  };

  const handleRephrase = () => {
    const kindText = rephraseHarshText(newContent);
    setNewContent(kindText);
    setDetectedHarsh([]);
    toast.success("Text rephrased with kindness! ✨");
  };

  const handleCreatePost = async (forcePost = false) => {
    if (!user) {
      toast.error("Please login to post");
      return;
    }
    if (!newContent.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }
    if (detectedHarsh.length > 0 && !forcePost) {
      return; // Wait for user choice
    }

    setIsSubmittingPost(true);
    try {
      const tagsArray = postTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const postCity = profile?.city_name || "India";

      const newPost = {
        author_id: user.id,
        author_name: profile?.full_name || user.email || "EcoVerse Supporter",
        author_avatar: profile?.primary_role || "volunteer",
        category: postCategory,
        content: newContent.trim(),
        image_url: postImage.trim() || null,
        tags: tagsArray,
        city_name: postCity,
        like_count: 0,
        comment_count: 0,
        share_count: 0,
        is_pinned: isPinned && canViewAdmin(profile),
        is_reported: detectedHarsh.length > 0,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ttl_days: 30
      };

      const { error: insertErr } = await supabase
        .from("community_posts")
        .insert(newPost);
      if (insertErr) throw insertErr;

      toast.success("Post shared successfully!");
      setNewContent("");
      setPostImage("");
      setPostTags("");
      setDetectedHarsh([]);
      setIsComposerOpen(false);
      fetchPosts();
    } catch (err: any) {
      console.error("Failed to insert post:", err);
      toast.error("Failed to share post: " + err.message);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleLikeToggle = async (post: CommunityPost) => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }

    const hasLiked = likedPosts.includes(post.id);
    const newLiked = hasLiked
      ? likedPosts.filter((id) => id !== post.id)
      : [...likedPosts, post.id];

    setLikedPosts(newLiked);
    localStorage.setItem("ecoverse_liked_posts", JSON.stringify(newLiked));

    const newLikeCount = hasLiked ? Math.max(0, post.like_count - 1) : post.like_count + 1;

    // Optimistic UI updates
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, like_count: newLikeCount } : p))
    );

    try {
      const { error } = await supabase
        .from("community_posts")
        .update({ like_count: newLikeCount })
        .eq("id", post.id);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to sync like:", err);
    }
  };

  const handleReportPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("community_posts")
        .update({ is_reported: true })
        .eq("id", postId);
      if (error) throw error;
      toast.success("Post reported. Our moderators will review this.");
    } catch (err: any) {
      toast.error("Report failed: " + (err.message || err));
    }
  };

  // ─────────────────────────────────────────────────────────────
  // MEMBERS TAB STATE & EFFECTS
  // ─────────────────────────────────────────────────────────────
  const [members, setMembers] = useState<Profile[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);

  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMembers(data as Profile[]);
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "members") {
      fetchMembers();
    }
  }, [activeTab]);

  const handleSayWelcome = (name: string) => {
    setNewContent(`Welcome to EcoVerse, @${name}! Glad to have you in our community. 🐾`);
    setPostCategory("general");
    setIsComposerOpen(true);
    setActiveTab("feed");
  };

  // Filter members client-side
  const filteredMembers = members.filter((member) => {
    const fullName = member.full_name || "";
    const username = member.username || "";
    const city = member.city_name || "";
    const query = memberSearch.toLowerCase();
    
    const matchesSearch = 
      fullName.toLowerCase().includes(query) ||
      username.toLowerCase().includes(query) ||
      city.toLowerCase().includes(query);

    const matchesRole = 
      memberRoleFilter === "all" || 
      (member.roles && member.roles.includes(memberRoleFilter));

    const matchesAvailability = !availableOnly || member.available_now;

    return matchesSearch && matchesRole && matchesAvailability;
  });

  // Last 10 registered members for spotlight
  const newMembersSpotlight = members.slice(0, 10);

  // ─────────────────────────────────────────────────────────────
  // VEGANS TAB STATE & EFFECTS
  // ─────────────────────────────────────────────────────────────
  const [veganLeaderboard, setVeganLeaderboard] = useState<Profile[]>([]);
  const [veganPledgeCount, setVeganPledgeCount] = useState(0);
  const [veganChallengeDay, setVeganChallengeDay] = useState(1);

  const fetchVeganData = async () => {
    try {
      // 1. Leaderboard
      const { data: boardList, error: boardErr } = await supabase
        .from("profiles")
        .select("*")
        .order("vegan_streak_days", { ascending: false })
        .limit(10);
      if (boardErr) throw boardErr;
      setVeganLeaderboard(boardList as Profile[]);

      // 2. Pledge count
      const { count, error: pledgeErr } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .eq("vegan_pledge_taken", true);
      if (pledgeErr) throw pledgeErr;
      setVeganPledgeCount(count || 0);
    } catch (err) {
      console.error("Failed to load vegan metrics:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "vegans") {
      fetchVeganData();
      if (profile) {
        setVeganChallengeDay(Math.min(7, Math.max(1, (profile.vegan_streak_days % 7) + 1)));
      }
    }
  }, [activeTab, profile]);

  const handleTakePledge = async () => {
    if (!user) {
      toast.error("Please login to take the vegan pledge");
      return;
    }
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          vegan_pledge_taken: true,
          vegan_since: new Date().toISOString().split("T")[0]
        })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Thank you for taking the EcoVerse Vegan Pledge! 💚🌱");
      refetchProfile();
      fetchVeganData();
    } catch (err: any) {
      toast.error("Action failed: " + (err.message || err));
    }
  };

  const handleMarkDayComplete = async () => {
    if (!user || !profile) {
      toast.error("Please login first");
      return;
    }
    try {
      const nextStreak = (profile.vegan_streak_days || 0) + 1;
      const { error } = await supabase
        .from("profiles")
        .update({
          vegan_streak_days: nextStreak
        })
        .eq("id", user.id);
      if (error) throw error;
      toast.success(`Day ${veganChallengeDay} Complete! Current Streak: ${nextStreak} Days 🔥`);
      refetchProfile();
      fetchVeganData();
    } catch (err: any) {
      toast.error("Failed to save progress: " + (err.message || err));
    }
  };

  // ─────────────────────────────────────────────────────────────
  // EVENTS TAB STATE & EFFECTS
  // ─────────────────────────────────────────────────────────────
  const [events, setEvents] = useState<any[]>([
    { id: "e1", name: "Indore Street Feeding Drive", city: "Indore", date: "June 20, 2026", type: "Feeding", rsvps: 18, rsvpUsers: [] },
    { id: "e2", name: "Pune Animal Rehabilitation Workshop", city: "Pune", date: "June 25, 2026", type: "Workshop", rsvps: 34, rsvpUsers: [] },
    { id: "e3", name: "Mumbai Adoption Mela", city: "Mumbai", date: "July 02, 2026", type: "Adoption", rsvps: 45, rsvpUsers: [] },
    { id: "e4", name: "Delhi Cruelty Awareness Walk", city: "New Delhi", date: "July 10, 2026", type: "Awareness", rsvps: 60, rsvpUsers: [] },
  ]);
  const [eventCityFilter, setEventCityFilter] = useState("all");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventCity, setNewEventCity] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventType, setNewEventType] = useState("Feeding");

  const handleRsvp = (eventId: string) => {
    if (!user) {
      toast.error("Please login to RSVP");
      return;
    }
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          const joined = ev.rsvpUsers.includes(user.id);
          return {
            ...ev,
            rsvps: joined ? ev.rsvps - 1 : ev.rsvps + 1,
            rsvpUsers: joined
              ? ev.rsvpUsers.filter((uid: string) => uid !== user.id)
              : [...ev.rsvpUsers, user.id],
          };
        }
        return ev;
      })
    );
    toast.success("RSVP updated!");
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim() || !newEventCity.trim() || !newEventDate.trim()) {
      toast.error("Please fill all event details");
      return;
    }
    const newEv = {
      id: "ev-" + Date.now(),
      name: newEventName.trim(),
      city: newEventCity.trim(),
      date: new Date(newEventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      type: newEventType,
      rsvps: 1,
      rsvpUsers: user ? [user.id] : [],
    };
    setEvents((prev) => [newEv, ...prev]);
    toast.success("Local event created successfully!");
    setIsEventModalOpen(false);
    setNewEventName("");
    setNewEventCity("");
    setNewEventDate("");
  };

  const filteredEvents = events.filter((ev) => {
    return eventCityFilter === "all" || ev.city.toLowerCase() === eventCityFilter.toLowerCase();
  });

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif", paddingBottom: "80px" }}>
      <Navbar />

      <div className="container" style={{ paddingTop: "120px", maxWidth: "900px", margin: "0 auto", paddingLeft: "24px", paddingRight: "24px" }}>
        
        {/* Header (single h1 per page SEO rule) */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#66BB6A", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <MessageSquare size={16} /> EcoVerse Social Hub
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-0.03em", marginTop: "8px", marginBottom: "8px" }}>
            EcoVerse Community Portal
          </h1>
          <p style={{ color: "rgba(232, 245, 233, 0.6)", fontSize: "1.05rem", lineHeight: 1.6 }}>
            Connect with volunteers, track vegan challenges, RSVP for local drives, and share stories.
          </p>
        </div>

        {/* Dynamic Rotating Quote */}
        {dailyQuote && (
          <div 
            style={{ 
              marginBottom: "32px",
              padding: "16px 20px",
              background: "rgba(102, 187, 106, 0.05)",
              borderLeft: "3.5px solid #66BB6A",
              borderRadius: "0 12px 12px 0",
              fontStyle: "italic",
              fontSize: "1.05rem",
              color: "#A5D6A7"
            }}
          >
            "{dailyQuote}"
          </div>
        )}

        {/* Tab Selection */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(102, 187, 106, 0.15)", marginBottom: "32px", gap: "8px", overflowX: "auto", paddingBottom: "2px" }}>
          {(["feed", "members", "vegans", "events", "guidelines"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none",
                border: "none",
                color: activeTab === tab ? "#66BB6A" : "rgba(232, 245, 233, 0.5)",
                padding: "12px 20px",
                fontSize: "0.95rem",
                fontWeight: activeTab === tab ? 700 : 500,
                cursor: "pointer",
                borderBottom: activeTab === tab ? "3px solid #66BB6A" : "3px solid transparent",
                textTransform: "capitalize",
                transition: "all 0.15s"
              }}
            >
              {tab === "vegans" ? "Vegan Pledge" : tab}
            </button>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            FEED TAB VIEW
            ───────────────────────────────────────────────────────────── */}
        {activeTab === "feed" && (
          <div>
            {/* Filter chips */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
              <button
                onClick={() => setFilterCategory("all")}
                style={filterTabStyle(filterCategory === "all")}
              >
                All updates
              </button>
              {Object.entries(CATEGORY_TAGS).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setFilterCategory(key)}
                  style={filterTabStyle(filterCategory === key)}
                >
                  {info.emoji} {info.label}
                </button>
              ))}
            </div>

            {/* Posts feed */}
            {postsLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ width: "36px", height: "36px", border: "3px solid rgba(102,187,106,0.15)", borderRadius: "50%", borderTopColor: "#66BB6A", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {posts
                  .filter((p) => filterCategory === "all" || p.category === filterCategory)
                  .map((post) => {
                    const tag = CATEGORY_TAGS[post.category as keyof typeof CATEGORY_TAGS] || CATEGORY_TAGS.general;
                    const isLiked = likedPosts.includes(post.id);
                    
                    // Expiry calculations
                    let expiryLabel = "⏱ Expired";
                    let expiryColor = "rgba(255,255,255,0.2)";
                    if ((post as any).expires_at) {
                      const diff = new Date((post as any).expires_at).getTime() - Date.now();
                      if (diff > 0) {
                        if (diff < 24 * 60 * 60 * 1000) {
                          const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
                          const minsLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                          expiryLabel = hoursLeft > 0 
                            ? `⏱ Expires in ${hoursLeft}h ${minsLeft}m`
                            : `⏱ Expires in ${minsLeft}m`;
                          expiryColor = "#E53935"; // Red for expiring soon (< 24h)
                        } else {
                          const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                          expiryLabel = `⏱ Expires in ${daysLeft}d`;
                          if (daysLeft > 14) expiryColor = "rgba(255,255,255,0.3)";
                          else if (daysLeft >= 7) expiryColor = "#FBC02D"; // yellow
                          else expiryColor = "#F57C00"; // orange
                        }
                      }
                    }


                    // Role Details
                    const roleId = post.author_avatar || "volunteer";
                    const roleDetails = ECOVERSE_ROLES[roleId] || ECOVERSE_ROLES.volunteer;

                    return (
                      <div
                        key={post.id}
                        style={{
                          background: "rgba(21, 35, 23, 0.45)",
                          border: "1px solid rgba(102, 187, 106, 0.12)",
                          borderRadius: "18px",
                          padding: "24px",
                          position: "relative"
                        }}
                      >
                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <div style={{
                              width: "38px", height: "38px", borderRadius: "50%",
                              background: "rgba(10, 16, 11, 0.6)", border: `2px solid ${roleDetails.color}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "1.2rem"
                            }}>
                              {roleDetails.emoji}
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{post.author_name}</span>
                                <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: tag.bg, color: tag.color }}>
                                  {tag.label}
                                </span>
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "rgba(232, 245, 233, 0.4)", marginTop: "2px" }}>
                                {roleDetails.label} • {post.city_name || "India"}
                              </div>
                            </div>
                          </div>

                          {/* Pin / Expiry indicators */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {post.is_pinned ? (
                              <span style={{ fontSize: "0.75rem", background: "rgba(102, 187, 106, 0.12)", color: "#66BB6A", border: "1px solid rgba(102,187,106,0.3)", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>
                                📌 Permanent
                              </span>
                            ) : (
                              <span style={{ fontSize: "0.72rem", color: expiryColor, fontWeight: 600 }}>
                                {expiryLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Under Review indicator for flag/moderation */}
                        {post.is_reported && (
                          <div style={{ marginBottom: "12px", padding: "6px 12px", background: "rgba(255, 167, 38, 0.08)", border: "1px solid rgba(255, 167, 38, 0.2)", borderRadius: "8px", fontSize: "0.78rem", color: "#FFA726", display: "flex", alignItems: "center", gap: "6px" }}>
                            <AlertCircle size={12} /> Under review by community moderators
                          </div>
                        )}

                        {/* Content */}
                        <p style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "rgba(232, 245, 233, 0.85)", whiteSpace: "pre-wrap", marginBottom: "16px" }}>
                          {post.content}
                        </p>

                        {/* Optional Attached Image */}
                        {post.image_url && (
                          <div style={{ marginBottom: "16px", borderRadius: "12px", overflow: "hidden", maxHeight: "350px", border: "1px solid rgba(102, 187, 106, 0.1)" }}>
                            <img src={post.image_url} alt="Attached" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
                          </div>
                        )}

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                            {post.tags.map((tg, i) => (
                              <span key={i} style={{ fontSize: "0.75rem", background: "rgba(102, 187, 106, 0.05)", border: "1px solid rgba(102, 187, 106, 0.12)", color: "#A5D6A7", padding: "2px 8px", borderRadius: "6px" }}>
                                #{tg}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(102, 187, 106, 0.08)", paddingTop: "12px" }}>
                          <button
                            onClick={() => handleLikeToggle(post)}
                            style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "6px", color: isLiked ? "#EF5350" : "rgba(232,245,233,0.5)", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem" }}
                          >
                            <Heart size={14} fill={isLiked ? "#EF5350" : "none"} />
                            <span>{post.like_count} Likes</span>
                          </button>

                          <button
                            onClick={() => handleReportPost(post.id)}
                            style={{ background: "none", border: "none", color: "rgba(232,245,233,0.35)", cursor: "pointer", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            <span>⚑ Report</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Float Action Button composer trigger */}
            {user && (
              <button
                onClick={() => setIsComposerOpen(true)}
                style={{
                  position: "fixed", bottom: "32px", right: "32px",
                  width: "56px", height: "56px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #66BB6A, #388E3C)",
                  color: "#FFFFFF", display: "flex", alignItems: "center",
                  justifyContent: "center", border: "none", cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(46, 125, 50, 0.45)", zIndex: 100
                }}
              >
                <Plus size={24} />
              </button>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MEMBERS TAB VIEW
            ───────────────────────────────────────────────────────────── */}
        {activeTab === "members" && (
          <div>
            {/* Spotlight header */}
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#A5D6A7", marginBottom: "16px" }}>
                🌟 New Members — Welcome them!
              </h2>
              <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "12px" }}>
                {newMembersSpotlight.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      flexShrink: 0, width: "160px", background: "rgba(21, 35, 23, 0.45)",
                      border: "1px solid rgba(102, 187, 106, 0.15)", borderRadius: "16px",
                      padding: "16px", textAlign: "center", display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "space-between"
                    }}
                  >
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "50%",
                      background: "rgba(102, 187, 106, 0.1)", display: "flex",
                      alignItems: "center", justifyContent: "center", fontWeight: "bold",
                      fontSize: "1.1rem", border: "1px solid rgba(102,187,106,0.3)"
                    }}>
                      {m.full_name?.charAt(0).toUpperCase() || "E"}
                    </div>
                    <div style={{ margin: "8px 0" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "130px" }}>
                        {m.full_name}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "rgba(232,245,233,0.4)" }}>
                        {m.city_name || "India"}
                      </div>
                    </div>
                    {user && user.id !== m.id && (
                      <button
                        onClick={() => handleSayWelcome(m.full_name || "Friend")}
                        style={{ background: "rgba(102,187,106,0.12)", border: "1px solid rgba(102,187,106,0.25)", color: "#A5D6A7", fontSize: "0.72rem", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                      >
                        Say Welcome 👋
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Filter & Search Directory */}
            <div style={{ background: "rgba(21, 35, 23, 0.3)", borderRadius: "18px", padding: "20px", border: "1px solid rgba(102,187,106,0.1)", marginBottom: "24px" }}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
                {/* Search input */}
                <div style={{ position: "relative", flex: 1, minWidth: "250px" }}>
                  <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "rgba(232,245,233,0.4)" }} />
                  <input
                    type="text"
                    placeholder="Search members by name, city, or role..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    style={{
                      width: "100%", background: "rgba(10, 16, 11, 0.6)", border: "1px solid rgba(102, 187, 106, 0.22)",
                      borderRadius: "10px", padding: "10px 12px 10px 38px", color: "#FFFFFF", outline: "none", fontSize: "0.88rem"
                    }}
                  />
                </div>

                {/* Available toggle */}
                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "#66BB6A" }}
                  />
                  <span>Available Now Only</span>
                </label>
              </div>

              {/* Role filter pills */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setMemberRoleFilter("all")}
                  style={pillFilterStyle(memberRoleFilter === "all")}
                >
                  All
                </button>
                {Object.entries(ECOVERSE_ROLES).map(([id, info]) => (
                  <button
                    key={id}
                    onClick={() => setMemberRoleFilter(id)}
                    style={pillFilterStyle(memberRoleFilter === id)}
                  >
                    {info.emoji} {info.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of members */}
            {membersLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ width: "36px", height: "36px", border: "3px solid rgba(102,187,106,0.15)", borderRadius: "50%", borderTopColor: "#66BB6A", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", border: "1px dashed rgba(102,187,106,0.15)", borderRadius: "16px" }}>
                <p style={{ color: "rgba(232,245,233,0.4)" }}>No community members found matching criteria.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                {filteredMembers.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)",
                      borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      {/* Avatar name header */}
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          background: "rgba(102, 187, 106, 0.15)", display: "flex",
                          alignItems: "center", justifyContent: "center", fontWeight: "bold",
                          color: "#A5D6A7", border: "1.5px solid rgba(102,187,106,0.3)"
                        }}>
                          {m.full_name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{m.full_name}</span>
                            {m.available_now && (
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#66BB6A", display: "inline-block" }} title="Available Now" />
                            )}
                          </div>
                          <span style={{ fontSize: "0.72rem", color: "rgba(232,245,233,0.4)" }}>
                            {m.city_name ? `${m.city_name}, ${m.state_name || ""}` : "Location not set"}
                          </span>
                        </div>
                      </div>

                      {/* Member roles list */}
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "12px" }}>
                        {m.roles && m.roles.slice(0, 3).map((roleId) => {
                          const r = ECOVERSE_ROLES[roleId] || ECOVERSE_ROLES.volunteer;
                          return (
                            <span key={roleId} style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(102,187,106,0.08)", color: r.color, border: `1px solid ${r.color}25` }}>
                              {r.emoji} {r.label}
                            </span>
                          );
                        })}
                        {m.roles && m.roles.length > 3 && (
                          <span style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                            +{m.roles.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(102,187,106,0.06)", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.72rem", color: "rgba(232,245,233,0.35)" }}>
                        Joined {new Date(m.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </span>
                      {m.rescue_count > 0 && (
                        <span style={{ fontSize: "0.72rem", background: "rgba(239,83,80,0.12)", color: "#EF5350", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                          🐾 {m.rescue_count} Rescues
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VEGANS TAB VIEW
            ───────────────────────────────────────────────────────────── */}
        {activeTab === "vegans" && (
          <div>
            {/* Pledge Card */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(46, 125, 50, 0.15), rgba(10, 16, 11, 0.5))",
                border: "1px solid rgba(102, 187, 106, 0.22)",
                borderRadius: "20px",
                padding: "32px",
                textAlign: "center",
                marginBottom: "32px"
              }}
            >
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "8px" }}>
                🌱 Take the Indian Vegan Pledge
              </h2>
              <p style={{ color: "rgba(232, 245, 233, 0.65)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 24px" }}>
                Join thousands of individuals across India pledge to eliminate animal contribution to food, clothing, or entertainment. Build a streak and earn your Green Heart badge.
              </p>

              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#66BB6A", marginBottom: "20px" }}>
                {veganPledgeCount} People Pledged in India
              </div>

              {profile?.vegan_pledge_taken ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(102, 187, 106, 0.12)", border: "1px solid #66BB6A", color: "#A5D6A7", padding: "10px 24px", borderRadius: "10px", fontWeight: 700, fontSize: "0.9rem" }}>
                  <CheckCircle size={16} /> Pledge Taken Successfully
                </div>
              ) : (
                <button
                  onClick={handleTakePledge}
                  style={{
                    background: "linear-gradient(135deg, #66BB6A, #388E3C)",
                    color: "#FFFFFF", border: "none", padding: "12px 28px",
                    borderRadius: "12px", fontWeight: 700, fontSize: "0.9rem",
                    cursor: "pointer", boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)"
                  }}
                >
                  Take the Pledge
                </button>
              )}
            </div>

            {/* 7-Day Challenge Tracker */}
            <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "20px", padding: "28px", marginBottom: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>📅 7-Day Vegan Challenge</h3>
                  <p style={{ fontSize: "0.82rem", color: "rgba(232, 245, 233, 0.45)" }}>Track your milestones day by day</p>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#A5D6A7", fontWeight: 700 }}>
                  Active Streak: {profile?.vegan_streak_days || 0} Days
                </div>
              </div>

              {/* Progress circles */}
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", margin: "24px 0", overflowX: "auto", paddingBottom: "12px" }}>
                {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                  const isCompleted = (profile?.vegan_streak_days || 0) >= dayNum;
                  const isActive = veganChallengeDay === dayNum;
                  return (
                    <div key={dayNum} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "60px" }}>
                      <div
                        style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          background: isCompleted ? "#2E7D32" : isActive ? "rgba(102,187,106,0.15)" : "rgba(10,16,11,0.5)",
                          border: isCompleted ? "2px solid #66BB6A" : isActive ? "2px solid #A5D6A7" : "1.5px solid rgba(102,187,106,0.15)",
                          color: isCompleted || isActive ? "#FFFFFF" : "rgba(232,245,233,0.35)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: "0.85rem"
                        }}
                      >
                        {isCompleted ? "✓" : dayNum}
                      </div>
                      <span style={{ fontSize: "0.7rem", marginTop: "6px", color: isActive ? "#A5D6A7" : "rgba(232,245,233,0.4)" }}>
                        Day {dayNum}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Today's details */}
              <div style={{ background: "rgba(10, 16, 11, 0.4)", borderRadius: "12px", padding: "16px", border: "1.5px solid rgba(102,187,106,0.08)", marginBottom: "20px" }}>
                <div style={{ color: "#A5D6A7", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  💡 Day {veganChallengeDay} Tip
                </div>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.5, margin: "0 0 12px 0", color: "rgba(232,245,233,0.85)" }}>
                  {VEGAN_CHALLENGE_STEPS[veganChallengeDay - 1]?.tip}
                </p>
                <div style={{ color: "#81C784", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  🍳 Day {veganChallengeDay} Recipe
                </div>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.5, margin: 0, color: "rgba(232,245,233,0.8)" }}>
                  {VEGAN_CHALLENGE_STEPS[veganChallengeDay - 1]?.recipe}
                </p>
              </div>

              {/* Action button */}
              {user && (
                <button
                  onClick={handleMarkDayComplete}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "rgba(102, 187, 106, 0.12)", border: "1px solid rgba(102,187,106,0.3)",
                    color: "#A5D6A7", padding: "10px 20px", borderRadius: "10px",
                    fontWeight: 700, fontSize: "0.85rem", cursor: "pointer"
                  }}
                >
                  <CheckCircle size={14} /> Mark Today Complete ✓
                </button>
              )}
            </div>

            {/* Leaderboard */}
            <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "20px", padding: "24px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Trophy size={18} style={{ color: "#FBC02D" }} /> Vegan Streak Leaderboard
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {veganLeaderboard.map((leader, index) => (
                  <div
                    key={leader.id}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "rgba(10,16,11,0.3)", border: "1px solid rgba(102,187,106,0.06)",
                      borderRadius: "12px", padding: "12px 16px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 700, color: index === 0 ? "#FBC02D" : index === 1 ? "#B0BEC5" : index === 2 ? "#CD7F32" : "rgba(232,245,233,0.3)" }}>
                        #{index + 1}
                      </span>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: "rgba(102,187,106,0.1)", display: "flex",
                        alignItems: "center", justifyContent: "center", fontWeight: "bold",
                        fontSize: "0.85rem"
                      }}>
                        {leader.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{leader.full_name}</div>
                        <div style={{ fontSize: "0.72rem", color: "rgba(232,245,233,0.4)" }}>{leader.city_name || "India"}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Flame size={14} style={{ color: "#EF5350" }} />
                      <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{leader.vegan_streak_days || 0} days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            EVENTS TAB VIEW
            ───────────────────────────────────────────────────────────── */}
        {activeTab === "events" && (
          <div>
            {/* Filter and Create Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(232, 245, 233, 0.45)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                  Filter City:
                </span>
                <select
                  value={eventCityFilter}
                  onChange={(e) => setEventCityFilter(e.target.value)}
                  style={{
                    background: "rgba(10, 16, 11, 0.8)", border: "1px solid rgba(102, 187, 106, 0.22)",
                    borderRadius: "8px", padding: "6px 12px", color: "#FFFFFF", fontSize: "0.8rem", cursor: "pointer", outline: "none"
                  }}
                >
                  <option value="all">All Cities</option>
                  <option value="indore">Indore</option>
                  <option value="pune">Pune</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="new delhi">New Delhi</option>
                </select>
              </div>

              {user && (
                <button
                  onClick={() => setIsEventModalOpen(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    background: "linear-gradient(135deg, #66BB6A, #388E3C)",
                    color: "#FFFFFF", border: "none", padding: "8px 16px",
                    borderRadius: "8px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer"
                  }}
                >
                  <Plus size={14} /> Create Local Event
                </button>
              )}
            </div>

            {/* Events grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {filteredEvents.map((ev) => {
                const joined = user && ev.rsvpUsers.includes(user.uid);
                return (
                  <div
                    key={ev.id}
                    style={{
                      background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)",
                      borderRadius: "18px", padding: "24px", display: "flex", flexDirection: "column",
                      justifyContent: "space-between", height: "200px"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <span style={{ fontSize: "0.72rem", background: "rgba(102,187,106,0.1)", color: "#A5D6A7", padding: "3px 8px", borderRadius: "4px", fontWeight: 700, textTransform: "uppercase" }}>
                          {ev.type}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.4)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          📍 {ev.city}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 8px 0" }}>{ev.name}</h3>
                      <div style={{ fontSize: "0.82rem", color: "rgba(232,245,233,0.5)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={12} /> {ev.date}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(102,187,106,0.06)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "#A5D6A7", fontWeight: 600 }}>{ev.rsvps} attending</span>
                      <button
                        onClick={() => handleRsvp(ev.id)}
                        style={{
                          background: joined ? "rgba(102,187,106,0.15)" : "#2E7D32",
                          border: "none", color: "#FFFFFF", fontSize: "0.78rem",
                          padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: 700
                        }}
                      >
                        {joined ? "Joined ✓" : "RSVP"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            GUIDELINES TAB VIEW
            ───────────────────────────────────────────────────────────── */}
        {activeTab === "guidelines" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ padding: "20px 24px", background: "rgba(102, 187, 106, 0.04)", borderLeft: "4px solid #66BB6A", borderRadius: "0 16px 16px 0" }}>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "8px" }}>One Community. One Standard. Compassion.</h2>
                <p style={{ color: "rgba(232, 245, 233, 0.65)", fontSize: "0.9rem", margin: 0 }}>
                  EcoVerse is built on the belief that how we treat each other reflects how we treat animals. Disagree constructively and keep the animals at the center of all actions.
                </p>
              </div>

              {/* Pillars */}
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "12px", color: "#A5D6A7" }}>Four Pillars:</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {COMMUNITY_PILLARS.map((p, i) => (
                    <div key={i} style={{ background: "rgba(21, 35, 23, 0.3)", border: "1px solid rgba(102,187,106,0.08)", borderRadius: "12px", padding: "16px" }}>
                      <span style={{ fontSize: "1.4rem" }}>{p.icon}</span>
                      <h4 style={{ fontWeight: 700, fontSize: "0.9rem", marginTop: "4px", marginBottom: "4px" }}>{p.title}</h4>
                      <p style={{ fontSize: "0.78rem", color: "rgba(232,245,233,0.55)", margin: 0 }}>{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "12px", color: "#A5D6A7" }}>Rules of Conduct:</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {COMMUNITY_RULES.map((r, i) => (
                    <div key={i} style={{ background: "rgba(21, 35, 23, 0.3)", border: "1px solid rgba(102,187,106,0.08)", borderRadius: "12px", padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.92rem" }}>{r.rule}</span>
                        <span style={{ fontSize: "0.68rem", color: "#FFA726" }}>{r.consequence}</span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.6)", marginTop: "6px", margin: 0 }}>{r.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete details button */}
              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <Link
                  href="/community/guidelines"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    background: "rgba(102, 187, 106, 0.12)", border: "1px solid rgba(102,187,106,0.3)",
                    color: "#A5D6A7", padding: "10px 24px", borderRadius: "10px",
                    fontWeight: 700, fontSize: "0.85rem", textDecoration: "none"
                  }}
                >
                  View Full Guidelines Page <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>

      <Footer />

      {/* ─────────────────────────────────────────────────────────────
          COMPOSER MODAL (POST FORM)
          ───────────────────────────────────────────────────────────── */}
      {isComposerOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px"
        }}>
          <div style={{
            background: "#08140a", border: "1.5px solid rgba(102, 187, 106, 0.22)",
            borderRadius: "24px", width: "100%", maxWidth: "550px", padding: "28px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)", position: "relative"
          }}>
            <button
              onClick={() => { setIsComposerOpen(false); setDetectedHarsh([]); }}
              style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "rgba(232,245,233,0.4)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "20px", background: "linear-gradient(to right, #A5D6A7, #66BB6A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Create Community Post
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Textarea */}
              <div style={{ position: "relative" }}>
                <textarea
                  placeholder="Share updates, rescue stories, or plant-based tips with the community..."
                  value={newContent}
                  onChange={(e) => handleTextChange(e.target.value)}
                  maxLength={500}
                  rows={4}
                  style={{
                    width: "100%", background: "rgba(10, 16, 11, 0.7)", border: "1px solid rgba(102, 187, 106, 0.22)",
                    borderRadius: "12px", padding: "12px", color: "#FFFFFF", outline: "none", fontSize: "0.92rem",
                    resize: "none", boxSizing: "border-box", paddingBottom: "24px"
                  }}
                />
                <span style={{ position: "absolute", bottom: "8px", right: "12px", fontSize: "0.72rem", color: "rgba(232,245,233,0.3)" }}>
                  {newContent.length}/500
                </span>
              </div>

              {/* Conflict Detection warning alert */}
              {detectedHarsh.length > 0 && (
                <div style={{
                  background: "rgba(255, 167, 38, 0.08)", border: "1px solid rgba(255, 167, 38, 0.25)",
                  borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#FFA726", fontWeight: 600 }}>
                    <AlertCircle size={14} /> Your message may seem harsh. EcoVerse is built on kindness.
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={handleRephrase}
                      style={{
                        background: "rgba(255, 167, 38, 0.12)", border: "1px solid rgba(255,167,38,0.3)",
                        color: "#FFA726", fontSize: "0.75rem", padding: "6px 12px", borderRadius: "6px",
                        cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px"
                      }}
                    >
                      <Sparkles size={12} /> Rephrase with AI ✨
                    </button>
                    <button
                      onClick={() => handleCreatePost(true)}
                      style={{ background: "none", border: "none", color: "rgba(232,245,233,0.45)", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}
                    >
                      Post Anyway
                    </button>
                  </div>
                </div>
              )}

              {/* Category selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.5)" }}>Category:</span>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  style={{
                    width: "100%", background: "rgba(10, 16, 11, 0.7)", border: "1px solid rgba(102, 187, 106, 0.22)",
                    borderRadius: "8px", padding: "8px 12px", color: "#FFFFFF", fontSize: "0.88rem", outline: "none", cursor: "pointer"
                  }}
                >
                  <option value="general">🌿 General Discussion</option>
                  <option value="rescue">🐾 Rescue Update</option>
                  <option value="veganism">🌱 Veganism</option>
                  <option value="adoption">🏡 Adoption Story</option>
                  <option value="tips">💡 Tips & Care</option>
                  <option value="celebration">🎉 Celebration</option>
                  <option value="news">📰 News</option>
                </select>
              </div>

              {/* Optional Attached Image URL */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.5)" }}>Image Link (Optional):</span>
                <input
                  type="text"
                  placeholder="https://example.com/animal.jpg"
                  value={postImage}
                  onChange={(e) => setPostImage(e.target.value)}
                  style={{
                    width: "100%", background: "rgba(10, 16, 11, 0.7)", border: "1px solid rgba(102, 187, 106, 0.22)",
                    borderRadius: "8px", padding: "8px 12px", color: "#FFFFFF", outline: "none", fontSize: "0.88rem"
                  }}
                />
              </div>

              {/* Tags (comma separated) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.5)" }}>Tags (Comma separated):</span>
                <input
                  type="text"
                  placeholder="dog, rescue, help"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  style={{
                    width: "100%", background: "rgba(10, 16, 11, 0.7)", border: "1px solid rgba(102, 187, 106, 0.22)",
                    borderRadius: "8px", padding: "8px 12px", color: "#FFFFFF", outline: "none", fontSize: "0.88rem"
                  }}
                />
              </div>

              {/* Pinned toggle for admin */}
              {canViewAdmin(profile) && (
                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", marginTop: "4px" }}>
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "#66BB6A" }}
                  />
                  <span style={{ color: "#A5D6A7", fontWeight: 600 }}>Pin this post (Permanent)</span>
                </label>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", borderTop: "1px solid rgba(102,187,106,0.08)", paddingTop: "16px" }}>
                <span style={{ fontSize: "0.75rem", color: "rgba(232,245,233,0.35)", maxWidth: "250px" }}>
                  Posts auto-delete after 30 days to keep the feed fresh. Pinned posts (admin-selected) are permanent.
                </span>

                <button
                  onClick={() => handleCreatePost(false)}
                  disabled={isSubmittingPost || (detectedHarsh.length > 0)}
                  style={{
                    background: detectedHarsh.length > 0 ? "#FBC02D" : "linear-gradient(135deg, #66BB6A, #388E3C)",
                    color: detectedHarsh.length > 0 ? "#000000" : "#FFFFFF", border: "none", padding: "10px 24px",
                    borderRadius: "10px", fontWeight: 700, fontSize: "0.85rem", cursor: detectedHarsh.length > 0 ? "not-allowed" : "pointer"
                  }}
                >
                  {isSubmittingPost ? "Posting..." : "Share Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          EVENT CREATE MODAL
          ───────────────────────────────────────────────────────────── */}
      {isEventModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px"
        }}>
          <form onSubmit={handleCreateEvent} style={{
            background: "#08140a", border: "1.5px solid rgba(102, 187, 106, 0.22)",
            borderRadius: "24px", width: "100%", maxWidth: "450px", padding: "28px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)", position: "relative"
          }}>
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "rgba(232,245,233,0.4)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "20px", background: "linear-gradient(to right, #A5D6A7, #66BB6A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Create Local Event
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Event Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.5)" }}>Event Name:</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Street Feeding Drive"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  style={{
                    width: "100%", background: "rgba(10, 16, 11, 0.7)", border: "1px solid rgba(102, 187, 106, 0.22)",
                    borderRadius: "8px", padding: "8px 12px", color: "#FFFFFF", outline: "none", fontSize: "0.88rem"
                  }}
                />
              </div>

              {/* City */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.5)" }}>City Name:</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune"
                  value={newEventCity}
                  onChange={(e) => setNewEventCity(e.target.value)}
                  style={{
                    width: "100%", background: "rgba(10, 16, 11, 0.7)", border: "1px solid rgba(102, 187, 106, 0.22)",
                    borderRadius: "8px", padding: "8px 12px", color: "#FFFFFF", outline: "none", fontSize: "0.88rem"
                  }}
                />
              </div>

              {/* Date */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.5)" }}>Date & Time:</span>
                <input
                  type="datetime-local"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  style={{
                    width: "100%", background: "rgba(10, 16, 11, 0.7)", border: "1px solid rgba(102, 187, 106, 0.22)",
                    borderRadius: "8px", padding: "8px 12px", color: "#FFFFFF", outline: "none", fontSize: "0.88rem"
                  }}
                />
              </div>

              {/* Event Type */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.5)" }}>Event Type:</span>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                  style={{
                    width: "100%", background: "rgba(10, 16, 11, 0.7)", border: "1px solid rgba(102, 187, 106, 0.22)",
                    borderRadius: "8px", padding: "8px 12px", color: "#FFFFFF", fontSize: "0.88rem", outline: "none", cursor: "pointer"
                  }}
                >
                  <option value="Feeding">Feeding Drive</option>
                  <option value="Rescue">Rescue Team Meetup</option>
                  <option value="Adoption">Adoption Mela</option>
                  <option value="Workshop">Volunteer Workshop</option>
                  <option value="Awareness">Cruelty Awareness Walk</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  style={{ background: "none", border: "none", color: "rgba(232,245,233,0.5)", cursor: "pointer", fontSize: "0.88rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #66BB6A, #388E3C)",
                    color: "#FFFFFF", border: "none", padding: "8px 20px",
                    borderRadius: "10px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer"
                  }}
                >
                  Create Event
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
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

const pillFilterStyle = (active: boolean): React.CSSProperties => ({
  background: active ? "#66BB6A" : "rgba(10, 16, 11, 0.5)",
  border: active ? "1px solid #66BB6A" : "1px solid rgba(102, 187, 106, 0.15)",
  color: active ? "#050f07" : "rgba(232, 245, 233, 0.7)",
  padding: "4px 12px",
  borderRadius: "20px",
  cursor: "pointer",
  fontSize: "0.78rem",
  fontWeight: 700,
  transition: "all 0.15s"
});
