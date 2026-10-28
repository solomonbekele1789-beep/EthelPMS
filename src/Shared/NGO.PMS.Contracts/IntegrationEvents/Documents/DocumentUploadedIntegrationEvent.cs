using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Documents;

/// <summary>
/// Fired when a document is uploaded.
/// Consumed by: Notifications (inform project team), Chat (link in message).
/// </summary>
public sealed record DocumentUploadedIntegrationEvent : IntegrationEvent
{
    public Guid DocumentId { get; init; }
    public string FileName { get; init; } = string.Empty;
    public int Version { get; init; }
}
