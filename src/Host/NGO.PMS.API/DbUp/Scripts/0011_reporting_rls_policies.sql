-- =============================================================
-- 0011: Reporting schema — RLS policies + updated_at triggers
-- =============================================================

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE reporting.report_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON reporting.report_templates
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE reporting.report_template_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON reporting.report_template_sections
    USING (report_template_id IN (
        SELECT id FROM reporting.report_templates
        WHERE organization_id = current_setting('app.current_org_id')::uuid));

ALTER TABLE reporting.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON reporting.reports
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE reporting.report_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON reporting.report_sections
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE reporting.report_data_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON reporting.report_data_entries
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE reporting.report_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON reporting.report_approvals
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE reporting.report_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON reporting.report_comments
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ── updated_at triggers (auditable tables only) ─────────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON reporting.report_templates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON reporting.reports
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON reporting.report_sections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON reporting.report_comments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
