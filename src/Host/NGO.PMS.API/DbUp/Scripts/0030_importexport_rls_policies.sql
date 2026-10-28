-- =============================================================
-- 0030: Import/Export (importexport schema) — RLS policies + updated_at triggers
-- =============================================================

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE importexport.import_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON importexport.import_templates
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE importexport.import_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON importexport.import_jobs
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE importexport.export_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON importexport.export_jobs
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE importexport.data_sync_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON importexport.data_sync_configs
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ── updated_at triggers ──────────────────────────────────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON importexport.import_templates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON importexport.import_jobs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON importexport.export_jobs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON importexport.data_sync_configs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
