namespace NGO.PMS.Contracts.IntegrationEvents.Planning;

/// <summary>
/// Published when an annual plan is approved.
/// Consumed by: DIP (enable DIP creation), Reporting.
/// </summary>
public sealed record AnnualPlanApprovedIntegrationEvent : IntegrationEvent
{
    public Guid PlanId { get; init; }
    public Guid ProjectId { get; init; }
    public int FiscalYear { get; init; }
}
