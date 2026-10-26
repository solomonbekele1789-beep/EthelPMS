-- =============================================================
-- 0018: Tasks schema — RLS policies + updated_at triggers
-- =============================================================

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE tasks.task_boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tasks.task_boards
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE tasks.task_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tasks.task_lists
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE tasks.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tasks.tasks
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE tasks.task_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tasks.task_assignments
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE tasks.task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tasks.task_comments
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE tasks.task_approval_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tasks.task_approval_logs
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ── updated_at triggers (all 6 tables are auditable) ─────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks.task_boards
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks.task_lists
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks.tasks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks.task_assignments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks.task_comments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks.task_approval_logs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
