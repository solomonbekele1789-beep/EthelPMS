-- =============================================================
-- 1017: Risk module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'risk.categories.create',    'risk', 'categories',  'create',   'Create risk categories'),
    (gen_random_uuid(), 'risk.categories.read',      'risk', 'categories',  'read',     'View risk categories'),
    (gen_random_uuid(), 'risk.register.create',      'risk', 'register',    'create',   'Identify and create risks'),
    (gen_random_uuid(), 'risk.register.read',        'risk', 'register',    'read',     'View risk register'),
    (gen_random_uuid(), 'risk.register.update',      'risk', 'register',    'update',   'Reassess and resolve risks'),
    (gen_random_uuid(), 'risk.mitigations.create',   'risk', 'mitigations', 'create',   'Create risk mitigation actions'),
    (gen_random_uuid(), 'risk.mitigations.complete', 'risk', 'mitigations', 'complete', 'Complete risk mitigations'),
    (gen_random_uuid(), 'risk.assessments.create',   'risk', 'assessments', 'create',   'Record risk assessments'),
    (gen_random_uuid(), 'risk.matrix.read',          'risk', 'matrix',      'read',     'View risk matrix and reports')
ON CONFLICT DO NOTHING;
