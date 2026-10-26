namespace NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;

public record TenantUsageDto(int CurrentUsers, int MaxUsers, int CurrentProjects, int MaxProjects);
