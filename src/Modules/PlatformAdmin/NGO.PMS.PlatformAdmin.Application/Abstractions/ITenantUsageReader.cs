namespace NGO.PMS.PlatformAdmin.Application.Abstractions;

public record TenantActualUsage(int CurrentUsers, int CurrentProjects, long StorageUsedBytes);

public interface ITenantUsageReader
{
    Task<TenantActualUsage> GetUsageAsync(Guid tenantId, CancellationToken ct = default);
}
