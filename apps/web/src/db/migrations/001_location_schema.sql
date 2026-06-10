-- ═══════════════════════════════════════════════════════════════
-- EcoVerse — Migration 001: Location Hierarchy Schema
-- 3-Level Strict Isolation: State → City → Area
-- Run against your PostgreSQL database:
--   psql $DATABASE_URL -f src/db/migrations/001_location_schema.sql
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Level 1: States ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS states (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,          -- "Telangana"
  code       VARCHAR(5)   NOT NULL UNIQUE,   -- "TG"
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_states_code ON states(code);

-- ── Level 2: Cities ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cities (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id   UUID         REFERENCES states(id) ON DELETE CASCADE NOT NULL,
  name       VARCHAR(100) NOT NULL,          -- "Hyderabad"
  slug       VARCHAR(100) NOT NULL UNIQUE,   -- "hyderabad"
  lat        DECIMAL(9,6),
  lng        DECIMAL(9,6),
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE(state_id, name)
);

CREATE INDEX IF NOT EXISTS idx_cities_state_id ON cities(state_id);

-- ── Level 3: Areas/Zones inside a city ──────────────────────────
CREATE TABLE IF NOT EXISTS areas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id    UUID         REFERENCES cities(id) ON DELETE CASCADE NOT NULL,
  state_id   UUID         REFERENCES states(id) NOT NULL,
  name       VARCHAR(150) NOT NULL,          -- "Banjara Hills"
  pincode    VARCHAR(10),                    -- "500034"
  lat        DECIMAL(9,6),                  -- area center lat
  lng        DECIMAL(9,6),                  -- area center lng
  radius_km  DECIMAL(4,1) DEFAULT 3.0,      -- coverage radius in km
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE(city_id, name)
);

CREATE INDEX IF NOT EXISTS idx_areas_city_id  ON areas(city_id);
CREATE INDEX IF NOT EXISTS idx_areas_state_id ON areas(state_id);
CREATE INDEX IF NOT EXISTS idx_areas_pincode  ON areas(pincode);

-- ── NGOs table (for escalation step 4) ──────────────────────────
CREATE TABLE IF NOT EXISTS ngos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(200) NOT NULL,
  city_id           UUID REFERENCES cities(id),
  state_id          UUID REFERENCES states(id),
  contact_email     VARCHAR(200),
  contact_phone     VARCHAR(20),
  emergency_contact VARCHAR(20),
  fcm_token         TEXT,
  lat               DECIMAL(9,6),
  lng               DECIMAL(9,6),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ngos_city_id ON ngos(city_id);

-- ── Rescue Cases ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rescue_cases (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id      TEXT,                            -- Firebase UID

  -- Location hierarchy — ALL THREE required (enforced at DB level)
  state_id   UUID REFERENCES states(id) NOT NULL,
  city_id    UUID REFERENCES cities(id) NOT NULL,
  area_id    UUID REFERENCES areas(id)  NOT NULL,

  -- Private exact GPS (never exposed in public API responses)
  exact_lat  DECIMAL(9,6),
  exact_lng  DECIMAL(9,6),

  -- Public display — area name only (shown on map & notifications)
  area_name    VARCHAR(150),   -- "Banjara Hills, Hyderabad"
  display_zone VARCHAR(200),   -- "Banjara Hills, Hyderabad, Telangana"

  -- Case details
  animal_type       VARCHAR(50),   -- dog, cat, bird, cow, pigeon
  condition_summary VARCHAR(200),
  emergency_level   VARCHAR(20)
    CHECK (emergency_level IN ('low','medium','high','critical'))
    NOT NULL DEFAULT 'medium',
  description       TEXT,
  status            VARCHAR(30) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','assigned','in_progress','escalated','resolved','closed')),

  -- Assignment
  assigned_volunteer_id TEXT,       -- Firebase UID
  assigned_ngo_id       UUID REFERENCES ngos(id),

  -- Timestamps
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  assigned_at   TIMESTAMPTZ,
  escalated_at  TIMESTAMPTZ,
  resolved_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rescue_cases_area_id         ON rescue_cases(area_id);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_city_id         ON rescue_cases(city_id);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_state_id        ON rescue_cases(state_id);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_status          ON rescue_cases(status);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_emergency_level ON rescue_cases(emergency_level);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_reporter        ON rescue_cases(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_rescue_cases_volunteer       ON rescue_cases(assigned_volunteer_id);

-- ── Notification Log ─────────────────────────────────────────────
-- Tracks every FCM alert sent and volunteer response
CREATE TABLE IF NOT EXISTS rescue_notifications (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rescue_case_id     UUID REFERENCES rescue_cases(id) ON DELETE CASCADE,
  volunteer_id       TEXT NOT NULL,            -- Firebase UID
  notification_level VARCHAR(20) NOT NULL
    CHECK (notification_level IN ('area','city','state')),
  sent_at            TIMESTAMPTZ DEFAULT NOW(),
  responded_at       TIMESTAMPTZ,
  response_type      VARCHAR(20)
    CHECK (response_type IN ('accepted','declined','no_response'))
);

CREATE INDEX IF NOT EXISTS idx_notif_rescue_case  ON rescue_notifications(rescue_case_id);
CREATE INDEX IF NOT EXISTS idx_notif_volunteer    ON rescue_notifications(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_notif_level        ON rescue_notifications(notification_level);
CREATE INDEX IF NOT EXISTS idx_notif_response     ON rescue_notifications(response_type);

-- ── Escalation Audit Log ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS escalation_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rescue_case_id UUID REFERENCES rescue_cases(id) ON DELETE CASCADE,
  from_level     VARCHAR(20) NOT NULL,   -- 'area', 'city', 'state'
  to_level       VARCHAR(20) NOT NULL,   -- 'city', 'state', 'ngo'
  reason         VARCHAR(100),           -- 'no_response', 'insufficient_volunteers'
  escalated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escalation_case ON escalation_log(rescue_case_id);

-- ── User Location Columns ─────────────────────────────────────────
-- Adds 3-level location + GPS to users table
-- NOTE: This creates a users table for location mapping.
-- Firebase Auth UIDs are stored as TEXT primary key.
CREATE TABLE IF NOT EXISTS user_locations (
  firebase_uid   TEXT PRIMARY KEY,
  state_id       UUID REFERENCES states(id),
  city_id        UUID REFERENCES cities(id),
  area_id        UUID REFERENCES areas(id),
  volunteer_lat  DECIMAL(9,6),    -- GPS rounded to area level only
  volunteer_lng  DECIMAL(9,6),
  fcm_token      TEXT,            -- Firebase Cloud Messaging token
  available_now  BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(30) DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified','pending','verified')),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_loc_area_id      ON user_locations(area_id);
CREATE INDEX IF NOT EXISTS idx_user_loc_city_id      ON user_locations(city_id);
CREATE INDEX IF NOT EXISTS idx_user_loc_state_id     ON user_locations(state_id);
CREATE INDEX IF NOT EXISTS idx_user_loc_available    ON user_locations(available_now);
CREATE INDEX IF NOT EXISTS idx_user_loc_verified     ON user_locations(verification_status);
-- Composite: fast volunteer lookup for alert engine
CREATE INDEX IF NOT EXISTS idx_user_loc_area_avail   ON user_locations(area_id, available_now, verification_status);
CREATE INDEX IF NOT EXISTS idx_user_loc_city_avail   ON user_locations(city_id, available_now, verification_status);
CREATE INDEX IF NOT EXISTS idx_user_loc_state_avail  ON user_locations(state_id, available_now, verification_status);
