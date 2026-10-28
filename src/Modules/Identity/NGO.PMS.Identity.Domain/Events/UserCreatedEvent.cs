using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Identity.Domain.Events;

public record UserCreatedEvent(Guid UserId, string Email) : IDomainEvent;
