-- =============================================================
-- 1014: Assets module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'assets.categories.create', 'assets', 'categories',  'create',   'Create asset categories'),
    (gen_random_uuid(), 'assets.categories.read',   'assets', 'categories',  'read',     'View asset categories'),
    (gen_random_uuid(), 'assets.categories.update', 'assets', 'categories',  'update',   'Update asset categories'),
    (gen_random_uuid(), 'assets.register.create',   'assets', 'register',    'create',   'Register new assets'),
    (gen_random_uuid(), 'assets.register.read',     'assets', 'register',    'read',     'View asset register'),
    (gen_random_uuid(), 'assets.register.update',   'assets', 'register',    'update',   'Update asset details'),
    (gen_random_uuid(), 'assets.disposals.create',  'assets', 'disposals',   'create',   'Initiate asset disposals'),
    (gen_random_uuid(), 'assets.disposals.read',    'assets', 'disposals',   'read',     'View asset disposals'),
    (gen_random_uuid(), 'assets.disposals.approve', 'assets', 'disposals',   'approve',  'Approve and complete asset disposals'),
    (gen_random_uuid(), 'assets.maintenance.create',   'assets', 'maintenance', 'create',   'Schedule asset maintenance'),
    (gen_random_uuid(), 'assets.maintenance.read',     'assets', 'maintenance', 'read',     'View maintenance schedules'),
    (gen_random_uuid(), 'assets.maintenance.complete', 'assets', 'maintenance', 'complete', 'Complete maintenance records'),
    (gen_random_uuid(), 'assets.stock.create',  'assets', 'stock',      'create', 'Create stock items'),
    (gen_random_uuid(), 'assets.stock.read',    'assets', 'stock',      'read',   'View stock items and movements'),
    (gen_random_uuid(), 'assets.stock.issue',   'assets', 'stock',      'issue',  'Record stock movements and issues'),
    (gen_random_uuid(), 'assets.transfers.create', 'assets', 'transfers', 'create', 'Create asset transfers'),
    (gen_random_uuid(), 'assets.transfers.read',   'assets', 'transfers', 'read',   'View asset transfer history')
ON CONFLICT DO NOTHING;
