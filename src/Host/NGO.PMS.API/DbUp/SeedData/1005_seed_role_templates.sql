-- Seed 7 default role templates that are cloned when a new tenant is provisioned.
-- These are system roles (is_system_role = true) that cannot be deleted by org admins.
-- ON CONFLICT ensures idempotent execution.
-- NOTE: These are templates stored without organization_id.
-- During tenant provisioning, actual roles are created per-org from these templates.

-- Role template storage: we use a dedicated table for this
CREATE TABLE IF NOT EXISTS identity.role_templates (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            varchar(100)    NOT NULL UNIQUE,
    description     text,
    tier            varchar(20)     NOT NULL DEFAULT 'free',
    permission_codes text[]         NOT NULL DEFAULT '{}'
);

INSERT INTO identity.role_templates (name, description, tier, permission_codes)
VALUES
    ('Organization Admin', 'Full access to all organization settings and user management',
     'free',
     ARRAY[
         'identity.users.create', 'identity.users.read', 'identity.users.update',
         'identity.users.delete', 'identity.users.manage',
         'identity.roles.create', 'identity.roles.read', 'identity.roles.update', 'identity.roles.delete',
         'identity.offices.create', 'identity.offices.read', 'identity.offices.update', 'identity.offices.delete',
         'orgsetup.organization.read', 'orgsetup.organization.update'
     ]),

    ('Project Manager', 'Manages projects, plans, budgets, and team members',
     'free',
     ARRAY[
         'identity.users.read', 'identity.offices.read',
         'projects.projects.create', 'projects.projects.read', 'projects.projects.update',
         'results.outcomes.create', 'results.outcomes.read', 'results.outcomes.update',
         'results.indicators.create', 'results.indicators.read', 'results.indicators.update',
         'planning.annual.create', 'planning.annual.read', 'planning.annual.update',
         'dip.entries.create', 'dip.entries.read', 'dip.entries.update',
         'reporting.reports.create', 'reporting.reports.read', 'reporting.reports.update', 'reporting.reports.submit',
         'fundacct.budgets.read', 'fundacct.journals.read',
         'tasks.boards.create', 'tasks.boards.read', 'tasks.items.create', 'tasks.items.update', 'tasks.items.assign'
     ]),

    ('MEAL Officer', 'Monitors indicators, conducts evaluations, manages data quality',
     'free',
     ARRAY[
         'identity.users.read',
         'projects.projects.read', 'results.indicators.read', 'results.outcomes.read',
         'meal.plans.create', 'meal.plans.read', 'meal.plans.update',
         'meal.evaluations.create', 'meal.evaluations.read',
         'participants.profiles.read',
         'reporting.reports.read'
     ]),

    ('Finance Officer', 'Manages budgets, journal entries, and financial reporting',
     'pro',
     ARRAY[
         'identity.users.read',
         'projects.projects.read',
         'fundacct.journals.create', 'fundacct.journals.read', 'fundacct.journals.post',
         'fundacct.budgets.create', 'fundacct.budgets.read', 'fundacct.budgets.update',
         'fundacct.accounts.manage',
         'procurement.requests.read', 'procurement.pos.approve',
         'assets.items.read',
         'reporting.reports.read', 'reporting.reports.export'
     ]),

    ('Procurement Officer', 'Manages procurement lifecycle from requests to GRN',
     'pro',
     ARRAY[
         'identity.users.read',
         'projects.projects.read',
         'procurement.requests.create', 'procurement.requests.read', 'procurement.requests.approve',
         'procurement.pos.create', 'procurement.pos.approve',
         'procurement.grn.create',
         'assets.items.create', 'assets.items.read',
         'fundacct.budgets.read'
     ]),

    ('Field Officer', 'Collects participant data, conducts field activities',
     'free',
     ARRAY[
         'identity.users.read',
         'projects.projects.read',
         'participants.profiles.create', 'participants.profiles.read', 'participants.profiles.update',
         'graduation.tracking.manage',
         'meal.plans.read',
         'training.programs.read', 'training.sessions.manage',
         'tasks.items.create', 'tasks.items.update'
     ]),

    ('Viewer', 'Read-only access to project data and reports',
     'free',
     ARRAY[
         'identity.users.read', 'identity.offices.read',
         'projects.projects.read', 'results.outcomes.read', 'results.indicators.read',
         'planning.annual.read', 'dip.entries.read',
         'reporting.reports.read',
         'meal.plans.read',
         'fundacct.budgets.read', 'fundacct.journals.read',
         'participants.profiles.read',
         'tasks.boards.read'
     ])
ON CONFLICT (name) DO NOTHING;
