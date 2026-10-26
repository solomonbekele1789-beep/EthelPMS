-- Row-Level Security for the collab schema (Chat module).
-- Uses tenant_id (IMultiTenant.TenantId) mapped via snake_case convention.

ALTER TABLE collab.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab.chat_rooms FORCE ROW LEVEL SECURITY;
ALTER TABLE collab.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab.chat_participants FORCE ROW LEVEL SECURITY;
ALTER TABLE collab.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab.chat_messages FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'chat_rooms_tenant_isolation') THEN
    CREATE POLICY chat_rooms_tenant_isolation ON collab.chat_rooms
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'chat_participants_tenant_isolation') THEN
    CREATE POLICY chat_participants_tenant_isolation ON collab.chat_participants
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'chat_messages_tenant_isolation') THEN
    CREATE POLICY chat_messages_tenant_isolation ON collab.chat_messages
        USING (tenant_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
  END IF;
END $$;

-- updated_at triggers

DROP TRIGGER IF EXISTS trg_chat_rooms_updated_at ON collab.chat_rooms;
CREATE TRIGGER trg_chat_rooms_updated_at
    BEFORE UPDATE ON collab.chat_rooms
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_chat_participants_updated_at ON collab.chat_participants;
CREATE TRIGGER trg_chat_participants_updated_at
    BEFORE UPDATE ON collab.chat_participants
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_chat_messages_updated_at ON collab.chat_messages;
CREATE TRIGGER trg_chat_messages_updated_at
    BEFORE UPDATE ON collab.chat_messages
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
