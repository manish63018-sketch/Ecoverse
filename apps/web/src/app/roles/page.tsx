"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/lib/hooks/useAuth";
import { ECOVERSE_ROLES } from "@/lib/roles";
import { supabase } from "@/lib/supabase";
import { Check, ShieldAlert, Award, Star, Compass, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function RolesPage() {
  const { user, profile, loading, refetchProfile } = useAuth();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Sync user's current roles when profile loads
  useEffect(() => {
    if (profile?.roles) {
      setSelectedRoles(profile.roles);
    }
  }, [profile]);

  const handleToggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  const handleSaveRoles = async () => {
    if (!user) {
      toast.error("Please log in to update your roles");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          roles: selectedRoles,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.uid);

      if (error) throw error;

      await refetchProfile();
      toast.success("Community roles updated successfully!");
    } catch (err: any) {
      console.error("Failed to save roles:", err);
      toast.error("Failed to save roles: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif", paddingBottom: "80px" }}>
      <Navbar />

      <div className="container" style={{ paddingTop: "120px", maxWidth: "1000px", margin: "0 auto", paddingLeft: "24px", paddingRight: "24px" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#66BB6A", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
            <Compass size={16} /> EcoVerse Roles Directory
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.03em", marginTop: "8px", marginBottom: "16px", background: "linear-gradient(to right, #A5D6A7, #66BB6A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Choose Your Way to Protect Life
          </h1>
          <p style={{ color: "rgba(232, 245, 233, 0.65)", fontSize: "1.15rem", lineHeight: 1.6, maxWidth: "700px", margin: "0 auto" }}>
            Every volunteer in EcoVerse India makes a unique difference. Read responsibilities, acquire badges, and join the task forces that fit your skills.
          </p>
        </div>

        {/* User Interaction Banner */}
        {user ? (
          <div 
            style={{
              background: "rgba(102, 187, 106, 0.06)",
              border: "1px solid rgba(102, 187, 106, 0.2)",
              borderRadius: "18px",
              padding: "24px",
              marginBottom: "40px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px"
            }}
          >
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", color: "#A5D6A7" }}>
                <UserCheck size={18} /> Update Your Active Roles
              </h3>
              <p style={{ fontSize: "0.85rem", color: "rgba(232, 245, 233, 0.5)", marginTop: "4px" }}>
                Select the cards below to toggle roles, then click save to update your badges and dispatch permissions.
              </p>
            </div>
            <button
              onClick={handleSaveRoles}
              disabled={saving}
              style={{
                background: "linear-gradient(135deg, #66BB6A, #388E3C)",
                color: "#FFFFFF",
                border: "none",
                padding: "12px 28px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)",
                transition: "all 0.2s"
              }}
            >
              {saving ? "Saving Changes..." : "Save Active Roles"}
            </button>
          </div>
        ) : (
          <div 
            style={{
              background: "rgba(255, 167, 38, 0.05)",
              border: "1px solid rgba(255, 167, 38, 0.15)",
              borderRadius: "18px",
              padding: "20px",
              marginBottom: "40px",
              textAlign: "center"
            }}
          >
            <p style={{ color: "#FFA726", fontSize: "0.95rem", fontWeight: 600 }}>
              💡 Want to register for these roles? Sign in or register to enable location dispatches and earn community badges.
            </p>
          </div>
        )}

        {/* Roles Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "24px" }}>
          {Object.entries(ECOVERSE_ROLES).map(([id, details]) => {
            const isSelected = selectedRoles.includes(id);
            return (
              <div
                key={id}
                onClick={user ? () => handleToggleRole(id) : undefined}
                style={{
                  background: isSelected ? "rgba(102, 187, 106, 0.08)" : "rgba(21, 35, 23, 0.4)",
                  border: isSelected 
                    ? `2.5px solid ${details.color}` 
                    : "1.5px solid rgba(102, 187, 106, 0.12)",
                  borderRadius: "20px",
                  padding: "28px",
                  cursor: user ? "pointer" : "default",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  boxShadow: isSelected ? `0 10px 30px -10px ${details.color}33` : "none"
                }}
                className="role-card"
              >
                {/* Selection indicator checkmark */}
                {isSelected && (
                  <div style={{
                    position: "absolute", top: "16px", right: "16px",
                    width: "24px", height: "24px", borderRadius: "50%",
                    background: details.color, display: "flex", alignItems: "center",
                    justifyContent: "center", color: "#FFFFFF"
                  }}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}

                <div>
                  {/* Title & Emoji */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "2rem" }}>{details.emoji}</span>
                    <div>
                      <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>{details.label}</h2>
                      <span style={{ fontSize: "0.75rem", color: details.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Badge: {details.badge_earned}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: "0.875rem", lineHeight: 1.5, color: "rgba(232, 245, 233, 0.7)", marginBottom: "20px" }}>
                    {details.description}
                  </p>

                  {/* Responsibilities list */}
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "#A5D6A7", letterSpacing: "0.03em", marginBottom: "8px" }}>
                      Responsibilities:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {details.responsibilities.map((resp, index) => (
                        <li key={index} style={{ fontSize: "0.82rem", color: "rgba(232, 245, 233, 0.6)", lineHeight: 1.4 }}>
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  {/* Divider */}
                  <div style={{ height: "1px", background: "rgba(102, 187, 106, 0.1)", margin: "16px 0" }} />

                  {/* Metadata fields */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                      <span style={{ color: "rgba(232, 245, 233, 0.4)" }}>Skills Required:</span>
                      <span style={{ fontWeight: 600, color: "#FFFFFF", textAlign: "right" }}>{details.skills_required}</span>
                    </div>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                      {details.sos_access && (
                        <span style={{ background: "rgba(239, 83, 80, 0.12)", color: "#EF5350", border: "1px solid rgba(239, 83, 80, 0.25)", fontSize: "0.68rem", fontWeight: 700, padding: "3px 8px", borderRadius: "6px" }}>
                          🚨 SOS DISPATCH
                        </span>
                      )}
                      {details.map_visible && (
                        <span style={{ background: "rgba(66, 165, 245, 0.12)", color: "#42A5F5", border: "1px solid rgba(66, 165, 245, 0.25)", fontSize: "0.68rem", fontWeight: 700, padding: "3px 8px", borderRadius: "6px" }}>
                          📍 MAP VISIBLE
                        </span>
                      )}
                      {details.vehicle_info_required && (
                        <span style={{ background: "rgba(255, 167, 38, 0.12)", color: "#FFA726", border: "1px solid rgba(255, 167, 38, 0.25)", fontSize: "0.68rem", fontWeight: 700, padding: "3px 8px", borderRadius: "6px" }}>
                          🚗 VEHICLE INFO
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
      <style>{`
        .role-card:hover {
          transform: translateY(-5px);
          border-color: rgba(102, 187, 106, 0.35) !important;
        }
      `}</style>
    </div>
  );
}
