"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, collection, onSnapshot } from "firebase/firestore";
import { Sparkles, Heart, Flame, ShieldCheck, Check, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function CampaignsPage() {
  const { user } = useAuth();
  const [pledgeCount, setPledgeCount] = useState(0);
  const [hasPledged, setHasPledged] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to real-time vegan pledges count
    const unsubscribe = onSnapshot(
      collection(db, "vegan_pledges"),
      (snapshot) => {
        setPledgeCount(snapshot.size);
        setLoading(false);
        
        if (user) {
          // Check if current user has already pledged
          const userPledged = snapshot.docs.some(
            (doc) => doc.id === `${user.uid}_pledge`
          );
          setHasPledged(userPledged);
        }
      },
      (error) => {
        console.warn("Failed to listen to vegan pledges:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleTakePledge = async () => {
    if (!user) {
      toast.error("Please login to take the Vegan Pledge!");
      return;
    }

    try {
      const pledgeRef = doc(db, "vegan_pledges", `${user.uid}_pledge`);
      await setDoc(pledgeRef, {
        pledgeId: `${user.uid}_pledge`,
        uid: user.uid,
        city: "hyderabad", // Default city selection
        createdAt: new Date().toISOString()
      });
      toast.success("Thank you for taking the EcoVerse Vegan Pledge! 💚");
      setHasPledged(true);
    } catch (err) {
      console.error("Failed to save vegan pledge:", err);
      toast.error("Could not register pledge. Please try again.");
    }
  };

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif" }}>
      <Navbar />

      <div className="container" style={{ paddingTop: "120px", paddingBottom: "80px", maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#66BB6A", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <Flame size={16} /> EcoVerse Campaigns
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-0.03em", marginTop: "8px", marginBottom: "12px" }}>
            Our Active Compassion Campaigns
          </h1>
          <p style={{ color: "var(--color-text-muted-dark)", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
            Join our ongoing efforts to make India safer, kinder, and more sustainable for all animals.
          </p>
        </div>

        {/* Campaign 1: Vegan Pledge */}
        <div
          style={{
            background: "rgba(21, 35, 23, 0.45)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(102, 187, 106, 0.18)",
            borderRadius: "var(--radius-2xl)",
            padding: "40px",
            marginBottom: "36px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            alignItems: "center",
          }}
          className="campaign-card"
        >
          <div>
            <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🌱</div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "12px" }}>
              The 21-Day Vegan Pledge
            </h2>
            <p style={{ color: "rgba(232, 245, 233, 0.8)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "20px" }}>
              Make a stand for animals and the environment. Pledge to try a plant-based lifestyle for 21 days. Get resources, support, and connect with a community of vegans across India.
            </p>
            <div style={{ display: "flex", gap: "12px", flexDirection: "column", fontSize: "0.85rem", color: "rgba(232, 245, 233, 0.6)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Check size={14} color="#66BB6A" /> Reduce animal suffering
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Check size={14} color="#66BB6A" /> Lower your carbon footprint
              </span>
            </div>
          </div>

          <div
            style={{
              background: "rgba(10, 16, 11, 0.5)",
              border: "1px solid rgba(102, 187, 106, 0.15)",
              borderRadius: "var(--radius-xl)",
              padding: "32px",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.08em" }}>
              Real-time Pledge Tracker
            </span>
            <div style={{ fontSize: "3.5rem", fontWeight: 800, color: "#66BB6A", margin: "12px 0 6px 0", fontFamily: "var(--font-sans)" }}>
              {loading ? "..." : pledgeCount}
            </div>
            <p style={{ color: "rgba(232, 245, 233, 0.65)", fontSize: "0.85rem", marginBottom: "24px" }}>
              Compassionate individuals have taken the pledge so far
            </p>

            {hasPledged ? (
              <div
                style={{
                  background: "rgba(102, 187, 106, 0.12)",
                  border: "1px solid rgba(102, 187, 106, 0.35)",
                  color: "#66BB6A",
                  padding: "14px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <CheckCircleIcon /> You Have Taken The Pledge!
              </div>
            ) : (
              <button
                onClick={handleTakePledge}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "14px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(76, 175, 80, 0.25)",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                Take the Vegan Pledge
              </button>
            )}
          </div>
        </div>

        {/* Campaign 2: Street Feeding */}
        <div
          style={{
            background: "rgba(21, 35, 23, 0.45)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(102, 187, 106, 0.12)",
            borderRadius: "var(--radius-2xl)",
            padding: "40px",
            marginBottom: "36px",
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: "40px",
            alignItems: "center",
          }}
          className="campaign-card"
        >
          <div style={{ order: 2 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🥣</div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "12px" }}>
              India Street Feeder Network
            </h2>
            <p style={{ color: "rgba(232, 245, 233, 0.8)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "20px" }}>
              Helping caretakers coordinate street animal feeding drives. Connect with local donors, find safe feeding spots, and log daily feeding logs to ensure no stray goes hungry.
            </p>
            <div style={{ display: "flex", gap: "12px", flexDirection: "column", fontSize: "0.85rem", color: "rgba(232, 245, 233, 0.6)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Check size={14} color="#66BB6A" /> Standardize hygiene feeding practices
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Check size={14} color="#66BB6A" /> Log routes to avoid feeding overlaps
              </span>
            </div>
          </div>

          <div
            style={{
              background: "rgba(10, 16, 11, 0.3)",
              border: "1px solid rgba(102, 187, 106, 0.1)",
              borderRadius: "var(--radius-xl)",
              padding: "32px",
              textAlign: "center",
              order: 1,
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🐕🐈🐈‍⬛</div>
            <strong style={{ color: "#FFFFFF", display: "block", fontSize: "1.1rem", marginBottom: "6px" }}>
              Street Feeder Registry
            </strong>
            <p style={{ color: "rgba(232, 245, 233, 0.6)", fontSize: "0.85rem", lineHeight: 1.5 }}>
              Coordinating feeding routes in active pilot zones. Feeders can set up their route schedules inside the Dashboard panel.
            </p>
          </div>
        </div>

      </div>

      <Footer />
      
      <style>{`
        @media (max-width: 768px) {
          .campaign-card { grid-template-columns: 1fr !important; gap: 24px !important; }
          .campaign-card div { order: unset !important; }
        }
      `}</style>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
