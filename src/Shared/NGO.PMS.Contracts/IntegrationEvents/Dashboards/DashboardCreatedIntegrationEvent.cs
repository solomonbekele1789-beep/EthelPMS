using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Dashboards;

/// <summary>
/// Published when a new dashboard is created.
/// Consumed by: Notifications, Settings.
/// </summary>
public sealed record DashboardCreatedIntegrationEvent : IntegrationEvent
{
    public Guid DashboardId { get; init; }
    public string DashboardType { get; init; } = string.Empty;
}
