"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, ShieldAlert, Award, UserCheck, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  email?: string;
  city_name: string | null;
  state_name: string | null;
  roles: string[];
  verification_status: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
      toast.error("Failed to load users list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "verified" ? "unverified" : "verified";
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ verification_status: nextStatus })
        .eq("id", userId);

      if (error) throw error;
      toast.success(`User verification status set to ${nextStatus}!`);
      
      await supabase.from("admin_logs").insert([{
        action: "verify_user",
        detail: `Set verification status of ${userId} to ${nextStatus}`
      }]);

      fetchUsers();
    } catch (err) {
      toast.error("Verification update failed");
    }
  };

  const handleUpdateRoles = async (userId: string, currentRoles: string[]) => {
    // Add admin role as a quick action toggle for test/demo
    let nextRoles = [...currentRoles];
    if (nextRoles.includes("admin")) {
      nextRoles = nextRoles.filter(r => r !== "admin");
    } else {
      nextRoles.push("admin");
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ roles: nextRoles, is_admin: nextRoles.includes("admin") })
        .eq("id", userId);

      if (error) throw error;
      toast.success(`Roles updated! Admin access toggled.`);

      await supabase.from("admin_logs").insert([{
        action: "update_roles",
        detail: `Toggled admin role for ${userId}`
      }]);

      fetchUsers();
    } catch (err) {
      toast.error("Failed to update roles");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user profile? This cannot be undone.")) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;
      toast.success("User profile deleted from database");

      await supabase.from("admin_logs").insert([{
        action: "delete_user",
        detail: `Deleted profile ${userId}`
      }]);

      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user profile");
    }
  };

  const filtered = users.filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.full_name?.toLowerCase().includes(q) || false;
      const matchUsername = u.username?.toLowerCase().includes(q) || false;
      const matchCity = u.city_name?.toLowerCase().includes(q) || false;
      if (!matchName && !matchUsername && !matchCity) return false;
    }
    if (roleFilter !== "all" && !u.roles.includes(roleFilter)) return false;
    if (statusFilter !== "all" && u.verification_status !== statusFilter) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Username", "City", "Roles", "Status", "Joined"];
    const rows = filtered.map((u) => [
      u.id,
      u.full_name || "N/A",
      u.username || "N/A",
      u.city_name || "N/A",
      u.roles.join(", "),
      u.verification_status,
      new Date(u.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ecoverse_users_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded!");
  };

  return (
    <div style={{ display: "flex", background: "#050f07", minHeight: "100vh", color: "#E8F5E9", fontFamily: "var(--font-sans), sans-serif" }}>
      {/* Sidebar Navigation */}
      <aside style={{ width: "260px", borderRight: "1px solid rgba(102, 187, 106, 0.15)", background: "rgba(10, 16, 11, 0.65)", display: "flex", flexDirection: "column", padding: "32px 24px" }}>
        <Link href="/" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#66BB6A", textDecoration: "none", marginBottom: "40px", display: "block" }}>
          ∞ EcoVerse Admin
        </Link>
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <Link href="/admin" style={linkStyle(false)}>📊 Overview</Link>
          <Link href="/admin/users" style={linkStyle(true)}>👥 Users Directory</Link>
          <Link href="/admin/rescue" style={linkStyle(false)}>🐾 Rescue Board</Link>
          <Link href="/admin/community" style={linkStyle(false)}>💬 Community Feed</Link>
          <Link href="/dashboard" style={linkStyle(false)}>🏠 User Dashboard</Link>
        </nav>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: "40px" }}>
        <div style={{ marginBottom: "32px" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#66BB6A", textDecoration: "none", fontSize: "0.85rem", fontWeight: 700, marginBottom: "12px" }}>
            <ArrowLeft size={14} /> Back to Overview
          </Link>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Users Directory</h1>
          <p style={{ color: "rgba(232, 245, 233, 0.6)", marginTop: "4px" }}>View profiles, toggle user roles, and verify field rescuers</p>
        </div>

        {/* Filter Bar Controls */}
        <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.15)", borderRadius: "14px", padding: "16px", marginBottom: "24px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(102, 187, 106, 0.4)" }} />
            <input
              type="text"
              placeholder="Search by name, username, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchStyle}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={selectStyle}>
              <option value="all">All Roles</option>
              <option value="volunteer">Volunteer</option>
              <option value="rescuer">Rescuer</option>
              <option value="medical_care">Medical Care</option>
              <option value="transport">Transport</option>
              <option value="foster">Foster Parent</option>
              <option value="admin">Admin</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
            <button onClick={handleExportCSV} style={btnSecondaryStyle}>Export CSV</button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ width: "32px", height: "32px", border: "3px solid rgba(102,187,106,0.15)", borderRadius: "50%", borderTopColor: "#66BB6A", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          </div>
        ) : (
          <div style={{ overflowX: "auto", background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.15)", borderRadius: "16px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(102, 187, 106, 0.15)", color: "rgba(232, 245, 233, 0.55)" }}>
                  <th style={thStyle}>Full Name</th>
                  <th style={thStyle}>City</th>
                  <th style={thStyle}>Roles</th>
                  <th style={thStyle}>Verification Status</th>
                  <th style={thStyle}>Joined</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid rgba(102, 187, 106, 0.08)" }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700 }}>{u.full_name || "N/A"}</div>
                      <div style={{ fontSize: "0.72rem", color: "rgba(232, 245, 233, 0.4)" }}>@{u.username || "username"}</div>
                    </td>
                    <td style={tdStyle}>{u.city_name ? `${u.city_name}, ${u.state_name || ""}` : "N/A"}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {(u.roles || []).map((r) => (
                          <span key={r} style={roleBadgeStyle(r === "admin")}>{r}</span>
                        ))}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(u.verification_status === "verified")}>
                        {u.verification_status.toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>{new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleVerify(u.id, u.verification_status)} title="Verify User" style={actionBtnStyle}>
                          <UserCheck size={14} />
                        </button>
                        <button onClick={() => handleUpdateRoles(u.id, u.roles)} title="Toggle Admin Role" style={actionBtnStyle}>
                          <Award size={14} />
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} title="Delete User" style={{ ...actionBtnStyle, color: "#EF5350" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  padding: "8px 12px",
  color: "#E8F5E9",
  fontSize: "0.8rem",
  fontWeight: 600,
  outline: "none",
  cursor: "pointer",
};

const btnSecondaryStyle: React.CSSProperties = {
  background: "rgba(102, 187, 106, 0.1)",
  border: "1px solid rgba(102, 187, 106, 0.35)",
  color: "#A5D6A7",
  padding: "8px 16px",
  borderRadius: "8px",
  fontWeight: 700,
  fontSize: "0.8rem",
  cursor: "pointer",
};

const thStyle: React.CSSProperties = {
  padding: "16px 20px",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: "14px 20px",
  color: "rgba(232, 245, 233, 0.85)",
};

const roleBadgeStyle = (isAdmin: boolean): React.CSSProperties => ({
  background: isAdmin ? "rgba(239, 83, 80, 0.12)" : "rgba(102, 187, 106, 0.1)",
  border: `1px solid ${isAdmin ? "rgba(239, 83, 80, 0.35)" : "rgba(102, 187, 106, 0.25)"}`,
  color: isAdmin ? "#EF5350" : "#A5D6A7",
  borderRadius: "4px",
  padding: "2px 6px",
  fontSize: "0.68rem",
  fontWeight: 600,
});

const statusBadgeStyle = (isVerified: boolean): React.CSSProperties => ({
  background: isVerified ? "rgba(102, 187, 106, 0.12)" : "rgba(255, 255, 255, 0.05)",
  border: `1px solid ${isVerified ? "rgba(102, 187, 106, 0.35)" : "rgba(255, 255, 255, 0.1)"}`,
  color: isVerified ? "#66BB6A" : "rgba(232, 245, 233, 0.45)",
  borderRadius: "4px",
  padding: "2px 6px",
  fontSize: "0.68rem",
  fontWeight: 700,
});

const actionBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(232, 245, 233, 0.75)",
  borderRadius: "6px",
  width: "28px",
  height: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.15s",
};
