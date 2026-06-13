-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ECOVERSE INDIA — SUPABASE SCHEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. PROFILES
-- ━━━━━━━━━━━━
CREATE TABLE profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           text NOT NULL,
  username            text UNIQUE NOT NULL,
  email               text UNIQUE NOT NULL,
  phone               text,
  bio                 text,
  avatar_url          text,
  
  -- Location
  state_name          text NOT NULL,
  city_name           text NOT NULL,
  area_name           text,
  lat                 numeric,
  lng                 numeric,
  
  -- Roles (multi-role support)
  roles               text[] DEFAULT ARRAY['volunteer'],
  primary_role        text DEFAULT 'volunteer',
  available_now       boolean DEFAULT false,
  
  -- Verification
  is_admin            boolean DEFAULT false,
  is_moderator        boolean DEFAULT false,
  is_verified         boolean DEFAULT false,
  verification_status text DEFAULT 'pending',
  -- pending | verified | rejected
  
  -- FCM
  fcm_token           text,
  
  -- Stats
  rescue_count        int DEFAULT 0,
  badge_count         int DEFAULT 0,
  
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- 2. RESCUE CASES
-- ━━━━━━━━━━━━━━━
CREATE TABLE rescue_cases (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text NOT NULL,
  description         text,
  animal_type         text NOT NULL,
  -- dog | cat | cow | bird | wild | other
  
  severity            text DEFAULT 'medium',
  -- low | medium | high | critical
  
  status              text DEFAULT 'open',
  -- open | assigned | in_progress | resolved | cancelled
  
  -- Location (area only, not exact)
  state_name          text NOT NULL,
  city_name           text NOT NULL,
  area_name           text,
  landmark            text,
  lat                 numeric, -- visible only to assigned volunteer
  lng                 numeric, -- visible only to assigned volunteer
  
  -- People
  reporter_id         uuid REFERENCES profiles(id),
  assigned_volunteer_id uuid REFERENCES profiles(id),
  ngo_id              uuid REFERENCES ngos(id),
  
  -- Media
  image_urls          text[],
  
  -- Timeline
  reported_at         timestamptz DEFAULT now(),
  assigned_at         timestamptz,
  resolved_at         timestamptz,
  expires_at          timestamptz DEFAULT now() + interval '7 days',
  
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- 3. RESCUE UPDATES (timeline)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE rescue_updates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     uuid REFERENCES rescue_cases(id) ON DELETE CASCADE,
  author_id   uuid REFERENCES profiles(id),
  status      text,
  note        text NOT NULL,
  image_urls  text[],
  created_at  timestamptz DEFAULT now()
);

-- 4. COMMUNITY POSTS
-- ━━━━━━━━━━━━━━━━━━
CREATE TABLE community_posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content     text NOT NULL,
  post_type   text DEFAULT 'general',
  -- general | rescue | adoption | vegan | awareness | sos
  
  image_urls  text[],
  tags        text[],
  city_name   text,
  state_name  text,
  is_pinned   boolean DEFAULT false,
  is_hidden   boolean DEFAULT false,
  
  like_count    int DEFAULT 0,
  comment_count int DEFAULT 0,
  share_count   int DEFAULT 0,
  
  expires_at  timestamptz DEFAULT now() + interval '30 days',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- 5. POST COMMENTS
-- ━━━━━━━━━━━━━━━━
CREATE TABLE post_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content     text NOT NULL,
  is_hidden   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- 6. POST LIKES
-- ━━━━━━━━━━━━━
CREATE TABLE post_likes (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id   uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(post_id, user_id)
);

-- 7. ADOPTIONS
-- ━━━━━━━━━━━━
CREATE TABLE adoptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by       uuid REFERENCES profiles(id),
  animal_name     text,
  animal_type     text NOT NULL,
  breed           text,
  age_estimate    text,
  gender          text,
  -- male | female | unknown
  
  health_status   text,
  vaccinated      boolean DEFAULT false,
  neutered        boolean DEFAULT false,
  
  description     text,
  image_urls      text[],
  
  city_name       text NOT NULL,
  state_name      text NOT NULL,
  area_name       text,
  
  status          text DEFAULT 'available',
  -- available | pending | adopted | closed
  
  adopter_id      uuid REFERENCES profiles(id),
  adopted_at      timestamptz,
  
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 8. ADOPTION REQUESTS
-- ━━━━━━━━━━━━━━━━━━━━
CREATE TABLE adoption_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adoption_id   uuid REFERENCES adoptions(id) ON DELETE CASCADE,
  requester_id  uuid REFERENCES profiles(id),
  message       text,
  status        text DEFAULT 'pending',
  -- pending | approved | rejected
  created_at    timestamptz DEFAULT now()
);

-- 9. NGOS
-- ━━━━━━━
CREATE TABLE ngos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          uuid REFERENCES profiles(id),
  name              text NOT NULL,
  description       text,
  logo_url          text,
  cover_url         text,
  
  -- Contact
  email             text,
  phone             text,
  website           text,
  whatsapp          text,
  
  -- Location
  state_name        text NOT NULL,
  city_name         text NOT NULL,
  area_name         text,
  address           text,
  
  -- Details
  causes            text[],
  -- rescue | adoption | vegan | medic | transport | education
  
  is_verified       boolean DEFAULT false,
  is_active         boolean DEFAULT true,
  member_count      int DEFAULT 0,
  
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- 10. NGO MEMBERS
-- ━━━━━━━━━━━━━━━
CREATE TABLE ngo_members (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id    uuid REFERENCES ngos(id) ON DELETE CASCADE,
  user_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role      text DEFAULT 'member',
  -- owner | admin | member | volunteer
  joined_at timestamptz DEFAULT now(),
  UNIQUE(ngo_id, user_id)
);

-- 11. NOTIFICATIONS
-- ━━━━━━━━━━━━━━━━━
CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL,
  -- welcome | sos | rescue_update | adoption | 
  -- comment | like | tag | ngo | badge | system
  
  title       text NOT NULL,
  body        text,
  link_to     text,
  image_url   text,
  is_read     boolean DEFAULT false,
  
  created_at  timestamptz DEFAULT now()
);

-- 12. USER BADGES
-- ━━━━━━━━━━━━━━━
CREATE TABLE user_badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type  text NOT NULL,
  -- first_rescue | 10_rescues | vegan_week | vegan_month |
  -- vegan_year | first_adoption | top_volunteer | hero
  
  awarded_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- 13. MAP PRESENCE
-- ━━━━━━━━━━━━━━━━
CREATE TABLE map_presence (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  city_name       text,
  state_name      text,
  presence_type   text DEFAULT 'volunteer',
  -- rescuer | vegan | volunteer | feeder | ngo | adopter
  visible         boolean DEFAULT true,
  last_seen_at    timestamptz DEFAULT now()
);

-- 14. CITY STATS
-- ━━━━━━━━━━━━━━
CREATE TABLE city_stats (
  city_name       text PRIMARY KEY,
  state_name      text,
  total_users     int DEFAULT 0,
  active_users    int DEFAULT 0,
  rescuers        int DEFAULT 0,
  volunteers      int DEFAULT 0,
  vegans          int DEFAULT 0,
  ngos            int DEFAULT 0,
  open_cases      int DEFAULT 0,
  updated_at      timestamptz DEFAULT now()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INDEXES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE INDEX idx_profiles_city ON profiles(city_name);
CREATE INDEX idx_profiles_roles ON profiles USING gin(roles);
CREATE INDEX idx_rescue_status ON rescue_cases(status);
CREATE INDEX idx_rescue_city ON rescue_cases(city_name);
CREATE INDEX idx_rescue_severity ON rescue_cases(severity);
CREATE INDEX idx_posts_city ON community_posts(city_name);
CREATE INDEX idx_posts_type ON community_posts(post_type);
CREATE INDEX idx_posts_created ON community_posts(created_at DESC);
CREATE INDEX idx_notif_user ON notifications(user_id, is_read);
CREATE INDEX idx_adoptions_city ON adoptions(city_name, status);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGERS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Auto create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'EcoVerse User'),
    COALESCE(NEW.raw_user_meta_data->>'username',
      'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.notifications
    (user_id, type, title, body, link_to)
  VALUES (
    NEW.id, 'welcome',
    '🌱 Welcome to EcoVerse!',
    'You are now part of India''s animal welfare community.',
    '/dashboard'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto update city stats
CREATE OR REPLACE FUNCTION update_city_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO city_stats (city_name, state_name, total_users)
  VALUES (NEW.city_name, NEW.state_name, 1)
  ON CONFLICT (city_name)
  DO UPDATE SET
    total_users = city_stats.total_users + 1,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_city_stats();

-- Auto updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER rescue_updated BEFORE UPDATE ON rescue_cases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER posts_updated BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- RLS POLICIES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngo_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_presence ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_insert"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_own_update"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Rescue Cases
CREATE POLICY "rescue_public_read"
  ON rescue_cases FOR SELECT USING (true);
CREATE POLICY "rescue_auth_insert"
  ON rescue_cases FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "rescue_own_update"
  ON rescue_cases FOR UPDATE USING (
    auth.uid() = reporter_id OR
    auth.uid() = assigned_volunteer_id
  );

-- Community Posts
CREATE POLICY "posts_public_read"
  ON community_posts FOR SELECT USING (is_hidden = false);
CREATE POLICY "posts_auth_insert"
  ON community_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "posts_own_update"
  ON community_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "posts_own_delete"
  ON community_posts FOR DELETE USING (auth.uid() = author_id);

-- Notifications
CREATE POLICY "notif_own"
  ON notifications FOR ALL USING (auth.uid() = user_id);

-- Adoptions
CREATE POLICY "adoptions_public_read"
  ON adoptions FOR SELECT USING (true);
CREATE POLICY "adoptions_auth_insert"
  ON adoptions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "adoptions_own_update"
  ON adoptions FOR UPDATE USING (auth.uid() = posted_by);

-- NGOs
CREATE POLICY "ngos_public_read"
  ON ngos FOR SELECT USING (true);
CREATE POLICY "ngos_auth_insert"
  ON ngos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ngos_owner_update"
  ON ngos FOR UPDATE USING (auth.uid() = owner_id);

-- Map Presence
CREATE POLICY "map_public_read"
  ON map_presence FOR SELECT USING (visible = true);
CREATE POLICY "map_own_write"
  ON map_presence FOR ALL USING (auth.uid() = user_id);

-- Badges
CREATE POLICY "badges_public_read"
  ON user_badges FOR SELECT USING (true);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- REALTIME ENABLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER PUBLICATION supabase_realtime
  ADD TABLE rescue_cases,
             notifications,
             community_posts,
             profiles,
             map_presence,
             city_stats;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- CLEANUP (optional cron)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Requires pg_cron enabled in Supabase
SELECT cron.schedule(
  'cleanup-expired-posts',
  '0 2 * * *',
  $$DELETE FROM community_posts
    WHERE expires_at < NOW() AND is_pinned = false;$$
);

SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 3 * * *',
  $$DELETE FROM notifications
    WHERE created_at < NOW() - interval '90 days'
    AND is_read = true;$$
);
