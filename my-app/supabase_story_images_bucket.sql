-- ============================================================
-- Supabase Storage: story-images bucket
-- Opprett bucket og RLS-policies for offentlig lesetilgang
-- Trygt å kjøre flere ganger (idempotent)
-- ============================================================

-- 1. Opprett bucket (ignorerer hvis den allerede finnes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-images',
  'story-images',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. RLS-policies for storage.objects

-- Fjern eksisterende policies (trygt om de ikke finnes)
DROP POLICY IF EXISTS "Public read access for story-images" ON storage.objects;
DROP POLICY IF EXISTS "Service role upload for story-images" ON storage.objects;
DROP POLICY IF EXISTS "Service role update for story-images" ON storage.objects;
DROP POLICY IF EXISTS "Service role delete for story-images" ON storage.objects;

-- Alle kan lese/laste ned bilder
CREATE POLICY "Public read access for story-images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'story-images');

-- Kun service_role kan laste opp
CREATE POLICY "Service role upload for story-images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'story-images'
    AND (select auth.role()) = 'service_role'
  );

-- Kun service_role kan oppdatere
CREATE POLICY "Service role update for story-images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'story-images'
    AND (select auth.role()) = 'service_role'
  )
  WITH CHECK (
    bucket_id = 'story-images'
    AND (select auth.role()) = 'service_role'
  );

-- Kun service_role kan slette
CREATE POLICY "Service role delete for story-images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'story-images'
    AND (select auth.role()) = 'service_role'
  );
