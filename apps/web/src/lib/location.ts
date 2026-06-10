// ─────────────────────────────────────────────────────────────
// EcoVerse — Location Hierarchy Helpers
// Validated queries against the 3-level State → City → Area tree
// ─────────────────────────────────────────────────────────────
import { query } from './db';
import type { State, City, Area } from '@/types/location';

// ── Fetch all states ─────────────────────────────────────────
export async function getStates(): Promise<State[]> {
  return query<State>(`
    SELECT id, name, code, created_at
    FROM states
    ORDER BY name ASC
  `);
}

// ── Fetch cities for a state ─────────────────────────────────
export async function getCitiesByState(stateId: string): Promise<City[]> {
  return query<City>(`
    SELECT id, state_id, name, slug, lat, lng, created_at
    FROM cities
    WHERE state_id = $1
    ORDER BY name ASC
  `, [stateId]);
}

// ── Fetch areas for a city ───────────────────────────────────
export async function getAreasByCity(cityId: string): Promise<Area[]> {
  return query<Area>(`
    SELECT id, city_id, state_id, name, pincode, lat, lng, radius_km, created_at
    FROM areas
    WHERE city_id = $1
    ORDER BY name ASC
  `, [cityId]);
}

// ── Validate: area → city → state hierarchy ──────────────────
// CRITICAL: This is the core guard against location mixing.
// Returns true ONLY if the area belongs to that city AND city belongs to state.
export async function validateLocationHierarchy(
  areaId: string,
  cityId: string,
  stateId: string
): Promise<boolean> {
  const rows = await query<{ id: string }>(`
    SELECT a.id
    FROM areas a
    JOIN cities c ON a.city_id = c.id
    JOIN states s ON c.state_id = s.id
    WHERE a.id = $1
      AND c.id = $2
      AND s.id = $3
  `, [areaId, cityId, stateId]);

  return rows.length > 0;
}

// ── Build display zone string ────────────────────────────────
// Returns: "Banjara Hills, Hyderabad, Telangana"
export async function buildDisplayZone(areaId: string): Promise<{
  area: string;
  city: string;
  state: string;
  areaName: string;    // "Banjara Hills, Hyderabad"
  displayZone: string; // "Banjara Hills, Hyderabad, Telangana"
} | null> {
  const rows = await query<{
    area: string;
    city: string;
    state: string;
  }>(`
    SELECT 
      a.name AS area,
      c.name AS city,
      s.name AS state
    FROM areas a
    JOIN cities c ON a.city_id = c.id
    JOIN states s ON c.state_id = s.id
    WHERE a.id = $1
  `, [areaId]);

  if (rows.length === 0) return null;
  const loc = rows[0];
  return {
    area: loc.area,
    city: loc.city,
    state: loc.state,
    areaName: `${loc.area}, ${loc.city}`,
    displayZone: `${loc.area}, ${loc.city}, ${loc.state}`,
  };
}

// ── Get area details (for volunteer lookup) ──────────────────
export async function getAreaById(areaId: string): Promise<Area | null> {
  const rows = await query<Area>(`
    SELECT id, city_id, state_id, name, pincode, lat, lng, radius_km
    FROM areas WHERE id = $1
  `, [areaId]);
  return rows[0] ?? null;
}

// ── Get user's location profile ──────────────────────────────
export async function getUserLocationProfile(firebaseUid: string): Promise<{
  state_id: string | null;
  city_id: string | null;
  area_id: string | null;
  area_name?: string;
  display_zone?: string;
} | null> {
  const rows = await query<{
    state_id: string;
    city_id: string;
    area_id: string;
    area_name: string;
    city_name: string;
    state_name: string;
  }>(`
    SELECT 
      ul.state_id, ul.city_id, ul.area_id,
      a.name AS area_name,
      c.name AS city_name,
      s.name AS state_name
    FROM user_locations ul
    LEFT JOIN areas a ON ul.area_id = a.id
    LEFT JOIN cities c ON ul.city_id = c.id
    LEFT JOIN states s ON ul.state_id = s.id
    WHERE ul.firebase_uid = $1
  `, [firebaseUid]);

  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    state_id: r.state_id,
    city_id: r.city_id,
    area_id: r.area_id,
    area_name: r.area_name,
    display_zone: r.area_name && r.city_name && r.state_name
      ? `${r.area_name}, ${r.city_name}, ${r.state_name}`
      : undefined,
  };
}

// ── Upsert user location profile ────────────────────────────
export async function upsertUserLocation(
  firebaseUid: string,
  data: {
    state_id: string;
    city_id: string;
    area_id: string;
    fcm_token?: string;
    available_now?: boolean;
    volunteer_lat?: number;
    volunteer_lng?: number;
    verification_status?: 'unverified' | 'pending' | 'verified';
  }
): Promise<void> {
  await query(`
    INSERT INTO user_locations (
      firebase_uid, state_id, city_id, area_id,
      fcm_token, available_now, volunteer_lat, volunteer_lng,
      verification_status, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    ON CONFLICT (firebase_uid) DO UPDATE SET
      state_id            = EXCLUDED.state_id,
      city_id             = EXCLUDED.city_id,
      area_id             = EXCLUDED.area_id,
      fcm_token           = COALESCE(EXCLUDED.fcm_token, user_locations.fcm_token),
      available_now       = COALESCE(EXCLUDED.available_now, user_locations.available_now),
      volunteer_lat       = COALESCE(EXCLUDED.volunteer_lat, user_locations.volunteer_lat),
      volunteer_lng       = COALESCE(EXCLUDED.volunteer_lng, user_locations.volunteer_lng),
      verification_status = COALESCE(EXCLUDED.verification_status, user_locations.verification_status),
      updated_at          = NOW()
  `, [
    firebaseUid,
    data.state_id,
    data.city_id,
    data.area_id,
    data.fcm_token ?? null,
    data.available_now ?? false,
    data.volunteer_lat ?? null,
    data.volunteer_lng ?? null,
    data.verification_status ?? 'unverified',
  ]);
}
