namespace NGO.PMS.Partnerships.Application.DTOs;

public class PartnerComplianceDto
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid SubGranteeId { get; set; }
    public string ComplianceType { get; set; } = string.Empty;
    public DateTime CheckDate { get; set; }
    public Guid AssessorId { get; set; }
    public int Score { get; set; }
    public string Findings { get; set; } = string.Empty;
    public string? Recommendations { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? FollowUpDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
