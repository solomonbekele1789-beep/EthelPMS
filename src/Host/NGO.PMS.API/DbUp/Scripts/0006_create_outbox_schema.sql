-- Shared outbox schema for transactional outbox + inbox pattern.
-- Individual module outbox tables live in their own schemas.
-- The inbox table is shared across all consumers for idempotency.

CREATE TABLE IF NOT EXISTS outbox.inbox_messages (
    id              uuid            PRIMARY KEY,
    event_type      varchar(200)    NOT NULL,
    consumer_name   varchar(200)    NOT NULL,
    processed_at    timestamptz     NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_inbox_consumer
    ON outbox.inbox_messages (id, consumer_name);
