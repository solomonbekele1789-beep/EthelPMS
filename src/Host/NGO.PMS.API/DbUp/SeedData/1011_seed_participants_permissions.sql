-- =============================================================
-- 1011: Additional Participants module permissions
-- Base permissions (participants.profiles.create/read/update/delete,
-- graduation.tracking.manage/approve) already in 1004.
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'participants.enrollments.create', 'participants', 'enrollments', 'create', 'Enroll participants in projects'),
    (gen_random_uuid(), 'participants.enrollments.update', 'participants', 'enrollments', 'update', 'Manage participant enrollments'),
    (gen_random_uuid(), 'participants.services.create',    'participants', 'services',    'create', 'Record services delivered to participants'),
    (gen_random_uuid(), 'participants.services.read',      'participants', 'services',    'read',   'View participant service history'),
    (gen_random_uuid(), 'participants.household.manage',   'participants', 'household',   'manage', 'Manage household membership'),
    (gen_random_uuid(), 'graduation.benchmarks.create',    'graduation',  'benchmarks',  'create', 'Create graduation benchmarks'),
    (gen_random_uuid(), 'graduation.benchmarks.update',    'graduation',  'benchmarks',  'update', 'Edit graduation benchmarks'),
    (gen_random_uuid(), 'graduation.assessments.record',   'graduation',  'assessments', 'record', 'Record graduation assessments'),
    (gen_random_uuid(), 'graduation.pipeline.read',        'graduation',  'pipeline',    'read',   'View graduation pipeline dashboard')
ON CONFLICT DO NOTHING;
