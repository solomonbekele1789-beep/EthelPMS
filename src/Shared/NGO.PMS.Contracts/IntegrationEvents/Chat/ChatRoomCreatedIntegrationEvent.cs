using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Chat;

/// <summary>
/// Fired when a new chat room is created.
/// Consumed by: Notifications (inform participants).
/// </summary>
public sealed record ChatRoomCreatedIntegrationEvent : IntegrationEvent
{
    public Guid ChatRoomId { get; init; }
    public string RoomType { get; init; } = string.Empty;
}
