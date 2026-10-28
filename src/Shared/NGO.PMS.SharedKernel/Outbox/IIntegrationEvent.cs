using MediatR;

namespace NGO.PMS.SharedKernel.Outbox;

/// <summary>
/// Marker interface for integration events consumed by <see cref="IdempotentEventHandler{TEvent}"/>.
/// Extends INotification for MediatR compatibility.
/// Implemented by the IntegrationEvent base record in NGO.PMS.Contracts.
/// </summary>
public interface IIntegrationEvent : INotification
{
    Guid EventId { get; }
}
