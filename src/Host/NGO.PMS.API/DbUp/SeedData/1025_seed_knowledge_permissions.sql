-- =============================================================
-- 1025: Knowledge Base module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'knowledge.categories.create', 'knowledge', 'categories', 'create', 'Create knowledge base categories'),
    (gen_random_uuid(), 'knowledge.categories.read',   'knowledge', 'categories', 'read',   'View knowledge base categories'),
    (gen_random_uuid(), 'knowledge.categories.update', 'knowledge', 'categories', 'update', 'Update knowledge base categories'),
    (gen_random_uuid(), 'knowledge.categories.delete', 'knowledge', 'categories', 'delete', 'Delete knowledge base categories'),
    (gen_random_uuid(), 'knowledge.articles.create',   'knowledge', 'articles',   'create', 'Create knowledge base articles'),
    (gen_random_uuid(), 'knowledge.articles.read',     'knowledge', 'articles',   'read',   'View knowledge base articles'),
    (gen_random_uuid(), 'knowledge.articles.update',   'knowledge', 'articles',   'update', 'Update knowledge base articles'),
    (gen_random_uuid(), 'knowledge.articles.delete',   'knowledge', 'articles',   'delete', 'Delete knowledge base articles')
ON CONFLICT DO NOTHING;
