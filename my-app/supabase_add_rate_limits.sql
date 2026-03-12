-- Migration: Add persistent rate limiting table
-- Run this in Supabase SQL Editor before deploying rate limiting changes.
-- Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE).

-- ============================================================
-- 1. Rate limits table
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_limits (
  identifier TEXT PRIMARY KEY,
  count       INTEGER     NOT NULL DEFAULT 1,
  reset_at    TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);

-- ============================================================
-- 2. Atomic check-and-increment function
--    Returns TRUE  → request allowed
--    Returns FALSE → rate limit exceeded
-- ============================================================
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_identifier  TEXT,
  p_max_attempts INTEGER,
  p_window_ms   BIGINT   -- milliseconds
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_record  RECORD;
  v_now     TIMESTAMPTZ := NOW();
  v_reset   TIMESTAMPTZ := v_now + (p_window_ms || ' milliseconds')::INTERVAL;
BEGIN
  SELECT count, reset_at INTO v_record
  FROM rate_limits
  WHERE identifier = p_identifier
  FOR UPDATE;

  IF NOT FOUND OR v_now > v_record.reset_at THEN
    -- New window: insert or reset
    INSERT INTO rate_limits (identifier, count, reset_at)
    VALUES (p_identifier, 1, v_reset)
    ON CONFLICT (identifier) DO UPDATE
      SET count = 1, reset_at = v_reset;
    RETURN TRUE;

  ELSIF v_record.count >= p_max_attempts THEN
    RETURN FALSE;

  ELSE
    UPDATE rate_limits
    SET count = count + 1
    WHERE identifier = p_identifier;
    RETURN TRUE;
  END IF;
END;
$$;

-- ============================================================
-- 3. RLS: service_role only (rate_limits is internal)
-- ============================================================
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON rate_limits;
CREATE POLICY "service_role_all" ON rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. Auto-cleanup: remove expired rows (optional cron via pg_cron)
-- ============================================================
-- If pg_cron is enabled in your Supabase project, run:
--   SELECT cron.schedule('cleanup-rate-limits', '*/15 * * * *',
--     $$DELETE FROM rate_limits WHERE reset_at < NOW()$$);
