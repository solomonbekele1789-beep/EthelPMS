using Microsoft.EntityFrameworkCore;
using NGO.PMS.Settings.Application.Abstractions;
using NGO.PMS.Settings.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Settings.Infrastructure.Persistence;

public class SettingsDbContext : MultiTenantDbContext, ISettingsDbContext
{
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<OrgSetting> OrgSettings => Set<OrgSetting>();
    public DbSet<ApprovalConfig> ApprovalConfigs => Set<ApprovalConfig>();
    public DbSet<AlertThreshold> AlertThresholds => Set<AlertThreshold>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public SettingsDbContext(
        DbContextOptions<SettingsDbContext> options,
        ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("dashboards");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SettingsDbContext).Assembly);
        modelBuilder.Entity<OutboxMessage>().ToTable("settings_outbox_messages");
    }
}
