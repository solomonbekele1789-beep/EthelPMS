using MediatR;

namespace NGO.PMS.SharedKernel.Outbox;

/// <summary>
/// Marker interface for integration events consumed by <see cref="IdempotentEventHandler{TEvent}"/>.
/// Extends INotification for MediatR compatibility.
/// </summary>
public interface IIntegrationEvent : INotification
{
    Guid EventId { get; }
    DateTimeOffset OccurredOn { get; }
    Guid OrganizationId { get; }
}
