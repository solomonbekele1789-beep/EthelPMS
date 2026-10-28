namespace NGO.PMS.Contracts.IntegrationEvents.Planning;

/// <summary>
/// Published when a quarterly plan is approved.
/// Consumed by: DIP, Reporting.
/// </summary>
public sealed record QuarterlyPlanApprovedIntegrationEvent : IntegrationEvent
{
    public Guid PlanId { get; init; }
    public Guid ProjectId { get; init; }
    public int Quarter { get; init; }
}
