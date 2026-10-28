-- Seed Ethiopian federal regions and city administrations.
-- Based on the current administrative structure of Ethiopia.

INSERT INTO reference.regions (id, name, code, country_code, is_active)
VALUES
    ('a0000000-0000-4000-8000-000000000001', 'Addis Ababa', 'ET-AA', 'ETH', true),
    ('a0000000-0000-4000-8000-000000000002', 'Afar', 'ET-AF', 'ETH', true),
    ('a0000000-0000-4000-8000-000000000003', 'Amhara', 'ET-AM', 'ETH', true),
    ('a0000000-0000-4000-8000-000000000004', 'Benishangul-Gumuz', 'ET-BE', 'ETH', true),
    ('a0000000-0000-4000-8000-000000000005', 'Central Ethiopia', 'ET-CE', 'ETH', true),
    ('a0000000-0000-4000-8000-000000000006', 'Dire Dawa', 'ET-DD', 'ETH', true),
    ('a0000000-0000-4000-8000-000000000007', 'Gambela', 'ET-GA', 'ETH', true),
    ('a0000000-0000-4000-8000-000000000008', 'Harari', 'ET-HA', 'ETH', true),
    ('a0000000-0000-4000-8000-000000000009', 'Oromia', 'ET-OR', 'ETH', true),
    ('a0000000-0000-4000-8000-000000000010', 'Sidama', 'ET-SI', 'ETH', true),
    ('a0000000-0000-4000-8000-000000000011', 'Somali', 'ET-SO', 'ETH', true),
    ('a0000000-0000-4000-8000-000000000012', 'South Ethiopia', 'ET-SE', 'ETH', true),
    ('a0000000-0000-4000-8000-000000000013', 'South West Ethiopia Peoples', 'ET-SW', 'ETH', true),
    ('a0000000-0000-4000-8000-000000000014', 'Tigray', 'ET-TI', 'ETH', true)
ON CONFLICT (code) DO NOTHING;
