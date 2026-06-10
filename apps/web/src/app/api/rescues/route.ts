// ═══════════════════════════════════════════════════════════════
// POST /api/rescues  — Create rescue case with strict location validation
// GET  /api/rescues  — Fetch cases filtered by location level
// ═══════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { validateLocationHierarchy, buildDisplayZone, getUserLocationProfile } from '@/lib/location';
import { alertVolunteersForCase } from '@/lib/alertEngine';
import type { CreateRescueBody, RescueCase } from '@/types/rescue';

export const dynamic = 'force-static';

// ── POST /api/rescues ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: CreateRescueBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // ── 1. Validate all 3 location levels are present ──────────────
  if (!body.state_id || !body.city_id || !body.area_id) {
    return NextResponse.json(
      { error: 'Complete location required: state, city, and area must all be specified' },
      { status: 400 }
    );
  }

  // ── 2. Validate emergency level ──────────────────────────────
  const validEmergencyLevels = ['low', 'medium', 'high', 'critical'];
  if (!body.emergency_level || !validEmergencyLevels.includes(body.emergency_level)) {
    return NextResponse.json(
      { error: 'emergency_level must be one of: low, medium, high, critical' },
      { status: 400 }
    );
  }

  // ── 3. Verify hierarchy integrity: area → city → state ─────────
  // CRITICAL: Prevents location mixing (Banjara Hills cannot claim Mumbai city)
  const hierarchyValid = await validateLocationHierarchy(
    body.area_id,
    body.city_id,
    body.state_id
  );

  if (!hierarchyValid) {
    return NextResponse.json(
      {
        error: 'Location mismatch: the selected area does not belong to the specified city or state. This may indicate tampered data.',
        code: 'LOCATION_HIERARCHY_MISMATCH',
      },
      { status: 400 }
    );
  }

  // ── 4. Build display zone string ──────────────────────────────
  const locationInfo = await buildDisplayZone(body.area_id);
  if (!locationInfo) {
    return NextResponse.json(
      { error: 'Could not resolve area information. Please try again.' },
      { status: 500 }
    );
  }

  // ── 5. Area-safe GPS: round to 2 decimal places (~1.1km precision) ──
  // This protects reporter's exact location — only area-level GPS stored publicly
  const areaLat = body.exact_lat != null
    ? Math.round(body.exact_lat * 100) / 100
    : null;
  const areaLng = body.exact_lng != null
    ? Math.round(body.exact_lng * 100) / 100
    : null;

  // ── 6. Insert rescue case ─────────────────────────────────────
  const rows = await query<RescueCase>(`
    INSERT INTO rescue_cases (
      reporter_user_id,
      state_id, city_id, area_id,
      exact_lat, exact_lng,
      area_name, display_zone,
      animal_type, condition_summary, emergency_level, description,
      status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'open')
    RETURNING 
      id, reporter_user_id,
      state_id, city_id, area_id,
      area_name, display_zone,
      animal_type, condition_summary, emergency_level, description,
      status, created_at
  `, [
    body.reporter_user_id ?? null,
    body.state_id,
    body.city_id,
    body.area_id,
    areaLat,
    areaLng,
    locationInfo.areaName,      // "Banjara Hills, Hyderabad"
    locationInfo.displayZone,   // "Banjara Hills, Hyderabad, Telangana"
    body.animal_type,
    body.condition_summary ?? null,
    body.emergency_level,
    body.description ?? null,
  ]);

  const newCase = rows[0];

  // ── 7. Trigger area-level alerts (async — does NOT block response) ──
  // The alert engine runs the 4-step cascade in the background
  alertVolunteersForCase(newCase).catch(err => {
    console.error(`[API] Alert engine failed for case ${newCase.id}:`, err);
  });

  return NextResponse.json(
    {
      case: newCase,
      status: 'created',
      message: `Emergency rescue reported in ${locationInfo.displayZone}. Area volunteers are being notified.`,
    },
    { status: 201 }
  );
}

// ── GET /api/rescues ─────────────────────────────────────────────
// Supports strict location isolation via query params:
//   ?area_id=<uuid>    — area-level feed (default, most specific)
//   ?city_id=<uuid>    — city-level feed (all areas in city)
//   ?state_id=<uuid>   — state-level feed (all cities in state)
//   ?firebase_uid=<uid> — auto-detect location from user profile
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  let areaId    = searchParams.get('area_id');
  const cityId  = searchParams.get('city_id');
  const stateId = searchParams.get('state_id');
  const uid     = searchParams.get('firebase_uid');
  const status  = searchParams.get('status'); // optional filter

  // Auto-detect location from user profile if firebase_uid provided
  if (uid && !areaId && !cityId && !stateId) {
    const profile = await getUserLocationProfile(uid);
    if (profile?.area_id) areaId = profile.area_id;
  }

  let whereClause = '1=1';
  const params: string[] = [];

  if (areaId) {
    // STRICTEST: only exact same area
    params.push(areaId);
    whereClause += ` AND rc.area_id = $${params.length}`;
  } else if (cityId) {
    // City-level: all areas within a city
    params.push(cityId);
    whereClause += ` AND rc.city_id = $${params.length}`;
  } else if (stateId) {
    // State-level: all cities within a state
    params.push(stateId);
    whereClause += ` AND rc.state_id = $${params.length}`;
  }
  // If none provided: return empty (safer than returning all)
  else {
    return NextResponse.json({ cases: [], warning: 'No location filter provided. Specify area_id, city_id, or state_id.' });
  }

  if (status) {
    params.push(status);
    whereClause += ` AND rc.status = $${params.length}`;
  } else {
    whereClause += ` AND rc.status IN ('open', 'assigned', 'in_progress', 'escalated')`;
  }

  try {
    const cases = await query<RescueCase & { city_name: string; state_name: string }>(`
      SELECT 
        rc.id, rc.reporter_user_id,
        rc.state_id, rc.city_id, rc.area_id,
        rc.area_name, rc.display_zone,
        rc.animal_type, rc.condition_summary, rc.emergency_level, rc.description,
        rc.status, rc.assigned_volunteer_id,
        rc.created_at, rc.assigned_at, rc.escalated_at, rc.resolved_at,
        c.name AS city_name,
        s.name AS state_name
      FROM rescue_cases rc
      JOIN cities c ON rc.city_id = c.id
      JOIN states s ON rc.state_id = s.id
      WHERE ${whereClause}
      ORDER BY 
        CASE rc.emergency_level 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          ELSE 4 
        END,
        rc.created_at DESC
      LIMIT 50
    `, params);

    return NextResponse.json({
      cases,
      filter: { areaId, cityId, stateId },
      count: cases.length,
    });
  } catch (err) {
    console.error('[API] /api/rescues GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch rescue cases' }, { status: 500 });
  }
}
