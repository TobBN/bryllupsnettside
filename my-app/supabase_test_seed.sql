-- ╔══════════════════════════════════════════════════════════════╗
-- ║  ⚠️  ADVARSEL: DENNE FILEN SLETTER ALL DATA!              ║
-- ║  KJØR ALDRI MOT PRODUKSJON!                                ║
-- ║  Kun for test-prosjektet i Supabase.                       ║
-- ╚══════════════════════════════════════════════════════════════╝
--
-- Forutsetning: Kjør supabase_setup_all.sql FØRST for skjema/policies.
-- Deretter denne filen for testdata.

-- Rydd opp eventuelle gamle testdata (trygt å kjøre på nytt)
DELETE FROM seating_guests;
DELETE FROM seating_tables;
DELETE FROM rsvp_guests;
DELETE FROM rsvps;

-- ============================================================
-- TESTGJESTER – simulerer realistisk RSVP-data
-- ============================================================

-- Familie som kommer (yes) – 2 voksne
WITH r1 AS (
  INSERT INTO rsvps (name, phone, email, response, message)
  VALUES ('Test Familie Hansen', '+47 900 00 001', 'hansen@test.no', 'yes', 'Gleder oss masse!')
  RETURNING id
)
INSERT INTO rsvp_guests (rsvp_id, name, allergies, guest_order)
SELECT id, 'Kari Hansen', NULL, 1 FROM r1
UNION ALL
SELECT id, 'Per Hansen', 'Nøtter', 2 FROM r1;

-- Familie som kommer (yes) – 3 personer
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

-- Enkeltperson som kommer (yes)
WITH r3 AS (
  INSERT INTO rsvps (name, phone, email, response, message)
  VALUES ('Test Bjørn Dahl', '+47 900 00 003', NULL, 'yes', 'Sees der!')
  RETURNING id
)
INSERT INTO rsvp_guests (rsvp_id, name, allergies, guest_order)
SELECT id, 'Bjørn Dahl', NULL, 1 FROM r3;

-- Par – en med allergi
WITH r4 AS (
  INSERT INTO rsvps (name, phone, email, response, message)
  VALUES ('Test Par Bakke', '+47 900 00 004', 'bakke@test.no', 'yes', NULL)
  RETURNING id
)
INSERT INTO rsvp_guests (rsvp_id, name, allergies, guest_order)
SELECT id, 'Anne Bakke', 'Gluten, Egg', 1 FROM r4
UNION ALL
SELECT id, 'Jonas Bakke', NULL, 2 FROM r4;

-- Person som ikke kommer (no)
WITH r5 AS (
  INSERT INTO rsvps (name, phone, email, response, message)
  VALUES ('Test Ikke Komme', '+47 900 00 005', NULL, 'no', 'Dessverre kan vi ikke komme. Gratulerer!')
  RETURNING id
)
INSERT INTO rsvp_guests (rsvp_id, name, allergies, guest_order)
SELECT id, 'Sigrid Strand', NULL, 1 FROM r5;

-- Person som er usikker (maybe)
WITH r6 AS (
  INSERT INTO rsvps (name, phone, email, response, message)
  VALUES ('Test Kanskje Lund', '+47 900 00 006', 'lund@test.no', 'maybe', 'Vi håper vi kan komme!')
  RETURNING id
)
INSERT INTO rsvp_guests (rsvp_id, name, allergies, guest_order)
SELECT id, 'Thomas Lund', NULL, 1 FROM r6
UNION ALL
SELECT id, 'Maria Lund', NULL, 2 FROM r6;

-- Stor gruppe (5 personer)
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

-- ============================================================
-- TESTBORDOPPSETT – simulerer bordplassering
-- ============================================================

INSERT INTO seating_tables (table_number, capacity) VALUES
  (1, 8),
  (2, 8),
  (3, 6),
  (4, 6);

-- Plasser noen testgjester ved Bord 1
WITH t1 AS (SELECT id FROM seating_tables WHERE table_number = 1)
INSERT INTO seating_guests (table_id, name, seat_number)
SELECT id, 'Kari Hansen', 1 FROM t1
UNION ALL
SELECT id, 'Per Hansen', 2 FROM t1
UNION ALL
SELECT id, 'Bjørn Dahl', 3 FROM t1;

-- Plasser noen testgjester ved Bord 2
WITH t2 AS (SELECT id FROM seating_tables WHERE table_number = 2)
INSERT INTO seating_guests (table_id, name, seat_number)
SELECT id, 'Lise Olsen', 1 FROM t2
UNION ALL
SELECT id, 'Erik Olsen', 2 FROM t2;

-- ============================================================
-- Verifiser at testdata ble lagt inn
-- ============================================================
SELECT 'RSVPs' as tabell, COUNT(*) as antall FROM rsvps
UNION ALL
SELECT 'RSVP-gjester', COUNT(*) FROM rsvp_guests
UNION ALL
SELECT 'Bord', COUNT(*) FROM seating_tables
UNION ALL
SELECT 'Bordplasser', COUNT(*) FROM seating_guests;
