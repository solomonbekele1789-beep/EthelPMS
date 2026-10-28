namespace NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;

public record TenantModuleDto(string ModuleName, bool IsEnabled, DateTimeOffset? EnabledAt);
