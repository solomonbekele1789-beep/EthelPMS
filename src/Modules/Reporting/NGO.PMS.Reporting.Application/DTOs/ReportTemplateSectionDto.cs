namespace NGO.PMS.Reporting.Application.DTOs;

public class ReportTemplateSectionDto
{
    public Guid Id { get; set; }
    public Guid ReportTemplateId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string SectionType { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }
    public string? Instructions { get; set; }
}
