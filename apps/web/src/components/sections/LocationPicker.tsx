"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MapPin, ChevronDown, CheckCircle, Loader } from "lucide-react";
import type { LocationSelection } from "@/types/location";
import { INDIA_STATES, getCitiesForState } from "@/data/india-locations";

interface LocationPickerProps {
  onChange: (selection: LocationSelection | null) => void;
  initialSelection?: Partial<LocationSelection>;
  required?: boolean;
  compact?: boolean;
}

export default function LocationPicker({
  onChange,
  initialSelection,
  required = true,
  compact = false,
}: LocationPickerProps) {
  const [selectedState, setSelectedState] = useState(initialSelection?.stateName || initialSelection?.stateId || "");
  const [selectedCity, setSelectedCity] = useState(initialSelection?.cityName || initialSelection?.cityId || "");
  const [selectedArea, setSelectedArea] = useState(initialSelection?.areaName || initialSelection?.areaId || "");

  const cities = getCitiesForState(selectedState);
  const confirmed = !!(selectedState && selectedCity && selectedArea.trim());

  // ── Emit selection to parent ──────────────────────────────────
  const emitSelection = useCallback(() => {
    if (selectedState && selectedCity && selectedArea.trim()) {
      onChange({
        stateId: selectedState,
        cityId: selectedCity,
        areaId: selectedArea.trim(),
        stateName: selectedState,
        cityName: selectedCity,
        areaName: selectedArea.trim(),
        displayZone: `${selectedArea.trim()}, ${selectedCity}, ${selectedState}`,
      });
    } else {
      onChange(null);
    }
  }, [selectedState, selectedCity, selectedArea, onChange]);

  useEffect(() => {
    emitSelection();
  }, [emitSelection]);

  const selectStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(10, 16, 11, 0.7)",
    border: "1px solid rgba(102, 187, 106, 0.25)",
    borderRadius: "10px",
    padding: compact ? "9px 36px 9px 12px" : "11px 36px 11px 14px",
    color: "#E8F5E9",
    fontSize: compact ? "0.85rem" : "0.9rem",
    fontFamily: "var(--font-sans), sans-serif",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    cursor: "pointer",
    transition: "border-color 0.2s",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(10, 16, 11, 0.7)",
    border: "1px solid rgba(102, 187, 106, 0.25)",
    borderRadius: "10px",
    padding: compact ? "9px 12px" : "11px 14px",
    color: "#E8F5E9",
    fontSize: compact ? "0.85rem" : "0.9rem",
    fontFamily: "var(--font-sans), sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "rgba(232, 245, 233, 0.7)",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
  };

  const dropdownWrapper: React.CSSProperties = {
    position: "relative",
    flex: 1,
  };

  const chevronStyle: React.CSSProperties = {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(102, 187, 106, 0.5)",
    pointerEvents: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Dropdowns and Input row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "1fr 1fr 1fr" : "1fr",
          gap: compact ? "12px" : "14px",
        }}
        className="location-picker-grid"
      >
        {/* ── State ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>
            <span>🗺</span> State
            {required && <span style={{ color: "#EF5350" }}>*</span>}
          </label>
          <div style={dropdownWrapper}>
            <select
              id="location-state"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity("");
              }}
              style={{
                ...selectStyle,
                borderColor: selectedState ? "rgba(102, 187, 106, 0.45)" : "rgba(102, 187, 106, 0.25)",
              }}
            >
              <option value="">Select State</option>
              {INDIA_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span style={chevronStyle}>
              <ChevronDown size={14} />
            </span>
          </div>
        </div>

        {/* ── City ───────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>
            <span>🏙</span> City
            {required && <span style={{ color: "#EF5350" }}>*</span>}
          </label>
          <div style={dropdownWrapper}>
            <select
              id="location-city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                ...selectStyle,
                borderColor: selectedCity ? "rgba(102, 187, 106, 0.45)" : "rgba(102, 187, 106, 0.25)",
                opacity: !selectedState ? 0.5 : 1,
              }}
              disabled={!selectedState}
            >
              <option value="">
                {!selectedState
                  ? "Select state first"
                  : cities.length === 0
                  ? "No cities found"
                  : "Select City"}
              </option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span style={chevronStyle}>
              <ChevronDown size={14} />
            </span>
          </div>
        </div>

        {/* ── Area ───────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>
            <MapPin size={12} />
            Area / Zone
            {required && <span style={{ color: "#EF5350" }}>*</span>}
          </label>
          <input
            id="location-area"
            type="text"
            placeholder="e.g. Banjara Hills, Koramangala..."
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            style={{
              ...inputStyle,
              borderColor: selectedArea.trim() ? "rgba(102, 187, 106, 0.45)" : "rgba(102, 187, 106, 0.25)",
              opacity: !selectedCity ? 0.5 : 1,
            }}
            disabled={!selectedCity}
          />
        </div>
      </div>

      {/* ── Confirmation Badge ────────────────────────────────────── */}
      {confirmed ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            background: "rgba(102, 187, 106, 0.08)",
            border: "1px solid rgba(102, 187, 106, 0.3)",
            borderRadius: "10px",
            fontSize: "0.82rem",
          }}
        >
          <CheckCircle size={16} style={{ color: "#66BB6A", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: "#A5D6A7" }}>
              📍 {selectedArea} · {selectedCity} · {selectedState}
            </div>
            <div style={{ color: "rgba(232,245,233,0.55)", marginTop: "2px", fontSize: "0.75rem" }}>
              ✅ Alerts will only reach volunteers near <strong style={{ color: "rgba(232,245,233,0.75)" }}>{selectedArea}</strong>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            background: "rgba(255, 167, 38, 0.06)",
            border: "1px solid rgba(255, 167, 38, 0.2)",
            borderRadius: "10px",
            fontSize: "0.78rem",
            color: "rgba(255, 213, 79, 0.7)",
          }}
        >
          <MapPin size={13} />
          Select state, city, and enter your local area/zone to receive alerts.
        </div>
      )}

      <style>{`
        #location-state:focus, #location-city:focus, #location-area:focus {
          border-color: rgba(102, 187, 106, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(102, 187, 106, 0.08);
        }
        @media (min-width: 700px) {
          .location-picker-grid {
            grid-template-columns: 1fr 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
