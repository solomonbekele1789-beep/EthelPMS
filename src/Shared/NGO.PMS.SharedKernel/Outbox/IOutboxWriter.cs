namespace NGO.PMS.SharedKernel.Outbox;

/// <summary>
/// Writes integration events to the outbox table within the current transaction.
/// Each module's DbContext includes an OutboxMessages DbSet for this purpose.
/// </summary>
public interface IOutboxWriter
{
    /// <summary>
    /// Serializes the event and adds it to the outbox for later relay.
    /// Must be called within the same transaction as the domain changes.
    /// </summary>
    Task WriteAsync<TEvent>(TEvent integrationEvent, CancellationToken ct = default)
        where TEvent : class;
}
