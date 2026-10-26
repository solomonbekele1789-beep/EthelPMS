using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Contracts.IntegrationEvents;

/// <summary>
/// Base class for all cross-module integration events.
/// Delivered via the Transactional Outbox pattern.
/// </summary>
public abstract record IntegrationEvent : IIntegrationEvent
{
    public Guid EventId { get; init; } = Guid.NewGuid();
    public DateTimeOffset OccurredOn { get; init; } = DateTimeOffset.UtcNow;
    public Guid OrganizationId { get; init; }
}
