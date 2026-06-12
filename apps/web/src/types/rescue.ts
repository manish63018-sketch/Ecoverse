// ─────────────────────────────────────────────────────────────
// EcoVerse — Rescue Case Types (PostgreSQL-backed)
// ─────────────────────────────────────────────────────────────

export type EmergencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type RescueStatus = 'open' | 'assigned' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
export type NotificationLevel = 'area' | 'city' | 'state';
export type ResponseType = 'accepted' | 'declined' | 'no_response';

export interface RescueCase {
  id: string;
  reporter_user_id?: string;
  reporter_name?: string;

  // Location — ALL THREE required
  state_id: string;
  city_id: string;
  area_id: string;

  // Public display location
  area_name: string;       // "Banjara Hills, Hyderabad"
  display_zone: string;    // "Banjara Hills, Hyderabad, Telangana"

  // Case details
  animal_type: string;             // dog, cat, bird, cow, pigeon
  condition_summary?: string;
  emergency_level: EmergencyLevel;
  description?: string;
  status: RescueStatus;

  // Assignment
  assigned_volunteer_id?: string;
  assigned_ngo_id?: string;

  // Timestamps
  created_at: string;
  assigned_at?: string;
  escalated_at?: string;
  resolved_at?: string;
}

export interface RescueNotification {
  id: string;
  rescue_case_id: string;
  volunteer_id: string;
  notification_level: NotificationLevel;
  sent_at: string;
  responded_at?: string;
  response_type?: ResponseType;
}

export interface EscalationLog {
  id: string;
  rescue_case_id: string;
  from_level: NotificationLevel;
  to_level: NotificationLevel | 'ngo';
  reason: string;
  escalated_at: string;
}

// For creating a new rescue case (API request body)
export interface CreateRescueBody {
  reporter_user_id?: string;
  state_id: string;
  city_id: string;
  area_id: string;
  exact_lat?: number;
  exact_lng?: number;
  animal_type: string;
  condition_summary?: string;
  emergency_level: EmergencyLevel;
  description?: string;
}
