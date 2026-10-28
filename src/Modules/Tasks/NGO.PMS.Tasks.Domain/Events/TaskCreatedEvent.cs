using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Tasks.Domain.Events;

public sealed record TaskCreatedEvent(Guid TaskId, Guid ProjectId, string Title) : IDomainEvent;
