namespace NGO.PMS.SharedKernel.Outbox;

/// <summary>
/// Tracks processed integration events per consumer for idempotency.
/// Before processing, the consumer records the message ID + its own name.
/// On subsequent deliveries, the consumer checks this table and skips if already processed.
/// Stored in the shared outbox.inbox_messages table.
/// </summary>
public class InboxMessage
{
    /// <summary>
    /// Same ID as the outbox message / integration event.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Fully-qualified type name of the integration event.
    /// </summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// Fully-qualified type name of the consumer handler.
    /// </summary>
    public string ConsumerName { get; set; } = string.Empty;

    /// <summary>
    /// When this consumer processed the event.
    /// </summary>
    public DateTimeOffset ProcessedAt { get; set; } = DateTimeOffset.UtcNow;
}
