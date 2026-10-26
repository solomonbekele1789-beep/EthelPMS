using Microsoft.EntityFrameworkCore;
using NGO.PMS.Dashboards.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Dashboards.Application.Abstractions;

public interface IDashboardsDbContext
{
    DbSet<DashboardConfig> DashboardConfigs { get; }
    DbSet<DashboardWidget> DashboardWidgets { get; }
    DbSet<SavedFilter> SavedFilters { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
