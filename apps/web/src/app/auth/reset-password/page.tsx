"use client";

/**
 * "Supabase is the only source of truth for authentication and app data."
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Key, Eye, EyeOff, AlertCircle } from "lucide-react";
import { EcoVerseLogo } from "@/components/brand/Logo";
import { supabase } from "@/lib/supabase";
import { resetPasswordForEmail, updatePassword } from "@/lib/auth";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [localLoading, setLocalLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Check if the URL indicates we are in a recovery/reset flow
    const hasRecoveryParam = 
      typeof window !== "undefined" && 
      (window.location.search.includes("code=") || 
       window.location.hash.includes("type=recovery") || 
       window.location.hash.includes("access_token="));

    if (hasRecoveryParam) {
      setIsRecoveryMode(true);
    }

    // Check if user came from a password recovery link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && hasRecoveryParam) {
        setIsRecoveryMode(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && hasRecoveryParam)) {
        setIsRecoveryMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorBanner("Please enter your email address");
      return;
    }

    try {
      setLocalLoading(true);
      await resetPasswordForEmail(email);
      setSuccessMessage("Password reset link sent! Please check your inbox.");
      toast.success("Reset link sent!");
    } catch (err: any) {
      console.error(err);
      setErrorBanner(err.message || "Failed to send reset link.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setSuccessMessage(null);

    if (!password || !confirmPassword) {
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

    try {
      setLocalLoading(true);
      await updatePassword(password);
      setSuccessMessage("Password successfully updated! Redirecting to login...");
      toast.success("Password updated!");
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setErrorBanner(err.message || "Failed to update password.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Brand logo at the top */}
      <Link href="/" style={{ textDecoration: "none", marginBottom: "32px", display: "inline-block" }}>
        <EcoVerseLogo theme="dark" size={48} />
      </Link>

      {/* Glassmorphic Reset Card */}
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={titleStyle}>{isRecoveryMode ? "New Password" : "Reset Password"}</h1>
          <p style={subtitleStyle}>
            {isRecoveryMode 
              ? "Enter your new password below" 
              : "Enter your email to receive a password recovery link"}
          </p>
        </div>

        {/* Error Banner */}
        {errorBanner && (
          <div style={errorBannerStyle}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div style={successBannerStyle}>
            <span>{successMessage}</span>
          </div>
        )}

        {isRecoveryMode ? (
          /* Phase 2: Input New Password */
          <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* New Password */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>New Password</label>
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
              <label style={labelStyle}>Confirm New Password</label>
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

            {/* Submit Password Update */}
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
                  <Key size={18} />
                  Update Password
                </>
              )}
            </button>
          </form>
        ) : (
          /* Phase 1: Request Reset Link */
          <form onSubmit={handleRequestReset} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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

            {/* Submit Link Request */}
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
                  <Key size={18} />
                  Send Reset Link
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div style={{ textAlign: "center", marginTop: "32px", fontSize: "0.875rem", color: "rgba(232, 245, 233, 0.6)" }}>
          <Link href="/auth/login" style={{ color: "#66BB6A", textDecoration: "none", fontWeight: 600 }}>
            Back to Sign In
          </Link>
        </div>
      </div>

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
  padding: "24px",
  fontFamily: "var(--font-sans), sans-serif",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  background: "rgba(21, 35, 23, 0.45)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(102, 187, 106, 0.15)",
  borderRadius: "16px",
  padding: "40px 32px",
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

const successBannerStyle: React.CSSProperties = {
  background: "rgba(102, 187, 106, 0.1)",
  border: "1px solid rgba(102, 187, 106, 0.25)",
  color: "#66BB6A",
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
  zIndex: 10,
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
