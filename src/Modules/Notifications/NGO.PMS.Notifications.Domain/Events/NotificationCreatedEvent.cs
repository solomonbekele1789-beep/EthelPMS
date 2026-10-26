using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Domain.Events;

public sealed record NotificationCreatedEvent(
    Guid NotificationId,
    Guid RecipientUserId,
    string EventType) : IDomainEvent;
