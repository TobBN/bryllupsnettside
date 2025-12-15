-- Migration: Add is_read column to rsvps table for admin notifications
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Add is_read column to rsvps table
-- ============================================
ALTER TABLE rsvps 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;

-- ============================================
-- 2. Backfill existing RSVPs as read (since they were already seen)
-- ============================================
UPDATE rsvps 
SET is_read = true 
WHERE is_read = false;

-- ============================================
-- 3. Create index for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_rsvps_is_read ON rsvps(is_read);

-- ============================================
-- 4. Add comment for documentation
-- ============================================
COMMENT ON COLUMN rsvps.is_read IS 'Indicates whether admin has read/viewed this RSVP response';

