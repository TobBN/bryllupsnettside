-- Migration: Add rsvp_guests table for normalized guest data
-- Run this in Supabase SQL Editor

-- Create rsvp_guests table
CREATE TABLE IF NOT EXISTS rsvp_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID NOT NULL REFERENCES rsvps(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  allergies TEXT,
  guest_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rsvp_guests_rsvp_id ON rsvp_guests(rsvp_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_guests_name ON rsvp_guests(name);

-- Migrate existing data from rsvps table to rsvp_guests
-- This creates one guest entry per existing RSVP based on the name field
INSERT INTO rsvp_guests (rsvp_id, name, allergies, guest_order)
SELECT 
  id as rsvp_id,
  name,
  allergies,
  1 as guest_order
FROM rsvps
WHERE NOT EXISTS (
  SELECT 1 FROM rsvp_guests WHERE rsvp_guests.rsvp_id = rsvps.id
);

-- Note: guest_count column in rsvps table is kept for backward compatibility
-- but will no longer be used for new RSVPs

