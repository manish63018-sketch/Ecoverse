"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  ArrowLeft, Plus, MapPin, Activity, Shield, Users, Clock, 
  Volume2, VolumeX, AlertCircle, CheckCircle, Search, Filter 
} from "lucide-react";
import toast from "react-hot-toast";

interface RescueCase {
  caseId: string;
  animalType: string;
  conditionDescription: string;
  severity: string;
  status: string;
  reporterContact: { name: string; phone: string };
  location: { addressText: string };
  createdAt: string;
  assignedVolunteerId: string | null;
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  critical: { bg: "rgba(239, 83, 80, 0.15)", text: "#EF5350" },
  high: { bg: "rgba(255, 167, 38, 0.15)", text: "#FFA726" },
  medium: { bg: "rgba(255, 213, 79, 0.15)", text: "#FFE082" },
  low: { bg: "rgba(102, 187, 106, 0.15)", text: "#A5D6A7" },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  reported: { bg: "rgba(239, 83, 80, 0.1)", text: "#EF5350" },
  dispatched: { bg: "rgba(66, 165, 245, 0.1)", text: "#42A5F5" },
  in_progress: { bg: "rgba(255, 167, 38, 0.1)", text: "#FFA726" },
  resolved: { bg: "rgba(102, 187, 106, 0.1)", text: "#66BB6A" },
};

export default function RescuePage() {
  const { user, loading } = useAuth();
  const [rescues, setRescues] = useState<RescueCase[]>([]);
  const [filteredRescues, setFilteredRescues] = useState<RescueCase[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [animalFilter, setAnimalFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Subscribe to real-time rescues
  useEffect(() => {
    const q = query(collection(db, "rescues"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: RescueCase[] = [];
        snapshot.forEach((doc) => {
          list.push({ caseId: doc.id, ...doc.data() } as RescueCase);
        });
        // Sort by newest first
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRescues(list);
        setDataLoading(false);
      },
      (error) => {
        console.error("Error subscribing to rescues:", error);
        toast.error("Failed to sync rescue feed");
        setDataLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter application
  useEffect(() => {
    let result = [...rescues];

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.conditionDescription.toLowerCase().includes(term) ||
          r.location.addressText.toLowerCase().includes(term) ||
          r.animalType.toLowerCase().includes(term)
      );
    }

    if (animalFilter !== "all") {
      result = result.filter((r) => r.animalType === animalFilter);
    }

    if (severityFilter !== "all") {
      result = result.filter((r) => r.severity === severityFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    } else {
      // By default show active ones if not selected, or show all
      // We will show all rescues on this list page
    }

    setFilteredRescues(result);
  }, [rescues, searchTerm, animalFilter, severityFilter, statusFilter]);

  const handleAcceptDispatch = async (caseId: string) => {
    if (!user) {
      toast.error("Please login to accept dispatches");
      return;
    }
    try {
      const rescueRef = doc(db, "rescues", caseId);
      await updateDoc(rescueRef, {
        status: "in_progress",
        assignedVolunteerId: user.uid,
      });
      toast.success("Rescue case accepted! You are now dispatched.");
    } catch (error) {
      console.error("Error accepting rescue case:", error);
      toast.error("Failed to accept rescue case");
    }
  };

  const handleResolveCase = async (caseId: string) => {
    try {
      const rescueRef = doc(db, "rescues", caseId);
      await updateDoc(rescueRef, {
        status: "resolved",
      });
      toast.success("Rescue marked as completed! Awarded 🏅 Rescue Badge.");
    } catch (error) {
      console.error("Error resolving rescue case:", error);
      toast.error("Failed to resolve rescue case");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a1a0e",
        color: "#E8F5E9",
        fontFamily: "var(--font-sans), sans-serif",
        paddingBottom: "80px",
      }}
    >
      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: "rgba(15,26,16,0.95)",
          borderBottom: "1px solid rgba(102,187,106,0.12)",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(16px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/dashboard"
            style={{ color: "rgba(232,245,233,0.6)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem" }}
          >
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
            Live Rescue Board
          </h1>
        </div>
        <Link
          href="/sos"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #EF5350, #C62828)",
            border: "none",
            color: "#FFFFFF",
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "0.85rem",
            padding: "10px 20px",
            borderRadius: "var(--radius-full)",
            cursor: "pointer",
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(239,83,80,0.3)",
          }}
        >
          <Plus size={15} />
          Report Emergency SOS
        </Link>
      </div>

      <div className="container" style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
        {/* ── Filter Bar Card ────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(21,35,23,0.5)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(102,187,106,0.12)",
            borderRadius: "var(--radius-2xl)",
            padding: "20px",
            marginBottom: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(102, 187, 106, 0.4)",
                }}
              />
              <input
                type="text"
                placeholder="Search by condition description, landmark, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(10,16,11,0.6)",
                  border: "1px solid rgba(102,187,106,0.2)",
                  borderRadius: "var(--radius-lg)",
                  padding: "11px 14px 11px 40px",
                  color: "#E8F5E9",
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={14} style={{ color: "rgba(102, 187, 106, 0.5)" }} />
              <span style={{ fontSize: "0.8rem", color: "rgba(232, 245, 233, 0.6)", fontWeight: 600 }}>Filters:</span>
            </div>

            {/* Animal Category */}
            <select
              value={animalFilter}
              onChange={(e) => setAnimalFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Animals</option>
              <option value="dog">Dogs</option>
              <option value="cat">Cats</option>
              <option value="cow">Cows / Cattle</option>
              <option value="bird">Birds</option>
              <option value="other">Others</option>
            </select>

            {/* Severity */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Severities</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* ── Cases Grid / List ─────────────────────────────────────────── */}
        {dataLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div className="spinner-green" />
            <p style={{ color: "rgba(232,245,233,0.4)", fontSize: "0.9rem", marginTop: "16px" }}>Fetching rescues...</p>
          </div>
        ) : filteredRescues.length === 0 ? (
          <div
            style={{
              background: "rgba(21,35,23,0.3)",
              border: "1px solid rgba(102,187,106,0.08)",
              borderRadius: "var(--radius-2xl)",
              padding: "60px 24px",
              textAlign: "center",
            }}
          >
            <Activity size={40} style={{ color: "#66BB6A", opacity: 0.3, marginBottom: "16px" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px 0" }}>No Rescue Cases Found</h3>
            <p style={{ color: "rgba(232,245,233,0.45)", fontSize: "0.85rem", margin: "0 0 20px 0" }}>
              Try adjusting your search criteria or select different filter parameters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setAnimalFilter("all");
                setSeverityFilter("all");
                setStatusFilter("all");
              }}
              style={{
                background: "rgba(102, 187, 106, 0.12)",
                border: "1px solid rgba(102, 187, 106, 0.25)",
                color: "#A5D6A7",
                padding: "8px 18px",
                borderRadius: "var(--radius-lg)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            {filteredRescues.map((rescue) => {
              const isAssignedToMe = user && rescue.assignedVolunteerId === user.uid;
              const isDispatched = rescue.status === "in_progress";
              const sev = SEVERITY_COLORS[rescue.severity] || { bg: "rgba(255,255,255,0.05)", text: "#E8F5E9" };
              const stat = STATUS_COLORS[rescue.status] || { bg: "rgba(255,255,255,0.05)", text: "#E8F5E9" };
              const dateStr = rescue.createdAt 
                ? new Date(rescue.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) 
                : "recently";

              return (
                <div
                  key={rescue.caseId}
                  style={{
                    background: "rgba(21,35,23,0.45)",
                    backdropFilter: "blur(16px)",
                    border: isAssignedToMe ? "1px solid rgba(102,187,106,0.35)" : "1px solid rgba(102,187,106,0.12)",
                    borderRadius: "var(--radius-2xl)",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    transition: "all 0.2s",
                    boxShadow: isAssignedToMe ? "0 4px 20px rgba(102,187,106,0.08)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "1.2rem" }}>
                          {rescue.animalType === "dog" ? "🐶" : rescue.animalType === "cat" ? "🐱" : rescue.animalType === "cow" ? "🐮" : rescue.animalType === "bird" ? "🐦" : "🐾"}
                        </span>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, textTransform: "capitalize" }}>
                          {rescue.animalType} Emergency
                        </h3>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: "4px",
                            background: sev.bg,
                            color: sev.text,
                            textTransform: "uppercase",
                          }}
                        >
                          {rescue.severity}
                        </span>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: "4px",
                            background: stat.bg,
                            color: stat.text,
                            textTransform: "uppercase",
                          }}
                        >
                          {rescue.status}
                        </span>
                      </div>
                      <p style={{ color: "rgba(232, 245, 233, 0.5)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
                        <Clock size={12} /> Reported on {dateStr} by {rescue.reporterContact?.name ? rescue.reporterContact.name.split(" ")[0] : "Anonymous"}
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: "0.875rem", lineHeight: 1.5, color: "rgba(232, 245, 233, 0.85)", margin: 0 }}>
                    {rescue.conditionDescription}
                  </p>

                  <div style={{ borderTop: "1px solid rgba(102,187,106,0.08)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.8rem", color: "rgba(232,245,233,0.7)" }}>
                      <MapPin size={14} style={{ color: "#66BB6A", marginTop: "2px", flexShrink: 0 }} />
                      <span>{rescue.location.addressText}</span>
                    </div>

                    {/* Contact detail if assigned to current user */}
                    {isAssignedToMe && rescue.reporterContact && (
                      <div
                        style={{
                          marginTop: "6px",
                          padding: "12px 16px",
                          background: "rgba(102, 187, 106, 0.08)",
                          border: "1px solid rgba(102, 187, 106, 0.2)",
                          borderRadius: "var(--radius-xl)",
                          fontSize: "0.8rem",
                        }}
                      >
                        <div style={{ fontWeight: 700, color: "#A5D6A7", marginBottom: "4px" }}>📞 Reporter Contact Details:</div>
                        <div>Name: {rescue.reporterContact.name || "Anonymous"}</div>
                        <div>Phone: <a href={`tel:${rescue.reporterContact.phone}`} style={{ color: "#66BB6A", fontWeight: 700, textDecoration: "none" }}>{rescue.reporterContact.phone}</a></div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {rescue.status !== "resolved" && (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                      {isAssignedToMe ? (
                        <button
                          onClick={() => handleResolveCase(rescue.caseId)}
                          style={{
                            background: "linear-gradient(135deg, #1976D2, #42A5F5)",
                            border: "none",
                            color: "#FFFFFF",
                            padding: "8px 18px",
                            borderRadius: "var(--radius-lg)",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontFamily: "var(--font-sans)",
                            boxShadow: "0 4px 10px rgba(33, 150, 243, 0.25)",
                          }}
                        >
                          Complete Rescue
                        </button>
                      ) : isDispatched ? (
                        <span style={{ fontSize: "0.78rem", color: "rgba(232, 245, 233, 0.45)", fontWeight: 600, padding: "8px 0" }}>
                          🔒 Volunteer Dispatched
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAcceptDispatch(rescue.caseId)}
                          style={{
                            background: "rgba(102, 187, 106, 0.12)",
                            border: "1px solid rgba(102, 187, 106, 0.25)",
                            color: "#A5D6A7",
                            padding: "8px 18px",
                            borderRadius: "var(--radius-lg)",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontFamily: "var(--font-sans)",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "#388E3C";
                            (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
                            (e.currentTarget as HTMLElement).style.borderColor = "#388E3C";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(102, 187, 106, 0.12)";
                            (e.currentTarget as HTMLElement).style.color = "#A5D6A7";
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(102, 187, 106, 0.25)";
                          }}
                        >
                          Accept Dispatch
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .spinner-green {
          width: 36px; height: 36px;
          border: 3px solid rgba(102,187,106,0.15);
          border-radius: 50%;
          border-top-color: #66BB6A;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: "rgba(10,16,11,0.6)",
  border: "1px solid rgba(102,187,106,0.2)",
  borderRadius: "var(--radius-lg)",
  padding: "8px 14px",
  color: "#E8F5E9",
  fontSize: "0.8rem",
  fontWeight: 600,
  fontFamily: "var(--font-sans)",
  outline: "none",
  cursor: "pointer",
};
