using Microsoft.EntityFrameworkCore;
using NGO.PMS.ImportExport.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.ImportExport.Application.Abstractions;

public interface IImportExportDbContext
{
    DbSet<ImportTemplate> ImportTemplates { get; }
    DbSet<ImportJob> ImportJobs { get; }
    DbSet<ExportJob> ExportJobs { get; }
    DbSet<DataSyncConfig> DataSyncConfigs { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
