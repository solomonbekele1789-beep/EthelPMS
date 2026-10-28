using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Dashboards;

/// <summary>
/// Published when a dashboard is shared with another user.
/// Consumed by: Notifications.
/// </summary>
public sealed record DashboardSharedIntegrationEvent : IntegrationEvent
{
    public Guid DashboardId { get; init; }
    public Guid SharedWithUserId { get; init; }
}
