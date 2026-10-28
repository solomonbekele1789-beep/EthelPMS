-- Seed currencies commonly used by Ethiopian NGOs.
-- ON CONFLICT DO NOTHING makes this idempotent.

INSERT INTO reference.currencies (code, name, symbol, decimal_places, is_active)
VALUES
    ('ETB', 'Ethiopian Birr', 'Br', 2, true),
    ('USD', 'US Dollar', '$', 2, true),
    ('EUR', 'Euro', '€', 2, true),
    ('GBP', 'British Pound', '£', 2, true),
    ('CHF', 'Swiss Franc', 'CHF', 2, true),
    ('SEK', 'Swedish Krona', 'kr', 2, true),
    ('NOK', 'Norwegian Krone', 'kr', 2, true),
    ('DKK', 'Danish Krone', 'kr', 2, true),
    ('CAD', 'Canadian Dollar', 'CA$', 2, true),
    ('AUD', 'Australian Dollar', 'A$', 2, true),
    ('JPY', 'Japanese Yen', '¥', 0, true),
    ('CNY', 'Chinese Yuan', '¥', 2, true),
    ('KES', 'Kenyan Shilling', 'KSh', 2, true),
    ('UGX', 'Ugandan Shilling', 'USh', 0, true),
    ('TZS', 'Tanzanian Shilling', 'TSh', 2, true),
    ('ZAR', 'South African Rand', 'R', 2, true),
    ('NGN', 'Nigerian Naira', '₦', 2, true),
    ('GHS', 'Ghanaian Cedi', 'GH₵', 2, true),
    ('SDG', 'Sudanese Pound', 'SDG', 2, true),
    ('SSP', 'South Sudanese Pound', 'SSP', 2, true)
ON CONFLICT (code) DO NOTHING;
