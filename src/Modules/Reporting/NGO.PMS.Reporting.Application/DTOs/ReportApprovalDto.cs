namespace NGO.PMS.Reporting.Application.DTOs;

public class ReportApprovalDto
{
    public Guid Id { get; set; }
    public Guid ReportId { get; set; }
    public Guid UserId { get; set; }
    public int ApprovalLevel { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Comments { get; set; }
    public DateTimeOffset ActionDate { get; set; }
}
