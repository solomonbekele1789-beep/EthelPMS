-- =============================================================
-- 1021: Documents module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'documents.folders.create',  'documents', 'folders',  'create', 'Create document folders'),
    (gen_random_uuid(), 'documents.folders.read',    'documents', 'folders',  'read',   'View document folders and tree'),
    (gen_random_uuid(), 'documents.folders.update',  'documents', 'folders',  'update', 'Update and move document folders'),
    (gen_random_uuid(), 'documents.files.upload',    'documents', 'files',    'upload', 'Upload documents'),
    (gen_random_uuid(), 'documents.files.read',      'documents', 'files',    'read',   'View and download documents'),
    (gen_random_uuid(), 'documents.files.update',    'documents', 'files',    'update', 'Update document metadata'),
    (gen_random_uuid(), 'documents.versions.create', 'documents', 'versions', 'create', 'Upload new document versions'),
    (gen_random_uuid(), 'documents.comments.create', 'documents', 'comments', 'create', 'Add document comments')
ON CONFLICT DO NOTHING;
