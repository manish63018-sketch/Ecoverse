-- ─── DATABASE MIGRATION: SUPABASE RESTORATION ───────────────────
-- Run this in your Supabase SQL Editor or apply via CLI.

-- 1. Create custom types if they don't exist
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM (
        'rescuer', 'medical_care', 'transport', 'foster', 
        'adopter', 'street_feeder', 'ngo_staff', 'vegan_advocate', 
        'volunteer', 'admin', 'moderator'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.emergency_level AS ENUM (
        'low', 'medium', 'high', 'critical'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.rescue_status AS ENUM (
        'open', 'assigned', 'in_progress', 'escalated', 'resolved', 'closed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.animal_type AS ENUM (
        'dog', 'cat', 'cow', 'bird', 'horse', 'monkey', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create tables with robust constraints
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    username TEXT UNIQUE,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    city_name TEXT,
    state_name TEXT,
    area_name TEXT,
    pincode TEXT,
    roles TEXT[] DEFAULT '{}',
    primary_role TEXT DEFAULT 'volunteer',
    is_admin BOOLEAN DEFAULT false,
    is_moderator BOOLEAN DEFAULT false,
    account_status TEXT DEFAULT 'active',
    verification_status TEXT DEFAULT 'unverified',
    available_now BOOLEAN DEFAULT false,
    provider_source TEXT DEFAULT 'supabase',
    notification_provider TEXT DEFAULT 'firebase',
    rescue_count INT DEFAULT 0,
    adopt_count INT DEFAULT 0,
    volunteer_hours INT DEFAULT 0,
    vegan_streak_days INT DEFAULT 0,
    instagram_handle TEXT,
    rescue_radius_km INT DEFAULT 10,
    skills TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rescue_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    state_name TEXT NOT NULL,
    city_name TEXT NOT NULL,
    area_name TEXT NOT NULL,
    animal_type TEXT NOT NULL DEFAULT 'dog',
    emergency_level TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    description TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    assigned_volunteer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_ngo_id UUID,
    area_lat NUMERIC(9,6),
    area_lng NUMERIC(9,6),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT DEFAULT 'general',
    content TEXT NOT NULL,
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    city_name TEXT,
    ttl_days INT DEFAULT 30,
    expires_at TIMESTAMPTZ,
    is_pinned BOOLEAN DEFAULT false,
    is_flagged BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    link_to TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ngos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city_name TEXT,
    state_name TEXT,
    focus_areas TEXT[] DEFAULT '{}',
    description TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL,
    badge_name TEXT,
    badge_emoji TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    detail TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS Policies

-- PROFILES
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RESCUE CASES
DROP POLICY IF EXISTS "Public cases read" ON public.rescue_cases;
CREATE POLICY "Public cases read" ON public.rescue_cases
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth insert cases" ON public.rescue_cases;
CREATE POLICY "Auth insert cases" ON public.rescue_cases
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Reporter or volunteer update cases" ON public.rescue_cases;
CREATE POLICY "Reporter or volunteer update cases" ON public.rescue_cases
    FOR UPDATE USING (
        auth.uid() = reporter_id OR 
        auth.uid() = assigned_volunteer_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND (profiles.is_admin = true OR profiles.is_moderator = true)
        )
    );

-- COMMUNITY POSTS
DROP POLICY IF EXISTS "Public posts read" ON public.community_posts;
CREATE POLICY "Public posts read" ON public.community_posts
    FOR SELECT USING (expires_at > NOW() OR is_pinned = true);

DROP POLICY IF EXISTS "Auth insert post" ON public.community_posts;
CREATE POLICY "Auth insert post" ON public.community_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Author update own post" ON public.community_posts;
CREATE POLICY "Author update own post" ON public.community_posts
    FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Moderator delete posts" ON public.community_posts;
CREATE POLICY "Moderator delete posts" ON public.community_posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND (profiles.is_admin = true OR profiles.is_moderator = true)
        )
    );

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Private notifications" ON public.notifications;
CREATE POLICY "Private notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- NGOS
DROP POLICY IF EXISTS "Public NGOs read" ON public.ngos;
CREATE POLICY "Public NGOs read" ON public.ngos
    FOR SELECT USING (true);

-- BADGES
DROP POLICY IF EXISTS "Public badges read" ON public.user_badges;
CREATE POLICY "Public badges read" ON public.user_badges
    FOR SELECT USING (true);

-- SETTINGS
DROP POLICY IF EXISTS "Public settings read" ON public.settings;
CREATE POLICY "Public settings read" ON public.settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin update settings" ON public.settings;
CREATE POLICY "Admin update settings" ON public.settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- ADMIN LOGS
DROP POLICY IF EXISTS "Admin view logs" ON public.admin_logs;
CREATE POLICY "Admin view logs" ON public.admin_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- 5. Safe Rescue Cases view (exact GPS masked for normal users)
CREATE OR REPLACE VIEW public.safe_rescue_cases AS
  SELECT 
    id, reporter_id, state_name, city_name, area_name, animal_type, emergency_level, status, description, photo_urls, assigned_volunteer_id, assigned_ngo_id, created_at, updated_at,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() AND (public.profiles.is_admin = true OR 'rescuer' = ANY(public.profiles.roles))
      ) THEN area_lat
      ELSE NULL
    END AS area_lat,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() AND (public.profiles.is_admin = true OR 'rescuer' = ANY(public.profiles.roles))
      ) THEN area_lng
      ELSE NULL
    END AS area_lng
  FROM public.rescue_cases;

-- 6. Welcome triggering and auto-profile triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, username, email, roles, primary_role, 
    city_name, state_name, is_admin, is_moderator, account_status, verification_status
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'EcoVerse User'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    ARRAY[COALESCE(NEW.raw_user_meta_data->>'role', 'volunteer')],
    COALESCE(NEW.raw_user_meta_data->>'role', 'volunteer'),
    NEW.raw_user_meta_data->>'city_name',
    NEW.raw_user_meta_data->>'state_name',
    false, false, 'active', 'unverified'
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Community Post TTL Triggers
CREATE OR REPLACE FUNCTION set_post_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + (COALESCE(NEW.ttl_days, 30) * INTERVAL '1 day');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_community_post_inserted ON public.community_posts;
CREATE TRIGGER on_community_post_inserted
  BEFORE INSERT ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION set_post_expiration();

-- 8. Realtime configurations
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE rescue_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
