namespace NGO.PMS.Risk.Application.DTOs;

public class RiskAssessmentDto
{
    public Guid Id { get; set; }
    public Guid RiskId { get; set; }
    public string Likelihood { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public string? Notes { get; set; }
    public string AssessedBy { get; set; } = string.Empty;
    public DateTime AssessmentDate { get; set; }
    public string? Source { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
