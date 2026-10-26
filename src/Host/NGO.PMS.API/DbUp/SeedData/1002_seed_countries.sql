-- Seed countries commonly relevant to Ethiopian NGO operations.
-- Includes Ethiopia + neighboring countries + major donor countries.

INSERT INTO reference.countries (code, name, is_active)
VALUES
    ('ETH', 'Ethiopia', true),
    ('KEN', 'Kenya', true),
    ('SOM', 'Somalia', true),
    ('ERI', 'Eritrea', true),
    ('DJI', 'Djibouti', true),
    ('SDN', 'Sudan', true),
    ('SSD', 'South Sudan', true),
    ('UGA', 'Uganda', true),
    ('TZA', 'Tanzania', true),
    ('RWA', 'Rwanda', true),
    ('USA', 'United States', true),
    ('GBR', 'United Kingdom', true),
    ('DEU', 'Germany', true),
    ('FRA', 'France', true),
    ('NLD', 'Netherlands', true),
    ('SWE', 'Sweden', true),
    ('NOR', 'Norway', true),
    ('DNK', 'Denmark', true),
    ('CHE', 'Switzerland', true),
    ('CAN', 'Canada', true),
    ('AUS', 'Australia', true),
    ('JPN', 'Japan', true),
    ('CHN', 'China', true),
    ('IND', 'India', true),
    ('ZAF', 'South Africa', true),
    ('NGA', 'Nigeria', true),
    ('GHA', 'Ghana', true),
    ('ITA', 'Italy', true),
    ('ESP', 'Spain', true),
    ('IRL', 'Ireland', true)
ON CONFLICT (code) DO NOTHING;
