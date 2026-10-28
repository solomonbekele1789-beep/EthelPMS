namespace NGO.PMS.Contracts.IntegrationEvents.FundAccounting;

/// <summary>
/// Published when a budget is approved.
/// Consumed by: Projects (allocate budget), Planning (unlock budget-linked plans),
/// Reporting (budget vs actuals baseline).
/// </summary>
public sealed record BudgetApprovedIntegrationEvent : IntegrationEvent
{
    public Guid BudgetId { get; init; }
    public Guid ProjectId { get; init; }
    public int FiscalYear { get; init; }
}
