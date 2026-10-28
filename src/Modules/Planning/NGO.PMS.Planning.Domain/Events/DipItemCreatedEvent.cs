using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Planning.Domain.Events;

public sealed record DipItemCreatedEvent(Guid DipItemId, Guid ActivityId, Guid ProjectId) : IDomainEvent;
