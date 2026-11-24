-- Seed Ethiopian administrative hierarchy (Regions, Zones, Woredas) into identity.locations
-- Level enum: Region = 0, Zone = 1, Woreda = 2, Kebele = 3

INSERT INTO identity.locations (id, name, name_am, code, level, parent_id)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Addis Ababa', 'አዲስ አበባ', 'ET-AA', 'Region', NULL),
  ('10000000-0000-0000-0000-000000000002', 'Oromia', 'ኦሮሚያ', 'ET-OR', 'Region', NULL),
  ('10000000-0000-0000-0000-000000000003', 'Amhara', 'አማራ', 'ET-AM', 'Region', NULL),
  ('10000000-0000-0000-0000-000000000004', 'Tigray', 'ትግራይ', 'ET-TI', 'Region', NULL),
  ('10000000-0000-0000-0000-000000000005', 'Somali', 'ሶማሌ', 'ET-SO', 'Region', NULL),
  ('10000000-0000-0000-0000-000000000006', 'Sidama', 'ሲዳማ', 'ET-SI', 'Region', NULL),
  ('10000000-0000-0000-0000-000000000007', 'Afar', 'አፋር', 'ET-AF', 'Region', NULL),
  ('10000000-0000-0000-0000-000000000008', 'Dire Dawa', 'ድሬዳዋ', 'ET-DD', 'Region', NULL),
  -- Zones / Sub-Cities
  ('20000000-0000-0000-0000-000000000001', 'Bole Sub-City', 'ቦሌ ክፍለ ከተማ', 'ET-AA-BL', 'Zone', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'Yeka Sub-City', 'የካ ክፍለ ከተማ', 'ET-AA-YK', 'Zone', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', 'East Shewa Zone', 'ምስራቅ ሸዋ ዞን', 'ET-OR-ES', 'Zone', '10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000004', 'North Gondar Zone', 'ሰሜን ጎንደር ዞን', 'ET-AM-NG', 'Zone', '10000000-0000-0000-0000-000000000003'),
  -- Woredas
  ('30000000-0000-0000-0000-000000000001', 'Bole Woreda 03', 'ቦሌ ወረዳ 03', 'ET-AA-BL-03', 'Woreda', '20000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', 'Adama Woreda', 'አዳማ ወረዳ', 'ET-OR-ES-AD', 'Woreda', '20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000003', 'Gondar Zuria', 'ጎንደር ዙሪያ', 'ET-AM-NG-GZ', 'Woreda', '20000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO NOTHING;
