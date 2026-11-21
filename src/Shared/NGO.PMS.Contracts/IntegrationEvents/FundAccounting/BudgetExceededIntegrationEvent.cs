namespace NGO.PMS.Contracts.IntegrationEvents.FundAccounting;

public sealed record BudgetExceededIntegrationEvent(
    Guid ProjectId,
    Guid BudgetLineId,
    decimal BudgetedAmount,
    decimal ActualAmount) : IntegrationEvent;
