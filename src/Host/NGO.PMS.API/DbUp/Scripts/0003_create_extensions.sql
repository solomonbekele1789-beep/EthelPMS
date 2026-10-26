-- PostgreSQL extensions used by EthelPMS
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Trigram similarity for fuzzy search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation (backup for gen_random_uuid)
