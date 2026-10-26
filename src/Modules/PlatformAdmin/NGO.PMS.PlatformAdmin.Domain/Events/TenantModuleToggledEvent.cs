using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.PlatformAdmin.Domain.Events;

public record TenantModuleToggledEvent(Guid TenantId, string ModuleName, bool Enabled) : IDomainEvent;
