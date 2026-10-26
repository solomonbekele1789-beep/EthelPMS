-- Seed additional permissions for Phase 3 — Planning module controllers.
-- ON CONFLICT DO NOTHING makes this idempotent.

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    -- Planning (additional to 1004_seed_permissions.sql)
    (gen_random_uuid(), 'planning.plans.create',       'planning', 'plans',      'create',  'Create plan entries'),
    (gen_random_uuid(), 'planning.plans.read',         'planning', 'plans',      'read',    'View plan entries'),
    (gen_random_uuid(), 'planning.plans.update',       'planning', 'plans',      'update',  'Edit plan entries'),
    (gen_random_uuid(), 'planning.plans.approve',      'planning', 'plans',      'approve', 'Approve/reject plans'),
    (gen_random_uuid(), 'planning.config.read',        'planning', 'config',     'read',    'View planning configuration'),
    (gen_random_uuid(), 'planning.config.update',      'planning', 'config',     'update',  'Edit planning configuration'),

    -- DIP (additional to 1004_seed_permissions.sql)
    (gen_random_uuid(), 'dip.items.create',            'dip', 'items',           'create',  'Create DIP items'),
    (gen_random_uuid(), 'dip.items.read',              'dip', 'items',           'read',    'View DIP items'),
    (gen_random_uuid(), 'dip.items.update',            'dip', 'items',           'update',  'Edit DIP items'),
    (gen_random_uuid(), 'dip.milestones.create',       'dip', 'milestones',     'create',  'Create DIP milestones'),
    (gen_random_uuid(), 'dip.milestones.update',       'dip', 'milestones',     'update',  'Edit DIP milestones')
ON CONFLICT (code) DO NOTHING;
