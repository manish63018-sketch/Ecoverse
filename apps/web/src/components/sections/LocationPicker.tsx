"use client";

// ═══════════════════════════════════════════════════════════════
// EcoVerse — 3-Level Location Picker Component
// State → City → Area cascading dropdowns
// Guarantees strict location isolation: never mixes areas
// ═══════════════════════════════════════════════════════════════
import React, { useState, useEffect, useCallback } from "react";
import { MapPin, ChevronDown, CheckCircle, Loader } from "lucide-react";
import type { State, City, Area, LocationSelection } from "@/types/location";

interface LocationPickerProps {
  onChange: (selection: LocationSelection | null) => void;
  initialSelection?: Partial<LocationSelection>;
  required?: boolean;
  compact?: boolean;
}

type LoadingKey = "states" | "cities" | "areas";

export default function LocationPicker({
  onChange,
  initialSelection,
  required = true,
  compact = false,
}: LocationPickerProps) {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  const [selectedStateId, setSelectedStateId] = useState(initialSelection?.stateId ?? "");
  const [selectedCityId, setSelectedCityId] = useState(initialSelection?.cityId ?? "");
  const [selectedAreaId, setSelectedAreaId] = useState(initialSelection?.areaId ?? "");

  const [loading, setLoading] = useState<Record<LoadingKey, boolean>>({
    states: false, cities: false, areas: false,
  });

  const [error, setError] = useState<string | null>(null);

  // Derived labels
  const selectedState = states.find((s) => s.id === selectedStateId);
  const selectedCity  = cities.find((c) => c.id === selectedCityId);
  const selectedArea  = areas.find((a) => a.id === selectedAreaId);

  const confirmed = !!(selectedStateId && selectedCityId && selectedAreaId);

  // ── Load states on mount ──────────────────────────────────────
  useEffect(() => {
    const loadStates = async () => {
      setLoading((prev) => ({ ...prev, states: true }));
      try {
        const res = await fetch("/api/locations/states");
        const data = await res.json();
        setStates(data.states ?? []);
      } catch {
        setError("Failed to load states. Please refresh.");
      } finally {
        setLoading((prev) => ({ ...prev, states: false }));
      }
    };
    loadStates();
  }, []);

  // ── Load cities when state changes ───────────────────────────
  useEffect(() => {
    if (!selectedStateId) {
      setCities([]);
      setAreas([]);
      setSelectedCityId("");
      setSelectedAreaId("");
      return;
    }

    const loadCities = async () => {
      setLoading((prev) => ({ ...prev, cities: true }));
      setCities([]);
      setAreas([]);
      setSelectedCityId("");
      setSelectedAreaId("");
      try {
        const res = await fetch(`/api/locations/cities?state_id=${selectedStateId}`);
        const data = await res.json();
        setCities(data.cities ?? []);
      } catch {
        setError("Failed to load cities.");
      } finally {
        setLoading((prev) => ({ ...prev, cities: false }));
      }
    };
    loadCities();
  }, [selectedStateId]);

  // ── Load areas when city changes ─────────────────────────────
  useEffect(() => {
    if (!selectedCityId) {
      setAreas([]);
      setSelectedAreaId("");
      return;
    }

    const loadAreas = async () => {
      setLoading((prev) => ({ ...prev, areas: true }));
      setAreas([]);
      setSelectedAreaId("");
      try {
        const res = await fetch(`/api/locations/areas?city_id=${selectedCityId}`);
        const data = await res.json();
        setAreas(data.areas ?? []);
      } catch {
        setError("Failed to load areas.");
      } finally {
        setLoading((prev) => ({ ...prev, areas: false }));
      }
    };
    loadAreas();
  }, [selectedCityId]);

  // ── Emit selection to parent ──────────────────────────────────
  const emitSelection = useCallback(() => {
    if (selectedStateId && selectedCityId && selectedAreaId && selectedState && selectedCity && selectedArea) {
      onChange({
        stateId: selectedStateId,
        cityId: selectedCityId,
        areaId: selectedAreaId,
        stateName: selectedState.name,
        cityName: selectedCity.name,
        areaName: selectedArea.name,
        displayZone: `${selectedArea.name}, ${selectedCity.name}, ${selectedState.name}`,
      });
    } else {
      onChange(null);
    }
  }, [selectedStateId, selectedCityId, selectedAreaId, selectedState, selectedCity, selectedArea, onChange]);

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
      {/* Error message */}
      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: "rgba(239, 83, 80, 0.1)",
            border: "1px solid rgba(239, 83, 80, 0.3)",
            borderRadius: "8px",
            fontSize: "0.8rem",
            color: "#EF9A9A",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Dropdowns row */}
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
              value={selectedStateId}
              onChange={(e) => setSelectedStateId(e.target.value)}
              style={{
                ...selectStyle,
                borderColor: selectedStateId ? "rgba(102, 187, 106, 0.45)" : "rgba(102, 187, 106, 0.25)",
              }}
              disabled={loading.states}
            >
              <option value="">
                {loading.states ? "Loading states..." : "Select State"}
              </option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <span style={chevronStyle}>
              {loading.states ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <ChevronDown size={14} />}
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
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              style={{
                ...selectStyle,
                borderColor: selectedCityId ? "rgba(102, 187, 106, 0.45)" : "rgba(102, 187, 106, 0.25)",
                opacity: !selectedStateId ? 0.5 : 1,
              }}
              disabled={!selectedStateId || loading.cities}
            >
              <option value="">
                {!selectedStateId
                  ? "Select state first"
                  : loading.cities
                  ? "Loading cities..."
                  : cities.length === 0
                  ? "No cities found"
                  : "Select City"}
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span style={chevronStyle}>
              {loading.cities ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <ChevronDown size={14} />}
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
          <div style={dropdownWrapper}>
            <select
              id="location-area"
              value={selectedAreaId}
              onChange={(e) => setSelectedAreaId(e.target.value)}
              style={{
                ...selectStyle,
                borderColor: selectedAreaId ? "rgba(102, 187, 106, 0.45)" : "rgba(102, 187, 106, 0.25)",
                opacity: !selectedCityId ? 0.5 : 1,
              }}
              disabled={!selectedCityId || loading.areas}
            >
              <option value="">
                {!selectedCityId
                  ? "Select city first"
                  : loading.areas
                  ? "Loading areas..."
                  : areas.length === 0
                  ? "No areas found"
                  : "Select Area"}
              </option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}{a.pincode ? ` — ${a.pincode}` : ""}
                </option>
              ))}
            </select>
            <span style={chevronStyle}>
              {loading.areas ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <ChevronDown size={14} />}
            </span>
          </div>
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
              📍 {selectedArea?.name} · {selectedCity?.name} · {selectedState?.name}
            </div>
            <div style={{ color: "rgba(232,245,233,0.55)", marginTop: "2px", fontSize: "0.75rem" }}>
              ✅ Alerts will only reach volunteers in <strong style={{ color: "rgba(232,245,233,0.75)" }}>{selectedArea?.name}</strong> — no other areas
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
          Select all 3 levels — alerts are strictly contained to the area you choose
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
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
