namespace NGO.PMS.SharedKernel.Outbox;

/// <summary>
/// Outbox message stored per-module schema for reliable cross-module event delivery.
/// The Hangfire relay job picks up unprocessed messages and publishes them.
/// </summary>
public class OutboxMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string EventType { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ProcessedAt { get; set; }
    public string? Error { get; set; }
    public int RetryCount { get; set; }
}
