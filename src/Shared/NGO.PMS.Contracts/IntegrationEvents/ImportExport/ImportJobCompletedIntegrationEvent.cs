using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.ImportExport;

/// <summary>
/// Published when a data import job completes.
/// Consumed by: Notifications, Dashboards.
/// </summary>
public sealed record ImportJobCompletedIntegrationEvent : IntegrationEvent
{
    public Guid JobId { get; init; }
    public string Module { get; init; } = string.Empty;
    public int SuccessRows { get; init; }
    public int ErrorRows { get; init; }
}
