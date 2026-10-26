using Microsoft.EntityFrameworkCore;
using NGO.PMS.Reporting.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Reporting.Application.Abstractions;

public interface IReportingDbContext
{
    DbSet<ReportTemplate> ReportTemplates { get; }
    DbSet<ReportTemplateSection> ReportTemplateSections { get; }
    DbSet<Report> Reports { get; }
    DbSet<ReportSection> ReportSections { get; }
    DbSet<ReportDataEntry> ReportDataEntries { get; }
    DbSet<ReportApproval> ReportApprovals { get; }
    DbSet<ReportComment> ReportComments { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
