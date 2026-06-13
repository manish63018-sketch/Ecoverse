-- Auto-profile on signup trigger
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
  );
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Own profile update" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Own profile insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public rescue" ON rescue_cases
  FOR SELECT USING (true);
CREATE POLICY "Auth rescue insert" ON rescue_cases
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth rescue update" ON rescue_cases
  FOR UPDATE USING (
    auth.uid() = reporter_id OR
    auth.uid() = assigned_volunteer_id
  );

CREATE POLICY "Public posts" ON community_posts
  FOR SELECT USING (true);
CREATE POLICY "Auth post insert" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Own post update" ON community_posts
  FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Own post delete" ON community_posts
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public ngos" ON ngos FOR SELECT USING (true);
CREATE POLICY "Public adoptions" ON adoptions
  FOR SELECT USING (true);
CREATE POLICY "Auth adoption insert" ON adoptions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Public badges" ON user_badges
  FOR SELECT USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE rescue_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Post auto-delete (if pg_cron enabled)
SELECT cron.schedule(
  'delete-expired-posts', '30 20 * * *',
  $$DELETE FROM community_posts
    WHERE expires_at < NOW() AND is_pinned = false;$$
);
