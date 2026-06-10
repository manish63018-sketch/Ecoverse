// ─────────────────────────────────────────────────────────────
// EcoVerse — Location Hierarchy Types
// State → City → Area (3-level strict isolation)
// ─────────────────────────────────────────────────────────────

export interface State {
  id: string;
  name: string;         // "Telangana"
  code: string;         // "TG"
  created_at?: string;
}

export interface City {
  id: string;
  state_id: string;
  name: string;         // "Hyderabad"
  slug: string;         // "hyderabad"
  lat?: number;
  lng?: number;
  created_at?: string;
}

export interface Area {
  id: string;
  city_id: string;
  state_id: string;
  name: string;         // "Banjara Hills"
  pincode?: string;     // "500034"
  lat?: number;
  lng?: number;
  radius_km?: number;   // default 3.0
  created_at?: string;
}

export interface LocationSelection {
  stateId: string;
  cityId: string;
  areaId: string;
  stateName: string;
  cityName: string;
  areaName: string;
  displayZone: string;  // "Banjara Hills, Hyderabad, Telangana"
}

export interface LocationHierarchy {
  area: Area & { city: City & { state: State } };
}
