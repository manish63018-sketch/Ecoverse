// PATCH /api/rescues/[id]
// Update a rescue case (e.g. mark it as resolved or closed)
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

function mapPostgresStatusToFirestore(status: string): string {
  switch (status) {
    case 'open':
      return 'reported';
    case 'in_progress':
      return 'in_progress';
    case 'resolved':
    case 'closed':
      return 'resolved';
    default:
      return 'reported';
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: { status: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.status) {
    return NextResponse.json({ error: 'status is required' }, { status: 400 });
  }

  if (!['resolved', 'closed', 'in_progress', 'open'].includes(body.status)) {
    return NextResponse.json(
      { error: 'Invalid status. Must be one of: open, in_progress, resolved, closed' },
      { status: 400 }
    );
  }

  try {
    const rows = await query(`
      UPDATE rescue_cases
      SET 
        status = $1, 
        resolved_at = CASE WHEN $1 = 'resolved' THEN NOW() ELSE resolved_at END
      WHERE id = $2
      RETURNING id, status
    `, [body.status, id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Rescue case not found' }, { status: 404 });
    }

    // Sync to Firestore rescues collection
    try {
      const firestoreStatus = mapPostgresStatusToFirestore(body.status);
      await updateDoc(doc(db, 'rescues', id), {
        status: firestoreStatus
      });
    } catch (fsErr) {
      console.warn('[API] Failed to update rescue in Firestore:', fsErr);
    }

    return NextResponse.json({ success: true, case: rows[0] });
  } catch (err) {
    console.error('[API] /api/rescues/[id] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update rescue case' }, { status: 500 });
  }
}
