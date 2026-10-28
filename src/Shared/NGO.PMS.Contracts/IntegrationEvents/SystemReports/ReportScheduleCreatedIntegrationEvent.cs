using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.SystemReports;

/// <summary>
/// Published when a new report schedule is created.
/// Consumed by: Notifications.
/// </summary>
public sealed record ReportScheduleCreatedIntegrationEvent : IntegrationEvent
{
    public Guid ScheduleId { get; init; }
    public string Name { get; init; } = string.Empty;
}
