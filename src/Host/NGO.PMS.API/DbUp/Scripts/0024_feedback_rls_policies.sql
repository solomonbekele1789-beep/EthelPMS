-- Row-Level Security for the content schema (Feedback module).
-- Uses tenant_id (IMultiTenant.TenantId) mapped via snake_case convention.

ALTER TABLE content.feedback_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.feedback_categories FORCE ROW LEVEL SECURITY;
ALTER TABLE content.feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.feedback_items FORCE ROW LEVEL SECURITY;
ALTER TABLE content.feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.feedback_responses FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'feedback_categories_tenant_isolation') THEN
    CREATE POLICY feedback_categories_tenant_isolation ON content.feedback_categories
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'feedback_items_tenant_isolation') THEN
    CREATE POLICY feedback_items_tenant_isolation ON content.feedback_items
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'feedback_responses_tenant_isolation') THEN
    CREATE POLICY feedback_responses_tenant_isolation ON content.feedback_responses
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

-- updated_at triggers

DROP TRIGGER IF EXISTS trg_feedback_categories_updated_at ON content.feedback_categories;
CREATE TRIGGER trg_feedback_categories_updated_at
    BEFORE UPDATE ON content.feedback_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_feedback_items_updated_at ON content.feedback_items;
CREATE TRIGGER trg_feedback_items_updated_at
    BEFORE UPDATE ON content.feedback_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_feedback_responses_updated_at ON content.feedback_responses;
CREATE TRIGGER trg_feedback_responses_updated_at
    BEFORE UPDATE ON content.feedback_responses
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
