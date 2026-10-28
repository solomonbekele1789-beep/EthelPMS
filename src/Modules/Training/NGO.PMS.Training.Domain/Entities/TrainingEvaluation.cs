using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Training.Domain.Entities;

/// <summary>
/// Post-training evaluation per REQ-TRN-007.
/// </summary>
public class TrainingEvaluation : AuditableEntity
{
    public Guid TrainingSessionId { get; private set; }
    public Guid? EvaluatedBy { get; private set; }
    public decimal OverallRating { get; private set; }
    public string? Feedback { get; private set; }
    public string? Recommendations { get; private set; }
    public DateTime EvaluationDate { get; private set; }

    public static TrainingEvaluation Create(
        Guid trainingSessionId, decimal overallRating, DateTime evaluationDate,
        Guid? evaluatedBy = null, string? feedback = null,
        string? recommendations = null)
    {
        if (overallRating < 1 || overallRating > 5)
            throw new ArgumentException("Rating must be between 1 and 5.", nameof(overallRating));

        return new TrainingEvaluation
        {
            TrainingSessionId = trainingSessionId,
            OverallRating = overallRating,
            EvaluationDate = evaluationDate,
            EvaluatedBy = evaluatedBy,
            Feedback = feedback?.Trim(),
            Recommendations = recommendations?.Trim()
        };
    }
}
