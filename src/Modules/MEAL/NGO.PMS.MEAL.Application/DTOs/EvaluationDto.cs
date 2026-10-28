namespace NGO.PMS.MEAL.Application.DTOs;

public class EvaluationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid ProjectId { get; set; }
    public string EvaluationType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? PrimaryDacCriteria { get; set; }
    public DateTimeOffset PlannedStartDate { get; set; }
    public DateTimeOffset PlannedEndDate { get; set; }
    public DateTimeOffset? ActualStartDate { get; set; }
    public DateTimeOffset? ActualEndDate { get; set; }
    public decimal? Budget { get; set; }
    public Guid? LeadEvaluatorUserId { get; set; }
    public string? ExternalEvaluator { get; set; }
    public string? Methodology { get; set; }
    public string? Scope { get; set; }
    public string? KeyQuestions { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public List<EvaluationFindingDto> Findings { get; set; } = [];
}
