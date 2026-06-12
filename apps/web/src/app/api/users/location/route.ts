// GET and PATCH /api/users/location
// Manage a user's 3-level location profile (state + city + area)
import { NextRequest, NextResponse } from 'next/server';
import { validateLocationHierarchy, buildDisplayZone, upsertUserLocation, getUserLocationProfile } from '@/lib/location';

export const dynamic = 'force-static';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const uid = searchParams.get('firebase_uid');

  if (!uid) {
    return NextResponse.json({ error: 'firebase_uid is required' }, { status: 400 });
  }

  try {
    const profile = await getUserLocationProfile(uid);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error('[API] /api/users/location GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch user location profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  let body: {
    firebase_uid: string;
    state_id?: string;
    city_id?: string;
    area_id?: string;
    fcm_token?: string;
    available_now?: boolean;
    volunteer_lat?: number;
    volunteer_lng?: number;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.firebase_uid) {
    return NextResponse.json({ error: 'firebase_uid is required' }, { status: 400 });
  }

  // Fetch existing profile to merge/fallback
  const existingProfile = await getUserLocationProfile(body.firebase_uid);

  const state_id = body.state_id || existingProfile?.state_id;
  const city_id = body.city_id || existingProfile?.city_id;
  const area_id = body.area_id || existingProfile?.area_id;

  if (!state_id || !city_id || !area_id) {
    return NextResponse.json(
      { error: 'Location profile not initialized yet. state_id, city_id, and area_id are required' },
      { status: 400 }
    );
  }

  // Validate hierarchy integrity
  const valid = await validateLocationHierarchy(area_id, city_id, state_id);
  if (!valid) {
    return NextResponse.json(
      {
        error: 'Location hierarchy mismatch: area does not belong to the specified city/state',
        code: 'LOCATION_HIERARCHY_MISMATCH',
      },
      { status: 400 }
    );
  }

  // Build display zone
  const locationInfo = await buildDisplayZone(area_id);

  // Round GPS to area-level precision (2dp = ~1.1km) for volunteer privacy
  const roundedLat = body.volunteer_lat != null
    ? Math.round(body.volunteer_lat * 100) / 100
    : undefined;
  const roundedLng = body.volunteer_lng != null
    ? Math.round(body.volunteer_lng * 100) / 100
    : undefined;

  await upsertUserLocation(body.firebase_uid, {
    state_id,
    city_id,
    area_id,
    fcm_token: body.fcm_token,
    available_now: body.available_now !== undefined ? body.available_now : undefined,
    volunteer_lat: roundedLat,
    volunteer_lng: roundedLng,
  });

  return NextResponse.json({
    success: true,
    message: 'Location profile updated',
    location: locationInfo,
  });
}
