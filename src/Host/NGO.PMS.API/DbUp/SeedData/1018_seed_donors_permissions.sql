-- =============================================================
-- 1018: Donors module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'donors.donors.create',          'donors', 'donors',         'create',   'Create donors'),
    (gen_random_uuid(), 'donors.donors.read',            'donors', 'donors',         'read',     'View donors and contacts'),
    (gen_random_uuid(), 'donors.donors.update',          'donors', 'donors',         'update',   'Update donor information'),
    (gen_random_uuid(), 'donors.contacts.create',        'donors', 'contacts',       'create',   'Add donor contacts'),
    (gen_random_uuid(), 'donors.grants.create',          'donors', 'grants',         'create',   'Create grants and agreements'),
    (gen_random_uuid(), 'donors.grants.read',            'donors', 'grants',         'read',     'View grants and agreements'),
    (gen_random_uuid(), 'donors.grants.activate',        'donors', 'grants',         'activate', 'Activate grants'),
    (gen_random_uuid(), 'donors.conditions.create',      'donors', 'conditions',     'create',   'Add grant conditions'),
    (gen_random_uuid(), 'donors.conditions.update',      'donors', 'conditions',     'update',   'Update grant condition status'),
    (gen_random_uuid(), 'donors.reports.create',         'donors', 'reports',        'create',   'Submit grant reports'),
    (gen_random_uuid(), 'donors.reports.read',           'donors', 'reports',        'read',     'View grant reports'),
    (gen_random_uuid(), 'donors.communications.create',  'donors', 'communications', 'create',   'Record donor communications'),
    (gen_random_uuid(), 'donors.compliance.read',        'donors', 'compliance',     'read',     'View compliance dashboard')
ON CONFLICT DO NOTHING;
