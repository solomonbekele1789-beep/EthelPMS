-- Seed application permissions.
-- Grouped by module. Format: {module}.{resource}.{action}
-- ON CONFLICT DO NOTHING makes this idempotent.

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    -- Identity
    (gen_random_uuid(), 'identity.users.create',       'identity', 'users',        'create',     'Create new users'),
    (gen_random_uuid(), 'identity.users.read',         'identity', 'users',        'read',       'View user profiles'),
    (gen_random_uuid(), 'identity.users.update',       'identity', 'users',        'update',     'Edit user profiles'),
    (gen_random_uuid(), 'identity.users.delete',       'identity', 'users',        'delete',     'Delete/deactivate users'),
    (gen_random_uuid(), 'identity.users.manage',       'identity', 'users',        'manage',     'Assign roles to users'),
    (gen_random_uuid(), 'identity.roles.create',       'identity', 'roles',        'create',     'Create custom roles'),
    (gen_random_uuid(), 'identity.roles.read',         'identity', 'roles',        'read',       'View roles'),
    (gen_random_uuid(), 'identity.roles.update',       'identity', 'roles',        'update',     'Edit role permissions'),
    (gen_random_uuid(), 'identity.roles.delete',       'identity', 'roles',        'delete',     'Delete custom roles'),
    (gen_random_uuid(), 'identity.offices.create',     'identity', 'offices',      'create',     'Create offices'),
    (gen_random_uuid(), 'identity.offices.read',       'identity', 'offices',      'read',       'View offices'),
    (gen_random_uuid(), 'identity.offices.update',     'identity', 'offices',      'update',     'Edit offices'),
    (gen_random_uuid(), 'identity.offices.delete',     'identity', 'offices',      'delete',     'Delete offices'),
    (gen_random_uuid(), 'orgsetup.organization.read',  'orgsetup', 'organization', 'read',       'View organization settings'),
    (gen_random_uuid(), 'orgsetup.organization.update','orgsetup', 'organization', 'update',     'Edit organization settings'),

    -- Projects
    (gen_random_uuid(), 'projects.projects.create',    'projects', 'projects',     'create',     'Create projects'),
    (gen_random_uuid(), 'projects.projects.read',      'projects', 'projects',     'read',       'View projects'),
    (gen_random_uuid(), 'projects.projects.update',    'projects', 'projects',     'update',     'Edit projects'),
    (gen_random_uuid(), 'projects.projects.delete',    'projects', 'projects',     'delete',     'Delete projects'),
    (gen_random_uuid(), 'projects.projects.approve',   'projects', 'projects',     'approve',    'Approve projects'),
    (gen_random_uuid(), 'results.outcomes.create',     'results',  'outcomes',     'create',     'Create results framework entries'),
    (gen_random_uuid(), 'results.outcomes.read',       'results',  'outcomes',     'read',       'View results framework'),
    (gen_random_uuid(), 'results.outcomes.update',     'results',  'outcomes',     'update',     'Edit results framework'),
    (gen_random_uuid(), 'results.indicators.create',   'results',  'indicators',   'create',     'Create indicators'),
    (gen_random_uuid(), 'results.indicators.read',     'results',  'indicators',   'read',       'View indicators'),
    (gen_random_uuid(), 'results.indicators.update',   'results',  'indicators',   'update',     'Edit indicators'),

    -- Planning
    (gen_random_uuid(), 'planning.annual.create',      'planning', 'annual',       'create',     'Create plans'),
    (gen_random_uuid(), 'planning.annual.read',        'planning', 'annual',       'read',       'View plans'),
    (gen_random_uuid(), 'planning.annual.update',      'planning', 'annual',       'update',     'Edit plans'),
    (gen_random_uuid(), 'planning.annual.approve',     'planning', 'annual',       'approve',    'Approve plans'),
    (gen_random_uuid(), 'dip.entries.create',          'dip',      'entries',      'create',     'Create DIP items'),
    (gen_random_uuid(), 'dip.entries.read',            'dip',      'entries',      'read',       'View DIP'),
    (gen_random_uuid(), 'dip.entries.update',          'dip',      'entries',      'update',     'Edit DIP items'),

    -- Reporting
    (gen_random_uuid(), 'reporting.reports.create',    'reporting', 'reports',      'create',     'Create reports'),
    (gen_random_uuid(), 'reporting.reports.read',      'reporting', 'reports',      'read',       'View reports'),
    (gen_random_uuid(), 'reporting.reports.update',    'reporting', 'reports',      'update',     'Edit reports'),
    (gen_random_uuid(), 'reporting.reports.submit',    'reporting', 'reports',      'submit',     'Submit reports for approval'),
    (gen_random_uuid(), 'reporting.reports.approve',   'reporting', 'reports',      'approve',    'Approve/reject reports'),
    (gen_random_uuid(), 'reporting.reports.export',    'reporting', 'reports',      'export',     'Export reports to PDF/Excel'),

    -- MEAL
    (gen_random_uuid(), 'meal.plans.create',           'meal',     'plans',        'create',     'Create MEAL plans'),
    (gen_random_uuid(), 'meal.plans.read',             'meal',     'plans',        'read',       'View MEAL data'),
    (gen_random_uuid(), 'meal.plans.update',           'meal',     'plans',        'update',     'Edit MEAL plans'),
    (gen_random_uuid(), 'meal.evaluations.create',     'meal',     'evaluations',  'create',     'Create evaluations'),
    (gen_random_uuid(), 'meal.evaluations.read',       'meal',     'evaluations',  'read',       'View evaluations'),

    -- Participants
    (gen_random_uuid(), 'participants.profiles.create','participants', 'profiles',  'create',     'Register participants'),
    (gen_random_uuid(), 'participants.profiles.read',  'participants', 'profiles',  'read',       'View participants'),
    (gen_random_uuid(), 'participants.profiles.update','participants', 'profiles',  'update',     'Edit participant profiles'),
    (gen_random_uuid(), 'participants.profiles.delete','participants', 'profiles',  'delete',     'Remove participants'),
    (gen_random_uuid(), 'graduation.tracking.manage',  'graduation',  'tracking',  'manage',     'Conduct graduation assessments'),
    (gen_random_uuid(), 'graduation.tracking.approve', 'graduation',  'tracking',  'approve',    'Approve graduation decisions'),

    -- Procurement
    (gen_random_uuid(), 'procurement.requests.create', 'procurement', 'requests',  'create',     'Create purchase requests'),
    (gen_random_uuid(), 'procurement.requests.read',   'procurement', 'requests',  'read',       'View procurement data'),
    (gen_random_uuid(), 'procurement.requests.approve','procurement', 'requests',  'approve',    'Approve purchase requests'),
    (gen_random_uuid(), 'procurement.pos.create',      'procurement', 'pos',       'create',     'Create purchase orders'),
    (gen_random_uuid(), 'procurement.pos.approve',     'procurement', 'pos',       'approve',    'Approve purchase orders'),
    (gen_random_uuid(), 'procurement.grn.create',      'procurement', 'grn',       'create',     'Record goods received'),

    -- Fund Accounting
    (gen_random_uuid(), 'fundacct.journals.create',    'fundacct', 'journals',     'create',     'Create journal entries'),
    (gen_random_uuid(), 'fundacct.journals.read',      'fundacct', 'journals',     'read',       'View journal entries'),
    (gen_random_uuid(), 'fundacct.journals.post',      'fundacct', 'journals',     'post',       'Post journal entries'),
    (gen_random_uuid(), 'fundacct.budgets.create',     'fundacct', 'budgets',      'create',     'Create budgets'),
    (gen_random_uuid(), 'fundacct.budgets.read',       'fundacct', 'budgets',      'read',       'View budgets'),
    (gen_random_uuid(), 'fundacct.budgets.update',     'fundacct', 'budgets',      'update',     'Edit budgets'),
    (gen_random_uuid(), 'fundacct.budgets.approve',    'fundacct', 'budgets',      'approve',    'Approve budgets'),
    (gen_random_uuid(), 'fundacct.accounts.manage',    'fundacct', 'accounts',     'manage',     'Manage chart of accounts'),

    -- Assets
    (gen_random_uuid(), 'assets.items.create',         'assets', 'items',          'create',     'Register assets'),
    (gen_random_uuid(), 'assets.items.read',           'assets', 'items',          'read',       'View assets'),
    (gen_random_uuid(), 'assets.items.update',         'assets', 'items',          'update',     'Edit asset details'),
    (gen_random_uuid(), 'assets.items.dispose',        'assets', 'items',          'dispose',    'Dispose assets'),
    (gen_random_uuid(), 'assets.stock.manage',         'assets', 'stock',          'manage',     'Manage stock items'),

    -- Training
    (gen_random_uuid(), 'training.programs.create',    'training', 'programs',     'create',     'Create training programs'),
    (gen_random_uuid(), 'training.programs.read',      'training', 'programs',     'read',       'View training data'),
    (gen_random_uuid(), 'training.programs.update',    'training', 'programs',     'update',     'Edit training programs'),
    (gen_random_uuid(), 'training.sessions.manage',    'training', 'sessions',     'manage',     'Manage training sessions'),

    -- Tasks
    (gen_random_uuid(), 'tasks.boards.create',         'tasks', 'boards',          'create',     'Create task boards'),
    (gen_random_uuid(), 'tasks.boards.read',           'tasks', 'boards',          'read',       'View task boards'),
    (gen_random_uuid(), 'tasks.items.create',          'tasks', 'items',           'create',     'Create tasks'),
    (gen_random_uuid(), 'tasks.items.update',          'tasks', 'items',           'update',     'Edit tasks'),
    (gen_random_uuid(), 'tasks.items.assign',          'tasks', 'items',           'assign',     'Assign tasks'),

    -- Risk
    (gen_random_uuid(), 'risk.register.create',        'risk', 'register',         'create',     'Create risk entries'),
    (gen_random_uuid(), 'risk.register.read',          'risk', 'register',         'read',       'View risk register'),
    (gen_random_uuid(), 'risk.register.update',        'risk', 'register',         'update',     'Edit risk entries'),
    (gen_random_uuid(), 'risk.mitigations.manage',     'risk', 'mitigations',      'manage',     'Manage risk mitigations'),

    -- Donors
    (gen_random_uuid(), 'donors.profiles.create',      'donors', 'profiles',       'create',     'Create donor profiles'),
    (gen_random_uuid(), 'donors.profiles.read',        'donors', 'profiles',       'read',       'View donor information'),
    (gen_random_uuid(), 'donors.profiles.update',      'donors', 'profiles',       'update',     'Edit donor profiles'),
    (gen_random_uuid(), 'donors.grants.manage',        'donors', 'grants',         'manage',     'Manage grants and conditions'),

    -- Chat
    (gen_random_uuid(), 'chat.rooms.create',           'chat', 'rooms',            'create',     'Create chat rooms'),
    (gen_random_uuid(), 'chat.rooms.read',             'chat', 'rooms',            'read',       'View and participate in chats'),
    (gen_random_uuid(), 'chat.rooms.manage',           'chat', 'rooms',            'manage',     'Manage chat rooms'),

    -- Notifications
    (gen_random_uuid(), 'notifications.templates.manage','notifications', 'templates', 'manage', 'Manage notification templates'),
    (gen_random_uuid(), 'notifications.send',           'notifications', 'send',      'send',    'Send notifications'),

    -- Documents
    (gen_random_uuid(), 'documents.folders.create',    'documents', 'folders',      'create',     'Create document folders'),
    (gen_random_uuid(), 'documents.files.upload',      'documents', 'files',        'upload',     'Upload documents'),
    (gen_random_uuid(), 'documents.files.read',        'documents', 'files',        'read',       'View documents'),
    (gen_random_uuid(), 'documents.files.delete',      'documents', 'files',        'delete',     'Delete documents'),

    -- Feedback
    (gen_random_uuid(), 'feedback.items.create',       'feedback', 'items',         'create',     'Submit feedback'),
    (gen_random_uuid(), 'feedback.items.read',         'feedback', 'items',         'read',       'View feedback'),
    (gen_random_uuid(), 'feedback.items.respond',      'feedback', 'items',         'respond',    'Respond to feedback'),

    -- Platform Admin (SuperAdmin only)
    (gen_random_uuid(), 'platform.tenants.create',     'platform', 'tenants',       'create',     'Create tenant organizations'),
    (gen_random_uuid(), 'platform.tenants.read',       'platform', 'tenants',       'read',       'View tenant organizations'),
    (gen_random_uuid(), 'platform.tenants.update',     'platform', 'tenants',       'update',     'Edit tenant settings'),
    (gen_random_uuid(), 'platform.tenants.deactivate', 'platform', 'tenants',       'deactivate', 'Deactivate tenants'),
    (gen_random_uuid(), 'platform.modules.manage',     'platform', 'modules',       'manage',     'Toggle tenant modules'),
    (gen_random_uuid(), 'platform.subscriptions.manage','platform', 'subscriptions', 'manage',    'Manage subscription packages')
ON CONFLICT (code) DO NOTHING;
