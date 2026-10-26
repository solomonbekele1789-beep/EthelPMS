namespace NGO.PMS.Partnerships.Application.DTOs;

public class PartnerReportDto
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid SubGranteeId { get; set; }
    public string ReportType { get; set; } = string.Empty;
    public DateTime ReportingPeriodStart { get; set; }
    public DateTime ReportingPeriodEnd { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Narrative { get; set; }
    public string? FinancialSummaryJson { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public Guid? ReviewedById { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ReviewComments { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
