"use client";

/**
 * "Supabase is the only source of truth for authentication and app data."
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, UserPlus, Eye, EyeOff, MapPin, Briefcase, AlertCircle } from "lucide-react";
import { EcoVerseLogo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/hooks/useAuth";
import { ECOVERSE_ROLES } from "@/lib/roles";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("volunteer");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const { signUpWithEmail, user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (!name || !username || !email || !password || !confirmPassword || !city || !state) {
      setErrorBanner("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setErrorBanner("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorBanner("Passwords do not match.");
      return;
    }

    if (!acceptTerms) {
      setErrorBanner("You must agree to the Terms of Service.");
      return;
    }

    try {
      setLocalLoading(true);
      await signUpWithEmail(email, password, name, username, role, city, state);
      toast.success("Account created successfully! Please verify your email.");
      router.push("/auth/login");
    } catch (err: any) {
      console.error(err);
      setErrorBanner(err.message || "Signup failed. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid rgba(102,187,106,0.15)", borderRadius: "50%", borderTopColor: "#66BB6A", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Brand logo at the top */}
      <Link href="/" style={{ textDecoration: "none", marginBottom: "32px", display: "inline-block" }}>
        <EcoVerseLogo theme="dark" size={48} />
      </Link>

      {/* Glassmorphic Signup Card */}
      <div style={{ ...cardStyle, maxWidth: "500px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={titleStyle}>Create Account</h1>
          <p style={subtitleStyle}>
            Join the movement. Connect, adopt, and protect.
          </p>
        </div>

        {/* Error Banner */}
        {errorBanner && (
          <div style={errorBannerStyle}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleEmailSignUp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="signup-grid">
            {/* Full Name */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={18} style={iconStyle} />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={inputStyle}
                  className="auth-input"
                />
              </div>
            </div>

            {/* Username */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Username</label>
              <div style={{ position: "relative" }}>
                <User size={18} style={iconStyle} />
                <input
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={inputStyle}
                  className="auth-input"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={iconStyle} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                className="auth-input"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="signup-grid">
            {/* Password */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={iconStyle} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: "42px" }}
                  className="auth-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={showPasswordToggleStyle}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={iconStyle} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={inputStyle}
                  className="auth-input"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Select Primary Role</label>
            <div style={{ position: "relative" }}>
              <Briefcase size={18} style={iconStyle} />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ ...inputStyle, paddingRight: "28px", appearance: "none", WebkitAppearance: "none" }}
                className="auth-input"
              >
                {Object.values(ECOVERSE_ROLES).map((r) => (
                  <option key={r.id} value={r.id} style={{ background: "#050f07", color: "#FFF" }}>
                    {r.emoji} {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="signup-grid">
            {/* City */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>City</label>
              <div style={{ position: "relative" }}>
                <MapPin size={18} style={iconStyle} />
                <input
                  type="text"
                  placeholder="Hyderabad"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  style={inputStyle}
                  className="auth-input"
                />
              </div>
            </div>

            {/* State */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>State</label>
              <div style={{ position: "relative" }}>
                <MapPin size={18} style={iconStyle} />
                <input
                  type="text"
                  placeholder="Telangana"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  style={inputStyle}
                  className="auth-input"
                />
              </div>
            </div>
          </div>

          {/* Terms checkbox */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "4px" }}>
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              style={{ accentColor: "#66BB6A", cursor: "pointer", marginTop: "3px" }}
            />
            <label htmlFor="acceptTerms" style={{ fontSize: "0.8rem", color: "rgba(232, 245, 233, 0.75)", cursor: "pointer", userSelect: "none", lineHeight: 1.4 }}>
              I agree to the <Link href="/terms" style={linkStyle}>Terms of Service</Link> and <Link href="/privacy" style={linkStyle}>Privacy Policy</Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={localLoading}
            style={buttonStyle}
            className="auth-btn"
          >
            {localLoading ? (
              <span className="spinner" />
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div style={{ textAlign: "center", marginTop: "28px", fontSize: "0.875rem", color: "rgba(232, 245, 233, 0.6)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "#66BB6A", textDecoration: "none", fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>

      {/* Styled JSX for Interactive Hover Effects */}
      <style>{`
        .auth-input:focus {
          border-color: #66BB6A !important;
          box-shadow: 0 0 0 3px rgba(102, 187, 106, 0.15) !important;
          background: rgba(10, 16, 11, 0.85) !important;
        }
        .auth-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(46, 125, 50, 0.45);
          filter: brightness(1.1);
        }
        .auth-btn:active {
          transform: translateY(0);
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #FFFFFF;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 480px) {
          .signup-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Inline Styles
const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "radial-gradient(circle at top, #121e14 0%, #050806 100%)",
  padding: "40px 24px",
  fontFamily: "var(--font-sans), sans-serif",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(21, 35, 23, 0.45)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(102, 187, 106, 0.15)",
  borderRadius: "16px",
  padding: "36px 32px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
  boxSizing: "border-box",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: 800,
  color: "#FFFFFF",
  letterSpacing: "-0.025em",
  margin: "0 0 8px 0",
};

const subtitleStyle: React.CSSProperties = {
  color: "rgba(232, 245, 233, 0.6)",
  fontSize: "0.875rem",
  margin: 0,
};

const errorBannerStyle: React.CSSProperties = {
  background: "rgba(239, 83, 80, 0.1)",
  border: "1px solid rgba(239, 83, 80, 0.25)",
  color: "#EF5350",
  borderRadius: "8px",
  padding: "12px 16px",
  fontSize: "0.82rem",
  fontWeight: 600,
  display: "flex",
  gap: "10px",
  alignItems: "center",
  marginBottom: "20px",
};

const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "rgba(232, 245, 233, 0.85)",
};

const iconStyle: React.CSSProperties = {
  position: "absolute",
  left: "14px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "rgba(102, 187, 106, 0.6)",
  zIndex: 10,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(10, 16, 11, 0.6)",
  border: "1px solid rgba(102, 187, 106, 0.25)",
  borderRadius: "10px",
  padding: "12px 14px 12px 42px",
  color: "#FFFFFF",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
};

const linkStyle: React.CSSProperties = {
  color: "#66BB6A",
  textDecoration: "none",
  fontWeight: 600,
};

const showPasswordToggleStyle: React.CSSProperties = {
  position: "absolute",
  right: "14px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "rgba(102, 187, 106, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

const buttonStyle: React.CSSProperties = {
  marginTop: "8px",
  background: "linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  padding: "14px",
  fontSize: "0.95rem",
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxShadow: "0 8px 20px rgba(46, 125, 50, 0.3)",
  boxSizing: "border-box",
  width: "100%",
};
