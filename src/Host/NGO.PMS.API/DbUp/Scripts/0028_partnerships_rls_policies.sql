-- =============================================================
-- 0028: Partnerships (partnerships schema) — RLS policies + updated_at triggers
-- =============================================================

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE partnerships.sub_grantees ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON partnerships.sub_grantees
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE partnerships.disbursements ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON partnerships.disbursements
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE partnerships.partner_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON partnerships.partner_reports
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE partnerships.partner_compliance ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON partnerships.partner_compliance
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ── updated_at triggers ──────────────────────────────────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON partnerships.sub_grantees
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON partnerships.disbursements
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON partnerships.partner_reports
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON partnerships.partner_compliance
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
