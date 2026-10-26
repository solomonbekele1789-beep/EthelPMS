using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.PlatformAdmin.Domain.Events;

public record TenantCreatedEvent(Guid TenantId, string Name, string AdminEmail) : IDomainEvent;
