-- Shared trigger function: auto-set updated_at on UPDATE.
-- Applied to every auditable table via per-table triggers in RLS scripts.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function for RLS policies to safely read the current tenant UUID
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
DECLARE
    val TEXT;
BEGIN
    val := current_setting('app.current_org_id', true);
    IF val IS NULL OR val = '' THEN
        RETURN NULL;
    END IF;
    RETURN val::UUID;
EXCEPTION WHEN invalid_text_representation THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;
