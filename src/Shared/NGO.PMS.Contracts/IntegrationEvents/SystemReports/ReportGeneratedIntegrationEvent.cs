using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.SystemReports;

/// <summary>
/// Published when a system report is generated.
/// Consumed by: Notifications, Documents.
/// </summary>
public sealed record ReportGeneratedIntegrationEvent : IntegrationEvent
{
    public Guid ReportId { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string ReportFormat { get; init; } = string.Empty;
}
