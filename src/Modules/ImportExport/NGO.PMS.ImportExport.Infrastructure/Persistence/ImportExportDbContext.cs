using Microsoft.EntityFrameworkCore;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.ImportExport.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.ImportExport.Infrastructure.Persistence;

public class ImportExportDbContext : MultiTenantDbContext, IImportExportDbContext
{
    public DbSet<ImportTemplate> ImportTemplates => Set<ImportTemplate>();
    public DbSet<ImportJob> ImportJobs => Set<ImportJob>();
    public DbSet<ExportJob> ExportJobs => Set<ExportJob>();
    public DbSet<DataSyncConfig> DataSyncConfigs => Set<DataSyncConfig>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public ImportExportDbContext(DbContextOptions<ImportExportDbContext> options, ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("importexport");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ImportExportDbContext).Assembly);
    }
}
