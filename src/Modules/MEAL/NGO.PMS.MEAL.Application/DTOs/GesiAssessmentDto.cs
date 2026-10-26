namespace NGO.PMS.MEAL.Application.DTOs;

public class GesiAssessmentDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string? GesiAnalysis { get; set; }
    public int GenderMarkerScore { get; set; }
    public string? GenderMarkerJustification { get; set; }
    public string? KeyFindings { get; set; }
    public string? Recommendations { get; set; }
    public DateTimeOffset AssessmentDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
