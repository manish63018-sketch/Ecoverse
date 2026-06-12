-- ─── ADMIN SYSTEM COLUMNS ──────────────────────────
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_level VARCHAR(20) DEFAULT NULL;

-- ─── ADMIN LOGS TABLE ─────────────────────────────
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ─── POST AUTO-DELETE EXPRIATION ─────────────────
ALTER TABLE community_posts 
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  ADD COLUMN IF NOT EXISTS ttl_days INT DEFAULT 30;

-- ─── CRON JOB FOR EXPIRY (using pg_cron) ─────────
-- Note: Must enable pg_cron in Supabase first (Database -> Extensions)
SELECT cron.schedule(
  'delete-expired-posts',
  '30 20 * * *', -- Run every day at 2:30 AM IST (8:30 PM UTC)
  $$
    DELETE FROM community_posts
    WHERE expires_at < NOW()
      AND is_pinned = false;
      
    INSERT INTO admin_logs (action, detail, created_at)
    VALUES (
      'auto_delete_posts',
      'Deleted ' || (SELECT COUNT(*) FROM community_posts WHERE expires_at < NOW() AND is_pinned = false)::text || ' expired posts',
      NOW()
    );
  $$
);

-- ─── MILESTONE TRIGGERS ───────────────────────────
CREATE OR REPLACE FUNCTION check_rescue_milestones()
RETURNS TRIGGER AS $$
DECLARE
  current_rescue_count INT;
BEGIN
  -- Verify state changes to resolved
  IF NEW.status = 'resolved' AND (OLD.status IS NULL OR OLD.status <> 'resolved') AND NEW.resolved_by IS NOT NULL THEN
    -- Increment resolved count on profiles
    SELECT rescue_count INTO current_rescue_count
    FROM profiles WHERE id = NEW.resolved_by;
    
    UPDATE profiles
    SET rescue_count = COALESCE(rescue_count, 0) + 1
    WHERE id = NEW.resolved_by;
    
    -- Check milestones and trigger reward letters Edge Function
    -- Assumes app.edge_function_url setting exists, or falls back to local simulation
    IF current_rescue_count + 1 = 1 THEN
      PERFORM net.http_post(
        url := COALESCE(current_setting('app.edge_function_url', true), 'https://ecoverseindia.supabase.co/functions/v1') || '/send-reward-letter',
        body := json_build_object(
          'userId', NEW.resolved_by,
          'milestoneType', 'FIRST_RESCUE'
        )::text
      );
    ELSIF current_rescue_count + 1 = 5 THEN
      PERFORM net.http_post(
        url := COALESCE(current_setting('app.edge_function_url', true), 'https://ecoverseindia.supabase.co/functions/v1') || '/send-reward-letter',
        body := json_build_object(
          'userId', NEW.resolved_by,
          'milestoneType', 'RESCUE_5'
        )::text
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER rescue_milestone_check
  AFTER UPDATE ON rescue_cases
  FOR EACH ROW EXECUTE FUNCTION check_rescue_milestones();
