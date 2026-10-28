-- Shared reference tables (not tenant-scoped).
-- Used by all modules via IReferenceDataService + Dapper.

CREATE TABLE IF NOT EXISTS reference.currencies (
    code            varchar(3)      PRIMARY KEY,
    name            varchar(100)    NOT NULL,
    symbol          varchar(10)     NOT NULL,
    decimal_places  int             NOT NULL DEFAULT 2,
    is_active       boolean         NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS reference.countries (
    code            varchar(3)      PRIMARY KEY,
    name            varchar(100)    NOT NULL,
    is_active       boolean         NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS reference.regions (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            varchar(100)    NOT NULL,
    code            varchar(20)     NOT NULL UNIQUE,
    country_code    varchar(3)      NOT NULL REFERENCES reference.countries(code),
    is_active       boolean         NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS reference.zones (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            varchar(100)    NOT NULL,
    code            varchar(20)     NOT NULL UNIQUE,
    region_id       uuid            NOT NULL REFERENCES reference.regions(id),
    is_active       boolean         NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS reference.woredas (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            varchar(100)    NOT NULL,
    code            varchar(20)     NOT NULL UNIQUE,
    zone_id         uuid            NOT NULL REFERENCES reference.zones(id),
    is_active       boolean         NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS reference.kebeles (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            varchar(100)    NOT NULL,
    code            varchar(20)     NOT NULL UNIQUE,
    woreda_id       uuid            NOT NULL REFERENCES reference.woredas(id),
    is_active       boolean         NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS reference.ethiopian_calendar (
    gc_date         date            PRIMARY KEY,
    ec_year         int             NOT NULL,
    ec_month        int             NOT NULL,
    ec_day          int             NOT NULL,
    ec_month_name   varchar(20)     NOT NULL,
    is_holiday      boolean         NOT NULL DEFAULT false,
    holiday_name    varchar(100)
);

-- Indexes for reference tables
CREATE INDEX IF NOT EXISTS ix_regions_country ON reference.regions (country_code);
CREATE INDEX IF NOT EXISTS ix_zones_region ON reference.zones (region_id);
CREATE INDEX IF NOT EXISTS ix_woredas_zone ON reference.woredas (zone_id);
CREATE INDEX IF NOT EXISTS ix_kebeles_woreda ON reference.kebeles (woreda_id);
CREATE INDEX IF NOT EXISTS ix_ethiopian_calendar_ec ON reference.ethiopian_calendar (ec_year, ec_month, ec_day);
