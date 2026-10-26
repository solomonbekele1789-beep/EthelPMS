using NGO.PMS.Notifications.Domain.Entities;

namespace NGO.PMS.Notifications.Application.Abstractions;

/// <summary>
/// Abstraction for sending notifications via different channels (SignalR, FCM, Email).
/// Implementation deferred to infrastructure layer.
/// </summary>
public interface INotificationSender
{
    Task SendAsync(Notification notification, CancellationToken ct = default);
}
