// GET /api/locations/areas?city_id=<uuid>
// Returns areas for a given city
import { NextRequest, NextResponse } from 'next/server';
import { getAreasByCity } from '@/lib/location';

export const dynamic = 'force-static';

export async function GET(req: NextRequest) {
  const cityId = req.nextUrl.searchParams.get('city_id');

  if (!cityId) {
    return NextResponse.json(
      { error: 'city_id query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const areas = await getAreasByCity(cityId);
    return NextResponse.json({ areas });
  } catch (err) {
    console.error('[API] /api/locations/areas error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch areas' },
      { status: 500 }
    );
  }
}
