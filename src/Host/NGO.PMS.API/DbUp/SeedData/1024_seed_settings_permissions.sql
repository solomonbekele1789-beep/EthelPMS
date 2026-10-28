-- =============================================================
-- 1024: Settings module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'settings.system.read',       'settings', 'system',    'read',   'View system settings'),
    (gen_random_uuid(), 'settings.system.manage',     'settings', 'system',    'manage', 'Manage system settings'),
    (gen_random_uuid(), 'settings.org.read',          'settings', 'org',       'read',   'View organization settings'),
    (gen_random_uuid(), 'settings.org.manage',        'settings', 'org',       'manage', 'Manage organization settings'),
    (gen_random_uuid(), 'settings.approvals.create',  'settings', 'approvals', 'create', 'Create approval configurations'),
    (gen_random_uuid(), 'settings.approvals.read',    'settings', 'approvals', 'read',   'View approval configurations'),
    (gen_random_uuid(), 'settings.approvals.update',  'settings', 'approvals', 'update', 'Update approval configurations'),
    (gen_random_uuid(), 'settings.alerts.manage',     'settings', 'alerts',    'manage', 'Manage alert thresholds')
ON CONFLICT DO NOTHING;
