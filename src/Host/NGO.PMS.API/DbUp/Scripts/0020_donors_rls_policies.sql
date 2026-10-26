-- Row-Level Security for the donors schema.
-- Uses tenant_id (IMultiTenant.TenantId) mapped via snake_case convention.

ALTER TABLE donors.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors.donors FORCE ROW LEVEL SECURITY;
ALTER TABLE donors.donor_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors.donor_contacts FORCE ROW LEVEL SECURITY;
ALTER TABLE donors.grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors.grants FORCE ROW LEVEL SECURITY;
ALTER TABLE donors.grant_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors.grant_conditions FORCE ROW LEVEL SECURITY;
ALTER TABLE donors.grant_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors.grant_reports FORCE ROW LEVEL SECURITY;
ALTER TABLE donors.donor_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors.donor_communications FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'donors_tenant_isolation') THEN
    CREATE POLICY donors_tenant_isolation ON donors.donors
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'donor_contacts_tenant_isolation') THEN
    CREATE POLICY donor_contacts_tenant_isolation ON donors.donor_contacts
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'grants_tenant_isolation') THEN
    CREATE POLICY grants_tenant_isolation ON donors.grants
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'grant_conditions_tenant_isolation') THEN
    CREATE POLICY grant_conditions_tenant_isolation ON donors.grant_conditions
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'grant_reports_tenant_isolation') THEN
    CREATE POLICY grant_reports_tenant_isolation ON donors.grant_reports
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'donor_communications_tenant_isolation') THEN
    CREATE POLICY donor_communications_tenant_isolation ON donors.donor_communications
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

-- updated_at triggers

DROP TRIGGER IF EXISTS trg_donors_updated_at ON donors.donors;
CREATE TRIGGER trg_donors_updated_at
    BEFORE UPDATE ON donors.donors
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_donor_contacts_updated_at ON donors.donor_contacts;
CREATE TRIGGER trg_donor_contacts_updated_at
    BEFORE UPDATE ON donors.donor_contacts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_grants_updated_at ON donors.grants;
CREATE TRIGGER trg_grants_updated_at
    BEFORE UPDATE ON donors.grants
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_grant_conditions_updated_at ON donors.grant_conditions;
CREATE TRIGGER trg_grant_conditions_updated_at
    BEFORE UPDATE ON donors.grant_conditions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_grant_reports_updated_at ON donors.grant_reports;
CREATE TRIGGER trg_grant_reports_updated_at
    BEFORE UPDATE ON donors.grant_reports
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_donor_communications_updated_at ON donors.donor_communications;
CREATE TRIGGER trg_donor_communications_updated_at
    BEFORE UPDATE ON donors.donor_communications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
