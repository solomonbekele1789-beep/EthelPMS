namespace NGO.PMS.MEAL.Application.DTOs;

public class LessonLearnedDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Context { get; set; }
    public string? ActionTaken { get; set; }
    public string? Impact { get; set; }
    public string? RecommendedAction { get; set; }
    public Guid? EvaluationId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
