using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Domain.Events;

public sealed record NotificationReadEvent(
    Guid NotificationId,
    Guid UserId) : IDomainEvent;
