-- Database roles for defense-in-depth schema isolation.
-- The application connects as the Supabase 'postgres' user
-- and is granted these roles for restricted access.

-- Read-only role for reference data
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ethelpms_reference_reader') THEN
    CREATE ROLE ethelpms_reference_reader;
  END IF;
END $$;

GRANT USAGE ON SCHEMA reference TO ethelpms_reference_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA reference TO ethelpms_reference_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA reference
    GRANT SELECT ON TABLES TO ethelpms_reference_reader;

-- INSERT-only role for audit schema (immutable audit trail, per Decision D14)
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ethelpms_audit_writer') THEN
    CREATE ROLE ethelpms_audit_writer;
  END IF;
END $$;

GRANT USAGE ON SCHEMA audit TO ethelpms_audit_writer;
GRANT INSERT ON ALL TABLES IN SCHEMA audit TO ethelpms_audit_writer;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA audit TO ethelpms_audit_writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit
    GRANT INSERT ON TABLES TO ethelpms_audit_writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit
    GRANT USAGE, SELECT ON SEQUENCES TO ethelpms_audit_writer;
-- Explicitly deny UPDATE and DELETE
REVOKE UPDATE, DELETE ON ALL TABLES IN SCHEMA audit FROM ethelpms_audit_writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit
    REVOKE UPDATE, DELETE ON TABLES FROM ethelpms_audit_writer;

-- Grant roles to the Supabase app user
GRANT ethelpms_reference_reader TO postgres;
GRANT ethelpms_audit_writer TO postgres;
