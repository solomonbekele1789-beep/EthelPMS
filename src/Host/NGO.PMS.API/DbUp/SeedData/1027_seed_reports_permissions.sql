-- =============================================================
-- 1027: Reports module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'reports.templates.create',  'reports', 'templates', 'create', 'Create report templates'),
    (gen_random_uuid(), 'reports.templates.read',    'reports', 'templates', 'read',   'View report templates'),
    (gen_random_uuid(), 'reports.templates.update',  'reports', 'templates', 'update', 'Update report templates'),
    (gen_random_uuid(), 'reports.templates.delete',  'reports', 'templates', 'delete', 'Delete report templates'),
    (gen_random_uuid(), 'reports.schedules.create',  'reports', 'schedules', 'create', 'Create report schedules'),
    (gen_random_uuid(), 'reports.schedules.read',    'reports', 'schedules', 'read',   'View report schedules'),
    (gen_random_uuid(), 'reports.schedules.manage',  'reports', 'schedules', 'manage', 'Manage report schedules'),
    (gen_random_uuid(), 'reports.generated.read',    'reports', 'generated', 'read',   'View generated reports')
ON CONFLICT DO NOTHING;
