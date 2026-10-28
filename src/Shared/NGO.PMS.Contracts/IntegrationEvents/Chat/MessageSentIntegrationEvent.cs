using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Chat;

/// <summary>
/// Fired when a chat message is sent.
/// Consumed by: Notifications (real-time push to participants).
/// </summary>
public sealed record MessageSentIntegrationEvent : IntegrationEvent
{
    public Guid MessageId { get; init; }
    public Guid ChatRoomId { get; init; }
    public Guid SenderUserId { get; init; }
}
