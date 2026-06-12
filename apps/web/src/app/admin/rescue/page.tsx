"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, ShieldAlert, ArrowLeft, CheckCircle2, User, RefreshCw, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface RescueCase {
  id: string;
  reporter_name: string | null;
  state_name: string;
  city_name: string;
  area_name: string;
  display_zone: string | null;
  animal_type: string;
  condition_summary: string | null;
  emergency_level: string;
  status: string;
  assigned_volunteer_id: string | null;
  created_at: string;
}

export default function AdminRescuePage() {
  const [cases, setCases] = useState<RescueCase[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reassigningId, setReassigningId] = useState<string | null>(null);

  const fetchCasesAndVolunteers = async () => {
    setLoading(true);
    try {
      const { data: caseData, error: caseError } = await supabase
        .from("rescue_cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (caseError) throw caseError;
      setCases(caseData || []);

      const { data: volData, error: volError } = await supabase
        .from("profiles")
        .select("id, full_name, city_name");

      if (volError) throw volError;
      setVolunteers(volData || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCasesAndVolunteers();
  }, []);

  const handleUpdateSeverity = async (caseId: string, current: string) => {
    const nextSeverity = current === "critical" ? "medium" : "critical";
    try {
      const { error } = await supabase
        .from("rescue_cases")
        .update({ emergency_level: nextSeverity })
        .eq("id", caseId);

      if (error) throw error;
      toast.success(`Emergency level set to ${nextSeverity}`);
      
      await supabase.from("admin_logs").insert([{
        action: "update_severity",
        detail: `Set case ${caseId} severity to ${nextSeverity}`
      }]);

      fetchCasesAndVolunteers();
    } catch (err) {
      toast.error("Failed to update emergency level");
    }
  };

  const handleForceClose = async (caseId: string) => {
    if (!confirm("Are you sure you want to force close this rescue case?")) return;
    try {
      const { error } = await supabase
        .from("rescue_cases")
        .update({ status: "closed" })
        .eq("id", caseId);

      if (error) throw error;
      toast.success("Case force closed successfully");

      await supabase.from("admin_logs").insert([{
        action: "close_case",
        detail: `Force closed case ${caseId}`
      }]);

      fetchCasesAndVolunteers();
    } catch (err) {
      toast.error("Failed to close case");
    }
  };

  const handleReassign = async (caseId: string, volunteerId: string) => {
    try {
      const { error } = await supabase
        .from("rescue_cases")
        .update({
          assigned_volunteer_id: volunteerId || null,
          status: volunteerId ? "assigned" : "open"
        })
        .eq("id", caseId);

      if (error) throw error;
      toast.success(volunteerId ? "Volunteer reassigned successfully!" : "Volunteer unassigned.");
      setReassigningId(null);

      await supabase.from("admin_logs").insert([{
        action: "reassign_volunteer",
        detail: `Reassigned case ${caseId} to volunteer ${volunteerId || 'None'}`
      }]);

      fetchCasesAndVolunteers();
    } catch (err) {
      toast.error("Reassignment failed");
    }
  };

  const filtered = cases.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchAnimal = c.animal_type?.toLowerCase().includes(q) || false;
      const matchCity = c.city_name?.toLowerCase().includes(q) || false;
      const matchCondition = c.condition_summary?.toLowerCase().includes(q) || false;
      if (!matchAnimal && !matchCity && !matchCondition) return false;
    }
    if (severityFilter !== "all" && c.emergency_level !== severityFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
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
          <Link href="/admin/rescue" style={linkStyle(true)}>🐾 Rescue Board</Link>
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
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Rescue Board Cases</h1>
          <p style={{ color: "rgba(232, 245, 233, 0.6)", marginTop: "4px" }}>Reassign volunteer dispatches, force close reports, and monitor critical situations</p>
        </div>

        {/* Filters */}
        <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.15)", borderRadius: "14px", padding: "16px", marginBottom: "24px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(102, 187, 106, 0.4)" }} />
            <input
              type="text"
              placeholder="Search by animal, conditions, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchStyle}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} style={selectStyle}>
              <option value="all">All Severity</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ width: "32px", height: "32px", border: "3px solid rgba(102,187,106,0.15)", borderRadius: "50%", borderTopColor: "#66BB6A", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filtered.map((c) => {
              const volunteer = volunteers.find(v => v.id === c.assigned_volunteer_id);
              const severityColor = c.emergency_level === "critical" ? "#EF5350" : c.emergency_level === "high" ? "#FFA726" : c.emergency_level === "medium" ? "#FFE082" : "#A5D6A7";

              return (
                <div key={c.id} style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "16px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "1.2rem" }}>
                        {{ dog: "🐶", cat: "🐱", cow: "🐮", bird: "🐦" }[c.animal_type] || "🐾"}
                      </span>
                      <strong style={{ fontSize: "0.95rem", textTransform: "capitalize" }}>{c.animal_type} Case</strong>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: severityColor }}>
                        {c.emergency_level.toUpperCase()}
                      </span>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: "rgba(102, 187, 106, 0.1)", color: "#A5D6A7" }}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "rgba(232, 245, 233, 0.4)" }}>
                      Reported {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.9rem", color: "rgba(232, 245, 233, 0.95)", margin: "0 0 12px 0" }}>
                    {c.condition_summary || "No description summary."}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", borderTop: "1px solid rgba(102, 187, 106, 0.08)", paddingTop: "14px", fontSize: "0.82rem" }}>
                    <div style={{ color: "rgba(232, 245, 233, 0.55)" }}>
                      📍 <strong>Zone:</strong> {c.display_zone || `${c.area_name}, ${c.city_name}`}
                      <br />
                      👤 <strong>Reporter:</strong> {c.reporter_name || "Anonymous"}
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {/* Volunteer details / reassignment control */}
                      {reassigningId === c.id ? (
                        <select
                          onChange={(e) => handleReassign(c.id, e.target.value)}
                          defaultValue={c.assigned_volunteer_id || ""}
                          style={selectStyle}
                        >
                          <option value="">-- Unassign --</option>
                          {volunteers.map(v => (
                            <option key={v.id} value={v.id}>{v.full_name || v.id}</option>
                          ))}
                        </select>
                      ) : (
                        <div style={{ color: "rgba(232,245,233,0.7)", display: "flex", alignItems: "center", gap: "6px" }}>
                          <User size={13} style={{ color: "#66BB6A" }} />
                          <span>Assignee: <strong>{volunteer?.full_name || "Awaiting Volunteer"}</strong></span>
                          <button onClick={() => setReassigningId(c.id)} style={smallActionBtnStyle} title="Change Assignment">
                            <RefreshCw size={11} />
                          </button>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => handleUpdateSeverity(c.id, c.emergency_level)} style={pillActionStyle}>
                          Toggle Critical
                        </button>
                        <button onClick={() => handleForceClose(c.id)} style={{ ...pillActionStyle, color: "#EF5350", borderColor: "rgba(239, 83, 80, 0.25)" }}>
                          Force Close
                        </button>
                      </div>
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

const smallActionBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#A5D6A7",
  borderRadius: "4px",
  width: "20px",
  height: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  padding: 0,
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
