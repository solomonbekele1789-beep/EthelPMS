using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Donors.Domain.Events;

public sealed record GrantConditionOverdueEvent(Guid ConditionId, Guid GrantId, DateTime DueDate) : IDomainEvent;
