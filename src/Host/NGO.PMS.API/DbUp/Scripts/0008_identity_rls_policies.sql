-- Row-Level Security for the identity schema.
-- Uses current_setting('app.current_org_id') set by TenantConnectionInterceptor.

-- Enable RLS on tenant-scoped tables
ALTER TABLE identity.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.users FORCE ROW LEVEL SECURITY;
ALTER TABLE identity.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.roles FORCE ROW LEVEL SECURITY;
ALTER TABLE identity.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.user_roles FORCE ROW LEVEL SECURITY;
ALTER TABLE identity.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.offices FORCE ROW LEVEL SECURITY;

-- Tenant isolation policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_tenant_isolation') THEN
    CREATE POLICY users_tenant_isolation ON identity.users
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'roles_tenant_isolation') THEN
    CREATE POLICY roles_tenant_isolation ON identity.roles
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_roles_tenant_isolation') THEN
    CREATE POLICY user_roles_tenant_isolation ON identity.user_roles
        USING (true);
    -- user_roles has no organization_id column; access controlled via user/role joins
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'offices_tenant_isolation') THEN
    CREATE POLICY offices_tenant_isolation ON identity.offices
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

-- Tables NOT under RLS (shared or platform-level):
-- identity.permissions        (global, not tenant-scoped)
-- identity.organizations      (filtered at app level; each org sees itself)
-- identity.refresh_tokens     (filtered by user_id, not org)
-- identity.password_reset_tokens (filtered by token_hash)

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trg_users_updated_at ON identity.users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON identity.users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_roles_updated_at ON identity.roles;
CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON identity.roles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_offices_updated_at ON identity.offices;
CREATE TRIGGER trg_offices_updated_at
    BEFORE UPDATE ON identity.offices
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON identity.organizations;
CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON identity.organizations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

