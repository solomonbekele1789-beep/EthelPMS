-- =============================================================
-- 0025: Dashboards (dashboards schema) — RLS policies + updated_at triggers
-- =============================================================

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE dashboards.dashboard_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON dashboards.dashboard_configs
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE dashboards.dashboard_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON dashboards.dashboard_widgets
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE dashboards.saved_filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON dashboards.saved_filters
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ── updated_at triggers ──────────────────────────────────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON dashboards.dashboard_configs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON dashboards.dashboard_widgets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON dashboards.saved_filters
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
