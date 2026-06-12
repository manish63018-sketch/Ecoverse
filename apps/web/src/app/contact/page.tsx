"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Mail, Phone, Send, MapPin, Sparkles, X, 
  CheckCircle2, Instagram, MessageSquare, AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";


export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("contact_inquiries")
        .insert({
          name: name.trim(),
          email: email.trim(),
          subject,
          message: message.trim(),
        });

      if (error) throw error;

      toast.success("Message sent successfully! Our team will get back to you.");
      setName("");
      setEmail("");
      setSubject("general");
      setMessage("");
    } catch (err) {
      console.error("Failed to submit inquiry:", err);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif", paddingBottom: "80px" }}>
      <Navbar />

      {/* Hero Section */}
      <div style={{ paddingTop: "120px", paddingBottom: "40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "40px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: "radial-gradient(ellipse, rgba(102,187,106,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        
        <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(102,187,106,0.08)", border: "1px solid rgba(102,187,106,0.2)", padding: "6px 16px", borderRadius: "20px", color: "#A5D6A7", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "24px" }}>
            <Mail size={13} /> Contact Us
          </div>

          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "20px" }}>
            Get In Touch With EcoVerse
          </h1>

          <p style={{ color: "rgba(232,245,233,0.65)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: "620px", margin: "0 auto" }}>
            Have questions about volunteer networks, NGO partnerships, or suggestions to make our rescue matching faster? We would love to hear from you.
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container" style={{ maxWidth: "1050px", margin: "0 auto", padding: "20px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "48px" }} className="contact-layout">
          
          {/* Left Column: Info & Helplines */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            
            {/* General Contacts */}
            <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "20px", padding: "28px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "20px", marginTop: 0 }}>
                Support Channels
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <Mail size={16} style={{ color: "#66BB6A", marginTop: "3px" }} />
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(232,245,233,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Email Support</div>
                    <a href="mailto:manish63018@gmail.com" style={{ fontSize: "0.95rem", color: "#E8F5E9", textDecoration: "none", fontWeight: 600 }}>
                      manish63018@gmail.com
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <Instagram size={16} style={{ color: "#66BB6A", marginTop: "3px" }} />
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(232,245,233,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Instagram Updates</div>
                    <a href="https://instagram.com/mannish_2323" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.95rem", color: "#E8F5E9", textDecoration: "none", fontWeight: 600 }}>
                      @mannish_2323
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <MapPin size={16} style={{ color: "#66BB6A", marginTop: "3px" }} />
                  <div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(232,245,233,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Main Office</div>
                    <span style={{ fontSize: "0.95rem", color: "rgba(232,245,233,0.85)", fontWeight: 600 }}>
                      Hyderabad, Telangana, India
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Info Box */}
            <div style={{ background: "rgba(239, 83, 80, 0.05)", border: "1px solid rgba(239, 83, 80, 0.2)", borderRadius: "20px", padding: "28px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#EF5350", marginBottom: "12px", marginTop: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={18} /> Emergency Cases
              </h3>
              <p style={{ fontSize: "0.88rem", color: "rgba(232, 245, 233, 0.65)", lineHeight: 1.6, margin: 0 }}>
                If you are reporting a critical animal emergency, please do not wait for email support. Submit an alert on our <Link href="/sos" style={{ color: "#EF5350", fontWeight: 700 }}>🚨 SOS Emergency Page</Link> to instantly ping verified local area volunteers.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div style={{ background: "rgba(21, 35, 23, 0.45)", border: "1px solid rgba(102, 187, 106, 0.12)", borderRadius: "20px", padding: "32px" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "8px", marginTop: 0 }}>
              Send a Message
            </h3>
            <p style={{ fontSize: "0.85rem", color: "rgba(232, 245, 233, 0.45)", marginBottom: "24px" }}>
              Fill out the form below and our team will get back to you within 24–48 hours.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Your Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Email Address *</label>
                <input 
                  type="email" 
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Subject Topic</label>
                <select 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={selectStyle}
                >
                  <option value="general">General Inquiry</option>
                  <option value="ngo">NGO Onboarding / Verified Rescuer</option>
                  <option value="ads">Partnership & Ads Support</option>
                  <option value="report">Content Abuse / Moderation Appeal</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Your Message *</label>
                <textarea 
                  required
                  placeholder="Tell us what you'd like to share or ask..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "14px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(46, 125, 50, 0.25)",
                  marginTop: "8px",
                  transition: "opacity 0.2s"
                }}
              >
                <Send size={15} />
                {isSubmitting ? "Sending..." : "Submit Message"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
      <style>{`
        @media (max-width: 768px) {
          .contact-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 700,
  color: "rgba(232, 245, 233, 0.75)",
  letterSpacing: "0.02em",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(10, 16, 11, 0.6)",
  border: "1px solid rgba(102, 187, 106, 0.22)",
  borderRadius: "10px",
  padding: "11px 14px",
  color: "#FFFFFF",
  fontSize: "0.9rem",
  fontFamily: "var(--font-sans), sans-serif",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(10, 16, 11, 0.8)",
  border: "1px solid rgba(102, 187, 106, 0.22)",
  borderRadius: "10px",
  padding: "11px 14px",
  color: "#FFFFFF",
  fontSize: "0.9rem",
  fontFamily: "var(--font-sans), sans-serif",
  outline: "none",
  boxSizing: "border-box",
  cursor: "pointer",
};
