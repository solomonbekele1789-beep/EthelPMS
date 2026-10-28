using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Planning.Domain.Events;

public sealed record PlanCreatedEvent(Guid PlanEntryId, string Level, Guid ProjectId) : IDomainEvent;
