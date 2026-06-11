// ═══════════════════════════════════════════════════════════════
// EcoVerse — 4-Step Volunteer Alert & Escalation Engine
// ═══════════════════════════════════════════════════════════════
//
// STRICT RULE: Never mix locations. Each level only triggers if
// the previous level had zero accepted responses after timeout.
//
// Step 1: AREA   (0–5 min)   → volunteers in exact same area_id
// Step 2: CITY   (5–12 min)  → other areas in same city_id
// Step 3: STATE  (12–20 min) → other cities in same state_id
// Step 4: NGO    (20+ min)   → NGO emergency escalation
// ═══════════════════════════════════════════════════════════════
import { query } from './db';
import type { RescueCase } from '@/types/rescue';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

// ── Types ────────────────────────────────────────────────────────

interface VolunteerTarget {
  firebase_uid: string;
  fcm_token: string | null;
}

interface NGOTarget {
  id: string;
  name: string;
  contact_email: string | null;
  emergency_contact: string | null;
  fcm_token: string | null;
}

// ── FCM Push (stubbed — replace with firebase-admin when tokens exist) ──

async function sendFCMNotification(
  fcmToken: string,
  title: string,
  body: string,
  data: Record<string, string>
): Promise<boolean> {
  // PRODUCTION: Replace this stub with firebase-admin FCM push
  // import { getMessaging } from 'firebase-admin/messaging';
  // await getMessaging().send({ token: fcmToken, notification: { title, body }, data });
  
  console.log(`[FCM] → ${fcmToken.substring(0, 12)}... | ${title} | ${body}`);
  // Simulate 95% delivery success
  return Math.random() > 0.05;
}

// ── Notification Logger ──────────────────────────────────────────

async function logNotification(
  rescueCaseId: string,
  volunteerId: string,
  level: 'area' | 'city' | 'state'
): Promise<void> {
  await query(`
    INSERT INTO rescue_notifications 
      (rescue_case_id, volunteer_id, notification_level)
    VALUES ($1, $2, $3)
    ON CONFLICT DO NOTHING
  `, [rescueCaseId, volunteerId, level]);
}

async function logEscalation(
  rescueCaseId: string,
  fromLevel: string,
  toLevel: string,
  reason: string
): Promise<void> {
  await query(`
    INSERT INTO escalation_log (rescue_case_id, from_level, to_level, reason)
    VALUES ($1, $2, $3, $4)
  `, [rescueCaseId, fromLevel, toLevel, reason]);

  // Update rescue case status to 'escalated' if going to NGO
  if (toLevel === 'ngo') {
    await query(`
      UPDATE rescue_cases 
      SET status = 'escalated', escalated_at = NOW()
      WHERE id = $1
    `, [rescueCaseId]);

    try {
      await updateDoc(doc(db, 'rescues', rescueCaseId), {
        status: 'escalated'
      });
    } catch (fsErr) {
      console.warn('[AlertEngine] Failed to sync NGO escalation to Firestore:', fsErr);
    }
  }
}

// ── Check if any volunteer accepted ──────────────────────────────

async function hasAnyAcceptedResponse(
  rescueCaseId: string,
  level: 'area' | 'city' | 'state'
): Promise<boolean> {
  const rows = await query<{ count: string }>(`
    SELECT COUNT(*) AS count
    FROM rescue_notifications
    WHERE rescue_case_id = $1
      AND notification_level = $2
      AND response_type = 'accepted'
  `, [rescueCaseId, level]);

  return parseInt(rows[0]?.count ?? '0', 10) > 0;
}

// ── Check if rescue case is still active ─────────────────────────

async function isCaseStillOpen(rescueCaseId: string): Promise<boolean> {
  const rows = await query<{ status: string }>(`
    SELECT status FROM rescue_cases WHERE id = $1
  `, [rescueCaseId]);

  const status = rows[0]?.status;
  return status === 'open' || status === 'assigned';
}

// ── Promise-based timeout ─────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// ═══════════════════════════════════════════════════════════════
// STEP 1: Area-Level Alert
// Query volunteers WHERE area_id = rescue.area_id
// STRICT: Only exact same area — no radius expansion
// ═══════════════════════════════════════════════════════════════

async function alertAreaVolunteers(rescueCase: RescueCase): Promise<number> {
  const volunteers = await query<VolunteerTarget>(`
    SELECT ul.firebase_uid, ul.fcm_token
    FROM user_locations ul
    WHERE ul.area_id = $1
      AND ul.available_now = true
      AND ul.verification_status = 'verified'
  `, [rescueCase.area_id]);

  if (volunteers.length === 0) {
    console.log(`[AlertEngine] [AREA] No verified volunteers in area ${rescueCase.area_id}`);
    return 0;
  }

  const title = `🚨 Animal Emergency in ${rescueCase.area_name}`;
  const body = `${rescueCase.animal_type?.toUpperCase()} — ${rescueCase.condition_summary ?? rescueCase.emergency_level} • Tap to respond`;

  let sent = 0;
  for (const v of volunteers) {
    await logNotification(rescueCase.id, v.firebase_uid, 'area');
    
    if (v.fcm_token) {
      const ok = await sendFCMNotification(v.fcm_token, title, body, {
        type: 'rescue_alert',
        level: 'area',
        rescue_case_id: rescueCase.id,
        display_zone: rescueCase.display_zone,
        emergency_level: rescueCase.emergency_level,
      });
      if (ok) sent++;
    }
  }

  console.log(`[AlertEngine] [AREA] Alerted ${sent}/${volunteers.length} volunteers in ${rescueCase.display_zone}`);
  return volunteers.length;
}

// ═══════════════════════════════════════════════════════════════
// STEP 2: City-Level Alert
// Query volunteers WHERE city_id = rescue.city_id
//   AND area_id != rescue.area_id  ← exclude area already notified
// ═══════════════════════════════════════════════════════════════

async function alertCityVolunteers(rescueCase: RescueCase): Promise<number> {
  const volunteers = await query<VolunteerTarget>(`
    SELECT ul.firebase_uid, ul.fcm_token
    FROM user_locations ul
    WHERE ul.city_id = $1
      AND ul.area_id != $2
      AND ul.available_now = true
      AND ul.verification_status = 'verified'
  `, [rescueCase.city_id, rescueCase.area_id]);

  if (volunteers.length === 0) {
    console.log(`[AlertEngine] [CITY] No verified volunteers in other areas of city ${rescueCase.city_id}`);
    return 0;
  }

  const title = `🚨 Animal Emergency Nearby — ${rescueCase.display_zone}`;
  const body = `${rescueCase.animal_type?.toUpperCase()} needs rescue. Area volunteers not responding. Can you help?`;

  let sent = 0;
  for (const v of volunteers) {
    await logNotification(rescueCase.id, v.firebase_uid, 'city');

    if (v.fcm_token) {
      const ok = await sendFCMNotification(v.fcm_token, title, body, {
        type: 'rescue_alert',
        level: 'city',
        rescue_case_id: rescueCase.id,
        display_zone: rescueCase.display_zone,
        emergency_level: rescueCase.emergency_level,
      });
      if (ok) sent++;
    }
  }

  console.log(`[AlertEngine] [CITY] Alerted ${sent}/${volunteers.length} city-level volunteers`);
  return volunteers.length;
}

// ═══════════════════════════════════════════════════════════════
// STEP 3: State-Level Alert
// Query volunteers WHERE state_id = rescue.state_id
//   AND city_id != rescue.city_id  ← exclude city already notified
// ═══════════════════════════════════════════════════════════════

async function alertStateVolunteers(rescueCase: RescueCase): Promise<number> {
  const volunteers = await query<VolunteerTarget>(`
    SELECT ul.firebase_uid, ul.fcm_token
    FROM user_locations ul
    WHERE ul.state_id = $1
      AND ul.city_id != $2
      AND ul.available_now = true
  `, [rescueCase.state_id, rescueCase.city_id]);

  if (volunteers.length === 0) {
    console.log(`[AlertEngine] [STATE] No volunteers in other cities of state ${rescueCase.state_id}`);
    return 0;
  }

  const title = `⚠️ Animal Emergency — State Alert — ${rescueCase.display_zone}`;
  const body = `Animal in critical need in ${rescueCase.display_zone}. No local volunteers responded. Please coordinate.`;

  let sent = 0;
  for (const v of volunteers) {
    await logNotification(rescueCase.id, v.firebase_uid, 'state');

    if (v.fcm_token) {
      const ok = await sendFCMNotification(v.fcm_token, title, body, {
        type: 'rescue_alert',
        level: 'state',
        rescue_case_id: rescueCase.id,
        display_zone: rescueCase.display_zone,
        emergency_level: rescueCase.emergency_level,
      });
      if (ok) sent++;
    }
  }

  console.log(`[AlertEngine] [STATE] Alerted ${sent}/${volunteers.length} state-level volunteers`);
  return volunteers.length;
}

// ═══════════════════════════════════════════════════════════════
// STEP 4: NGO Escalation
// Triggered if: emergency_level = 'critical' OR no volunteer in 20 min
// Sends email + FCM to NGO emergency contacts in same city
// ═══════════════════════════════════════════════════════════════

async function escalateToNGO(rescueCase: RescueCase): Promise<void> {
  // Get closest NGOs in same city (up to 3)
  const ngos = await query<NGOTarget>(`
    SELECT id, name, contact_email, emergency_contact, fcm_token
    FROM ngos
    WHERE city_id = $1
    ORDER BY 
      CASE WHEN fcm_token IS NOT NULL THEN 0 ELSE 1 END,
      created_at ASC
    LIMIT 3
  `, [rescueCase.city_id]);

  if (ngos.length === 0) {
    console.log(`[AlertEngine] [NGO] No NGOs registered for city ${rescueCase.city_id}`);
    return;
  }

  await logEscalation(
    rescueCase.id,
    'state',
    'ngo',
    rescueCase.emergency_level === 'critical' ? 'critical_case' : 'no_response'
  );

  for (const ngo of ngos) {
    // FCM push to NGO app
    if (ngo.fcm_token) {
      await sendFCMNotification(ngo.fcm_token,
        `🆘 CRITICAL NGO ESCALATION — ${rescueCase.display_zone}`,
        `${rescueCase.animal_type?.toUpperCase()} — ${rescueCase.emergency_level?.toUpperCase()} — No volunteer responded in 20 minutes`,
        {
          type: 'ngo_escalation',
          rescue_case_id: rescueCase.id,
          display_zone: rescueCase.display_zone,
          emergency_level: rescueCase.emergency_level,
        }
      );
    }

    // EMAIL (stub — replace with SendGrid/Nodemailer/Resend)
    if (ngo.contact_email) {
      console.log(`[AlertEngine] [NGO] EMAIL → ${ngo.contact_email}: Case ${rescueCase.id} in ${rescueCase.display_zone}`);
      // TODO: await sendEmail(ngo.contact_email, ngoEmailTemplate(rescueCase, ngo));
    }

    console.log(`[AlertEngine] [NGO] Escalated to: ${ngo.name}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN ENTRY POINT: alertVolunteersForCase
// Called async from POST /api/rescues — does not block response
// ═══════════════════════════════════════════════════════════════

export async function alertVolunteersForCase(rescueCase: RescueCase): Promise<void> {
  const caseId = rescueCase.id;
  console.log(`\n[AlertEngine] Starting alert cascade for case ${caseId} in ${rescueCase.display_zone}`);

  try {
    // ── STEP 1: Area level (0–5 minutes) ───────────────────────
    const areaCount = await alertAreaVolunteers(rescueCase);

    if (areaCount === 0) {
      // No volunteers in this area at all — skip wait, go to city immediately
      console.log(`[AlertEngine] 0 area volunteers — escalating to city immediately`);
      await logEscalation(caseId, 'area', 'city', 'insufficient_volunteers');
    } else {
      // Wait 5 minutes for area volunteers to respond
      console.log(`[AlertEngine] Waiting 5 min for area response (${areaCount} alerted)...`);
      await sleep(5 * 60 * 1000);
    }

    // Check if still needs help
    if (!await isCaseStillOpen(caseId)) {
      console.log(`[AlertEngine] Case ${caseId} resolved at area level ✅`);
      return;
    }

    if (await hasAnyAcceptedResponse(caseId, 'area')) {
      console.log(`[AlertEngine] Area volunteer accepted — no escalation needed ✅`);
      return;
    }

    // ── STEP 2: City level (5–12 minutes) ──────────────────────
    console.log(`[AlertEngine] Area had 0 accepts — escalating to CITY level`);
    await logEscalation(caseId, 'area', 'city', 'no_response');
    const cityCount = await alertCityVolunteers(rescueCase);

    if (cityCount > 0) {
      console.log(`[AlertEngine] Waiting 7 min for city response (${cityCount} alerted)...`);
      await sleep(7 * 60 * 1000);
    }

    if (!await isCaseStillOpen(caseId)) {
      console.log(`[AlertEngine] Case ${caseId} resolved at city level ✅`);
      return;
    }

    if (await hasAnyAcceptedResponse(caseId, 'city')) {
      console.log(`[AlertEngine] City volunteer accepted — no state escalation needed ✅`);
      return;
    }

    // ── STEP 3: State level (12–20 minutes) ────────────────────
    console.log(`[AlertEngine] City had 0 accepts — escalating to STATE level`);
    await logEscalation(caseId, 'city', 'state', 'no_response');
    const stateCount = await alertStateVolunteers(rescueCase);

    if (stateCount > 0) {
      console.log(`[AlertEngine] Waiting 8 min for state response (${stateCount} alerted)...`);
      await sleep(8 * 60 * 1000);
    }

    if (!await isCaseStillOpen(caseId)) {
      console.log(`[AlertEngine] Case ${caseId} resolved at state level ✅`);
      return;
    }

    // ── STEP 4: NGO Escalation (20+ minutes OR critical) ────────
    const shouldEscalateToNGO =
      rescueCase.emergency_level === 'critical' ||
      !await hasAnyAcceptedResponse(caseId, 'state');

    if (shouldEscalateToNGO) {
      console.log(`[AlertEngine] Escalating to NGO (${rescueCase.emergency_level === 'critical' ? 'CRITICAL case' : 'no state response'})`);
      await escalateToNGO(rescueCase);
    }

  } catch (err) {
    console.error(`[AlertEngine] Error in alert cascade for case ${caseId}:`, err);
  }
}

// ── Volunteer response handler (called from API) ──────────────────
export async function recordVolunteerResponse(
  rescueCaseId: string,
  volunteerId: string,
  responseType: 'accepted' | 'declined'
): Promise<void> {
  await query(`
    UPDATE rescue_notifications
    SET response_type = $1, responded_at = NOW()
    WHERE rescue_case_id = $2
      AND volunteer_id = $3
      AND response_type IS NULL
  `, [responseType, rescueCaseId, volunteerId]);

  // If accepted, assign volunteer and update case status
  if (responseType === 'accepted') {
    await query(`
      UPDATE rescue_cases
      SET assigned_volunteer_id = $1,
          status = 'assigned',
          assigned_at = NOW()
      WHERE id = $2
        AND status IN ('open', 'escalated')
    `, [volunteerId, rescueCaseId]);

    try {
      await updateDoc(doc(db, 'rescues', rescueCaseId), {
        status: 'dispatched',
        assignedVolunteerId: volunteerId
      });
    } catch (fsErr) {
      console.warn('[AlertEngine] Failed to sync volunteer assignment to Firestore:', fsErr);
    }
  }
}
