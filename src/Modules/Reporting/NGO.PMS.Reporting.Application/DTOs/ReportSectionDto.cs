namespace NGO.PMS.Reporting.Application.DTOs;

public class ReportSectionDto
{
    public Guid Id { get; set; }
    public Guid ReportId { get; set; }
    public Guid? TemplateSectionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string SectionType { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string? Content { get; set; }
    public List<ReportDataEntryDto> DataEntries { get; set; } = [];
}
