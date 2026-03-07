-- ============================================================
-- KOMPLETT OPPSETT FOR SUPABASE TESTPROSJEKT
-- Lim inn ALT dette i SQL Editor og klikk "Run"
-- ============================================================


-- ============================================================
-- 1. supabase_migration_complete.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS website_content (
  id TEXT PRIMARY KEY DEFAULT 'main',
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO website_content (id, content)
VALUES ('main', '{
  "hero": {
    "date": "24. juli 2026",
    "location": "Østgaard, Halden",
    "names": {
      "bride": "Alexandra",
      "groom": "Tobias"
    }
  },
  "story": {
    "title": "Vår historie",
    "subtitle": "Et lite tilbakeblikk på vår reise sammen",
    "timeline": [
      {
        "date": "Våren 2016",
        "title": "Vi møttes",
        "text": "En solfull dag i Son – en gåtur, en nedlagt jernbanelinje langs sjøen, og en klem som ble starten på alt."
      },
      {
        "date": "Sommeren 2018",
        "title": "Vår nye hverdag",
        "text": "Midnattsol og mørketid, familieliv og små eventyr som gjorde oss til verdens beste team."
      },
      {
        "date": "September 2018",
        "title": "Familien øker",
        "text": "Leah, vårt første barn, kommer til verden og sammen er vi nå tre."
      },
      {
        "date": "Oktober 2019",
        "title": "Familien øker igjen",
        "text": "Lucas kommer som nummer to, lykken er stor og søvnmangelen merkes."
      },
      {
        "date": "Mars 2021",
        "title": "Familien øker enda en gang",
        "text": "Live ankommer familien som en virvelvind, vi er nå fem i huset."
      },
      {
        "date": "Oktober 2022",
        "title": "Forlovelsen",
        "text": "Et «ja» på bursdagen til Alexandra, med barna rundt oss, og utsikt over vannet og fremtiden."
      },
      {
        "date": "Juli 2024",
        "title": "Hjemkomsten",
        "text": "Vi flytter tilbake til Sør-Norge, og begynner å bygge vårt nye liv her."
      },
      {
        "date": "Sommeren 2026",
        "title": "Bryllup",
        "text": "Vi gleder oss til å feire kjærligheten sammen med dere alle."
      }
    ]
  },
  "weddingDetails": {
    "title": "Selve dagen",
    "venue": {
      "title": "Sted",
      "description": "Vielse og fest på Garder Østgaard i Halden",
      "website": "https://www.garder-ostgaard.no",
      "websiteLabel": "www.garder-ostgaard.no",
      "address": "Brødenveien 31, 1763 Halden",
      "mapsLink": "https://maps.google.com/?q=Brødenveien+31,+1763+Halden"
    },
    "dressCode": {
      "title": "Antrekk",
      "general": "Mørk dress / sommerformell",
      "men": {
        "title": "Herrer:",
        "description": "Mørk dress, slips eller sløyfe, skjorte som tåler juli-varme. Lys sommerdress er lov hvis sola koker."
      },
      "women": {
        "title": "Damer:",
        "description": "Cocktailkjole, lang kjole eller en elegant sommerkjole – gjerne lett og sommerlig, men fortsatt pyntet."
      },
      "note": "Poenget: Pent, sommerlig og høytidelig. Kle deg så du ser bra ut på bilder, men fortsatt kan spise, drikke og danse hele kvelden."
    },
    "gifts": {
      "title": "Gaveønsker",
      "description": "Vi blir både glade for gaver fra ønskelisten og pengebidrag til vår bryllupsreise",
      "links": [
        {
          "url": "https://www.onsk.no",
          "label": "🎁 Ønskeliste fra Onsk.no"
        },
        {
          "url": "https://www.vinmonopolet.no",
          "label": "🍷 Vin fra Vinmonopolet"
        },
        {
          "url": "https://stas.app",
          "label": "🏠 Alternativ 3 (stas.app)"
        }
      ],
      "vipps": "💰 Vipps: til bryllupsreise"
    },
    "food": {
      "title": "Mat",
      "description": "Meny kommer...",
      "allergyNote": "* Allergier meldes fra om i RSVP"
    }
  },
  "footer": {
    "heading": "Alexandra & Tobias",
    "tagline": "Vi gleder oss til å dele denne spesielle dagen med dere 👩‍❤️‍💋‍👨",
    "contact": {
      "title": "Kontakt",
      "bride": {
        "name": "Alexandra",
        "phone": "+47 950 20 606"
      },
      "groom": {
        "name": "Tobias",
        "phone": "+47 905 95 348"
      }
    }
  }
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

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
CREATE INDEX IF NOT EXISTS idx_rsvps_response ON rsvps(response);
CREATE INDEX IF NOT EXISTS idx_rsvps_name ON rsvps(name);

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


-- ============================================================
-- 2. supabase_add_rsvp_guests_table.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS rsvp_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID NOT NULL REFERENCES rsvps(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  allergies TEXT,
  guest_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rsvp_guests_rsvp_id ON rsvp_guests(rsvp_id);
CREATE INDEX IF NOT EXISTS idx_rsvp_guests_name ON rsvp_guests(name);

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


-- ============================================================
-- 3. supabase_add_seating_tables.sql
-- ============================================================

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
CREATE INDEX IF NOT EXISTS idx_seating_guests_table_id ON seating_guests(table_id);
CREATE INDEX IF NOT EXISTS idx_seating_guests_name ON seating_guests(name);

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

ALTER TABLE seating_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_guests ENABLE ROW LEVEL SECURITY;

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


-- ============================================================
-- 4. supabase_add_rsvp_read_status.sql
-- ============================================================

ALTER TABLE rsvps
ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;

UPDATE rsvps SET is_read = true WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_rsvps_is_read ON rsvps(is_read);

COMMENT ON COLUMN rsvps.is_read IS 'Indicates whether admin has read/viewed this RSVP response';


-- ============================================================
-- 5. supabase_add_guest_count.sql
-- ============================================================

ALTER TABLE rsvps
ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 1 NOT NULL;

UPDATE rsvps SET guest_count = 1 WHERE guest_count IS NULL OR guest_count < 1;

ALTER TABLE rsvps
ADD CONSTRAINT check_guest_count_positive CHECK (guest_count >= 1);


-- ============================================================
-- 6. supabase_security_fix_optimized.sql
-- ============================================================

DROP POLICY IF EXISTS "Allow public read access" ON website_content;
DROP POLICY IF EXISTS "Allow service role write access" ON website_content;
DROP POLICY IF EXISTS "Allow service role insert access" ON website_content;
DROP POLICY IF EXISTS "Allow service role update access" ON website_content;
DROP POLICY IF EXISTS "Allow service role delete access" ON website_content;
DROP POLICY IF EXISTS "Allow public insert" ON rsvps;
DROP POLICY IF EXISTS "Allow service role read access" ON rsvps;
DROP POLICY IF EXISTS "Allow service role write access" ON rsvps;
DROP POLICY IF EXISTS "Allow service role update access" ON rsvps;
DROP POLICY IF EXISTS "Allow service role delete access" ON rsvps;

ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;

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

ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

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


-- ============================================================
-- 7. supabase_add_rls_rsvp_guests.sql
-- ============================================================

ALTER TABLE rsvp_guests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert" ON rsvp_guests;
DROP POLICY IF EXISTS "Allow service role read access" ON rsvp_guests;
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


-- ============================================================
-- 8. supabase_test_seed.sql – TESTDATA
-- ============================================================

DELETE FROM seating_guests;
DELETE FROM seating_tables;
DELETE FROM rsvp_guests;
DELETE FROM rsvps;

WITH r1 AS (
  INSERT INTO rsvps (name, phone, email, response, message)
  VALUES ('Test Familie Hansen', '+47 900 00 001', 'hansen@test.no', 'yes', 'Gleder oss masse!')
  RETURNING id
)
INSERT INTO rsvp_guests (rsvp_id, name, allergies, guest_order)
SELECT id, 'Kari Hansen', NULL, 1 FROM r1
UNION ALL
SELECT id, 'Per Hansen', 'Nøtter', 2 FROM r1;

WITH r2 AS (
  INSERT INTO rsvps (name, phone, email, response, message)
  VALUES ('Test Familie Olsen', '+47 900 00 002', 'olsen@test.no', 'yes', NULL)
  RETURNING id
)
INSERT INTO rsvp_guests (rsvp_id, name, allergies, guest_order)
SELECT id, 'Lise Olsen', NULL, 1 FROM r2
UNION ALL
SELECT id, 'Erik Olsen', NULL, 2 FROM r2
UNION ALL
SELECT id, 'Maja Olsen', 'Laktose', 3 FROM r2;

WITH r3 AS (
  INSERT INTO rsvps (name, phone, email, response, message)
  VALUES ('Test Bjørn Dahl', '+47 900 00 003', NULL, 'yes', 'Sees der!')
  RETURNING id
)
INSERT INTO rsvp_guests (rsvp_id, name, allergies, guest_order)
SELECT id, 'Bjørn Dahl', NULL, 1 FROM r3;

WITH r4 AS (
  INSERT INTO rsvps (name, phone, email, response, message)
  VALUES ('Test Par Bakke', '+47 900 00 004', 'bakke@test.no', 'yes', NULL)
  RETURNING id
)
INSERT INTO rsvp_guests (rsvp_id, name, allergies, guest_order)
SELECT id, 'Anne Bakke', 'Gluten, Egg', 1 FROM r4
UNION ALL
SELECT id, 'Jonas Bakke', NULL, 2 FROM r4;

WITH r5 AS (
  INSERT INTO rsvps (name, phone, email, response, message)
  VALUES ('Test Ikke Komme', '+47 900 00 005', NULL, 'no', 'Dessverre kan vi ikke komme. Gratulerer!')
  RETURNING id
)
INSERT INTO rsvp_guests (rsvp_id, name, allergies, guest_order)
SELECT id, 'Sigrid Strand', NULL, 1 FROM r5;

WITH r6 AS (
  INSERT INTO rsvps (name, phone, email, response, message)
  VALUES ('Test Kanskje Lund', '+47 900 00 006', 'lund@test.no', 'maybe', 'Vi håper vi kan komme!')
  RETURNING id
)
INSERT INTO rsvp_guests (rsvp_id, name, allergies, guest_order)
SELECT id, 'Thomas Lund', NULL, 1 FROM r6
UNION ALL
SELECT id, 'Maria Lund', NULL, 2 FROM r6;

WITH r7 AS (
  INSERT INTO rsvps (name, phone, email, response, message)
  VALUES ('Test Stor Familie Berg', '+47 900 00 007', 'berg@test.no', 'yes', NULL)
  RETURNING id
)
INSERT INTO rsvp_guests (rsvp_id, name, allergies, guest_order)
SELECT id, 'Hanne Berg', NULL, 1 FROM r7
UNION ALL
SELECT id, 'Morten Berg', NULL, 2 FROM r7
UNION ALL
SELECT id, 'Sofia Berg', 'Nøtter, Fisk', 3 FROM r7
UNION ALL
SELECT id, 'Noah Berg', NULL, 4 FROM r7
UNION ALL
SELECT id, 'Ella Berg', 'Melk', 5 FROM r7;

INSERT INTO seating_tables (table_number, capacity) VALUES
  (1, 8), (2, 8), (3, 6), (4, 6);

WITH t1 AS (SELECT id FROM seating_tables WHERE table_number = 1)
INSERT INTO seating_guests (table_id, name, seat_number)
SELECT id, 'Kari Hansen', 1 FROM t1
UNION ALL
SELECT id, 'Per Hansen', 2 FROM t1
UNION ALL
SELECT id, 'Bjørn Dahl', 3 FROM t1;

WITH t2 AS (SELECT id FROM seating_tables WHERE table_number = 2)
INSERT INTO seating_guests (table_id, name, seat_number)
SELECT id, 'Lise Olsen', 1 FROM t2
UNION ALL
SELECT id, 'Erik Olsen', 2 FROM t2;

-- Verifisering
SELECT 'RSVPs' as tabell, COUNT(*) as antall FROM rsvps
UNION ALL
SELECT 'RSVP-gjester', COUNT(*) FROM rsvp_guests
UNION ALL
SELECT 'Bord', COUNT(*) FROM seating_tables
UNION ALL
SELECT 'Bordplasser', COUNT(*) FROM seating_guests;
