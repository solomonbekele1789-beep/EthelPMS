using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.PlatformAdmin.Domain.Events;

public record TenantActivatedEvent(Guid TenantId, string Name) : IDomainEvent;
