-- =============================================================
-- 0016: Assets schema — RLS policies + updated_at triggers
-- =============================================================

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE assets.asset_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON assets.asset_categories
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE assets.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON assets.assets
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE assets.asset_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON assets.asset_assignments
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE assets.asset_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON assets.asset_transfers
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE assets.asset_disposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON assets.asset_disposals
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE assets.asset_maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON assets.asset_maintenance
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE assets.stock_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON assets.stock_items
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE assets.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON assets.stock_movements
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ── updated_at triggers (all 8 tables are auditable) ─────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON assets.asset_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON assets.assets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON assets.asset_assignments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON assets.asset_transfers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON assets.asset_disposals
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON assets.asset_maintenance
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON assets.stock_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON assets.stock_movements
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
