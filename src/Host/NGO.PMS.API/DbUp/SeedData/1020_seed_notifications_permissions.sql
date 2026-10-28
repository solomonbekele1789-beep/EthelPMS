-- =============================================================
-- 1020: Notifications module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'notifications.read',             'notifications', 'read',        'read',   'View own notifications'),
    (gen_random_uuid(), 'notifications.manage',           'notifications', 'manage',      'manage', 'Mark notifications as read'),
    (gen_random_uuid(), 'notifications.templates.create', 'notifications', 'templates',   'create', 'Create notification templates'),
    (gen_random_uuid(), 'notifications.templates.read',   'notifications', 'templates',   'read',   'View notification templates'),
    (gen_random_uuid(), 'notifications.templates.update', 'notifications', 'templates',   'update', 'Update notification templates'),
    (gen_random_uuid(), 'notifications.preferences.manage','notifications', 'preferences', 'manage', 'Manage own notification preferences')
ON CONFLICT DO NOTHING;
