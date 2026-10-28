using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.PlatformAdmin.Domain.Events;

public record TenantSuspendedEvent(Guid TenantId, string Name, string Reason) : IDomainEvent;
