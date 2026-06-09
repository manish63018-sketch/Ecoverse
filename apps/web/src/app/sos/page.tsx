"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AlertCircle, MapPin, Send, ArrowLeft, Phone, Info } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// Load Leaflet dynamically to avoid SSR errors
import dynamic from "next/dynamic";
const LeafletMapPicker = dynamic(() => import("@/components/sections/MapPicker"), { ssr: false });

export default function SOSReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [animalType, setAnimalType] = useState("dog");
  const [condition, setCondition] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(17.4485); // Default to Hyderabad coordinates
  const [longitude, setLongitude] = useState(78.3741);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Handle GPS location auto-detection
  const handleAutoLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          toast.success("GPS Location detected!");
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Could not access GPS. Please select location manually.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condition.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill in all details");
      return;
    }

    try {
      setSubmitting(true);
      const rescueCollection = collection(db, "rescues");
      const newDocRef = await addDoc(rescueCollection, {
        reporterId: user ? user.uid : "anonymous",
        reporterContact: {
          name: user?.displayName || "Anonymous Reporter",
          phone: phone,
        },
        animalType,
        conditionDescription: condition,
        severity,
        status: "reported",
        location: {
          latitude,
          longitude,
          addressText: address,
        },
        createdAt: new Date().toISOString(),
        assignedVolunteerId: null,
      });

      // Update caseId field with document ID
      await updateDoc(newDocRef, {
        caseId: newDocRef.id,
      });

      toast.success("Emergency SOS reported successfully! Notifications sent to nearby rescuers.");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error creating SOS report:", error);
      toast.error(error.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #121e14 0%, #050806 100%)",
        color: "#FFFFFF",
        fontFamily: "var(--font-sans), sans-serif",
        padding: "40px 24px",
      }}
    >
      <div className="container" style={{ maxWidth: "780px", margin: "0 auto" }}>
        {/* Back Link */}
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "rgba(232, 245, 233, 0.6)",
            textDecoration: "none",
            fontSize: "0.9rem",
            marginBottom: "24px",
            transition: "color var(--transition-fast)",
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.color = "#66BB6A"}
          onMouseLeave={(e) => (e.target as HTMLElement).style.color = "rgba(232, 245, 233, 0.6)"}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Page Title */}
        <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "#EF5350", padding: "10px", borderRadius: "12px", display: "flex" }}>
            <AlertCircle size={24} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#EF5350", letterSpacing: "-0.025em" }}>
              Report Animal Emergency (SOS)
            </h1>
            <p style={{ color: "rgba(232, 245, 233, 0.6)", marginTop: "4px", fontSize: "0.875rem" }}>
              Submit details of the injured street animal. Rescuer notifications are dispatched in real-time.
            </p>
          </div>
        </div>

        {/* SOS Form and Map layout */}
        <form onSubmit={handleFormSubmit} style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="sos-layout">
          {/* Left Block: Form inputs */}
          <div
            style={{
              background: "rgba(21, 35, 23, 0.45)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(102, 187, 106, 0.15)",
              borderRadius: "var(--radius-2xl)",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Animal Type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(232, 245, 233, 0.85)" }}>
                  Animal Category
                </label>
                <select
                  value={animalType}
                  onChange={(e) => setAnimalType(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(10, 16, 11, 0.8)",
                    border: "1px solid rgba(102, 187, 106, 0.25)",
                    borderRadius: "var(--radius-lg)",
                    padding: "10px 12px",
                    color: "#FFFFFF",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="cow">Cow / Cattle</option>
                  <option value="bird">Bird</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Severity Level */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(232, 245, 233, 0.85)" }}>
                  Emergency Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(10, 16, 11, 0.8)",
                    border: "1px solid rgba(102, 187, 106, 0.25)",
                    borderRadius: "var(--radius-lg)",
                    padding: "10px 12px",
                    color: "#FFFFFF",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="low">Low (Minor cut/scratch)</option>
                  <option value="medium">Medium (Limping/Skin disease)</option>
                  <option value="high">High (Severe bleeding/fracture)</option>
                  <option value="critical">Critical (Life-threatening/unconscious)</option>
                </select>
              </div>
            </div>

            {/* Condition Description */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(232, 245, 233, 0.85)" }}>
                Condition details
              </label>
              <textarea
                placeholder="Describe the injuries or current state of the animal..."
                rows={3}
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                required
                style={{
                  width: "100%",
                  background: "rgba(10, 16, 11, 0.6)",
                  border: "1px solid rgba(102, 187, 106, 0.25)",
                  borderRadius: "var(--radius-lg)",
                  padding: "12px 14px",
                  color: "#FFFFFF",
                  fontSize: "0.9rem",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Phone contact */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(232, 245, 233, 0.85)" }}>
                Your Contact Phone Number
              </label>
              <div style={{ position: "relative" }}>
                <Phone
                  size={16}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "rgba(102, 187, 106, 0.6)",
                  }}
                />
                <input
                  type="text"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    background: "rgba(10, 16, 11, 0.6)",
                    border: "1px solid rgba(102, 187, 106, 0.25)",
                    borderRadius: "var(--radius-lg)",
                    padding: "12px 14px 12px 42px",
                    color: "#FFFFFF",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
            </div>

            {/* Manual Location Address */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(232, 245, 233, 0.85)" }}>
                Address/Landmark Description
              </label>
              <input
                type="text"
                placeholder="e.g. Opposite Metro Pillar 124, Gachibowli Road"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                style={{
                  width: "100%",
                  background: "rgba(10, 16, 11, 0.6)",
                  border: "1px solid rgba(102, 187, 106, 0.25)",
                  borderRadius: "var(--radius-lg)",
                  padding: "12px 14px",
                  color: "#FFFFFF",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            {/* Geolocation Section */}
            <div style={{ borderTop: "1px solid rgba(102,187,106,0.15)", paddingTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Map Dispatch Coordinates</span>
                <button
                  type="button"
                  onClick={handleAutoLocate}
                  style={{
                    background: "rgba(102, 187, 106, 0.12)",
                    border: "1px solid rgba(102, 187, 106, 0.3)",
                    color: "#A5D6A7",
                    borderRadius: "var(--radius-md)",
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <MapPin size={14} />
                  Detect My GPS
                </button>
              </div>

              {/* Map picker rendering */}
              <div style={{ height: "240px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(102,187,106,0.2)" }}>
                <LeafletMapPicker
                  lat={latitude}
                  lng={longitude}
                  onChange={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "0.75rem", color: "rgba(232,245,233,0.5)" }}>
                <span>Lat: {latitude.toFixed(6)}</span>
                <span>Lng: {longitude.toFixed(6)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: "12px",
                background: "linear-gradient(135deg, #EF5350 0%, #C62828 100%)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "var(--radius-lg)",
                padding: "14px",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(239, 83, 80, 0.3)",
                transition: "all var(--transition-base)",
              }}
              className="sos-submit-btn"
            >
              {submitting ? (
                <span className="spinner-white"></span>
              ) : (
                <>
                  <Send size={18} />
                  Dispatch Emergency Rescue Alert
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .spinner-white {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #FFFFFF;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sos-submit-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
          box-shadow: 0 12px 24px rgba(239, 83, 80, 0.45);
        }
        .sos-submit-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
