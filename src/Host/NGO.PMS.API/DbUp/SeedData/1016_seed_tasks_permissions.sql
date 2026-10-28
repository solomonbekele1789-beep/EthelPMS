-- =============================================================
-- 1016: Tasks module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'tasks.boards.create',     'tasks', 'boards',   'create', 'Create task boards'),
    (gen_random_uuid(), 'tasks.boards.read',       'tasks', 'boards',   'read',   'View task boards'),
    (gen_random_uuid(), 'tasks.lists.create',      'tasks', 'lists',    'create', 'Create task lists'),
    (gen_random_uuid(), 'tasks.items.create',      'tasks', 'items',    'create', 'Create tasks'),
    (gen_random_uuid(), 'tasks.items.read',        'tasks', 'items',    'read',   'View tasks'),
    (gen_random_uuid(), 'tasks.items.update',      'tasks', 'items',    'update', 'Update task details and status'),
    (gen_random_uuid(), 'tasks.items.assign',      'tasks', 'items',    'assign', 'Assign tasks to team members'),
    (gen_random_uuid(), 'tasks.items.approve',     'tasks', 'items',    'approve','Approve or reject tasks'),
    (gen_random_uuid(), 'tasks.comments.create',   'tasks', 'comments', 'create', 'Add comments to tasks'),
    (gen_random_uuid(), 'tasks.comments.read',     'tasks', 'comments', 'read',   'View task comments')
ON CONFLICT DO NOTHING;
