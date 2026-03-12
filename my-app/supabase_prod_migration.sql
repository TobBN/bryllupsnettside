-- ============================================================
-- PROD-MIGRASJON: Trygt å kjøre mot eksisterende produksjonsdatabase
-- Alle operasjoner er additive (IF NOT EXISTS, ADD COLUMN IF NOT EXISTS)
-- Ingen data slettes. Kjør i Supabase PROD SQL Editor.
-- ============================================================

-- ── 1. Grunnleggende tabeller ────────────────────────────────

CREATE TABLE IF NOT EXISTS website_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sett inn standard innhold KUN om tabellen er tom (ON CONFLICT DO NOTHING)
INSERT INTO website_content (id, content)
VALUES ('main', '{
  "hero": {
    "date": "24. juli 2026",
    "location": "Østgaard, Halden",
    "names": { "bride": "Alexandra", "groom": "Tobias" }
  },
  "story": {
    "title": "Vår historie",
    "subtitle": "Et lite tilbakeblikk på vår reise sammen",
    "timeline": []
  },
  "weddingDetails": {
    "title": "Selve dagen",
    "venue": {},
    "dressCode": {},
    "gifts": {},
    "food": {}
  },
  "footer": {
    "heading": "Alexandra & Tobias",
    "tagline": "",
    "contact": {
      "title": "Kontakt",
      "bride": { "name": "Alexandra", "phone": "" },
      "groom": { "name": "Tobias", "phone": "" }
    }
  },
  "rsvp": {}
}'::jsonb)
ON CONFLICT (id) DO NOTHING;
-- ↑ Berører ikke eksisterende innhold i PROD

CREATE TABLE IF NOT EXISTS rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  response VARCHAR(10) NOT NULL CHECK (response IN ('yes', 'no', 'maybe')),
  allergies TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvps_response   ON rsvps(response);
CREATE INDEX IF NOT EXISTS idx_rsvps_name       ON rsvps(name);

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

DROP TRIGGER IF EXISTS update_rsvps_updated_at ON rsvps;
CREATE TRIGGER update_rsvps_updated_at
    BEFORE UPDATE ON rsvps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ── 2. Nye kolonner på rsvps (trygge ADD COLUMN IF NOT EXISTS) ──

ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_rsvps_is_read ON rsvps(is_read);
COMMENT ON COLUMN rsvps.is_read IS 'Indicates whether admin has read/viewed this RSVP response';

-- Eksisterende rsvps markeres som lest slik at de ikke ser ut som nye henvendelser
UPDATE rsvps SET is_read = true WHERE is_read = false;

ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 1 NOT NULL;
UPDATE rsvps SET guest_count = 1 WHERE guest_count IS NULL OR guest_count < 1;
ALTER TABLE rsvps DROP CONSTRAINT IF EXISTS check_guest_count_positive;
ALTER TABLE rsvps ADD CONSTRAINT check_guest_count_positive CHECK (guest_count >= 1);


-- ── 3. rsvp_guests-tabell ────────────────────────────────────

CREATE TABLE IF NOT EXISTS rsvp_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID NOT NULL REFERENCES rsvps(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  allergies TEXT,
  guest_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rsvp_guests_rsvp_id ON rsvp_guests(rsvp_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_guests_name    ON rsvp_guests(name);

-- Backfill: opprett én gjest-rad for eksisterende RSVP-svar som mangler gjest-rad
INSERT INTO rsvp_guests (rsvp_id, name, allergies, guest_order)
SELECT id, name, allergies, 1
FROM rsvps
WHERE NOT EXISTS (
  SELECT 1 FROM rsvp_guests WHERE rsvp_guests.rsvp_id = rsvps.id
);


-- ── 4. Seating-tabeller ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS seating_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 8 CHECK (capacity >= 1 AND capacity <= 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seating_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES seating_tables(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  seat_number INTEGER NOT NULL CHECK (seat_number >= 1 AND seat_number <= 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(table_id, seat_number)
);

CREATE INDEX IF NOT EXISTS idx_seating_tables_table_number ON seating_tables(table_number);
CREATE INDEX IF NOT EXISTS idx_seating_guests_table_id     ON seating_guests(table_id);
CREATE INDEX IF NOT EXISTS idx_seating_guests_name         ON seating_guests(name);

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


-- ── 5. Rate limiting ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rate_limits (
  identifier TEXT PRIMARY KEY,
  count       INTEGER     NOT NULL DEFAULT 1,
  reset_at    TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);

CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_identifier  TEXT,
  p_max_attempts INTEGER,
  p_window_ms   BIGINT
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
    INSERT INTO rate_limits (identifier, count, reset_at)
    VALUES (p_identifier, 1, v_reset)
    ON CONFLICT (identifier) DO UPDATE
      SET count = 1, reset_at = v_reset;
    RETURN TRUE;
  ELSIF v_record.count >= p_max_attempts THEN
    RETURN FALSE;
  ELSE
    UPDATE rate_limits SET count = count + 1 WHERE identifier = p_identifier;
    RETURN TRUE;
  END IF;
END;
$$;


-- ── 6. RLS-policies (droppes og gjenskapes for å sikre siste versjon) ──

-- website_content
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access"       ON website_content;
DROP POLICY IF EXISTS "Allow service role insert access" ON website_content;
DROP POLICY IF EXISTS "Allow service role update access" ON website_content;
DROP POLICY IF EXISTS "Allow service role delete access" ON website_content;
DROP POLICY IF EXISTS "Allow service role write access"  ON website_content;

CREATE POLICY "Allow public read access" ON website_content
  FOR SELECT USING (true);
CREATE POLICY "Allow service role insert access" ON website_content
  FOR INSERT WITH CHECK ((select auth.role()) = 'service_role');
CREATE POLICY "Allow service role update access" ON website_content
  FOR UPDATE
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');
CREATE POLICY "Allow service role delete access" ON website_content
  FOR DELETE USING ((select auth.role()) = 'service_role');

-- rsvps
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert"          ON rsvps;
DROP POLICY IF EXISTS "Allow service role read access"   ON rsvps;
DROP POLICY IF EXISTS "Allow service role update access" ON rsvps;
DROP POLICY IF EXISTS "Allow service role delete access" ON rsvps;
DROP POLICY IF EXISTS "Allow service role write access"  ON rsvps;

CREATE POLICY "Allow public insert" ON rsvps
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role read access" ON rsvps
  FOR SELECT USING ((select auth.role()) = 'service_role');
CREATE POLICY "Allow service role update access" ON rsvps
  FOR UPDATE
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');
CREATE POLICY "Allow service role delete access" ON rsvps
  FOR DELETE USING ((select auth.role()) = 'service_role');

-- rsvp_guests
ALTER TABLE rsvp_guests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert"          ON rsvp_guests;
DROP POLICY IF EXISTS "Allow service role read access"   ON rsvp_guests;
DROP POLICY IF EXISTS "Allow service role update access" ON rsvp_guests;
DROP POLICY IF EXISTS "Allow service role delete access" ON rsvp_guests;

CREATE POLICY "Allow public insert" ON rsvp_guests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role read access" ON rsvp_guests
  FOR SELECT USING ((select auth.role()) = 'service_role');
CREATE POLICY "Allow service role update access" ON rsvp_guests
  FOR UPDATE
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');
CREATE POLICY "Allow service role delete access" ON rsvp_guests
  FOR DELETE USING ((select auth.role()) = 'service_role');

-- seating_tables
ALTER TABLE seating_tables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access"         ON seating_tables;
DROP POLICY IF EXISTS "Allow service role insert access" ON seating_tables;
DROP POLICY IF EXISTS "Allow service role update access" ON seating_tables;
DROP POLICY IF EXISTS "Allow service role delete access" ON seating_tables;

CREATE POLICY "Allow public read access" ON seating_tables
  FOR SELECT USING (true);
CREATE POLICY "Allow service role insert access" ON seating_tables
  FOR INSERT WITH CHECK ((select auth.role()) = 'service_role');
CREATE POLICY "Allow service role update access" ON seating_tables
  FOR UPDATE
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');
CREATE POLICY "Allow service role delete access" ON seating_tables
  FOR DELETE USING ((select auth.role()) = 'service_role');

-- seating_guests
ALTER TABLE seating_guests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access"         ON seating_guests;
DROP POLICY IF EXISTS "Allow service role insert access" ON seating_guests;
DROP POLICY IF EXISTS "Allow service role update access" ON seating_guests;
DROP POLICY IF EXISTS "Allow service role delete access" ON seating_guests;

CREATE POLICY "Allow public read access" ON seating_guests
  FOR SELECT USING (true);
CREATE POLICY "Allow service role insert access" ON seating_guests
  FOR INSERT WITH CHECK ((select auth.role()) = 'service_role');
CREATE POLICY "Allow service role update access" ON seating_guests
  FOR UPDATE
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');
CREATE POLICY "Allow service role delete access" ON seating_guests
  FOR DELETE USING ((select auth.role()) = 'service_role');

-- rate_limits (kun service_role)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all" ON rate_limits;
CREATE POLICY "service_role_all" ON rate_limits
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ── 7. Verifisering (kontroller resultatet) ──────────────────

SELECT
  (SELECT COUNT(*) FROM rsvps)        AS rsvp_svar,
  (SELECT COUNT(*) FROM rsvp_guests)  AS rsvp_gjester,
  (SELECT COUNT(*) FROM seating_tables) AS bord,
  (SELECT COUNT(*) FROM seating_guests) AS bordplasser;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'rsvps'
ORDER BY ordinal_position;
