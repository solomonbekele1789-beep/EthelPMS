using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Planning.Domain.Events;

public sealed record PlanApprovedEvent(Guid PlanEntryId, string Level, Guid ApprovedBy) : IDomainEvent;
