-- =============================================================
-- 0027: Knowledge Base (dashboards schema) — RLS policies + updated_at triggers
-- =============================================================

-- ── RLS Policies ─────────────────────────────────────────────

ALTER TABLE dashboards.kb_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON dashboards.kb_categories
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE dashboards.kb_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON dashboards.kb_articles
    USING (organization_id = current_setting('app.current_org_id')::uuid);

ALTER TABLE dashboards.kb_article_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON dashboards.kb_article_comments
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- ── updated_at triggers ──────────────────────────────────────

CREATE TRIGGER set_updated_at BEFORE UPDATE ON dashboards.kb_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON dashboards.kb_articles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON dashboards.kb_article_comments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
