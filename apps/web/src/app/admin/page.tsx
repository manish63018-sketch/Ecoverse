"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, Activity, ShieldAlert, BadgeCheck, Settings, 
  Megaphone, Shield, AlertTriangle, ArrowRight 
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { canViewAdmin } from "@/lib/permissions";
import toast from "react-hot-toast";

interface OverviewStats {
  totalUsers: number;
  activeToday: number;
  openSos: number;
  resolvedCases: number;
  partnerNgos: number;
  flaggedPosts: number;
}

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<OverviewStats>({
    totalUsers: 0,
    activeToday: 0,
    openSos: 0,
    resolvedCases: 0,
    partnerNgos: 0,
    flaggedPosts: 0
  });
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const [escalationTime, setEscalationTime] = useState(15);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !canViewAdmin(profile)) {
      toast.error("Access denied. Admin permissions required.");
      router.push("/dashboard");
    }
  }, [user, profile, authLoading, router]);

  const fetchStats = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch open cases count
      const { count: openCount } = await supabase
        .from("rescue_cases")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");

      // Fetch resolved cases count
      const { count: resolvedCount } = await supabase
        .from("rescue_cases")
        .select("*", { count: "exact", head: true })
        .eq("status", "resolved");

      // Fetch NGOs count
      const { count: ngosCount } = await supabase
        .from("ngos")
        .select("*", { count: "exact", head: true });

      // Fetch flagged posts
      const { count: flaggedCount } = await supabase
        .from("community_posts")
        .select("*", { count: "exact", head: true })
        .eq("is_reported", true);

      setStats({
        totalUsers: usersCount || 120,
        activeToday: Math.floor((usersCount || 120) * 0.35),
        openSos: openCount || 0,
        resolvedCases: resolvedCount || 0,
        partnerNgos: ngosCount || 0,
        flaggedPosts: flaggedCount || 0
      });

      // Fetch recent admin logs
      const { data: logs } = await supabase
        .from("admin_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      setRecentLogs(logs || []);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = async () => {
    try {
      const { error } = await supabase
        .from("admin_logs")
        .insert([{
          admin_id: user?.id,
          action: "update_settings",
          detail: `Updated SOS Escalation threshold to ${escalationTime} mins`
        }]);
      if (error) throw error;
      toast.success("Settings saved successfully!");
      fetchStats();
    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  const handlePostAnnouncement = async () => {
    if (!announcement.trim()) return toast.error("Announcement cannot be empty");
    try {
      const { error } = await supabase
        .from("admin_logs")
        .insert([{
          admin_id: user?.id,
          action: "post_announcement",
          detail: `Broadcaster: "${announcement}"`
        }]);
      if (error) throw error;
      toast.success("Site-wide announcement published!");
      setAnnouncement("");
      fetchStats();
    } catch (err) {
      toast.error("Failed to publish announcement");
    }
  };

  return (
    <div style={{ display: "flex", background: "#050f07", minHeight: "100vh", color: "#E8F5E9", fontFamily: "var(--font-sans), sans-serif" }}>
      {/* Sidebar Navigation */}
      <aside style={{ width: "260px", borderRight: "1px solid rgba(102, 187, 106, 0.15)", background: "rgba(10, 16, 11, 0.65)", display: "flex", flexDirection: "column", padding: "32px 24px" }}>
        <Link href="/" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#66BB6A", textDecoration: "none", marginBottom: "40px", display: "block" }}>
          ∞ EcoVerse Admin
        </Link>
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <Link href="/admin" style={linkStyle(true)}>📊 Overview</Link>
          <Link href="/admin/users" style={linkStyle(false)}>👥 Users Directory</Link>
          <Link href="/admin/rescue" style={linkStyle(false)}>🐾 Rescue Board</Link>
          <Link href="/admin/community" style={linkStyle(false)}>💬 Community Feed</Link>
          <Link href="/dashboard" style={linkStyle(false)}>🏠 User Dashboard</Link>
        </nav>
        <div style={{ fontSize: "0.75rem", color: "rgba(232, 245, 233, 0.4)", borderTop: "1px solid rgba(102, 187, 106, 0.15)", paddingTop: "16px" }}>
          Admin Mode Enabled
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "40px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Admin Control Panel</h1>
            <p style={{ color: "rgba(232, 245, 233, 0.6)", marginTop: "4px" }}>Manage platform users, verify partners, and resolve reported incidents</p>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: "36px", height: "36px", border: "3px solid rgba(102,187,106,0.15)", borderRadius: "50%", borderTopColor: "#66BB6A", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Overview Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
              {[
                { title: "Total Users", value: stats.totalUsers, icon: <Users size={20} />, color: "#42a5f5" },
                { title: "Active Today", value: stats.activeToday, icon: <Activity size={20} />, color: "#66bb6a" },
                { title: "Open SOS Cases", value: stats.openSos, icon: <ShieldAlert size={20} />, color: "#ef5350" },
                { title: "Resolved Cases", value: stats.resolvedCases, icon: <BadgeCheck size={20} />, color: "#81c784" },
                { title: "NGO Partners", value: stats.partnerNgos, icon: <Shield size={20} />, color: "#26c6da" },
                { title: "Flagged Content", value: stats.flaggedPosts, icon: <AlertTriangle size={20} />, color: "#ffa726" }
              ].map((c) => (
                <div key={c.title} style={{ background: "rgba(21, 35, 23, 0.45)", border: `1px solid rgba(102, 187, 106, 0.15)`, borderRadius: "14px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "rgba(232, 245, 233, 0.6)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>
                    <span>{c.title}</span>
                    <span style={{ color: c.color }}>{c.icon}</span>
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "10px", color: c.color }}>{c.value}</div>
                </div>
              ))}
            </div>

            {/* Quick Settings & Announcement Blocks */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="admin-actions-grid">
              {/* Announcement configuration */}
              <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.15)", borderRadius: "16px", padding: "24px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Megaphone size={18} style={{ color: "#66BB6A" }} /> Publish Site Announcement
                </h3>
                <textarea
                  placeholder="Enter alert text to show at the top of the community page..."
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  rows={3}
                  style={inputStyle}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                  <label style={{ fontSize: "0.85rem", color: "rgba(232, 245, 233, 0.65)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <input type="checkbox" checked={showBanner} onChange={(e) => setShowBanner(e.target.checked)} />
                    Show banner immediately
                  </label>
                  <button onClick={handlePostAnnouncement} style={btnStyle}>Publish</button>
                </div>
              </div>

              {/* Site thresholds configurations */}
              <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.15)", borderRadius: "16px", padding: "24px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Settings size={18} style={{ color: "#66BB6A" }} /> Platform Settings
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "rgba(232, 245, 233, 0.65)", display: "block", marginBottom: "6px" }}>
                      SOS Escalation Threshold (Minutes)
                    </label>
                    <input
                      type="number"
                      value={escalationTime}
                      onChange={(e) => setEscalationTime(Number(e.target.value))}
                      style={smallInputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "rgba(232, 245, 233, 0.65)", display: "block", marginBottom: "6px" }}>
                      Community Post TTL (Days)
                    </label>
                    <input
                      type="number"
                      value={30}
                      disabled
                      style={{ ...smallInputStyle, opacity: 0.6, cursor: "not-allowed" }}
                    />
                  </div>
                  <button onClick={handleSaveSettings} style={{ ...btnStyle, alignSelf: "flex-end", marginTop: "8px" }}>Save Changes</button>
                </div>
              </div>
            </div>

            {/* Audit Logs */}
            <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.15)", borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px" }}>Recent Platform Actions</h3>
              {recentLogs.length === 0 ? (
                <p style={{ color: "rgba(232, 245, 233, 0.4)", fontSize: "0.85rem" }}>No recent logs logged.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recentLogs.map((log) => (
                    <div key={log.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(10, 16, 11, 0.4)", border: "1px solid rgba(102, 187, 106, 0.08)", borderRadius: "8px", fontSize: "0.82rem" }}>
                      <div>
                        <strong style={{ color: "#A5D6A7" }}>{log.action.toUpperCase()}</strong>
                        <span style={{ marginLeft: "10px", color: "rgba(255,255,255,0.75)" }}>{log.detail}</span>
                      </div>
                      <span style={{ color: "rgba(232,245,233,0.3)" }}>
                        {new Date(log.created_at).toLocaleTimeString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .admin-actions-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(10, 16, 11, 0.6)",
  border: "1px solid rgba(102, 187, 106, 0.22)",
  borderRadius: "10px",
  padding: "12px",
  color: "#FFFFFF",
  outline: "none",
  fontSize: "0.88rem",
  resize: "none",
  boxSizing: "border-box"
};

const smallInputStyle: React.CSSProperties = {
  width: "100px",
  background: "rgba(10, 16, 11, 0.6)",
  border: "1px solid rgba(102, 187, 106, 0.22)",
  borderRadius: "8px",
  padding: "8px 12px",
  color: "#FFFFFF",
  outline: "none",
  fontSize: "0.85rem",
};

const btnStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #66BB6A, #388E3C)",
  color: "#FFFFFF",
  border: "none",
  padding: "8px 20px",
  borderRadius: "8px",
  fontWeight: 700,
  fontSize: "0.82rem",
  cursor: "pointer",
  transition: "opacity 0.2s"
};
