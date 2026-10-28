-- ═══════════════════════════════════════════════════════════════════
-- EthelPMS Database Reset Script
-- ═══════════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor BEFORE restarting the backend.
-- This drops all application schemas and the DbUp journal table
-- so the entire database is rebuilt from scratch on next startup.
-- ═══════════════════════════════════════════════════════════════════

-- Drop all module schemas (CASCADE drops all tables, policies, triggers within)
DROP SCHEMA IF EXISTS identity CASCADE;
DROP SCHEMA IF EXISTS platform CASCADE;
DROP SCHEMA IF EXISTS projects CASCADE;
DROP SCHEMA IF EXISTS planning CASCADE;
DROP SCHEMA IF EXISTS reporting CASCADE;
DROP SCHEMA IF EXISTS meal CASCADE;
DROP SCHEMA IF EXISTS participants CASCADE;
DROP SCHEMA IF EXISTS procurement CASCADE;
DROP SCHEMA IF EXISTS fundacct CASCADE;
DROP SCHEMA IF EXISTS assets CASCADE;
DROP SCHEMA IF EXISTS training CASCADE;
DROP SCHEMA IF EXISTS tasks CASCADE;
DROP SCHEMA IF EXISTS risk CASCADE;
DROP SCHEMA IF EXISTS donors CASCADE;
DROP SCHEMA IF EXISTS collab CASCADE;
DROP SCHEMA IF EXISTS content CASCADE;
DROP SCHEMA IF EXISTS reference CASCADE;
DROP SCHEMA IF EXISTS audit CASCADE;
DROP SCHEMA IF EXISTS outbox CASCADE;
DROP SCHEMA IF EXISTS dashboards CASCADE;
DROP SCHEMA IF EXISTS partnerships CASCADE;
DROP SCHEMA IF EXISTS reports CASCADE;
DROP SCHEMA IF EXISTS importexport CASCADE;

-- Drop Hangfire schema (created by Hangfire.PostgreSql)
DROP SCHEMA IF EXISTS hangfire CASCADE;

-- Drop the DbUp journal table (tracks which scripts have been executed)
DROP TABLE IF EXISTS public."SchemaVersions";

-- Drop shared functions
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- Verify clean state
DO $$
BEGIN
    RAISE NOTICE 'Database reset complete. All EthelPMS schemas dropped.';
    RAISE NOTICE 'Run dotnet run to rebuild everything from scratch.';
END $$;
