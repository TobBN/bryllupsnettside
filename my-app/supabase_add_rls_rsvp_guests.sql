-- Migration: Add Row Level Security (RLS) to rsvp_guests table
-- Run this in Supabase SQL Editor
-- This follows the same security pattern as rsvps table

-- ============================================
-- 1. Enable Row Level Security (RLS) on rsvp_guests
-- ============================================
ALTER TABLE rsvp_guests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Drop existing policies if they exist (for idempotency)
-- ============================================
DROP POLICY IF EXISTS "Allow public insert" ON rsvp_guests;
DROP POLICY IF EXISTS "Allow service role read access" ON rsvp_guests;
DROP POLICY IF EXISTS "Allow service role update access" ON rsvp_guests;
DROP POLICY IF EXISTS "Allow service role delete access" ON rsvp_guests;

-- ============================================
-- 3. Create RLS Policies
-- ============================================

-- Policy: Allow public insert (for RSVP form submissions)
-- Users need to be able to insert guest records when submitting RSVP
CREATE POLICY "Allow public insert" ON rsvp_guests
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only service role can read (for admin export/list)
-- Separate SELECT policy to avoid multiple_permissive_policies warning
CREATE POLICY "Allow service role read access" ON rsvp_guests
  FOR SELECT
  USING ((select auth.role()) = 'service_role');

-- Policy: Only service role can update
CREATE POLICY "Allow service role update access" ON rsvp_guests
  FOR UPDATE
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

-- Policy: Only service role can delete
CREATE POLICY "Allow service role delete access" ON rsvp_guests
  FOR DELETE
  USING ((select auth.role()) = 'service_role');

-- Note: CASCADE DELETE from rsvps table will still work automatically
-- due to the foreign key constraint: ON DELETE CASCADE

