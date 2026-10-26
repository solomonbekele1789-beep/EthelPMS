namespace NGO.PMS.Reporting.Application.DTOs;

public class ReportTemplateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ReportType { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int RequiredApprovalLevels { get; set; }
    public int SubmissionDeadlineDays { get; set; }
    public List<ReportTemplateSectionDto> Sections { get; set; } = [];
}
