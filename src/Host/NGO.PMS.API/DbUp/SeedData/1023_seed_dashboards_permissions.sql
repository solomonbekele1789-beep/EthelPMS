-- =============================================================
-- 1023: Dashboards module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'dashboards.configs.create',  'dashboards', 'configs',  'create', 'Create dashboard configurations'),
    (gen_random_uuid(), 'dashboards.configs.read',    'dashboards', 'configs',  'read',   'View dashboard configurations'),
    (gen_random_uuid(), 'dashboards.configs.update',  'dashboards', 'configs',  'update', 'Update dashboard configurations'),
    (gen_random_uuid(), 'dashboards.configs.delete',  'dashboards', 'configs',  'delete', 'Delete dashboard configurations'),
    (gen_random_uuid(), 'dashboards.widgets.manage',  'dashboards', 'widgets',  'manage', 'Manage dashboard widgets'),
    (gen_random_uuid(), 'dashboards.filters.create',  'dashboards', 'filters',  'create', 'Create saved filters'),
    (gen_random_uuid(), 'dashboards.filters.read',    'dashboards', 'filters',  'read',   'View saved filters'),
    (gen_random_uuid(), 'dashboards.filters.delete',  'dashboards', 'filters',  'delete', 'Delete saved filters')
ON CONFLICT DO NOTHING;
