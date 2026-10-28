using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Events;

public sealed record ProjectMemberAddedEvent(Guid ProjectId, Guid UserId, string Role) : IDomainEvent;
