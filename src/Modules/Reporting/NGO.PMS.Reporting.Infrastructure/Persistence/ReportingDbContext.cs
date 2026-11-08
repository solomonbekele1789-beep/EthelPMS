using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NGO.PMS.Reporting.Application.Abstractions;
using NGO.PMS.Reporting.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Reporting.Infrastructure.Persistence;

public class ReportingDbContext : MultiTenantDbContext, IReportingDbContext
{
    public DbSet<ReportTemplate> ReportTemplates => Set<ReportTemplate>();
    public DbSet<ReportTemplateSection> ReportTemplateSections => Set<ReportTemplateSection>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<ReportSection> ReportSections => Set<ReportSection>();
    public DbSet<ReportDataEntry> ReportDataEntries => Set<ReportDataEntry>();
    public DbSet<ReportApproval> ReportApprovals => Set<ReportApproval>();
    public DbSet<ReportComment> ReportComments => Set<ReportComment>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public ReportingDbContext(
        DbContextOptions<ReportingDbContext> options,
        ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("reporting");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ReportingDbContext).Assembly);

        var utcConverter = new ValueConverter<DateTimeOffset, DateTimeOffset>(
            v => v.ToUniversalTime(),
            v => v);

        var nullableUtcConverter = new ValueConverter<DateTimeOffset?, DateTimeOffset?>(
            v => v.HasValue ? v.Value.ToUniversalTime() : v,
            v => v);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTimeOffset))
                {
                    property.SetValueConverter(utcConverter);
                }
                else if (property.ClrType == typeof(DateTimeOffset?))
                {
                    property.SetValueConverter(nullableUtcConverter);
                }
            }
        }
    }
}
