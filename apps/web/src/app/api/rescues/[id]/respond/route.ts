// POST /api/rescues/[id]/respond
// Volunteer accepts or declines a rescue case assignment
import { NextRequest, NextResponse } from 'next/server';
import { recordVolunteerResponse } from '@/lib/alertEngine';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rescueCaseId } = await params;

  let body: { volunteer_id: string; response: 'accepted' | 'declined' };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.volunteer_id || !body.response) {
    return NextResponse.json(
      { error: 'volunteer_id and response (accepted|declined) are required' },
      { status: 400 }
    );
  }

  if (!['accepted', 'declined'].includes(body.response)) {
    return NextResponse.json(
      { error: 'response must be "accepted" or "declined"' },
      { status: 400 }
    );
  }

  // Verify rescue case exists
  const caseRows = await query<{ id: string; status: string; area_id: string; city_id: string }>(
    `SELECT id, status, area_id, city_id FROM rescue_cases WHERE id = $1`,
    [rescueCaseId]
  );

  if (caseRows.length === 0) {
    return NextResponse.json({ error: 'Rescue case not found' }, { status: 404 });
  }

  const rescueCase = caseRows[0];

  // Prevent duplicate accepts (case already assigned)
  if (rescueCase.status === 'in_progress' || rescueCase.status === 'resolved' || rescueCase.status === 'closed') {
    return NextResponse.json(
      { error: 'This rescue case is already assigned or closed', status: rescueCase.status },
      { status: 409 }
    );
  }

  // LOCATION ISOLATION CHECK: Volunteer must be from same area, city, or state
  // (they can only respond if they were alerted, meaning they were in the right scope)
  const volunteerRows = await query<{ area_id: string; city_id: string; state_id: string }>(
    `SELECT area_id, city_id, state_id FROM user_locations WHERE firebase_uid = $1`,
    [body.volunteer_id]
  );

  if (volunteerRows.length === 0) {
    return NextResponse.json(
      { error: 'Volunteer location profile not found. Please set your area in your profile first.' },
      { status: 403 }
    );
  }

  const vLoc = volunteerRows[0];

  // Get case location for isolation check
  const caseLocationRows = await query<{ state_id: string }>(
    `SELECT state_id FROM rescue_cases WHERE id = $1`,
    [rescueCaseId]
  );

  const caseLoc = caseLocationRows[0];

  // Volunteer must be in same state at minimum
  if (vLoc.state_id !== caseLoc.state_id) {
    return NextResponse.json(
      { error: 'Location isolation violation: you cannot respond to cases outside your state' },
      { status: 403 }
    );
  }

  // Record the response
  await recordVolunteerResponse(rescueCaseId, body.volunteer_id, body.response);

  return NextResponse.json({
    success: true,
    message: body.response === 'accepted'
      ? 'You have been assigned to this rescue case. The reporter\'s contact details are now visible.'
      : 'Response recorded. Thank you for letting us know.',
    response: body.response,
  });
}
