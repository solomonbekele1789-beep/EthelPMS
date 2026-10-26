-- Seed additional permissions for Phase 2 — Projects module controllers.
-- These complement the initial 1004_seed_permissions.sql (which used 'results.*' prefix).
-- Controllers use 'projects.*' prefix for all results framework entities since they
-- are part of the Projects module.
-- ON CONFLICT DO NOTHING makes this idempotent.

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    -- Projects — additional actions
    (gen_random_uuid(), 'projects.projects.submit',             'projects', 'projects',          'submit',  'Submit projects for approval'),
    (gen_random_uuid(), 'projects.projects.manage',             'projects', 'projects',          'manage',  'Manage project teams and settings'),

    -- Outcomes (under projects module)
    (gen_random_uuid(), 'projects.outcomes.create',             'projects', 'outcomes',          'create',  'Create outcomes in results framework'),
    (gen_random_uuid(), 'projects.outcomes.read',               'projects', 'outcomes',          'read',    'View outcomes in results framework'),
    (gen_random_uuid(), 'projects.outcomes.update',             'projects', 'outcomes',          'update',  'Edit outcomes in results framework'),

    -- Outputs
    (gen_random_uuid(), 'projects.outputs.create',              'projects', 'outputs',           'create',  'Create outputs under outcomes'),
    (gen_random_uuid(), 'projects.outputs.update',              'projects', 'outputs',           'update',  'Edit outputs under outcomes'),

    -- Activities
    (gen_random_uuid(), 'projects.activities.create',           'projects', 'activities',        'create',  'Create activities under outputs'),
    (gen_random_uuid(), 'projects.activities.update',           'projects', 'activities',        'update',  'Edit activities under outputs'),

    -- Indicators
    (gen_random_uuid(), 'projects.indicators.create',           'projects', 'indicators',        'create',  'Create indicators on outcomes/outputs'),
    (gen_random_uuid(), 'projects.indicators.update',           'projects', 'indicators',        'update',  'Edit indicators on outcomes/outputs'),

    -- Intervention Areas
    (gen_random_uuid(), 'projects.interventionareas.create',    'projects', 'interventionareas', 'create',  'Create intervention areas'),
    (gen_random_uuid(), 'projects.interventionareas.read',      'projects', 'interventionareas', 'read',    'View intervention areas'),
    (gen_random_uuid(), 'projects.interventionareas.update',    'projects', 'interventionareas', 'update',  'Edit intervention areas'),
    (gen_random_uuid(), 'projects.interventionareas.manage',    'projects', 'interventionareas', 'manage',  'Allocate projects to intervention areas')
ON CONFLICT (code) DO NOTHING;
