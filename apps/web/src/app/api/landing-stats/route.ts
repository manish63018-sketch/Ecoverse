// GET /api/landing-stats
// Returns counts, recent cases, and online volunteers/NGOs for the public landing page.
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Basic Counts
    const counts = {
      states: 0,
      cities: 0,
      areas: 0,
      volunteers: 0,
      ngos: 0,
      rescues: 0,
      resolvedRescues: 0,
    };

    let isDbConnected = true;

    try {
      const stateCount = await query<{ count: string }>('SELECT COUNT(*) FROM states');
      const cityCount = await query<{ count: string }>('SELECT COUNT(*) FROM cities');
      const areaCount = await query<{ count: string }>('SELECT COUNT(*) FROM areas');
      const volunteerCount = await query<{ count: string }>('SELECT COUNT(*) FROM user_locations');
      const ngoCount = await query<{ count: string }>('SELECT COUNT(*) FROM ngos');
      const rescueCount = await query<{ count: string }>('SELECT COUNT(*) FROM rescue_cases');
      const resolvedCount = await query<{ count: string }>("SELECT COUNT(*) FROM rescue_cases WHERE status = 'resolved'");

      counts.states = parseInt(stateCount[0]?.count || '0', 10);
      counts.cities = parseInt(cityCount[0]?.count || '0', 10);
      counts.areas = parseInt(areaCount[0]?.count || '0', 10);
      counts.volunteers = parseInt(volunteerCount[0]?.count || '0', 10);
      counts.ngos = parseInt(ngoCount[0]?.count || '0', 10);
      counts.rescues = parseInt(rescueCount[0]?.count || '0', 10);
      counts.resolvedRescues = parseInt(resolvedCount[0]?.count || '0', 10);
    } catch (dbErr) {
      console.warn('[API/landing-stats] Database connection or query failed. Defaulting to 0 counts.', dbErr);
      isDbConnected = false;
    }

    // 2. Recent Cases
    let recentCases: any[] = [];
    if (isDbConnected) {
      try {
        recentCases = await query(`
          SELECT 
            rc.id, rc.animal_type, rc.condition_summary, rc.status, rc.created_at,
            rc.area_name, rc.display_zone, rc.assigned_volunteer_id, rc.assigned_ngo_id,
            c.name AS city_name
          FROM rescue_cases rc
          LEFT JOIN cities c ON rc.city_id = c.id
          ORDER BY rc.created_at DESC
          LIMIT 5
        `);
      } catch (dbErr) {
        console.warn('[API/landing-stats] Failed to fetch recent cases:', dbErr);
      }
    }

    // 3. Nearby alerts / active network members (volunteers & NGOs)
    let members: any[] = [];
    let sampleAreas: any[] = [];

    if (isDbConnected) {
      try {
        const activeVolunteers = await query(`
          SELECT 
            firebase_uid as id, 'volunteer' as type, volunteer_lat as lat, volunteer_lng as lng, 
            verification_status, city_id
          FROM user_locations 
          WHERE available_now = true OR verification_status = 'verified'
          LIMIT 10
        `);

        const activeNgos = await query(`
          SELECT 
            id, 'ngo' as type, name, lat, lng, city_id
          FROM ngos
          LIMIT 10
        `);

        members = [
          ...activeVolunteers.map(v => ({
            id: v.id,
            type: 'volunteer',
            lat: v.lat ? Number(v.lat) : null,
            lng: v.lng ? Number(v.lng) : null,
            name: 'Volunteer',
            verification_status: v.verification_status,
            city_id: v.city_id
          })),
          ...activeNgos.map(n => ({
            id: n.id,
            type: 'ngo',
            lat: n.lat ? Number(n.lat) : null,
            lng: n.lng ? Number(n.lng) : null,
            name: n.name,
            city_id: n.city_id
          }))
        ];
      } catch (dbErr) {
        console.warn('[API/landing-stats] Failed to fetch network members:', dbErr);
      }

      try {
        sampleAreas = await query(`
          SELECT name FROM areas LIMIT 5
        `);
      } catch (dbErr) {
        console.warn('[API/landing-stats] Failed to fetch sample areas:', dbErr);
      }
    }

    return NextResponse.json({
      counts,
      recentCases,
      members,
      sampleAreas: sampleAreas.map(a => a.name),
      dbConnected: isDbConnected,
    });
  } catch (err: any) {
    console.error('[API] /api/landing-stats critical error:', err);
    return NextResponse.json({
      counts: { states: 0, cities: 0, areas: 0, volunteers: 0, ngos: 0, rescues: 0, resolvedRescues: 0 },
      recentCases: [],
      members: [],
      dbConnected: false,
      error: err.message || 'Internal server error',
    });
  }
}
