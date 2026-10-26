using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Reporting;

/// <summary>
/// Fired when a report receives final approval.
/// Consumed by: Dashboards (update metrics), Donors (auto-share if configured).
/// </summary>
public sealed record ReportApprovedIntegrationEvent : IntegrationEvent
{
    public Guid ReportId { get; init; }
    public Guid ApprovedBy { get; init; }
}
