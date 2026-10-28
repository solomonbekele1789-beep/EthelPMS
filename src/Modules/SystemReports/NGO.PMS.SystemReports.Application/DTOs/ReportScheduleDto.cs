namespace NGO.PMS.SystemReports.Application.DTOs;

public class ReportScheduleDto
{
    public Guid Id { get; set; }
    public Guid ReportTemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string CronExpression { get; set; } = string.Empty;
    public string Recipients { get; set; } = string.Empty;
    public string? Parameters { get; set; }
    public DateTimeOffset? LastRunAt { get; set; }
    public DateTimeOffset? NextRunAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
