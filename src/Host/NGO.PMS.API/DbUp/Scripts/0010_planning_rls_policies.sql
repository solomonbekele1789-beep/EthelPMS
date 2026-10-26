-- Row-Level Security for the planning schema.
-- Uses current_setting('app.current_org_id') set by TenantConnectionInterceptor.

-- Enable RLS on tenant-scoped tables
ALTER TABLE planning.plan_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning.plan_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE planning.plan_indicator_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning.plan_indicator_allocations FORCE ROW LEVEL SECURITY;
ALTER TABLE planning.plan_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning.plan_activities FORCE ROW LEVEL SECURITY;
ALTER TABLE planning.dip_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning.dip_items FORCE ROW LEVEL SECURITY;
ALTER TABLE planning.dip_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning.dip_milestones FORCE ROW LEVEL SECURITY;
ALTER TABLE planning.planning_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning.planning_configurations FORCE ROW LEVEL SECURITY;

-- Tenant isolation policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'plan_entries_tenant_isolation') THEN
    CREATE POLICY plan_entries_tenant_isolation ON planning.plan_entries
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'plan_indicator_alloc_tenant_isolation') THEN
    CREATE POLICY plan_indicator_alloc_tenant_isolation ON planning.plan_indicator_allocations
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'plan_activities_tenant_isolation') THEN
    CREATE POLICY plan_activities_tenant_isolation ON planning.plan_activities
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dip_items_tenant_isolation') THEN
    CREATE POLICY dip_items_tenant_isolation ON planning.dip_items
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dip_milestones_tenant_isolation') THEN
    CREATE POLICY dip_milestones_tenant_isolation ON planning.dip_milestones
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'planning_config_tenant_isolation') THEN
    CREATE POLICY planning_config_tenant_isolation ON planning.planning_configurations
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trg_plan_entries_updated_at ON planning.plan_entries;
CREATE TRIGGER trg_plan_entries_updated_at
    BEFORE UPDATE ON planning.plan_entries
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_plan_activities_updated_at ON planning.plan_activities;
CREATE TRIGGER trg_plan_activities_updated_at
    BEFORE UPDATE ON planning.plan_activities
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_dip_items_updated_at ON planning.dip_items;
CREATE TRIGGER trg_dip_items_updated_at
    BEFORE UPDATE ON planning.dip_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_planning_config_updated_at ON planning.planning_configurations;
CREATE TRIGGER trg_planning_config_updated_at
    BEFORE UPDATE ON planning.planning_configurations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
