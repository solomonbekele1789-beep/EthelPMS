namespace NGO.PMS.SystemReports.Application.DTOs;

public class ReportTemplateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Module { get; set; } = string.Empty;
    public string ReportFormat { get; set; } = string.Empty;
    public bool IsSystemTemplate { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
