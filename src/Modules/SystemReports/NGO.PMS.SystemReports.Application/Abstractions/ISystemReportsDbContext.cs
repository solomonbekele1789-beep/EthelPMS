using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.SystemReports.Application.Abstractions;

public interface ISystemReportsDbContext
{
    DbSet<ReportTemplate> ReportTemplates { get; }
    DbSet<ReportSchedule> ReportSchedules { get; }
    DbSet<GeneratedReport> GeneratedReports { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
