using Microsoft.EntityFrameworkCore;
using NGO.PMS.Settings.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Settings.Application.Abstractions;

public interface ISettingsDbContext
{
    DbSet<SystemSetting> SystemSettings { get; }
    DbSet<OrgSetting> OrgSettings { get; }
    DbSet<ApprovalConfig> ApprovalConfigs { get; }
    DbSet<AlertThreshold> AlertThresholds { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
