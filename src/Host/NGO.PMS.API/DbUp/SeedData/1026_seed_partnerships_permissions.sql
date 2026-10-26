-- =============================================================
-- 1026: Partnerships module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'partnerships.subgrantees.create',   'partnerships', 'subgrantees',   'create',  'Create sub-grantees'),
    (gen_random_uuid(), 'partnerships.subgrantees.read',     'partnerships', 'subgrantees',   'read',    'View sub-grantees'),
    (gen_random_uuid(), 'partnerships.subgrantees.update',   'partnerships', 'subgrantees',   'update',  'Update sub-grantees'),
    (gen_random_uuid(), 'partnerships.subgrantees.manage',   'partnerships', 'subgrantees',   'manage',  'Manage sub-grantees'),
    (gen_random_uuid(), 'partnerships.disbursements.create', 'partnerships', 'disbursements', 'create',  'Create disbursements'),
    (gen_random_uuid(), 'partnerships.disbursements.read',   'partnerships', 'disbursements', 'read',    'View disbursements'),
    (gen_random_uuid(), 'partnerships.disbursements.approve','partnerships', 'disbursements', 'approve', 'Approve disbursements'),
    (gen_random_uuid(), 'partnerships.reports.create',       'partnerships', 'reports',       'create',  'Create partner reports'),
    (gen_random_uuid(), 'partnerships.reports.read',         'partnerships', 'reports',       'read',    'View partner reports'),
    (gen_random_uuid(), 'partnerships.reports.review',       'partnerships', 'reports',       'review',  'Review partner reports'),
    (gen_random_uuid(), 'partnerships.compliance.create',    'partnerships', 'compliance',    'create',  'Create partner compliance records'),
    (gen_random_uuid(), 'partnerships.compliance.read',      'partnerships', 'compliance',    'read',    'View partner compliance records')
ON CONFLICT DO NOTHING;
