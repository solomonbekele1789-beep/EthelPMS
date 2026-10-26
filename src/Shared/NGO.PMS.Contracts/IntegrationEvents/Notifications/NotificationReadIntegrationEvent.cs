using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Notifications;

/// <summary>
/// Fired when a notification is read by the recipient.
/// Consumed by: SignalR hub (update unread count in real-time).
/// </summary>
public sealed record NotificationReadIntegrationEvent : IntegrationEvent
{
    public Guid NotificationId { get; init; }
    public Guid UserId { get; init; }
}
