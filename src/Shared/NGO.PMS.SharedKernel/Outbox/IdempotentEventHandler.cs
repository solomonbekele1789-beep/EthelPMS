using MediatR;
using Microsoft.EntityFrameworkCore;

namespace NGO.PMS.SharedKernel.Outbox;

/// <summary>
/// Base class for integration event consumers that ensures idempotent processing.
/// Checks the inbox table before processing; records the message after processing.
/// Derived handlers implement HandleEvent with their business logic.
/// </summary>
/// <typeparam name="TEvent">The integration event type to handle.</typeparam>
public abstract class IdempotentEventHandler<TEvent> : INotificationHandler<TEvent>
    where TEvent : IIntegrationEvent
{
    private readonly DbContext _db;

    protected IdempotentEventHandler(DbContext db) => _db = db;

    public async Task Handle(TEvent notification, CancellationToken ct)
    {
        var consumerName = GetType().FullName!;

        // Check if already processed (idempotency check)
        var alreadyProcessed = await _db.Set<InboxMessage>()
            .AnyAsync(i => i.Id == notification.EventId
                        && i.ConsumerName == consumerName, ct);

        if (alreadyProcessed)
            return; // Already processed — skip silently

        // Record in inbox FIRST (before processing)
        _db.Set<InboxMessage>().Add(new InboxMessage
        {
            Id = notification.EventId,
            EventType = typeof(TEvent).Name,
            ConsumerName = consumerName
        });

        // Process the event (implemented by derived class)
        await HandleEvent(notification, ct);

        // Save both the inbox record and any changes from HandleEvent
        await _db.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Override this method with the actual event handling logic.
    /// SaveChangesAsync is called automatically by the base class after this completes.
    /// </summary>
    protected abstract Task HandleEvent(TEvent notification, CancellationToken ct);
}
