using NGO.PMS.SystemReports.Domain.Enums;
using NGO.PMS.SystemReports.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.SystemReports.Domain.Entities;

public class GeneratedReport : BaseEntity
{
    public Guid ReportTemplateId { get; private set; }
    public Guid? ScheduleId { get; private set; }
    public Guid GeneratedById { get; private set; }
    public DateTimeOffset GeneratedAt { get; private set; }
    public ReportFormat ReportFormat { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public long FileSize { get; private set; }
    public string StoragePath { get; private set; } = string.Empty;
    public DateTimeOffset? ExpiresAt { get; private set; }

    public Guid OrganizationId { get; set; }

    // Navigation
    public ReportTemplate? ReportTemplate { get; private set; }
    public ReportSchedule? Schedule { get; private set; }

    public static GeneratedReport Create(
        Guid reportTemplateId, Guid generatedById, ReportFormat format,
        string fileName, long fileSize, string storagePath,
        Guid orgId, Guid? scheduleId = null, DateTimeOffset? expiresAt = null)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new ArgumentException("File name is required.", nameof(fileName));
        if (string.IsNullOrWhiteSpace(storagePath))
            throw new ArgumentException("Storage path is required.", nameof(storagePath));

        var report = new GeneratedReport
        {
            ReportTemplateId = reportTemplateId,
            ScheduleId = scheduleId,
            GeneratedById = generatedById,
            GeneratedAt = DateTimeOffset.UtcNow,
            ReportFormat = format,
            FileName = fileName,
            FileSize = fileSize,
            StoragePath = storagePath,
            ExpiresAt = expiresAt,
            OrganizationId = orgId
        };
        report.AddDomainEvent(new ReportGeneratedEvent(report.Id, orgId, fileName, format.ToString()));
        return report;
    }
}
