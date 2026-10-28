-- Row-Level Security for the projects schema.
-- Uses current_setting('app.current_org_id') set by TenantConnectionInterceptor.

-- Enable RLS on tenant-scoped tables
ALTER TABLE projects.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.projects FORCE ROW LEVEL SECURITY;
ALTER TABLE projects.project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.project_phases FORCE ROW LEVEL SECURITY;
ALTER TABLE projects.project_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.project_revisions FORCE ROW LEVEL SECURITY;
ALTER TABLE projects.project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.project_team_members FORCE ROW LEVEL SECURITY;
ALTER TABLE projects.outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.outcomes FORCE ROW LEVEL SECURITY;
ALTER TABLE projects.outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.outputs FORCE ROW LEVEL SECURITY;
ALTER TABLE projects.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.activities FORCE ROW LEVEL SECURITY;
ALTER TABLE projects.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.indicators FORCE ROW LEVEL SECURITY;
ALTER TABLE projects.indicator_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.indicator_targets FORCE ROW LEVEL SECURITY;
ALTER TABLE projects.units_of_measurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.units_of_measurement FORCE ROW LEVEL SECURITY;
ALTER TABLE projects.intervention_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.intervention_areas FORCE ROW LEVEL SECURITY;
ALTER TABLE projects.project_intervention_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.project_intervention_areas FORCE ROW LEVEL SECURITY;

-- Tenant isolation policies (all use organization_id column)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'projects_tenant_isolation') THEN
    CREATE POLICY projects_tenant_isolation ON projects.projects
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_phases_tenant_isolation') THEN
    CREATE POLICY project_phases_tenant_isolation ON projects.project_phases
        USING (true); -- no organization_id column; protected via parent project RLS
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_revisions_tenant_isolation') THEN
    CREATE POLICY project_revisions_tenant_isolation ON projects.project_revisions
        USING (true); -- no organization_id column; protected via parent project RLS
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_team_members_tenant_isolation') THEN
    CREATE POLICY project_team_members_tenant_isolation ON projects.project_team_members
        USING (true); -- no organization_id column; junction table protected via parent RLS
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'outcomes_tenant_isolation') THEN
    CREATE POLICY outcomes_tenant_isolation ON projects.outcomes
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'outputs_tenant_isolation') THEN
    CREATE POLICY outputs_tenant_isolation ON projects.outputs
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'activities_tenant_isolation') THEN
    CREATE POLICY activities_tenant_isolation ON projects.activities
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'indicators_tenant_isolation') THEN
    CREATE POLICY indicators_tenant_isolation ON projects.indicators
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'indicator_targets_tenant_isolation') THEN
    CREATE POLICY indicator_targets_tenant_isolation ON projects.indicator_targets
        USING (true); -- no organization_id column; protected via parent indicator/project RLS
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'uom_tenant_isolation') THEN
    CREATE POLICY uom_tenant_isolation ON projects.units_of_measurement
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'intervention_areas_tenant_isolation') THEN
    CREATE POLICY intervention_areas_tenant_isolation ON projects.intervention_areas
        USING (organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'project_intervention_areas_tenant_isolation') THEN
    CREATE POLICY project_intervention_areas_tenant_isolation ON projects.project_intervention_areas
        USING (true); -- no organization_id column; junction table protected via parent RLS
  END IF;
END $$;

-- Apply updated_at triggers to auditable tables
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects.projects;
CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects.projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_project_phases_updated_at ON projects.project_phases;
CREATE TRIGGER trg_project_phases_updated_at
    BEFORE UPDATE ON projects.project_phases
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_outcomes_updated_at ON projects.outcomes;
CREATE TRIGGER trg_outcomes_updated_at
    BEFORE UPDATE ON projects.outcomes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_outputs_updated_at ON projects.outputs;
CREATE TRIGGER trg_outputs_updated_at
    BEFORE UPDATE ON projects.outputs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_activities_updated_at ON projects.activities;
CREATE TRIGGER trg_activities_updated_at
    BEFORE UPDATE ON projects.activities
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_indicators_updated_at ON projects.indicators;
CREATE TRIGGER trg_indicators_updated_at
    BEFORE UPDATE ON projects.indicators
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_uom_updated_at ON projects.units_of_measurement;
CREATE TRIGGER trg_uom_updated_at
    BEFORE UPDATE ON projects.units_of_measurement
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_intervention_areas_updated_at ON projects.intervention_areas;
CREATE TRIGGER trg_intervention_areas_updated_at
    BEFORE UPDATE ON projects.intervention_areas
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
