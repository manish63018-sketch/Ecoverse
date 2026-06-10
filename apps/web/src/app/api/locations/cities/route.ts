// GET /api/locations/cities?state_id=<uuid>
// Returns cities for a given state
import { NextRequest, NextResponse } from 'next/server';
import { getCitiesByState } from '@/lib/location';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const stateId = req.nextUrl.searchParams.get('state_id');

  if (!stateId) {
    return NextResponse.json(
      { error: 'state_id query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const cities = await getCitiesByState(stateId);
    return NextResponse.json({ cities });
  } catch (err) {
    console.error('[API] /api/locations/cities error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}
