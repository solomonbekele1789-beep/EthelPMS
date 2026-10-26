using Microsoft.EntityFrameworkCore;
using NGO.PMS.Planning.Application;
using NGO.PMS.Planning.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Planning.Infrastructure.Persistence;

public class PlanningDbContext : MultiTenantDbContext, IPlanningDbContext
{
    public DbSet<PlanEntry> PlanEntries => Set<PlanEntry>();
    public DbSet<PlanIndicatorAllocation> PlanIndicatorAllocations => Set<PlanIndicatorAllocation>();
    public DbSet<PlanActivity> PlanActivities => Set<PlanActivity>();
    public DbSet<DipItem> DipItems => Set<DipItem>();
    public DbSet<DipMilestone> DipMilestones => Set<DipMilestone>();
    public DbSet<PlanningConfiguration> PlanningConfigurations => Set<PlanningConfiguration>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public PlanningDbContext(
        DbContextOptions<PlanningDbContext> options,
        ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("planning");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PlanningDbContext).Assembly);
    }
}
