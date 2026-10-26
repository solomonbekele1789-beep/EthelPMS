using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Identity.Domain.Events;

public record PasswordChangedEvent(Guid UserId) : IDomainEvent;
