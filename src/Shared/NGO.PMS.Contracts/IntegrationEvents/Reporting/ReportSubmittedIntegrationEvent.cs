using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Reporting;

/// <summary>
/// Fired when a report is submitted for approval.
/// Consumed by: Notifications (notify approvers).
/// </summary>
public sealed record ReportSubmittedIntegrationEvent : IntegrationEvent
{
    public Guid ReportId { get; init; }
    public string ReportType { get; init; } = string.Empty;
    public Guid ProjectId { get; init; }
}
