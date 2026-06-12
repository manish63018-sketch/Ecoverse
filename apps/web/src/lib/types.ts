/**
 * "Supabase is the only source of truth for authentication and app data."
 */

export interface Profile {
  id: string
  full_name: string | null
  username: string | null
  email: string | null
  avatar_url: string | null
  bio: string | null
  phone: string | null
  state_name: string | null
  city_name: string | null
  area_name: string | null
  pincode: string | null
  roles: string[]
  primary_role: string
  is_admin: boolean
  is_moderator: boolean
  account_status: 'active' | 'suspended'
  verification_status: 'unverified' | 'pending' | 'verified'
  available_now: boolean
  provider_source: 'supabase' | 'google'
  notification_provider: 'firebase'
  rescue_count: number
  adopt_count: number
  volunteer_hours: number
  vegan_since: string | null
  vegan_pledge_taken: boolean
  vegan_streak_days: number
  instagram_handle: string | null
  rescue_radius_km: number
  skills: string[]
  created_at: string
  updated_at: string
  last_seen_at: string
}

export interface RescueCase {
  id: string
  reporter_id: string | null
  reporter_name: string | null
  state_name: string
  city_name: string
  area_name: string
  display_zone: string | null
  area_lat: number | null
  area_lng: number | null
  animal_type: string
  animal_description: string | null
  condition_summary: string | null
  emergency_level: 'low' | 'medium' | 'high' | 'critical'
  description: string | null
  status: 'open' | 'assigned' | 'in_progress' |
          'escalated' | 'resolved' | 'closed'
  photo_urls: string[]
  assigned_volunteer_id: string | null
  assigned_ngo_id: string | null
  escalation_level: string
  alert_sent_count: number
  resolution_notes: string | null
  resolved_by: string | null
  created_at: string
  assigned_at: string | null
  resolved_at: string | null
  updated_at: string
}

export interface Adoption {
  id: string
  poster_id: string | null
  name: string
  animal_type: string
  breed: string | null
  age_years: number | null
  age_months: number | null
  gender: string | null
  weight_kg: number | null
  color: string | null
  vaccinated: boolean
  neutered: boolean
  dewormed: boolean
  microchipped: boolean
  medical_notes: string | null
  city_name: string | null
  state_name: string | null
  area_name: string | null
  description: string | null
  personality_tags: string[]
  requirements: string | null
  photo_urls: string[]
  status: string
  adopted_by: string | null
  created_at: string
  updated_at: string
}

export interface CommunityPost {
  id: string
  author_id: string | null
  author_name: string | null
  author_avatar: string | null
  category: string
  content: string
  image_url: string | null
  tags: string[]
  city_name: string | null
  like_count: number
  comment_count: number
  share_count: number
  is_pinned: boolean
  is_reported: boolean
  is_flagged: boolean
  ttl_days: number
  expires_at: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  link_to: string | null
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface NGO {
  id: string
  name: string
  slug: string | null
  city_name: string | null
  state_name: string | null
  focus_areas: string[]
  description: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  is_verified: boolean
  logo_url: string | null
  created_at: string
}

export interface Badge {
  id: string
  user_id: string
  badge_type: string
  badge_name: string | null
  badge_emoji: string | null
  earned_at: string
}
