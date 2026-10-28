using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Events;

public sealed record ProjectApprovedEvent(Guid ProjectId, Guid ApprovedBy) : IDomainEvent;
