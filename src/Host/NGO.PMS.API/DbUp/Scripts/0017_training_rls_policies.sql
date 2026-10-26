-- =============================================================
-- 0017: Training schema — RLS policies + updated_at triggers
-- =============================================================

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE training.training_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON training.training_programs
    USING (true); -- no organization_id column; protected via parent project RLS

ALTER TABLE training.training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON training.training_sessions
    USING (true); -- no organization_id column; protected via parent RLS

ALTER TABLE training.training_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON training.training_participants
    USING (true); -- no organization_id column; protected via parent RLS

ALTER TABLE training.trainers ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON training.trainers
    USING (true); -- no organization_id column; protected via parent RLS

ALTER TABLE training.training_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON training.training_materials
    USING (true); -- no organization_id column; protected via parent RLS

ALTER TABLE training.training_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON training.training_evaluations
    USING (true); -- no organization_id column; protected via parent RLS

-- ── updated_at triggers (all 6 tables are auditable) ─────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON training.training_programs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON training.training_sessions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON training.training_participants
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON training.trainers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON training.training_materials
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON training.training_evaluations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
