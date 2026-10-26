namespace NGO.PMS.Risk.Application.DTOs;

public class RiskDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid? RiskCategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Likelihood { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Owner { get; set; }
    public Guid? OwnerUserId { get; set; }
    public string? Location { get; set; }
    public DateTime IdentifiedDate { get; set; }
    public DateTime? ResolvedDate { get; set; }
    public string? ResidualRiskNotes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public List<RiskMitigationDto> Mitigations { get; set; } = [];
    public RiskAssessmentDto? LatestAssessment { get; set; }
}
