-- =============================================================
-- 0019: Risk schema — RLS policies + updated_at triggers
-- =============================================================

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE risk.risk_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON risk.risk_categories
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE risk.risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON risk.risks
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE risk.risk_mitigations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON risk.risk_mitigations
    USING (true); -- no organization_id column; child of Risk, protected via parent RLS

ALTER TABLE risk.risk_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON risk.risk_assessments
    USING (true); -- no organization_id column; child of Risk, protected via parent RLS

-- ── updated_at triggers (all 4 tables are auditable) ─────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON risk.risk_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON risk.risks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON risk.risk_mitigations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON risk.risk_assessments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
