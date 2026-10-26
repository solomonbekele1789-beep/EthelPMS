-- Shared trigger function: auto-set updated_at on UPDATE.
-- Applied to every auditable table via per-table triggers in RLS scripts.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
