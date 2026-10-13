using MediatR;

namespace NGO.PMS.SharedKernel.Domain;

/// <summary>
/// Marker interface for domain events dispatched via MediatR.
/// </summary>
public interface IDomainEvent : INotification
{
    DateTimeOffset OccurredOn => DateTimeOffset.UtcNow;
}
