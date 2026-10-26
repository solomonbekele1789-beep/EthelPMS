using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Notifications;

/// <summary>
/// Fired when a notification is created for a user.
/// Consumed by: SignalR hub (real-time push), FCM (mobile push), Email service.
/// </summary>
public sealed record NotificationCreatedIntegrationEvent : IntegrationEvent
{
    public Guid NotificationId { get; init; }
    public Guid RecipientUserId { get; init; }
    public string EventType { get; init; } = string.Empty;
    public string Channel { get; init; } = string.Empty;
}
