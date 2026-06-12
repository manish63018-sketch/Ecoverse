"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Heart, CheckCircle, ArrowRight, ShieldCheck, HeartHandshake, FileText, AlertCircle, Info, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import PageHero from "@/components/PageHero";

interface Donor {
  name: string;
  amount: number;
  time: string;
}

export default function DonatePage() {
  const [donateType, setDonateType] = useState<"one_time" | "monthly">("one_time");
  const [amount, setAmount] = useState<number>(250);
  const [customActive, setCustomActive] = useState(false);
  const [customVal, setCustomVal] = useState("");

  const [cause, setCause] = useState("most_needed");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pan, setPan] = useState("");
  const [message, setMessage] = useState("");

  const [processing, setProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Anonymized mock donors
  const [donors, setDonors] = useState<Donor[]>([
    { name: "A*** K***", amount: 500, time: "2 hours ago" },
    { name: "R*** S***", amount: 1000, time: "1 day ago" },
    { name: "M*** P***", amount: 250, time: "3 days ago" },
  ]);

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomActive(false);
  };

  const handleCustomChange = (val: string) => {
    setCustomVal(val);
    const parsed = parseInt(val);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    } else {
      setAmount(0);
    }
  };

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      return toast.error("Please fill in Name, Email, and Phone number");
    }
    if (amount <= 0) {
      return toast.error("Please select or enter a valid donation amount");
    }

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setCheckoutSuccess(true);
      // Add donor to recent list (anonymized)
      const initial = name.charAt(0).toUpperCase();
      const last = name.trim().split(" ").slice(-1)[0].charAt(0).toUpperCase() || "*";
      const anonName = `${initial}*** ${last}***`;
      setDonors((prev) => [
        { name: anonName, amount: amount, time: "Just now" },
        ...prev,
      ]);
      toast.success("Thank you for your generous support!");
    }, 2000);
  };

  const getImpactMessage = () => {
    if (amount < 50) return "Thank you for supporting animal rescue.";
    if (amount < 100) return `₹${amount} = 1 day of nutritious food for a rescued street puppy.`;
    if (amount < 250) return `₹${amount} = 1 vital vaccination shot against Distemper/Rabies.`;
    if (amount < 500) return `₹${amount} = Emergency vet consultation and wound dressing.`;
    if (amount < 1000) return `₹${amount} = Full deworming, vaccination course, and minor medical kit.`;
    return `₹${amount} = One whole week of rescue shelter care, recovery food, and medical checkups.`;
  };

  const totalRaised = donors.reduce((sum, d) => sum + d.amount, 0) + 1750; // simulated seed offset

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif" }}>
      <Navbar />

      <PageHero
        tag="💚 DIRECT SUPPORT"
        h1="Support Animal Welfare"
        subtitle="Every rupee helps rescue, heal, and rehome animals across India."
      />

      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>
        
        {/* Core donation checkout workspace */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "40px" }} className="donate-layout">
          
          {/* Left: Donation configurator and Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Amount Selector */}
            <div style={sectionCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={labelStyle}>1. Select Amount</span>
                
                {/* One time / Monthly toggle */}
                <div style={{ display: "flex", background: "rgba(10,16,11,0.6)", borderRadius: "8px", padding: "2px" }}>
                  <button
                    type="button"
                    onClick={() => setDonateType("one_time")}
                    style={{
                      background: donateType === "one_time" ? "rgba(102,187,106,0.15)" : "transparent",
                      border: "none",
                      color: donateType === "one_time" ? "#66BB6A" : "rgba(255,255,255,0.4)",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    One-Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonateType("monthly")}
                    style={{
                      background: donateType === "monthly" ? "rgba(102,187,106,0.15)" : "transparent",
                      border: "none",
                      color: donateType === "monthly" ? "#66BB6A" : "rgba(255,255,255,0.4)",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Amount chips */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
                {[50, 100, 250, 500, 1000].map((val) => {
                  const active = amount === val && !customActive;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAmountSelect(val)}
                      style={{
                        background: active ? "#66BB6A" : "rgba(10, 16, 11, 0.4)",
                        border: `1px solid ${active ? "#66BB6A" : "rgba(102, 187, 106, 0.15)"}`,
                        color: active ? "#050f07" : "#FFFFFF",
                        padding: "12px",
                        borderRadius: "10px",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      ₹{val}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setCustomActive(true);
                    setAmount(customVal ? parseInt(customVal) || 0 : 0);
                  }}
                  style={{
                    background: customActive ? "#66BB6A" : "rgba(10, 16, 11, 0.4)",
                    border: `1px solid ${customActive ? "#66BB6A" : "rgba(102, 187, 106, 0.15)"}`,
                    color: customActive ? "#050f07" : "#FFFFFF",
                    padding: "12px",
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                  }}
                >
                  Custom
                </button>
              </div>

              {/* Custom input */}
              {customActive && (
                <div style={{ marginBottom: "12px" }}>
                  <input
                    type="number"
                    min="10"
                    placeholder="Enter Custom Amount (₹)"
                    value={customVal}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Live Impact Calculator panel */}
              <div
                style={{
                  background: "rgba(102,187,106,0.06)",
                  border: "1px solid rgba(102,187,106,0.25)",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <Sparkles size={18} style={{ color: "#66BB6A", flexShrink: 0 }} />
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#A5D6A7" }}>
                  {getImpactMessage()}
                </span>
              </div>
            </div>

            {/* Cause selection */}
            <div style={sectionCardStyle}>
              <span style={labelStyle}>2. Direct Support Cause</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }} className="cause-grid">
                {[
                  { id: "most_needed", title: "🎯 Where Needed Most" },
                  { id: "rescue", title: "🆘 Emergency Rescue" },
                  { id: "vet", title: "🏥 Veterinary Care" },
                  { id: "food", title: "🐾 Food & Shelter" },
                ].map((item) => {
                  const active = cause === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCause(item.id)}
                      style={{
                        background: active ? "rgba(102,187,106,0.15)" : "rgba(10, 16, 11, 0.4)",
                        border: `1px solid ${active ? "#66BB6A" : "rgba(102,187,106,0.15)"}`,
                        color: active ? "#66BB6A" : "#FFFFFF",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        textAlign: "left",
                        cursor: "pointer",
                        fontWeight: active ? 700 : 500,
                        fontSize: "0.85rem",
                      }}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Donor Form */}
            <div style={sectionCardStyle}>
              <span style={labelStyle}>3. Donor Details</span>
              <form onSubmit={handleDonateSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="form-grid">
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={formLabelStyle}>Name *</label>
                    <input type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={formLabelStyle}>Email *</label>
                    <input type="email" required placeholder="email@address.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={formLabelStyle}>Phone *</label>
                    <input type="tel" required placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={formLabelStyle}>PAN Number (Optional)</label>
                    <input type="text" placeholder="For 80G tax benefit" value={pan} onChange={(e) => setPan(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={formLabelStyle}>Support Message</label>
                  <textarea rows={3} placeholder="Why are you supporting EcoVerse?..." value={message} onChange={(e) => setMessage(e.target.value)} style={{ ...inputStyle, resize: "none" }} />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={processing || checkoutSuccess}
                  style={{
                    background: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "16px",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "1rem",
                    cursor: "pointer",
                    marginTop: "12px",
                    boxShadow: "0 6px 20px rgba(46,125,50,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  {processing ? (
                    <div style={{ width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "50%", borderTopColor: "#FFFFFF", animation: "spin 0.8s linear infinite" }} />
                  ) : checkoutSuccess ? (
                    "Thank You for Direct Support! 💚"
                  ) : (
                    <>Donate ₹{amount} {donateType === "monthly" ? "/ Month" : ""} →</>
                  )}
                </button>
              </form>
            </div>

          </div>

          {/* Right: Stats, Transparency, Recent Donors */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Impact Stat */}
            <div style={sectionCardStyle}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#A5D6A7", margin: "0 0 8px 0" }}>Impact Tracker</h3>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#66BB6A", letterSpacing: "-0.02em" }}>
                ₹{totalRaised}
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                Direct funds raised so far — Thank you for your support
              </p>
            </div>

            {/* Transparency details */}
            <div style={sectionCardStyle}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#A5D6A7", margin: "0 0 16px 0" }}>100% Transparency</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <ShieldCheck size={18} style={{ color: "#66BB6A", flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#FFFFFF" }}>Fund Allocation</strong>
                    <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                      100% of donations are ring-fenced for vet clinics. Zero admin fee cuts.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <FileText size={18} style={{ color: "#66BB6A", flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#FFFFFF" }}>Expense Reports</strong>
                    <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                      We publish itemized clinic reports quarterly for community audit.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <HeartHandshake size={18} style={{ color: "#66BB6A", flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#FFFFFF" }}>Independent Audit</strong>
                    <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                      Subject to third-party audits to maintain strict welfare compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Supporters */}
            <div style={sectionCardStyle}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#A5D6A7", margin: "0 0 16px 0" }}>Recent Supporters</h3>
              
              {donors.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>Be the first to donate. Start a movement.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {donors.map((donor, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "rgba(10,16,11,0.4)",
                        border: "1px solid rgba(102,187,106,0.08)",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        fontSize: "0.82rem",
                      }}
                    >
                      <div>
                        <strong style={{ color: "#FFFFFF" }}>{donor.name}</strong>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{donor.time}</div>
                      </div>
                      <span style={{ fontWeight: 800, color: "#66BB6A" }}>₹{donor.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      <Footer />

      {/* Checkout simulation overlay */}
      {processing && (
        <div style={loadingOverlayStyle}>
          <div style={loadingCardStyle}>
            <div style={{ width: "32px", height: "32px", border: "3px solid rgba(102,187,106,0.15)", borderRadius: "50%", borderTopColor: "#66BB6A", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <h4 style={{ margin: 0, fontSize: "1rem" }}>Redirecting to secure gateway...</h4>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>Please do not close this window</p>
          </div>
        </div>
      )}

      {/* Success Dialog overlay */}
      {checkoutSuccess && (
        <div style={loadingOverlayStyle}>
          <div style={{ ...loadingCardStyle, maxWidth: "380px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(102,187,106,0.15)", border: "2px solid #66BB6A", color: "#66BB6A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", margin: "0 auto 16px" }}>
              ✓
            </div>
            <h3 style={{ margin: "0 0 8px 0" }}>Direct Support Successful!</h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
              Your contribution of <strong>₹{amount}</strong> has been received. Thank you for making a difference in animal rescues!
            </p>
            <button
              onClick={() => setCheckoutSuccess(false)}
              style={{
                background: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
                border: "none",
                color: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .donate-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const sectionCardStyle: React.CSSProperties = {
  background: "rgba(21, 35, 23, 0.45)",
  border: "1px solid rgba(102, 187, 106, 0.12)",
  borderRadius: "16px",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 800,
  color: "#A5D6A7",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const formLabelStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  fontWeight: 700,
  color: "rgba(255, 255, 255, 0.45)",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(10, 16, 11, 0.6)",
  border: "1px solid rgba(102, 187, 106, 0.22)",
  borderRadius: "10px",
  padding: "11px 14px",
  color: "#FFFFFF",
  fontSize: "0.88rem",
  outline: "none",
  boxSizing: "border-box",
};

const loadingOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(5, 8, 6, 0.85)",
  backdropFilter: "blur(6px)",
  zIndex: 1200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
};

const loadingCardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "320px",
  background: "#111f13",
  border: "1px solid rgba(102,187,106,0.2)",
  borderRadius: "20px",
  padding: "32px",
  textAlign: "center",
  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
};
