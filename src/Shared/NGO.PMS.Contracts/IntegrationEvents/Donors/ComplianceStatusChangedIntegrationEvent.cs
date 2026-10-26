using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Donors;

/// <summary>
/// Fired when a grant's compliance status (RAG) changes.
/// Consumed by: Notifications (alert compliance officers), Reporting (donor compliance dashboard).
/// </summary>
public sealed record ComplianceStatusChangedIntegrationEvent : IntegrationEvent
{
    public Guid GrantId { get; init; }
    public string OldStatus { get; init; } = string.Empty;
    public string NewStatus { get; init; } = string.Empty;
}
