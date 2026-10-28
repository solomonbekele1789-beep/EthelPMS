using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Identity.Domain.Events;

public record UserDeactivatedEvent(Guid UserId) : IDomainEvent;
