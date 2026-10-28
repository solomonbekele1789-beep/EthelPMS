-- =============================================================
-- 0029: Reports (reports schema) — RLS policies + updated_at triggers
-- =============================================================

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE reports.report_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON reports.report_templates
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE reports.report_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON reports.report_schedules
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE reports.generated_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON reports.generated_reports
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ── updated_at triggers ──────────────────────────────────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON reports.report_templates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON reports.report_schedules
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON reports.generated_reports
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
