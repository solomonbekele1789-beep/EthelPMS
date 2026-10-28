using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Partnerships.Domain.Events;

public sealed record SubGranteeRegisteredEvent(Guid SubGranteeId, Guid OrganizationId, string Name) : IDomainEvent;
