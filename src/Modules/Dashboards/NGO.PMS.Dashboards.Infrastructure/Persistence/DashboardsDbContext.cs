using Microsoft.EntityFrameworkCore;
using NGO.PMS.Dashboards.Application.Abstractions;
using NGO.PMS.Dashboards.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Dashboards.Infrastructure.Persistence;

public class DashboardsDbContext : MultiTenantDbContext, IDashboardsDbContext
{
    public DbSet<DashboardConfig> DashboardConfigs => Set<DashboardConfig>();
    public DbSet<DashboardWidget> DashboardWidgets => Set<DashboardWidget>();
    public DbSet<SavedFilter> SavedFilters => Set<SavedFilter>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public DashboardsDbContext(
        DbContextOptions<DashboardsDbContext> options,
        ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("dashboards");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DashboardsDbContext).Assembly);
        modelBuilder.Entity<OutboxMessage>().ToTable("dashboard_outbox_messages");
    }
}
