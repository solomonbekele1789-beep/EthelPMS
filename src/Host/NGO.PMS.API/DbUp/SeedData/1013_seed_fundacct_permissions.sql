-- =============================================================
-- 1013: Additional FundAccounting module permissions
-- Base permissions (fundacct.journals.create/read/post,
-- fundacct.budgets.create/read/update/approve,
-- fundacct.accounts.manage) already in 1004.
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'fundacct.accounts.create',      'fundacct', 'accounts',     'create',  'Create chart of accounts entries'),
    (gen_random_uuid(), 'fundacct.accounts.read',        'fundacct', 'accounts',     'read',    'View chart of accounts'),
    (gen_random_uuid(), 'fundacct.accounts.update',      'fundacct', 'accounts',     'update',  'Update chart of accounts entries'),
    (gen_random_uuid(), 'fundacct.funds.create',         'fundacct', 'funds',        'create',  'Create fund codes'),
    (gen_random_uuid(), 'fundacct.funds.read',           'fundacct', 'funds',        'read',    'View fund codes'),
    (gen_random_uuid(), 'fundacct.funds.update',         'fundacct', 'funds',        'update',  'Update fund codes'),
    (gen_random_uuid(), 'fundacct.journals.create',      'fundacct', 'journals',     'create',  'Create journal entries'),
    (gen_random_uuid(), 'fundacct.journals.read',        'fundacct', 'journals',     'read',    'View journal entries'),
    (gen_random_uuid(), 'fundacct.journals.post',        'fundacct', 'journals',     'post',    'Post journal entries'),
    (gen_random_uuid(), 'fundacct.budgets.create',       'fundacct', 'budgets',      'create',  'Create budgets'),
    (gen_random_uuid(), 'fundacct.budgets.read',         'fundacct', 'budgets',      'read',    'View budgets'),
    (gen_random_uuid(), 'fundacct.budgets.update',       'fundacct', 'budgets',      'update',  'Update budgets and add budget lines'),
    (gen_random_uuid(), 'fundacct.budgets.approve',      'fundacct', 'budgets',      'approve', 'Approve budgets'),
    (gen_random_uuid(), 'fundacct.restrictions.create',  'fundacct', 'restrictions', 'create',  'Create fund restrictions'),
    (gen_random_uuid(), 'fundacct.restrictions.release', 'fundacct', 'restrictions', 'release', 'Release fund restrictions')
ON CONFLICT DO NOTHING;
