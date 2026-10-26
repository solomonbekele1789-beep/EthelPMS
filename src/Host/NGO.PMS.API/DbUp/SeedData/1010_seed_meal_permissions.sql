-- =============================================================
-- 1010: Additional MEAL module permissions
-- Base MEAL permissions (meal.plans.create/read/update,
-- meal.evaluations.create/read) already in 1004.
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'meal.evaluations.update',  'meal', 'evaluations', 'update', 'Edit evaluations'),
    (gen_random_uuid(), 'meal.indicators.record',   'meal', 'indicators',  'record', 'Record indicator measurements'),
    (gen_random_uuid(), 'meal.gesi.create',         'meal', 'gesi',        'create', 'Create GESI assessments'),
    (gen_random_uuid(), 'meal.gesi.read',           'meal', 'gesi',        'read',   'View GESI assessments'),
    (gen_random_uuid(), 'meal.lessons.create',      'meal', 'lessons',     'create', 'Create lessons learned'),
    (gen_random_uuid(), 'meal.lessons.read',        'meal', 'lessons',     'read',   'View lessons learned'),
    (gen_random_uuid(), 'meal.findings.verify',     'meal', 'findings',    'verify', 'Verify evaluation findings')
ON CONFLICT DO NOTHING;
