using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.MEAL;

/// <summary>
/// Fired when an evaluation is completed.
/// Consumed by: Projects (update project status), Notifications (notify stakeholders).
/// </summary>
public sealed record EvaluationCompletedIntegrationEvent : IntegrationEvent
{
    public Guid EvaluationId { get; init; }
    public Guid ProjectId { get; init; }
}
