-- Seed subscription packages for the platform.
-- These define the tier limits for tenant organizations.

INSERT INTO platform.subscription_packages (id, name, max_users, max_projects, price_monthly_usd, included_modules, is_active, created_at, updated_at)
VALUES
    ('b0000000-0000-4000-8000-000000000001',
     'Free', 10, 5, 0.00,
     ARRAY['identity', 'projects', 'resultsframework', 'planning', 'reporting', 'meal', 'tasks'],
     true, now(), now()),

    ('b0000000-0000-4000-8000-000000000002',
     'Pro', 50, 25, 49.00,
     ARRAY['identity', 'projects', 'resultsframework', 'interventionareas', 'planning', 'dip',
           'reporting', 'meal', 'participants', 'graduation', 'procurement', 'fundacct',
           'assets', 'training', 'tasks', 'risk', 'donors'],
     true, now(), now()),

    ('b0000000-0000-4000-8000-000000000003',
     'Enterprise', 500, 100, 199.00,
     ARRAY['identity', 'projects', 'resultsframework', 'interventionareas', 'planning', 'dip',
           'reporting', 'meal', 'participants', 'graduation', 'procurement', 'fundacct',
           'assets', 'training', 'tasks', 'risk', 'donors', 'chat', 'notifications',
           'documents', 'feedback', 'dashboards', 'knowledgemgmt', 'settings', 'ai'],
     true, now(), now())
ON CONFLICT (id) DO NOTHING;
