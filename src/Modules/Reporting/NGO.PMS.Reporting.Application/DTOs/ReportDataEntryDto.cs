namespace NGO.PMS.Reporting.Application.DTOs;

public class ReportDataEntryDto
{
    public Guid Id { get; set; }
    public Guid ReportSectionId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string? Label { get; set; }
    public string? StringValue { get; set; }
    public decimal? NumericValue { get; set; }
    public int SortOrder { get; set; }
    public Guid? IndicatorId { get; set; }
    public Guid? ActivityId { get; set; }
}
