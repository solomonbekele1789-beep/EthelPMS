-- =============================================================
-- 1009: Seed additional Reporting module permissions
-- =============================================================
-- The base 6 permissions (reporting.reports.create/read/update/submit/approve/export)
-- are already seeded in 1004_seed_permissions.sql.
-- This script adds template management permissions.

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'reporting.templates.create', 'reporting', 'templates', 'create', 'Create report templates'),
    (gen_random_uuid(), 'reporting.templates.read',   'reporting', 'templates', 'read',   'View report templates'),
    (gen_random_uuid(), 'reporting.templates.update', 'reporting', 'templates', 'update', 'Edit report templates'),
    (gen_random_uuid(), 'reporting.templates.delete', 'reporting', 'templates', 'delete', 'Delete report templates'),
    (gen_random_uuid(), 'reporting.comments.create',  'reporting', 'comments',  'create', 'Add comments on reports'),
    (gen_random_uuid(), 'reporting.comments.read',    'reporting', 'comments',  'read',   'View report comments')
ON CONFLICT (code) DO NOTHING;
