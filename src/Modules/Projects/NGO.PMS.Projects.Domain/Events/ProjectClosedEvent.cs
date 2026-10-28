using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Events;

public sealed record ProjectClosedEvent(Guid ProjectId, Guid ClosedBy, string Reason) : IDomainEvent;
