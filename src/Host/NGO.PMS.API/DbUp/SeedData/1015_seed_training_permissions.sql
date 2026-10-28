-- =============================================================
-- 1015: Training module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'training.programs.create',  'training', 'programs',    'create',   'Create training programs'),
    (gen_random_uuid(), 'training.programs.read',    'training', 'programs',    'read',     'View training programs'),
    (gen_random_uuid(), 'training.programs.update',  'training', 'programs',    'update',   'Update training programs'),
    (gen_random_uuid(), 'training.sessions.create',  'training', 'sessions',    'create',   'Create training sessions'),
    (gen_random_uuid(), 'training.sessions.read',    'training', 'sessions',    'read',     'View training sessions'),
    (gen_random_uuid(), 'training.sessions.complete','training', 'sessions',    'complete', 'Complete training sessions'),
    (gen_random_uuid(), 'training.attendance.create', 'training', 'attendance', 'create',   'Register participants and record attendance'),
    (gen_random_uuid(), 'training.attendance.read',   'training', 'attendance', 'read',     'View attendance records'),
    (gen_random_uuid(), 'training.trainers.create',  'training', 'trainers',    'create',   'Create and manage trainers'),
    (gen_random_uuid(), 'training.trainers.read',    'training', 'trainers',    'read',     'View trainers'),
    (gen_random_uuid(), 'training.materials.create', 'training', 'materials',   'create',   'Add training materials'),
    (gen_random_uuid(), 'training.evaluations.create','training', 'evaluations', 'create',  'Create training evaluations')
ON CONFLICT DO NOTHING;
