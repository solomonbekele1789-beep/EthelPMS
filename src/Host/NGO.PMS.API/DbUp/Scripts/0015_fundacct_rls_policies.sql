-- =============================================================
-- 0015: FundAccounting schema — RLS policies + updated_at triggers
-- =============================================================

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE fundacct.account_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON fundacct.account_categories
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE fundacct.chart_of_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON fundacct.chart_of_accounts
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE fundacct.fund_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON fundacct.fund_codes
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE fundacct.fund_restrictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON fundacct.fund_restrictions
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE fundacct.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON fundacct.journal_entries
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE fundacct.journal_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON fundacct.journal_lines
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE fundacct.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON fundacct.budgets
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE fundacct.budget_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON fundacct.budget_lines
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE fundacct.budget_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON fundacct.budget_revisions
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ── updated_at triggers (all 9 tables are auditable) ─────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fundacct.account_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fundacct.chart_of_accounts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fundacct.fund_codes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fundacct.fund_restrictions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fundacct.journal_entries
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fundacct.journal_lines
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fundacct.budgets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fundacct.budget_lines
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON fundacct.budget_revisions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
