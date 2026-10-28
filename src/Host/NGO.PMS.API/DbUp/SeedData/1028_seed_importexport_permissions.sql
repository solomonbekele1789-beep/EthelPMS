-- =============================================================
-- 1028: Import/Export module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'importexport.templates.create', 'importexport', 'templates', 'create', 'Create import templates'),
    (gen_random_uuid(), 'importexport.templates.read',   'importexport', 'templates', 'read',   'View import templates'),
    (gen_random_uuid(), 'importexport.templates.update', 'importexport', 'templates', 'update', 'Update import templates'),
    (gen_random_uuid(), 'importexport.templates.delete', 'importexport', 'templates', 'delete', 'Delete import templates'),
    (gen_random_uuid(), 'importexport.import.create',    'importexport', 'import',    'create', 'Create import jobs'),
    (gen_random_uuid(), 'importexport.import.read',      'importexport', 'import',    'read',   'View import jobs'),
    (gen_random_uuid(), 'importexport.export.create',    'importexport', 'export',    'create', 'Create export jobs'),
    (gen_random_uuid(), 'importexport.export.read',      'importexport', 'export',    'read',   'View export jobs')
ON CONFLICT DO NOTHING;
