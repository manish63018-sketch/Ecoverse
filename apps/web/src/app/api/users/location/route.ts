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
    state_id: string;
    city_id: string;
    area_id: string;
    fcm_token?: string;
    volunteer_lat?: number;
    volunteer_lng?: number;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.firebase_uid || !body.state_id || !body.city_id || !body.area_id) {
    return NextResponse.json(
      { error: 'firebase_uid, state_id, city_id, and area_id are all required' },
      { status: 400 }
    );
  }

  // Validate hierarchy integrity
  const valid = await validateLocationHierarchy(body.area_id, body.city_id, body.state_id);
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
  const locationInfo = await buildDisplayZone(body.area_id);

  // Round GPS to area-level precision (2dp = ~1.1km) for volunteer privacy
  const roundedLat = body.volunteer_lat != null
    ? Math.round(body.volunteer_lat * 100) / 100
    : undefined;
  const roundedLng = body.volunteer_lng != null
    ? Math.round(body.volunteer_lng * 100) / 100
    : undefined;

  await upsertUserLocation(body.firebase_uid, {
    state_id: body.state_id,
    city_id: body.city_id,
    area_id: body.area_id,
    fcm_token: body.fcm_token,
    available_now: false, // availability is toggled separately
    volunteer_lat: roundedLat,
    volunteer_lng: roundedLng,
  });

  return NextResponse.json({
    success: true,
    message: 'Location profile updated',
    location: locationInfo,
  });
}
