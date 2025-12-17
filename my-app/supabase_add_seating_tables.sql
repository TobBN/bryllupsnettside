-- Migration: Add seating tables and guests for interactive seating chart
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Create seating_tables table
-- ============================================
CREATE TABLE IF NOT EXISTS seating_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 8 CHECK (capacity >= 1 AND capacity <= 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Create seating_guests table
-- ============================================
CREATE TABLE IF NOT EXISTS seating_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES seating_tables(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  seat_number INTEGER NOT NULL CHECK (seat_number >= 1 AND seat_number <= 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(table_id, seat_number)
);

-- ============================================
-- 3. Create indexes for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_seating_tables_table_number ON seating_tables(table_number);
CREATE INDEX IF NOT EXISTS idx_seating_guests_table_id ON seating_guests(table_id);
CREATE INDEX IF NOT EXISTS idx_seating_guests_name ON seating_guests(name);

-- ============================================
-- 4. Create trigger to update updated_at on seating_tables
-- ============================================
CREATE OR REPLACE FUNCTION update_seating_tables_updated_at()
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

DROP TRIGGER IF EXISTS update_seating_tables_updated_at_trigger ON seating_tables;
CREATE TRIGGER update_seating_tables_updated_at_trigger
    BEFORE UPDATE ON seating_tables
    FOR EACH ROW
    EXECUTE FUNCTION update_seating_tables_updated_at();

-- ============================================
-- 5. Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE seating_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_guests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. Create RLS Policies for seating_tables
-- ============================================
-- Policy: Allow public read access (for seating chart display)
CREATE POLICY "Allow public read access" ON seating_tables
  FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update/delete
CREATE POLICY "Allow service role insert access" ON seating_tables
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "Allow service role update access" ON seating_tables
  FOR UPDATE
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "Allow service role delete access" ON seating_tables
  FOR DELETE
  USING ((select auth.role()) = 'service_role');

-- ============================================
-- 7. Create RLS Policies for seating_guests
-- ============================================
-- Policy: Allow public read access (for seating chart display)
CREATE POLICY "Allow public read access" ON seating_guests
  FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update/delete
CREATE POLICY "Allow service role insert access" ON seating_guests
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "Allow service role update access" ON seating_guests
  FOR UPDATE
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "Allow service role delete access" ON seating_guests
  FOR DELETE
  USING ((select auth.role()) = 'service_role');

