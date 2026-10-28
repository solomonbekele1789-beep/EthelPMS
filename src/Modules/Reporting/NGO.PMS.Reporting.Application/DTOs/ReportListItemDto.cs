namespace NGO.PMS.Reporting.Application.DTOs;

public class ReportListItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ReportType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
    public int? FiscalYear { get; set; }
    public Guid ProjectId { get; set; }
    public decimal PlannedBudget { get; set; }
    public decimal ActualSpent { get; set; }
    public DateTimeOffset? SubmissionDeadline { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
}
