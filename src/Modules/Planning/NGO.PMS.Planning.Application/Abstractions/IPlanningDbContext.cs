using Microsoft.EntityFrameworkCore;
using NGO.PMS.Planning.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Planning.Application;

public interface IPlanningDbContext
{
    DbSet<PlanEntry> PlanEntries { get; }
    DbSet<PlanIndicatorAllocation> PlanIndicatorAllocations { get; }
    DbSet<PlanActivity> PlanActivities { get; }
    DbSet<DipItem> DipItems { get; }
    DbSet<DipMilestone> DipMilestones { get; }
    DbSet<PlanningConfiguration> PlanningConfigurations { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
