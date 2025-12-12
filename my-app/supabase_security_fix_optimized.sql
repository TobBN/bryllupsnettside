-- Optimized Security Fixes for Supabase Database
-- Run this to fix performance warnings from Database Linter
-- This replaces the previous security_fix.sql with optimized policies

-- ============================================
-- 1. Drop old policies (if they exist)
-- ============================================
DROP POLICY IF EXISTS "Allow public read access" ON website_content;
DROP POLICY IF EXISTS "Allow service role write access" ON website_content;
DROP POLICY IF EXISTS "Allow public insert" ON rsvps;
DROP POLICY IF EXISTS "Allow service role read access" ON rsvps;
DROP POLICY IF EXISTS "Allow service role write access" ON rsvps;

-- ============================================
-- 2. Enable Row Level Security (RLS) on website_content
-- ============================================
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (for website components)
-- Using (select auth.role()) for better performance
CREATE POLICY "Allow public read access" ON website_content
  FOR SELECT
  USING (true);

-- Policy: Only service role can write (via API with service_role key)
-- Using (select auth.role()) for better performance
CREATE POLICY "Allow service role write access" ON website_content
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- ============================================
-- 3. Enable Row Level Security (RLS) on rsvps
-- ============================================
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public insert (for RSVP form submissions)
CREATE POLICY "Allow public insert" ON rsvps
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only service role can read (for admin export)
-- Separate SELECT policy to avoid multiple_permissive_policies warning
CREATE POLICY "Allow service role read access" ON rsvps
  FOR SELECT
  USING ((select auth.role()) = 'service_role');

-- Policy: Only service role can update
CREATE POLICY "Allow service role update access" ON rsvps
  FOR UPDATE
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- Policy: Only service role can delete
CREATE POLICY "Allow service role delete access" ON rsvps
  FOR DELETE
  USING ((select auth.role()) = 'service_role');

-- ============================================
-- 4. Fix function search_path security issue
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

