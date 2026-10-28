namespace NGO.PMS.Contracts.IntegrationEvents.Projects;

/// <summary>
/// Published when a project's budget allocation changes (intervention area allocation).
/// Consumed by: FundAccounting (sync budget lines), Reporting (refresh budget summary).
/// </summary>
public sealed record BudgetAllocatedIntegrationEvent : IntegrationEvent
{
    public Guid ProjectId { get; init; }
    public string ProjectCode { get; init; } = string.Empty;
    public Guid InterventionAreaId { get; init; }
    public decimal BudgetAllocated { get; init; }
    public decimal BudgetPercentage { get; init; }
}
