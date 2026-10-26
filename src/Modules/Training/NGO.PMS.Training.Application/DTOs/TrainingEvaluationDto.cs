namespace NGO.PMS.Training.Application.DTOs;

public class TrainingEvaluationDto
{
    public Guid Id { get; set; }
    public Guid TrainingSessionId { get; set; }
    public Guid? EvaluatedBy { get; set; }
    public decimal OverallRating { get; set; }
    public string? Feedback { get; set; }
    public string? Recommendations { get; set; }
    public DateTime EvaluationDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
