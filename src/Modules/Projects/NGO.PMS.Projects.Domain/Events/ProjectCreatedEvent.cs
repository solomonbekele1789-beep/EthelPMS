using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Events;

public sealed record ProjectCreatedEvent(Guid ProjectId, string Code, string Name) : IDomainEvent;
