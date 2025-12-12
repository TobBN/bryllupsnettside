-- Security Fixes for Supabase Database
-- Run this AFTER the initial migration (supabase_migration_complete.sql)
-- This fixes critical security issues found by Supabase Database Linter

-- ============================================
-- 1. Enable Row Level Security (RLS) on website_content
-- ============================================
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (for website components)
CREATE POLICY "Allow public read access" ON website_content
  FOR SELECT
  USING (true);

-- Policy: Only service role can write (via API with service_role key)
CREATE POLICY "Allow service role write access" ON website_content
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 2. Enable Row Level Security (RLS) on rsvps
-- ============================================
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public insert (for RSVP form submissions)
CREATE POLICY "Allow public insert" ON rsvps
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only service role can read (for admin export)
CREATE POLICY "Allow service role read access" ON rsvps
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Policy: Only service role can update/delete
CREATE POLICY "Allow service role write access" ON rsvps
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- 3. Fix function search_path security issue
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================
-- 4. Optional: Remove unused indexes (performance optimization)
-- ============================================
-- Uncomment these if you want to remove unused indexes
-- Note: These may become useful later, so keeping them is fine
-- DROP INDEX IF EXISTS idx_rsvps_created_at;
-- DROP INDEX IF EXISTS idx_rsvps_response;
-- DROP INDEX IF EXISTS idx_rsvps_name;

