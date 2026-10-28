-- =============================================================
-- 0013: Participants schema — RLS policies + updated_at triggers
-- =============================================================

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE participants.participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON participants.participants
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE participants.household_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON participants.household_members
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE participants.participant_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON participants.participant_enrollments
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE participants.participant_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON participants.participant_services
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE participants.graduation_benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON participants.graduation_benchmarks
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE participants.graduation_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON participants.graduation_assessments
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE participants.graduation_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON participants.graduation_decisions
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ── updated_at triggers (all 7 tables are auditable) ─────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON participants.participants
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON participants.household_members
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON participants.participant_enrollments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON participants.participant_services
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON participants.graduation_benchmarks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON participants.graduation_assessments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON participants.graduation_decisions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Trigram index for participant name search (REQ-PART-011) ──

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX ix_participants_search
    ON participants.participants USING GIN (full_name gin_trgm_ops);
