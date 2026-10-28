using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Tasks;

/// <summary>
/// Fired when a task is marked as completed.
/// Consumed by: Reporting (project progress metrics), MEAL (activity tracking).
/// </summary>
public sealed record TaskCompletedIntegrationEvent : IntegrationEvent
{
    public Guid TaskId { get; init; }
    public Guid ProjectId { get; init; }
}
