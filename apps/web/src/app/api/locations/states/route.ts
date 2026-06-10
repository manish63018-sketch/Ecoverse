// GET /api/locations/states
// Returns all Indian states ordered alphabetically
import { NextResponse } from 'next/server';
import { getStates } from '@/lib/location';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const states = await getStates();
    return NextResponse.json({ states });
  } catch (err) {
    console.error('[API] /api/locations/states error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch states' },
      { status: 500 }
    );
  }
}
