-- Row-Level Security for the content schema (Documents module).
-- Uses tenant_id (IMultiTenant.TenantId) mapped via snake_case convention.

ALTER TABLE content.document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.document_folders FORCE ROW LEVEL SECURITY;
ALTER TABLE content.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.documents FORCE ROW LEVEL SECURITY;
ALTER TABLE content.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.document_versions FORCE ROW LEVEL SECURITY;
ALTER TABLE content.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.document_comments FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'document_folders_tenant_isolation') THEN
    CREATE POLICY document_folders_tenant_isolation ON content.document_folders
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'documents_tenant_isolation') THEN
    CREATE POLICY documents_tenant_isolation ON content.documents
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'document_versions_tenant_isolation') THEN
    CREATE POLICY document_versions_tenant_isolation ON content.document_versions
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'document_comments_tenant_isolation') THEN
    CREATE POLICY document_comments_tenant_isolation ON content.document_comments
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

-- updated_at triggers

DROP TRIGGER IF EXISTS trg_document_folders_updated_at ON content.document_folders;
CREATE TRIGGER trg_document_folders_updated_at
    BEFORE UPDATE ON content.document_folders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_documents_updated_at ON content.documents;
CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON content.documents
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_document_versions_updated_at ON content.document_versions;
CREATE TRIGGER trg_document_versions_updated_at
    BEFORE UPDATE ON content.document_versions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_document_comments_updated_at ON content.document_comments;
CREATE TRIGGER trg_document_comments_updated_at
    BEFORE UPDATE ON content.document_comments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
