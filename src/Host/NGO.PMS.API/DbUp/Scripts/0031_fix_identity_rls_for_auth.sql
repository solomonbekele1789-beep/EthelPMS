-- MOVED: This script's logic has been relocated to 0031_identity_rls_policies_auth_fix.sql
-- which includes "_rls_policies" in the filename so DbUp picks it up in Phase 3 (post-migration).
-- This file is intentionally a no-op to avoid running RLS changes before tables exist in Phase 1.
SELECT 1;
