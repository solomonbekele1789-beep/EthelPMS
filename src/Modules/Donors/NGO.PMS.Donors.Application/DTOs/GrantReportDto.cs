namespace NGO.PMS.Donors.Application.DTOs;

public class GrantReportDto
{
    public Guid Id { get; set; }
    public Guid GrantId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ReportType { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public DateTime? SubmittedDate { get; set; }
    public bool IsSubmitted { get; set; }
    public string? FileUrl { get; set; }
    public string? Notes { get; set; }
}
