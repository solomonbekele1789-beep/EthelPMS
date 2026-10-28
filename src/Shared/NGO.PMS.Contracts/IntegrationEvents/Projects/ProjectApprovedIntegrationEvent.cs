namespace NGO.PMS.Contracts.IntegrationEvents.Projects;

/// <summary>
/// Published when a project is approved.
/// Consumed by: Planning (unlock annual plan creation), FundAccounting (activate budget),
/// Notifications (notify team), Documents (create project folder).
/// </summary>
public sealed record ProjectApprovedIntegrationEvent : IntegrationEvent
{
    public Guid ProjectId { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public Guid ApprovedByUserId { get; init; }
    public decimal TotalBudget { get; init; }
    public DateTimeOffset? StartDate { get; init; }
    public DateTimeOffset? EndDate { get; init; }
}
