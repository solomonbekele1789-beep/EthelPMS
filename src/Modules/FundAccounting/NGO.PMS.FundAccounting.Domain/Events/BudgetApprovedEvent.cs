using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Domain.Events;

public sealed record BudgetApprovedEvent(Guid BudgetId, Guid ProjectId) : IDomainEvent;
