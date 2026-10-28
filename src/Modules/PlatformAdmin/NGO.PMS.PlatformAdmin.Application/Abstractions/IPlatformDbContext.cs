using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Domain.Entities;

namespace NGO.PMS.PlatformAdmin.Application;

public interface IPlatformDbContext
{
    DbSet<PlatformTenant> Tenants { get; }
    DbSet<SubscriptionPackage> SubscriptionPackages { get; }
    DbSet<TenantModule> TenantModules { get; }
    DbSet<TenantAccessKey> AccessKeys { get; }
    DbSet<ProvisioningLog> ProvisioningLogs { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
