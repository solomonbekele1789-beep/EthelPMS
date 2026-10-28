-- Row-Level Security for the collab schema (Notifications module).
-- Uses tenant_id (IMultiTenant.TenantId) mapped via snake_case convention.

ALTER TABLE collab.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab.notification_templates FORCE ROW LEVEL SECURITY;
ALTER TABLE collab.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab.notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE collab.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab.user_notification_preferences FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notification_templates_tenant_isolation') THEN
    CREATE POLICY notification_templates_tenant_isolation ON collab.notification_templates
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notifications_tenant_isolation') THEN
    CREATE POLICY notifications_tenant_isolation ON collab.notifications
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_notification_preferences_tenant_isolation') THEN
    CREATE POLICY user_notification_preferences_tenant_isolation ON collab.user_notification_preferences
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

-- updated_at triggers

DROP TRIGGER IF EXISTS trg_notification_templates_updated_at ON collab.notification_templates;
CREATE TRIGGER trg_notification_templates_updated_at
    BEFORE UPDATE ON collab.notification_templates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_notifications_updated_at ON collab.notifications;
CREATE TRIGGER trg_notifications_updated_at
    BEFORE UPDATE ON collab.notifications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_user_notification_preferences_updated_at ON collab.user_notification_preferences;
CREATE TRIGGER trg_user_notification_preferences_updated_at
    BEFORE UPDATE ON collab.user_notification_preferences
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
