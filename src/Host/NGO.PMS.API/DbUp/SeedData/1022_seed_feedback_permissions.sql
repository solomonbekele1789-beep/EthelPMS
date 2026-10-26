-- =============================================================
-- 1022: Feedback / GRM module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'feedback.categories.create',  'feedback', 'categories',   'create',  'Create feedback categories'),
    (gen_random_uuid(), 'feedback.categories.read',    'feedback', 'categories',   'read',    'View feedback categories'),
    (gen_random_uuid(), 'feedback.categories.update',  'feedback', 'categories',   'update',  'Update feedback categories'),
    (gen_random_uuid(), 'feedback.items.read',         'feedback', 'items',         'read',    'View feedback items'),
    (gen_random_uuid(), 'feedback.items.manage',       'feedback', 'items',         'manage',  'Acknowledge, assign, escalate, and resolve feedback'),
    (gen_random_uuid(), 'feedback.items.respond',      'feedback', 'items',         'respond', 'Add responses to feedback items'),
    (gen_random_uuid(), 'feedback.confidential.read',  'feedback', 'confidential', 'read',    'View confidential/safeguarding feedback'),
    (gen_random_uuid(), 'feedback.dashboard.read',     'feedback', 'dashboard',    'read',    'View feedback dashboard and analytics')
ON CONFLICT DO NOTHING;
