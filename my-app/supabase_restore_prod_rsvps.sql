-- ============================================================
-- GJENOPPRETTING AV PROD RSVP-DATA
-- Kjør dette i Supabase SQL Editor på PROD-prosjektet
-- Trygt å kjøre flere ganger (ON CONFLICT DO NOTHING)
-- ============================================================

-- Fjern testdata som ble satt inn ved uhell
DELETE FROM rsvp_guests WHERE rsvp_id IN (
  SELECT id FROM rsvps WHERE name LIKE 'Test %'
);
DELETE FROM rsvps WHERE name LIKE 'Test %';
DELETE FROM seating_guests;
DELETE FROM seating_tables;

-- ── RSVP-svar ────────────────────────────────────────────────

INSERT INTO rsvps (id, name, phone, email, response, allergies, message, created_at, updated_at, is_read, guest_count)
VALUES
  ('0a5c885d-1de9-420a-9362-17c4e393b93f', 'Amanda Maeder Sanyang', '97043428', NULL, 'yes', NULL, NULL, '2026-01-27 20:56:02.501919+00', '2026-01-27 20:56:02.501919+00', false, 2),
  ('1708d57b-5216-46f7-8d53-cb89df3cd8c7', 'Leon Thuseth-Berg', '46509450', NULL, 'yes', NULL, NULL, '2026-02-08 16:16:14.476325+00', '2026-02-08 16:16:14.476325+00', false, 1),
  ('1f2ee34f-ef5e-44e1-8472-07b5a7e45500', 'Bent Ove Andersen', '92030181', NULL, 'yes', NULL, NULL, '2026-01-23 20:00:13.429301+00', '2026-01-23 20:00:13.429301+00', false, 1),
  ('3b3ea918-3e5d-4b20-a4c3-24ec059ff8f9', 'Rachel Nordhavn', '95077650', NULL, 'no', NULL, NULL, '2026-01-19 10:00:01.337173+00', '2026-01-19 10:00:01.337173+00', false, 1),
  ('6ba32e4f-35b5-486a-8548-721cd7696118', 'Andrea Nedrebø', '45495642', NULL, 'yes', NULL, NULL, '2026-01-22 18:13:37.229065+00', '2026-01-22 18:13:37.229065+00', false, 2),
  ('9e29dade-ec81-4c91-b509-ec6c10cf14e2', 'Susanne Sannerud', '47271204', NULL, 'yes', NULL, NULL, '2025-12-23 18:54:19.9649+00', '2025-12-23 18:54:19.9649+00', false, 2),
  ('a852671f-3b10-4543-bd23-497dbd9c4525', 'Monica Berg', '47271199', NULL, 'yes', NULL, NULL, '2026-01-22 15:53:23.325364+00', '2026-01-22 15:53:23.325364+00', false, 1),
  ('b7120f8c-2f54-4f0f-9a46-8d893564f8b0', 'Frank Robert Berg', '92654131', NULL, 'yes', NULL, NULL, '2025-12-21 18:12:43.1939+00', '2025-12-21 18:12:43.1939+00', false, 2),
  ('c1725d7a-9189-4f68-b5dd-23ab036809a0', 'Christian Jomark', '99509482', NULL, 'yes', NULL, NULL, '2026-01-26 21:35:37.714023+00', '2026-01-26 21:35:37.714023+00', false, 1),
  ('c4025560-9cc6-4b23-998a-396ffc4ae08a', 'Marte Gram-Johannessen', '93053846', NULL, 'yes', NULL, NULL, '2026-01-01 19:38:53.73248+00', '2026-01-01 19:38:53.73248+00', false, 2),
  ('c812bc03-42f8-45d3-baf8-88d2ce2cdd28', 'Fredrik Skogsrud', '4793000882', NULL, 'yes', NULL, NULL, '2026-01-28 13:21:17.404059+00', '2026-01-28 13:21:17.404059+00', false, 1),
  ('dc98ef7c-9e98-4595-bc89-63ec077402dc', 'Henrik Thuseth-Berg', '40851778', NULL, 'yes', NULL, NULL, '2025-12-25 19:10:21.728168+00', '2025-12-25 19:10:21.728168+00', false, 2),
  ('e94821fa-3713-4c58-b75b-eab462e7051c', 'Alf Gunnar Ravneng', '95077650', NULL, 'yes', NULL, NULL, '2026-01-19 09:58:43.682591+00', '2026-01-19 09:58:43.682591+00', false, 3),
  ('f71013ee-b0ca-4da0-a732-cc209ddabbc5', 'Iben Thuseth-Berg', '46746239', NULL, 'yes', NULL, NULL, '2026-02-08 16:14:41.484038+00', '2026-02-08 16:14:41.484038+00', false, 1)
ON CONFLICT (id) DO NOTHING;

-- ── RSVP-gjester ─────────────────────────────────────────────

INSERT INTO rsvp_guests (id, rsvp_id, name, allergies, guest_order, created_at)
VALUES
  -- Amanda Maeder Sanyang + Petter Røsand Hernæs
  ('fcee04fc-ff98-47da-84b7-b456a6d397d0', '0a5c885d-1de9-420a-9362-17c4e393b93f', 'Amanda Maeder Sanyang', NULL, 1, '2026-01-27 20:56:03.002536+00'),
  ('c4215e5b-717f-4493-b7c0-a79417721dea', '0a5c885d-1de9-420a-9362-17c4e393b93f', 'Petter Røsand Hernæs', NULL, 2, '2026-01-27 20:56:03.002536+00'),
  -- Leon Thuseth-Berg
  ('022df262-dd91-48c4-868e-fe3096c97725', '1708d57b-5216-46f7-8d53-cb89df3cd8c7', 'Leon Thuseth-Berg', NULL, 1, '2026-02-08 16:16:14.660759+00'),
  -- Bent Ove Andersen
  ('10f8abad-9c3f-4b94-9c81-bf1cd2b7a013', '1f2ee34f-ef5e-44e1-8472-07b5a7e45500', 'Bent Ove Andersen', NULL, 1, '2026-01-23 20:00:13.846019+00'),
  -- Rachel Nordhavn
  ('3f2569d9-07ba-49b0-9d47-3a93f61196c6', '3b3ea918-3e5d-4b20-a4c3-24ec059ff8f9', 'Rachel Nordhavn', NULL, 1, '2026-01-19 10:00:01.524287+00'),
  -- Andrea Nedrebø + Nikolai Mollatt
  ('7bfa0b22-cc59-425c-8e9c-6e0d3635a8e3', '6ba32e4f-35b5-486a-8548-721cd7696118', 'Andrea Nedrebø', 'Veganer', 1, '2026-01-22 18:13:37.785061+00'),
  ('e219a7b7-786b-46e3-82a1-c3d2deee80b1', '6ba32e4f-35b5-486a-8548-721cd7696118', 'Nikolai Mollatt', 'Veganer', 2, '2026-01-22 18:13:37.785061+00'),
  -- Susanne Sannerud + Christoffer Sannerud
  ('7c9ba81d-b19d-477f-b435-c223d92f0a35', '9e29dade-ec81-4c91-b509-ec6c10cf14e2', 'Susanne Sannerud', 'Gluten', 1, '2025-12-23 18:54:20.41346+00'),
  ('fe523cc8-5545-49fd-95ae-3d533f1c46d0', '9e29dade-ec81-4c91-b509-ec6c10cf14e2', 'Christoffer Sannerud', NULL, 2, '2025-12-23 18:54:20.41346+00'),
  -- Monica Berg
  ('4053c5c4-8c24-4e99-895a-69fa8f36d0aa', 'a852671f-3b10-4543-bd23-497dbd9c4525', 'Monica Berg', 'Cøliaki', 1, '2026-01-22 15:53:23.565751+00'),
  -- Frank Robert Berg + Birgit Nygaard Berg
  ('993327c9-7103-4927-8518-5f937b6df802', 'b7120f8c-2f54-4f0f-9a46-8d893564f8b0', 'Frank Robert Berg', NULL, 1, '2025-12-21 18:12:43.41321+00'),
  ('4e911904-9d0d-4ddf-8cdb-6fa604ddd50b', 'b7120f8c-2f54-4f0f-9a46-8d893564f8b0', 'Birgit Nygaard Berg', NULL, 2, '2025-12-21 18:12:43.41321+00'),
  -- Christian Jomark
  ('c5b76770-ce66-4d0a-950d-a86e08371bb9', 'c1725d7a-9189-4f68-b5dd-23ab036809a0', 'Christian Jomark', NULL, 1, '2026-01-26 21:35:37.968341+00'),
  -- Marte Gram-Johannessen + Didrik Gram-Johannessen
  ('d1d845f2-940c-48ad-aeb0-aabffd903923', 'c4025560-9cc6-4b23-998a-396ffc4ae08a', 'Marte Gram-Johannessen', 'Vegetar eller kylling/fisk som protein. Ellers ingen allergier <3', 1, '2026-01-01 19:38:54.147359+00'),
  ('a8d398d7-5785-4309-8286-efd6b6945a60', 'c4025560-9cc6-4b23-998a-396ffc4ae08a', 'Didrik Gram-Johannessen', 'Nei', 2, '2026-01-01 19:38:54.147359+00'),
  -- Fredrik Skogsrud
  ('67ca6ffc-c08b-483a-880a-3139da814067', 'c812bc03-42f8-45d3-baf8-88d2ce2cdd28', 'Fredrik Skogsrud', 'Nei', 1, '2026-01-28 13:21:17.580603+00'),
  -- Henrik Thuseth-Berg + Solveig Thuseth-Berg
  ('aca6252c-45cc-43d3-a1b4-58e4f7a08307', 'dc98ef7c-9e98-4595-bc89-63ec077402dc', 'Henrik Thuseth-Berg', 'Ingen', 1, '2025-12-25 19:10:22.10508+00'),
  ('9b62a987-075f-4eac-81f8-b3333942c25e', 'dc98ef7c-9e98-4595-bc89-63ec077402dc', 'Solveig  Thuseth-Berg', 'Ingen', 2, '2025-12-25 19:10:22.10508+00'),
  -- Alf Gunnar Ravneng + Trine-Lise Ravneng + Jan-Vegar Ravneng
  ('79e30964-962a-4478-8e34-073ee7af4a59', 'e94821fa-3713-4c58-b75b-eab462e7051c', 'Alf Gunnar Ravneng', NULL, 1, '2026-01-19 09:58:43.908524+00'),
  ('1e1a6a3f-4b75-4569-a28a-1d998ff0ac9b', 'e94821fa-3713-4c58-b75b-eab462e7051c', 'Trine-Lise Ravneng', NULL, 2, '2026-01-19 09:58:43.908524+00'),
  ('3df01480-95ba-4e28-b794-a955c046045e', 'e94821fa-3713-4c58-b75b-eab462e7051c', 'Jan-Vegar Ravneng', NULL, 3, '2026-01-19 09:58:43.908524+00'),
  -- Iben Thuseth-Berg
  ('1926759a-cfdd-4da0-8236-4d2286b8588e', 'f71013ee-b0ca-4da0-a732-cc209ddabbc5', 'Iben Thuseth-Berg', NULL, 1, '2026-02-08 16:14:41.734942+00')
ON CONFLICT (id) DO NOTHING;

-- ── Verifisering ─────────────────────────────────────────────

SELECT 'RSVPs' as tabell, COUNT(*) as antall FROM rsvps
UNION ALL
SELECT 'RSVP-gjester', COUNT(*) FROM rsvp_guests;
