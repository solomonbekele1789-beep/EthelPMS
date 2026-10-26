using Microsoft.EntityFrameworkCore;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SystemReports.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.SystemReports.Infrastructure.Persistence;

public class SystemReportsDbContext : MultiTenantDbContext, ISystemReportsDbContext
{
    public DbSet<ReportTemplate> ReportTemplates => Set<ReportTemplate>();
    public DbSet<ReportSchedule> ReportSchedules => Set<ReportSchedule>();
    public DbSet<GeneratedReport> GeneratedReports => Set<GeneratedReport>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public SystemReportsDbContext(
        DbContextOptions<SystemReportsDbContext> options,
        ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("reports");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SystemReportsDbContext).Assembly);
    }
}
