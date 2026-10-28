-- =============================================================
-- 1012: Additional Procurement module permissions
-- Base permissions (procurement.manage, procurement.approve)
-- already in 1004.
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'procurement.suppliers.create',   'procurement', 'suppliers', 'create',  'Register new suppliers'),
    (gen_random_uuid(), 'procurement.suppliers.read',     'procurement', 'suppliers', 'read',    'View supplier details and list'),
    (gen_random_uuid(), 'procurement.suppliers.update',   'procurement', 'suppliers', 'update',  'Update, rate, or blacklist suppliers'),
    (gen_random_uuid(), 'procurement.plans.create',       'procurement', 'plans',     'create',  'Create procurement plans'),
    (gen_random_uuid(), 'procurement.plans.read',         'procurement', 'plans',     'read',    'View procurement plans'),
    (gen_random_uuid(), 'procurement.plans.update',       'procurement', 'plans',     'update',  'Edit procurement plans and add items'),
    (gen_random_uuid(), 'procurement.plans.approve',      'procurement', 'plans',     'approve', 'Approve submitted procurement plans'),
    (gen_random_uuid(), 'procurement.requests.create',    'procurement', 'requests',  'create',  'Create purchase requests'),
    (gen_random_uuid(), 'procurement.requests.read',      'procurement', 'requests',  'read',    'View purchase requests'),
    (gen_random_uuid(), 'procurement.requests.update',    'procurement', 'requests',  'update',  'Edit and submit purchase requests'),
    (gen_random_uuid(), 'procurement.requests.approve',   'procurement', 'requests',  'approve', 'Approve purchase requests'),
    (gen_random_uuid(), 'procurement.rfqs.create',        'procurement', 'rfqs',      'create',  'Create RFQs and submit responses'),
    (gen_random_uuid(), 'procurement.rfqs.read',          'procurement', 'rfqs',      'read',    'View RFQs and evaluate bids'),
    (gen_random_uuid(), 'procurement.orders.create',      'procurement', 'orders',    'create',  'Create purchase orders'),
    (gen_random_uuid(), 'procurement.orders.read',        'procurement', 'orders',    'read',    'View purchase orders'),
    (gen_random_uuid(), 'procurement.orders.issue',       'procurement', 'orders',    'issue',   'Issue purchase orders to suppliers'),
    (gen_random_uuid(), 'procurement.receipts.create',    'procurement', 'receipts',  'create',  'Create goods received notes'),
    (gen_random_uuid(), 'procurement.receipts.confirm',   'procurement', 'receipts',  'confirm', 'Confirm goods receipt'),
    (gen_random_uuid(), 'procurement.invoices.create',    'procurement', 'invoices',  'create',  'Record supplier invoices'),
    (gen_random_uuid(), 'procurement.invoices.read',      'procurement', 'invoices',  'read',    'View supplier invoices'),
    (gen_random_uuid(), 'procurement.payments.create',    'procurement', 'payments',  'create',  'Create payment requests'),
    (gen_random_uuid(), 'procurement.payments.approve',   'procurement', 'payments',  'approve', 'Approve payment requests')
ON CONFLICT DO NOTHING;
