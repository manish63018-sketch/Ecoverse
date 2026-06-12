"use client";

/**
 * "Supabase is the only source of truth for authentication and app data."
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import { EcoVerseLogo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthContext } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const { signInWithEmail, user, profile, loading } = useAuth();
  const { signInWithGoogle } = useAuthContext();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (profile?.is_admin || profile?.primary_role === 'admin' || profile?.roles?.includes('admin')) {
        router.push("/admin");
      } else if (profile?.is_moderator || profile?.primary_role === 'moderator' || profile?.roles?.includes('moderator')) {
        router.push("/moderation");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, profile, loading, router]);

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem("ecoverse_remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (!email || !password) {
      setErrorBanner("Please fill in all fields");
      return;
    }

    try {
      setLocalLoading(true);
      const authenticatedUser = await signInWithEmail(email, password);

      if (!authenticatedUser) {
        throw new Error("Unable to log in. Please check your credentials.");
      }

      // Fetch profile details to check role for redirection
      const { data: userProfile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authenticatedUser.id)
        .maybeSingle();

      if (profileErr) throw profileErr;
      
      if (rememberMe) {
        localStorage.setItem("ecoverse_remembered_email", email);
      } else {
        localStorage.removeItem("ecoverse_remembered_email");
      }

      toast.success("Welcome back to EcoVerse!");

      if (userProfile?.is_admin || userProfile?.primary_role === 'admin' || userProfile?.roles?.includes('admin')) {
        router.push("/admin");
      } else if (userProfile?.is_moderator || userProfile?.primary_role === 'moderator' || userProfile?.roles?.includes('moderator')) {
        router.push("/moderation");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setErrorBanner(err.message || "Sign in failed. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorBanner(null);
    try {
      setLocalLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setErrorBanner(err.message || "Google sign in failed.");
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

      {/* Glassmorphic Login Card */}
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={titleStyle}>Welcome Back</h1>
          <p style={subtitleStyle}>
            Sign in to access emergency rescue alerts and maps
          </p>
        </div>

        {/* Error Banner */}
        {errorBanner && (
          <div style={errorBannerStyle}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Email Password Form */}
        <form onSubmit={handleEmailSignIn} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Email input group */}
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

          {/* Password input group */}
          <div style={inputGroupStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={labelStyle}>Password</label>
              <Link href="/auth/reset-password" style={linkStyle}>
                Forgot Password?
              </Link>
            </div>
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

          {/* Remember Me Checkbox */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: "#66BB6A", cursor: "pointer" }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: "0.82rem", color: "rgba(232, 245, 233, 0.7)", cursor: "pointer", userSelect: "none" }}>
              Remember me on this device
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
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Optional Google Sign-In */}
        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(102, 187, 106, 0.15)" }}></div>
            <span style={{ fontSize: "0.75rem", color: "rgba(232, 245, 233, 0.4)" }}>or connect with</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(102, 187, 106, 0.15)" }}></div>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            style={googleButtonStyle}
            className="auth-btn"
          >
            <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.35 12.93a5.59 5.59 0 0 1 5.64-5.59c2.477 0 4.5 1.5 5.3 3.58l3.96-3.08A11.97 11.97 0 0 0 13.99 2c-6.627 0-12 5.373-12 12s5.373 12 12 12c6.237 0 11.39-4.8 11.96-10.966H12.24Z" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Signup Link */}
        <div style={{ textAlign: "center", marginTop: "32px", fontSize: "0.875rem", color: "rgba(232, 245, 233, 0.6)" }}>
          New to EcoVerse?{" "}
          <Link href="/auth/signup" style={{ color: "#66BB6A", textDecoration: "none", fontWeight: 600 }}>
            Create an Account
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

const linkStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#66BB6A",
  textDecoration: "none",
  fontWeight: 500,
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

const googleButtonStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.08)",
  color: "#FFFFFF",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: "10px",
  padding: "12px",
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  width: "100%",
  boxSizing: "border-box",
};
