-- Migration: Fix search_path security issue in update_seating_tables_updated_at function
-- Run this in Supabase SQL Editor
--
-- This fixes the security warning: Function has a role mutable search_path
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- ============================================
-- Fix function search_path security issue
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

