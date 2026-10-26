namespace NGO.PMS.Partnerships.Application.DTOs;

public class PartnerReportListDto
{
    public Guid Id { get; set; }
    public Guid SubGranteeId { get; set; }
    public string SubGranteeName { get; set; } = string.Empty;
    public string ReportType { get; set; } = string.Empty;
    public DateTime ReportingPeriodStart { get; set; }
    public DateTime ReportingPeriodEnd { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? SubmittedAt { get; set; }
}
