-- =============================================================
-- 0026: Settings (dashboards schema) — RLS policies + updated_at triggers
-- =============================================================
-- NOTE: dashboards.system_settings does NOT get RLS (platform-level, no org_id)

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE dashboards.org_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON dashboards.org_settings
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE dashboards.approval_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON dashboards.approval_configs
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE dashboards.alert_thresholds ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON dashboards.alert_thresholds
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ── updated_at triggers ──────────────────────────────────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON dashboards.org_settings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON dashboards.approval_configs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON dashboards.alert_thresholds
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
