-- ─── DATABASE MIGRATION ───────────────────────────────
-- Run this in your Supabase SQL Editor.

-- 1. Alter profiles table to ensure all required fields exist
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS provider_source TEXT DEFAULT 'supabase',
  ADD COLUMN IF NOT EXISTS notification_provider TEXT DEFAULT 'firebase',
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
  ADD COLUMN IF NOT EXISTS rescue_radius_km INT DEFAULT 10,
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- 2. Alter community_posts table for TTL capability
ALTER TABLE IF EXISTS public.community_posts
  ADD COLUMN IF NOT EXISTS ttl_days INT DEFAULT 30,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;

-- 3. Create settings table if not exists
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create admin_logs table if not exists
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- 6. Trigger to automatically set expires_at for community posts on insert
CREATE OR REPLACE FUNCTION set_post_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.created_at + (COALESCE(NEW.ttl_days, 30) * INTERVAL '1 day');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_community_post_inserted
  BEFORE INSERT ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION set_post_expiration();

-- 7. Function to cleanup expired community posts (called via cron or API)
CREATE OR REPLACE FUNCTION delete_expired_posts()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.community_posts
  WHERE expires_at < NOW() AND is_pinned = false;
END;
$$ LANGUAGE plpgsql;

-- 8. Policies configuration

-- Settings: Public read, admin write
DROP POLICY IF EXISTS "Public settings viewable" ON public.settings;
CREATE POLICY "Public settings viewable" ON public.settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage settings" ON public.settings;
CREATE POLICY "Admins manage settings" ON public.settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid() AND public.profiles.is_admin = true
    )
  );

-- Admin logs: Admins only
DROP POLICY IF EXISTS "Admins view logs" ON public.admin_logs;
CREATE POLICY "Admins view logs" ON public.admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid() AND public.profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "System inserts logs" ON public.admin_logs;
CREATE POLICY "System inserts logs" ON public.admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid() AND public.profiles.is_admin = true
    )
  );

-- Profiles: Public select (excluding sensitive columns like is_admin/is_moderator/email if needed)
-- We allow basic public read but users can only edit their own rows.
DROP POLICY IF EXISTS "Public profiles viewable" ON public.profiles;
CREATE POLICY "Public profiles viewable" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Community posts RLS: Everyone can read, authenticated can write own, admins/moderators can delete/update
DROP POLICY IF EXISTS "Public community posts" ON public.community_posts;
CREATE POLICY "Public community posts" ON public.community_posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated post" ON public.community_posts;
CREATE POLICY "Authenticated post" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

DROP POLICY IF EXISTS "Author edit own post" ON public.community_posts;
CREATE POLICY "Author edit own post" ON public.community_posts
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Moderators manage posts" ON public.community_posts;
CREATE POLICY "Moderators manage posts" ON public.community_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid() AND (public.profiles.is_admin = true OR public.profiles.is_moderator = true)
    )
  );

-- Rescue Cases GPS column masking:
-- RLS policies themselves cannot easily hide columns on SELECT. Instead, we configure a secure view or let the client-side check the profile.
-- Alternatively, we can restrict exact GPS queries using a function or a view.
-- Here we'll configure a view `public_rescue_cases` that replaces exact GPS coordinates with NULL if the requesting user is not a verified admin/rescuer.
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

-- Ensure trigger sets email on profile from user metadata on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    username, 
    email,
    roles,
    primary_role,
    city_name,
    state_name,
    is_admin,
    is_moderator,
    account_status,
    verification_status
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'EcoVerse User'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    ARRAY[COALESCE(NEW.raw_user_meta_data->>'role', 'volunteer')]::public.user_role[],
    COALESCE(NEW.raw_user_meta_data->>'role', 'volunteer')::public.user_role,
    NEW.raw_user_meta_data->>'city_name',
    NEW.raw_user_meta_data->>'state_name',
    false,
    false,
    'active',
    'unverified'
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

-- 9. Create contact_inquiries table if not exists
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert inquiries" ON public.contact_inquiries;
CREATE POLICY "Anyone can insert inquiries" ON public.contact_inquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view inquiries" ON public.contact_inquiries;
CREATE POLICY "Admins can view inquiries" ON public.contact_inquiries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid() AND public.profiles.is_admin = true
    )
  );

