-- Fix RLS policies on identity tables to allow unauthenticated access (login endpoint).
-- When app.current_org_id is NOT set (empty or null), allow access to all rows.
-- When it IS set, restrict to that organization's rows only.
-- This is required because the login endpoint must search users across all tenants.

-- Drop and recreate users policy
DROP POLICY IF EXISTS users_tenant_isolation ON identity.users;
CREATE POLICY users_tenant_isolation ON identity.users
    USING (
        NULLIF(current_setting('app.current_org_id', true), '') IS NULL
        OR organization_id = current_setting('app.current_org_id', true)::uuid
    );

-- Drop and recreate roles policy
DROP POLICY IF EXISTS roles_tenant_isolation ON identity.roles;
CREATE POLICY roles_tenant_isolation ON identity.roles
    USING (
        NULLIF(current_setting('app.current_org_id', true), '') IS NULL
        OR organization_id = current_setting('app.current_org_id', true)::uuid
    );

-- Drop and recreate user_roles policy
DROP POLICY IF EXISTS user_roles_tenant_isolation ON identity.user_roles;
CREATE POLICY user_roles_tenant_isolation ON identity.user_roles
    USING (true);
-- user_roles does not have organization_id column; access is controlled via user/role joins

-- Drop and recreate offices policy
DROP POLICY IF EXISTS offices_tenant_isolation ON identity.offices;
CREATE POLICY offices_tenant_isolation ON identity.offices
    USING (
        NULLIF(current_setting('app.current_org_id', true), '') IS NULL
        OR organization_id = current_setting('app.current_org_id', true)::uuid
    );

-- Drop and recreate role_permissions policy (if it exists)
DROP POLICY IF EXISTS role_permissions_tenant_isolation ON identity.role_permissions;
-- role_permissions does not have organization_id; no RLS needed
