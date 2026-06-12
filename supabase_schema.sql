-- ─── ENUMS ───────────────────────────────────────
CREATE TYPE user_role AS ENUM (
  'rescuer', 'adopter', 'vegan_advocate',
  'volunteer', 'ngo_staff', 'street_feeder', 'admin'
);

CREATE TYPE emergency_level AS ENUM (
  'low', 'medium', 'high', 'critical'
);

CREATE TYPE rescue_status AS ENUM (
  'open', 'assigned', 'in_progress',
  'escalated', 'resolved', 'closed'
);

CREATE TYPE animal_type AS ENUM (
  'dog', 'cat', 'cow', 'bird',
  'horse', 'monkey', 'other'
);

-- ─── PROFILES (extends auth.users) ──────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100),
  username VARCHAR(50) UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  phone VARCHAR(15),
  
  -- Location (3-level)
  state_name VARCHAR(100),
  city_name VARCHAR(100),
  area_name VARCHAR(150),
  pincode VARCHAR(10),
  
  -- Roles (array — user can have multiple)
  roles user_role[] DEFAULT '{}',
  primary_role user_role DEFAULT 'volunteer',
  
  -- Status
  available_now BOOLEAN DEFAULT false,
  verification_status VARCHAR(20) DEFAULT 'unverified',
  
  -- Stats (denormalized for speed)
  rescue_count INT DEFAULT 0,
  adopt_count INT DEFAULT 0,
  volunteer_hours INT DEFAULT 0,
  
  -- FCM token for push notifications
  fcm_token TEXT,
  
  -- Vegan journey
  vegan_since DATE,
  vegan_pledge_taken BOOLEAN DEFAULT false,
  vegan_streak_days INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RESCUE CASES ────────────────────────────────
CREATE TABLE rescue_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reporter
  reporter_id UUID REFERENCES profiles(id),
  reporter_name VARCHAR(100),
  
  -- Location (stored as text for simplicity)
  state_name VARCHAR(100) NOT NULL,
  city_name VARCHAR(100) NOT NULL,
  area_name VARCHAR(150) NOT NULL,
  display_zone VARCHAR(250),
  -- GPS (area-level only, not exact)
  area_lat DECIMAL(9,6),
  area_lng DECIMAL(9,6),
  
  -- Animal
  animal_type animal_type NOT NULL DEFAULT 'dog',
  animal_description VARCHAR(300),
  condition_summary VARCHAR(200),
  
  -- Case
  emergency_level emergency_level DEFAULT 'medium',
  description TEXT,
  status rescue_status DEFAULT 'open',
  
  -- Media
  photo_urls TEXT[] DEFAULT '{}',
  
  -- Assignment
  assigned_volunteer_id UUID REFERENCES profiles(id),
  assigned_ngo_id UUID,
  
  -- Escalation
  escalation_level VARCHAR(20) DEFAULT 'area',
  alert_sent_count INT DEFAULT 0,
  
  -- Resolution
  resolution_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ADOPTION LISTINGS ───────────────────────────
CREATE TABLE adoptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  poster_id UUID REFERENCES profiles(id),
  
  -- Animal
  name VARCHAR(50) NOT NULL,
  animal_type animal_type NOT NULL,
  breed VARCHAR(100),
  age_years INT,
  age_months INT,
  gender VARCHAR(10),
  weight_kg DECIMAL(4,1),
  color VARCHAR(50),
  
  -- Health
  vaccinated BOOLEAN DEFAULT false,
  neutered BOOLEAN DEFAULT false,
  dewormed BOOLEAN DEFAULT false,
  microchipped BOOLEAN DEFAULT false,
  medical_notes TEXT,
  
  -- Location
  city_name VARCHAR(100),
  state_name VARCHAR(100),
  area_name VARCHAR(150),
  
  -- Listing
  description TEXT,
  personality_tags TEXT[] DEFAULT '{}',
  requirements TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  
  -- Status
  status VARCHAR(20) DEFAULT 'available',
  adopted_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── COMMUNITY POSTS ─────────────────────────────
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  author_id UUID REFERENCES profiles(id),
  author_name VARCHAR(100),
  author_avatar VARCHAR(10),
  
  category VARCHAR(30) DEFAULT 'general',
  
  content TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Location context
  city_name VARCHAR(100),
  
  -- Engagement
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  
  -- Moderation
  is_pinned BOOLEAN DEFAULT false,
  is_reported BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTIFICATIONS ───────────────────────────────
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  
  -- Link
  link_to VARCHAR(200),
  
  -- Data payload (JSON)
  data JSONB DEFAULT '{}',
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NGOs ─────────────────────────────────────────
CREATE TABLE ngos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE,
  registration_number VARCHAR(100),
  
  city_name VARCHAR(100),
  state_name VARCHAR(100),
  
  focus_areas TEXT[] DEFAULT '{}',
  description TEXT,
  
  contact_name VARCHAR(100),
  contact_email VARCHAR(200),
  contact_phone VARCHAR(15),
  website VARCHAR(200),
  
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  logo_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BADGES ──────────────────────────────────────
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100),
  badge_emoji VARCHAR(10),
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "Public profiles viewable" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Rescue cases: public read
CREATE POLICY "Public rescue cases" ON rescue_cases
  FOR SELECT USING (true);
CREATE POLICY "Authenticated create cases" ON rescue_cases
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Own case or volunteer update" ON rescue_cases
  FOR UPDATE USING (
    auth.uid() = reporter_id OR
    auth.uid() = assigned_volunteer_id
  );

-- Adoptions: public read
CREATE POLICY "Public adoptions" ON adoptions
  FOR SELECT USING (true);
CREATE POLICY "Authenticated create adoption" ON adoptions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Community posts: public read
CREATE POLICY "Public community posts" ON community_posts
  FOR SELECT USING (true);
CREATE POLICY "Authenticated post" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Notifications: private
CREATE POLICY "Own notifications only" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- NGOs: public read
CREATE POLICY "Public NGOs" ON ngos FOR SELECT USING (true);

-- Badges: public read
CREATE POLICY "Public badges" ON user_badges
  FOR SELECT USING (true);

-- ─── TRIGGER: auto-create profile on signup ──────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'EcoVerse User'),
    COALESCE(NEW.raw_user_meta_data->>'username',
             'user_' || substr(NEW.id::text, 1, 8))
  );
  
  -- Send welcome notification
  INSERT INTO public.notifications (user_id, type, title, body, link_to)
  VALUES (
    NEW.id, 'welcome',
    '🌱 Welcome to EcoVerse!',
    'You are now part of India''s animal welfare movement.',
    '/dashboard'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── REALTIME ENABLE ─────────────────────────────
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
ALTER PUBLICATION supabase_realtime ADD TABLE rescue_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
