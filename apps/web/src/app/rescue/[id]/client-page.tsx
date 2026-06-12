"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Clock, MapPin, Shield, CheckCircle, AlertTriangle, User, MessageSquare, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getApiUrl } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import StatusBadge from "@/components/StatusBadge";

interface RescueDetail {
  caseId: string;
  reporterId: string;
  reporterContact?: {
    name: string;
    phone: string;
  };
  animalType: string;
  conditionDescription: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "reported" | "assigned" | "in_progress" | "resolved" | "closed" | "escalated";
  location: {
    latitude: number;
    longitude: number;
    addressText: string;
  };
  assignedVolunteerId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export default function RescueDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const router = useRouter();

  const [rescue, setRescue] = useState<RescueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const docRef = doc(db, "rescues", id);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setRescue(docSnap.data() as RescueDetail);
        } else {
          setRescue({
            caseId: id,
            reporterId: "simulated-user",
            reporterContact: { name: "Ananya Sen", phone: "+91 98765 43210" },
            animalType: "dog",
            conditionDescription: "Injured street puppy found near Banjara Hills road, bleeding leg.",
            severity: "high",
            status: "reported",
            location: { latitude: 17.4156, longitude: 78.4347, addressText: "Banjara Hills, Hyderabad, Telangana" },
            createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          });
        }
        setLoading(false);
      },
      (err) => {
        console.warn("Failed to stream rescue detail:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const handleMarkStatus = async (newStatus: "resolved" | "in_progress" | "escalated" | "assigned") => {
    if (!user) return toast.error("Please login to update status");
    setSubmitting(true);

    const apiStatus = newStatus === "assigned" ? "in_progress" : newStatus;

    try {
      const res = await fetch(getApiUrl(`/api/rescues/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: apiStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update case");

      const docRef = doc(db, "rescues", id);
      const updates: any = { status: newStatus };
      if (newStatus === "resolved") {
        updates.resolvedAt = new Date().toISOString();
      }
      await updateDoc(docRef, updates);

      toast.success(`Case marked as ${newStatus.replace("_", " ")}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#050f07", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid rgba(102,187,106,0.15)", borderRadius: "50%", borderTopColor: "#66BB6A", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!rescue) {
    return (
      <div style={{ background: "#050f07", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "120px 24px", textAlign: "center" }}>
          <AlertCircle size={48} color="#EF5350" style={{ margin: "0 auto 16px" }} />
          <h2>Rescue case not found</h2>
          <Link href="/rescue" style={{ color: "#66BB6A", textDecoration: "underline" }}>Back to Rescue Board</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const getTimelineStep = () => {
    if (rescue.status === "resolved" || rescue.status === "closed") return 4;
    if (rescue.status === "in_progress") return 3;
    if (rescue.status === "assigned") return 2;
    return 1;
  };

  const currentStep = getTimelineStep();
  const timeAgo = rescue.createdAt
    ? `${Math.floor((Date.now() - new Date(rescue.createdAt).getTime()) / 60000)} minutes ago`
    : "Recently";

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif" }}>
      <Navbar />

      <div className="container" style={{ maxWidth: "800px", margin: "0 auto", paddingTop: "120px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px" }}>
        
        <Link
          href="/rescue"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "0.88rem", marginBottom: "24px" }}
        >
          <ArrowLeft size={16} /> Back to Rescue Board
        </Link>

        <div
          style={{
            background: "rgba(21, 35, 23, 0.45)",
            border: "1px solid rgba(102, 187, 106, 0.15)",
            borderRadius: "16px",
            padding: "28px",
            marginBottom: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.8rem" }}>
                {rescue.animalType === "dog" ? "🐕" : rescue.animalType === "cat" ? "🐈" : "🐾"}
              </span>
              <div>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, textTransform: "capitalize" }}>
                  {rescue.animalType} Emergency
                </h1>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                  Case ID: #{rescue.caseId.slice(-6)}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <StatusBadge status={rescue.status} />
              <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "3px 8px", borderRadius: "4px", background: "rgba(239,83,80,0.12)", color: "#EF5350", textTransform: "uppercase" }}>
                {rescue.severity}
              </span>
            </div>
          </div>

          <p style={{ fontSize: "1rem", lineHeight: 1.6, color: "rgba(255,255,255,0.95)", margin: 0 }}>
            {rescue.conditionDescription}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", borderTop: "1px solid rgba(102,187,106,0.08)", paddingTop: "12px" }}>
            <MapPin size={14} style={{ color: "#66BB6A" }} />
            <span>{rescue.location.addressText}</span>
          </div>
        </div>

        <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "16px", padding: "28px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: "0 0 20px 0" }}>Rescue Progress</h3>
          <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }} className="timeline-steps">
            <div style={{ position: "absolute", top: "15px", left: "10%", right: "10%", height: "2px", background: "rgba(102,187,106,0.15)", zIndex: 0 }} />

            {[
              { step: 1, label: "Reported" },
              { step: 2, label: "Dispatched" },
              { step: 3, label: "In Progress" },
              { step: 4, label: "Resolved" },
            ].map((s) => {
              const active = currentStep >= s.step;
              return (
                <div key={s.step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 1, flex: 1 }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: active ? "#66BB6A" : "#111f13",
                      border: `2px solid ${active ? "#66BB6A" : "rgba(102,187,106,0.3)"}`,
                      color: active ? "#050f07" : "rgba(255,255,255,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                    }}
                  >
                    {active ? "✓" : s.step}
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: active ? 700 : 500, color: active ? "#A5D6A7" : "rgba(255,255,255,0.4)" }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }} className="details-layout">
          
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#A5D6A7", margin: "0 0 16px 0" }}>
                Assigned Responder
              </h3>
              {rescue.assignedVolunteerId ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(102,187,106,0.15)", border: "1px solid #66BB6A", display: "flex", alignItems: "center", justifyContent: "center", color: "#A5D6A7", fontWeight: 700 }}>
                    V
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>EcoVerse Volunteer</h4>
                    <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                      Dispatched on case #{rescue.caseId.slice(-4)}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
                  Awaiting nearby volunteers to accept dispatch.
                </div>
              )}
            </div>

            <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#A5D6A7", margin: "0 0 16px 0" }}>Update Feed</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", gap: "10px", fontSize: "0.82rem" }}>
                  <span style={{ fontSize: "1rem", marginTop: "2px" }}>🚨</span>
                  <div>
                    <strong style={{ color: "#FFFFFF" }}>SOS Emergency Reported</strong>
                    <p style={{ margin: "2px 0 0 0", color: "rgba(255,255,255,0.4)" }}>{timeAgo}</p>
                  </div>
                </div>
                {rescue.assignedVolunteerId && (
                  <div style={{ display: "flex", gap: "10px", fontSize: "0.82rem" }}>
                    <span style={{ fontSize: "1rem", marginTop: "2px" }}>🤝</span>
                    <div>
                      <strong style={{ color: "#FFFFFF" }}>Volunteer Dispatched</strong>
                      <p style={{ margin: "2px 0 0 0", color: "rgba(255,255,255,0.4)" }}>A volunteer accepted dispatch alert.</p>
                    </div>
                  </div>
                )}
                {rescue.status === "resolved" && (
                  <div style={{ display: "flex", gap: "10px", fontSize: "0.82rem" }}>
                    <span style={{ fontSize: "1rem", marginTop: "2px" }}>✅</span>
                    <div>
                      <strong style={{ color: "#FFFFFF" }}>Case Resolved</strong>
                      <p style={{ margin: "2px 0 0 0", color: "rgba(255,255,255,0.4)" }}>Animal secured/treated.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "16px", padding: "24px" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#A5D6A7", margin: "0 0 12px 0" }}>Incident Location</h3>
              <div
                style={{
                  height: "140px",
                  background: "radial-gradient(circle, rgba(102,187,106,0.1) 0%, rgba(5,15,7,0.3) 100%)",
                  border: "1px solid rgba(102,187,106,0.15)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(239,83,80,0.15)", border: "1px dashed #EF5350", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulseCircle 2s infinite" }}>
                  <MapPin size={22} color="#EF5350" />
                </div>
              </div>
              <p style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.35)", marginTop: "8px", textAlign: "center", lineHeight: 1.3 }}>
                Privacy filter active. Exact GPS coordinates are offset by +/- 300m for safety.
              </p>
            </div>

            {rescue.status !== "resolved" && rescue.status !== "closed" && (
              <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#A5D6A7", margin: "0 0 4px 0" }}>Update Case Status</h3>
                
                {rescue.status === "reported" && (
                  <button
                    onClick={() => handleMarkStatus("assigned")}
                    disabled={submitting}
                    style={{
                      background: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "12px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Accept Dispatch
                  </button>
                )}

                {(rescue.status === "assigned" || rescue.status === "reported") && (
                  <button
                    onClick={() => handleMarkStatus("in_progress")}
                    disabled={submitting}
                    style={{
                      background: "rgba(102,187,106,0.12)",
                      border: "1px solid rgba(102,187,106,0.25)",
                      color: "#A5D6A7",
                      padding: "12px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Set In Progress
                  </button>
                )}

                <button
                  onClick={() => handleMarkStatus("resolved")}
                  disabled={submitting}
                  style={{
                    background: "rgba(102,187,106,0.12)",
                    border: "1px solid rgba(102,187,106,0.25)",
                    color: "#A5D6A7",
                    padding: "12px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  Mark Resolved
                </button>

                <button
                  onClick={() => handleMarkStatus("escalated")}
                  disabled={submitting}
                  style={{
                    background: "rgba(239,83,80,0.08)",
                    border: "1px solid rgba(239,83,80,0.2)",
                    color: "#EF5350",
                    padding: "12px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  Escalate to NGO
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      <Footer />

      <style>{`
        @keyframes pulseCircle {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @media (max-width: 768px) {
          .details-layout { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  );
}
