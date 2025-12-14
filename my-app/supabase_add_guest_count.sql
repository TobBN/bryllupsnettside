-- Migration: Add guest_count column to rsvps table
-- Run this in Supabase SQL Editor

-- Add guest_count column with default value 1
ALTER TABLE rsvps 
ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 1 NOT NULL;

-- Update existing rows to have guest_count = 1 (for backward compatibility)
UPDATE rsvps 
SET guest_count = 1 
WHERE guest_count IS NULL OR guest_count < 1;

-- Add constraint to ensure guest_count is at least 1
ALTER TABLE rsvps 
ADD CONSTRAINT check_guest_count_positive CHECK (guest_count >= 1);

