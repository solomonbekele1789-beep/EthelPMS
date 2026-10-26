using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Domain.Events;

public sealed record BudgetOverrunDetectedEvent(Guid BudgetLineId, decimal BudgetAmount, decimal ActualAmount) : IDomainEvent;
