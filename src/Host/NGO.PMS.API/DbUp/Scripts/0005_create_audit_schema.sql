-- Immutable audit trail schema.
-- Only INSERT is allowed via the ethelpms_audit_writer role (see 0002).
-- UPDATE and DELETE are denied at the database level.

CREATE TABLE IF NOT EXISTS audit.audit_logs (
    id                bigint          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    table_name        varchar(128)    NOT NULL,
    schema_name       varchar(64)     NOT NULL,
    entity_id         varchar(64)     NOT NULL,
    operation         varchar(10)     NOT NULL,
    old_values        jsonb,
    new_values        jsonb,
    changed_columns   text[],
    user_id           uuid,
    user_email        varchar(256),
    organization_id   uuid,
    correlation_id    varchar(64),
    ip_address        varchar(45),
    user_agent        varchar(512),
    timestamp         timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_audit_logs_entity
    ON audit.audit_logs (schema_name, table_name, entity_id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_user
    ON audit.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_org
    ON audit.audit_logs (organization_id);
CREATE INDEX IF NOT EXISTS ix_audit_logs_timestamp
    ON audit.audit_logs (timestamp);
CREATE INDEX IF NOT EXISTS ix_audit_logs_correlation
    ON audit.audit_logs (correlation_id);
