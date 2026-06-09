import React from "react";

interface EcoVerseLogoProps {
  variant?: "full" | "icon" | "wordmark";
  theme?: "light" | "dark" | "auto";
  size?: number;
  className?: string;
}

export function EcoVerseLogo({
  variant = "full",
  theme = "auto",
  size = 40,
  className = "",
}: EcoVerseLogoProps) {
  const iconColor = theme === "dark" ? "#66BB6A" : "#2E7D32";
  const accentColor = "#66BB6A";
  const textColor = theme === "dark" ? "#E8F5E9" : "#1A2E1A";

  const Icon = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="EcoVerse Logo Icon"
    >
      {/* Outer glow circle */}
      <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" opacity="0.12" />

      {/* Earth circle */}
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="url(#earthGradient)"
        stroke={accentColor}
        strokeWidth="2"
      />

      {/* Continent shapes (simplified) */}
      <ellipse cx="38" cy="42" rx="10" ry="7" fill={accentColor} opacity="0.7" transform="rotate(-20 38 42)" />
      <ellipse cx="58" cy="36" rx="6" ry="4" fill={accentColor} opacity="0.6" transform="rotate(10 58 36)" />
      <ellipse cx="52" cy="58" rx="8" ry="5" fill={accentColor} opacity="0.65" transform="rotate(-5 52 58)" />
      <ellipse cx="34" cy="58" rx="5" ry="4" fill={accentColor} opacity="0.5" transform="rotate(15 34 58)" />

      {/* Infinity loop (∞) overlaid */}
      <path
        d="M 22 50 C 22 42 30 36 38 36 C 46 36 50 44 50 50 C 50 56 54 64 62 64 C 70 64 78 58 78 50 C 78 42 70 36 62 36 C 54 36 50 44 50 50 C 50 56 46 64 38 64 C 30 64 22 58 22 50 Z"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Paw print */}
      <g transform="translate(43, 45) scale(0.6)" fill="white" opacity="0.95">
        <circle cx="7" cy="0" r="3" />
        <circle cx="14" cy="0" r="2.2" />
        <circle cx="0" cy="5" r="2.2" />
        <circle cx="21" cy="5" r="2.2" />
        <ellipse cx="10.5" cy="13" rx="8" ry="6.5" />
      </g>

      {/* Orbital dot (represents community/globe spin) */}
      <circle cx="50" cy="12" r="4" fill={accentColor} />

      <defs>
        <radialGradient id="logoGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="100%" stopColor={iconColor} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="earthGradient" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#2E7D32" />
          <stop offset="100%" stopColor="#1B5E20" />
        </radialGradient>
      </defs>
    </svg>
  );

  if (variant === "icon") {
    return (
      <span className={className} style={{ display: "inline-flex" }}>
        <Icon />
      </span>
    );
  }

  if (variant === "wordmark") {
    return (
      <span
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: size * 0.55,
          letterSpacing: "-0.03em",
          color: textColor,
          lineHeight: 1,
        }}
      >
        <span style={{ color: iconColor }}>Eco</span>
        <span>Verse</span>
      </span>
    );
  }

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.2,
        textDecoration: "none",
      }}
    >
      <Icon />
      <span
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: size * 0.55,
          letterSpacing: "-0.03em",
          color: textColor,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        <span style={{ color: iconColor }}>Eco</span>
        <span>Verse</span>
      </span>
    </span>
  );
}
