"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell, LogOut, LayoutDashboard, User as UserIcon, Settings } from "lucide-react";
import { EcoVerseLogo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/hooks/useAuth";
import toast from "react-hot-toast";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Map", href: "/map" },
  { label: "Rescue", href: "/rescue", highlight: true },
  { label: "Adopt", href: "/adopt" },
  { label: "Knowledge", href: "/knowledge" },
  { label: "NGOs", href: "/ngos" },
  { label: "💚 Donate", href: "/donate" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Successfully logged out");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      <nav
        id="main-navbar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
          padding: scrolled ? "10px 0" : "18px 0",
          background: scrolled
            ? "rgba(15,26,16,0.95)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(102,187,106,0.15)"
            : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <EcoVerseLogo theme="dark" size={38} />
          </Link>

          {/* Desktop Nav */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              listStyle: "none",
            }}
            className="hidden-mobile"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    borderRadius: "var(--radius-full)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    color: link.highlight
                      ? "#fff"
                      : isActive
                      ? "#A5D6A7"
                      : "rgba(232,245,233,0.85)",
                    background: link.highlight
                      ? "linear-gradient(135deg,#388E3C,#1B5E20)"
                      : isActive
                      ? "rgba(102,187,106,0.12)"
                      : "transparent",
                    transition: "all var(--transition-base)",
                    boxShadow: link.highlight ? "0 4px 16px rgba(46,125,50,0.4)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!link.highlight && !isActive) {
                      (e.target as HTMLElement).style.background = "rgba(102,187,106,0.12)";
                      (e.target as HTMLElement).style.color = "#A5D6A7";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!link.highlight && !isActive) {
                      (e.target as HTMLElement).style.background = "transparent";
                      (e.target as HTMLElement).style.color = "rgba(232,245,233,0.85)";
                    }
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            {user && (
              <>
                <Link
                  href="/dashboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    borderRadius: "var(--radius-full)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    color: "rgba(232,245,233,0.85)",
                    transition: "all var(--transition-base)",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.background = "rgba(102,187,106,0.12)";
                    (e.target as HTMLElement).style.color = "#A5D6A7";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.background = "transparent";
                    (e.target as HTMLElement).style.color = "rgba(232,245,233,0.85)";
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "8px 16px",
                    borderRadius: "var(--radius-full)",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    color: "rgba(232,245,233,0.85)",
                    transition: "all var(--transition-base)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(102,187,106,0.12)";
                    (e.currentTarget as HTMLElement).style.color = "#A5D6A7";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "rgba(232,245,233,0.85)";
                  }}
                >
                  <UserIcon size={14} /> Profile
                </Link>
              </>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* SOS Button */}
            <Link
              href="/sos"
              id="nav-sos-btn"
              className="btn btn-sos hidden-mobile"
              style={{ padding: "10px 20px", fontSize: "0.875rem" }}
            >
              🚨 SOS
            </Link>

            {/* Auth State Button */}
            {user ? (
              <div className="hidden-mobile" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Link href="/profile" style={{ textDecoration: "none" }}>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      title="View Profile"
                      style={{ width: "34px", height: "34px", borderRadius: "50%", border: "2px solid #66BB6A", cursor: "pointer" }}
                    />
                  ) : (
                    <div
                      title="View Profile"
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        background: "rgba(102,187,106,0.2)",
                        border: "2px solid #66BB6A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#A5D6A7",
                        fontWeight: "bold",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                      }}
                    >
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U")}
                    </div>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-ghost"
                  style={{ padding: "10px 16px", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="btn btn-ghost hidden-mobile"
                style={{ padding: "10px 24px", fontSize: "0.875rem" }}
              >
                Login
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              aria-label="Toggle mobile menu"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="show-mobile"
              style={{
                background: "rgba(102,187,106,0.1)",
                border: "1px solid rgba(102,187,106,0.3)",
                color: "#A5D6A7",
                borderRadius: "var(--radius-md)",
                width: "44px",
                height: "44px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all var(--transition-fast)",
              }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "rgba(15,26,16,0.97)",
              backdropFilter: "blur(24px)",
              borderBottom: "1px solid rgba(102,187,106,0.2)",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              animation: "fade-up 0.2s ease forwards",
            }}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: "14px 20px",
                    borderRadius: "var(--radius-lg)",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: link.highlight
                      ? "#66BB6A"
                      : isActive
                      ? "#A5D6A7"
                      : "rgba(232,245,233,0.85)",
                    background: link.highlight
                      ? "rgba(102,187,106,0.1)"
                      : isActive
                      ? "rgba(102,187,106,0.08)"
                      : "transparent",
                    textDecoration: "none",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            {user && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: "14px 20px",
                    borderRadius: "var(--radius-lg)",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "rgba(232,245,233,0.85)",
                    background: "transparent",
                    textDecoration: "none",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: "14px 20px",
                    borderRadius: "var(--radius-lg)",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "rgba(232,245,233,0.85)",
                    background: "transparent",
                    textDecoration: "none",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  My Profile
                </Link>
              </>
            )}
            <div style={{ display: "flex", gap: "12px", marginTop: "12px", padding: "0 4px" }}>
              <Link href="/sos" onClick={() => setMobileOpen(false)} className="btn btn-sos" style={{ flex: 1, fontSize: "0.9rem", textAlign: "center" }}>🚨 Report SOS</Link>
              {user ? (
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="btn btn-ghost"
                  style={{ flex: 1, fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              ) : (
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn btn-ghost" style={{ flex: 1, fontSize: "0.9rem", textAlign: "center" }}>Login</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <style>{`
        .hidden-mobile { display: flex; }
        .show-mobile { display: none !important; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}

