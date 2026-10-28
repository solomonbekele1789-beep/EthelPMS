using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Documents;

/// <summary>
/// Fired when a new version of a document is uploaded.
/// Consumed by: Notifications (inform stakeholders of update).
/// </summary>
public sealed record DocumentVersionCreatedIntegrationEvent : IntegrationEvent
{
    public Guid DocumentId { get; init; }
    public Guid VersionId { get; init; }
    public int VersionNumber { get; init; }
}
