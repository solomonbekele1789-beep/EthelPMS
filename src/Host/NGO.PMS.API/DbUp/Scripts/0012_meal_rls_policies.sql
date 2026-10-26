-- =============================================================
-- 0012: MEAL schema — RLS policies + updated_at triggers
-- =============================================================

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE meal.meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON meal.meal_plans
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE meal.meal_indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON meal.meal_indicators
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE meal.indicator_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON meal.indicator_measurements
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE meal.evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON meal.evaluations
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE meal.evaluation_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON meal.evaluation_findings
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE meal.gesi_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON meal.gesi_assessments
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE meal.lessons_learned ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON meal.lessons_learned
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ── updated_at triggers (all 7 tables are auditable) ─────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON meal.meal_plans
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON meal.meal_indicators
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON meal.indicator_measurements
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON meal.evaluations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON meal.evaluation_findings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON meal.gesi_assessments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON meal.lessons_learned
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
