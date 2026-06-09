"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { EcoVerseLogo } from "@/components/brand/Logo";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      setLocalLoading(true);
      await signInWithEmail(email, password);
      toast.success("Welcome back to EcoVerse!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      const code = error.code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        toast.error("Invalid email or password");
      } else if (code === "auth/invalid-email") {
        toast.error("Please enter a valid email address");
      } else {
        toast.error(error.message || "Sign in failed");
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLocalLoading(true);
      await signInWithGoogle();
      toast.success("Successfully signed in with Google!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error(error.message || "Google sign in failed");
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top, #121e14 0%, #050806 100%)",
        padding: "24px",
        fontFamily: "var(--font-sans), sans-serif",
      }}
    >
      {/* Brand logo at the top */}
      <Link href="/" style={{ textDecoration: "none", marginBottom: "32px", display: "inline-block" }}>
        <EcoVerseLogo theme="dark" size={48} />
      </Link>

      {/* Glassmorphic Login Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(21, 35, 23, 0.45)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(102, 187, 106, 0.15)",
          borderRadius: "var(--radius-2xl)",
          padding: "40px 32px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.025em",
              marginBottom: "8px",
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "rgba(232, 245, 233, 0.6)", fontSize: "0.875rem" }}>
            Sign in to access emergency rescue alerts and maps
          </p>
        </div>

        {/* Email Password Form */}
        <form onSubmit={handleEmailSignIn} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Email input group */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(232, 245, 233, 0.85)" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(102, 187, 106, 0.6)",
                }}
              />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  background: "rgba(10, 16, 11, 0.6)",
                  border: "1px solid rgba(102, 187, 106, 0.25)",
                  borderRadius: "var(--radius-lg)",
                  padding: "12px 14px 12px 42px",
                  color: "#FFFFFF",
                  fontSize: "0.95rem",
                  transition: "all var(--transition-base)",
                  outline: "none",
                }}
                className="auth-input"
              />
            </div>
          </div>

          {/* Password input group */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(232, 245, 233, 0.85)" }}>
                Password
              </label>
              <Link
                href="/forgot-password"
                style={{
                  fontSize: "0.75rem",
                  color: "#66BB6A",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(102, 187, 106, 0.6)",
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  background: "rgba(10, 16, 11, 0.6)",
                  border: "1px solid rgba(102, 187, 106, 0.25)",
                  borderRadius: "var(--radius-lg)",
                  padding: "12px 42px 12px 42px",
                  color: "#FFFFFF",
                  fontSize: "0.95rem",
                  transition: "all var(--transition-base)",
                  outline: "none",
                }}
                className="auth-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
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
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={localLoading}
            style={{
              marginTop: "8px",
              background: "linear-gradient(135deg, #388E3C 0%, #1B5E20 100%)",
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
              boxShadow: "0 8px 20px rgba(46, 125, 50, 0.3)",
              transition: "all var(--transition-base)",
            }}
            className="auth-btn"
          >
            {localLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "24px 0",
            color: "rgba(232, 245, 233, 0.3)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "rgba(102, 187, 106, 0.15)" }}></div>
          <span style={{ padding: "0 10px" }}>Or Continue with</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(102, 187, 106, 0.15)" }}></div>
        </div>

        {/* Google sign-in */}
        <button
          onClick={handleGoogleSignIn}
          disabled={localLoading}
          style={{
            width: "100%",
            background: "rgba(15, 26, 16, 0.8)",
            border: "1px solid rgba(102, 187, 106, 0.25)",
            color: "#E8F5E9",
            borderRadius: "var(--radius-lg)",
            padding: "12px",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "all var(--transition-base)",
          }}
          className="google-btn"
        >
          {/* Custom Google SVG Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.67 0 3.2.58 4.38 1.71l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.87 3C6.31 7.54 8.95 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.47h6.47c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.98 3.72-4.88 3.72-8.52z"
            />
            <path
              fill="#FBBC05"
              d="M5.37 14.5c-.24-.72-.37-1.49-.37-2.3s.13-1.58.37-2.3L1.5 6.9C.54 8.82 0 10.97 0 13.2s.54 4.38 1.5 6.3l3.87-3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.05 0-5.69-2.5-6.62-5.46L1.5 15.88C3.39 19.73 7.35 22.36 12 23z"
            />
          </svg>
          Google
        </button>

        {/* Signup Link */}
        <div style={{ textAlign: "center", marginTop: "32px", fontSize: "0.875rem", color: "rgba(232, 245, 233, 0.6)" }}>
          New to EcoVerse?{" "}
          <Link href="/signup" style={{ color: "#66BB6A", textDecoration: "none", fontWeight: 600 }}>
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
        .google-btn:hover {
          background: rgba(102, 187, 106, 0.08) !important;
          border-color: rgba(102, 187, 106, 0.45) !important;
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
