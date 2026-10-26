using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Application;
using NGO.PMS.PlatformAdmin.Domain.Entities;

namespace NGO.PMS.PlatformAdmin.Infrastructure.Persistence;

public class PlatformDbContext : DbContext, IPlatformDbContext
{
    public DbSet<PlatformTenant> Tenants => Set<PlatformTenant>();
    public DbSet<SubscriptionPackage> SubscriptionPackages => Set<SubscriptionPackage>();
    public DbSet<TenantModule> TenantModules => Set<TenantModule>();
    public DbSet<TenantAccessKey> AccessKeys => Set<TenantAccessKey>();
    public DbSet<ProvisioningLog> ProvisioningLogs => Set<ProvisioningLog>();

    public PlatformDbContext(DbContextOptions<PlatformDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("platform");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PlatformDbContext).Assembly);
    }
}
