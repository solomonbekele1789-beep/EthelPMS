namespace NGO.PMS.SystemReports.Application.DTOs;

public class GeneratedReportDto
{
    public Guid Id { get; set; }
    public Guid ReportTemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public Guid? ScheduleId { get; set; }
    public Guid GeneratedById { get; set; }
    public DateTimeOffset GeneratedAt { get; set; }
    public string ReportFormat { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string StoragePath { get; set; } = string.Empty;
    public DateTimeOffset? ExpiresAt { get; set; }
}
