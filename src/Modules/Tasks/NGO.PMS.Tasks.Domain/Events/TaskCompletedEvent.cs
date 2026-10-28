using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Tasks.Domain.Events;

public sealed record TaskCompletedEvent(Guid TaskId, Guid ProjectId) : IDomainEvent;
