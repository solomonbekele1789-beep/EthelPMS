using MediatR;

namespace NGO.PMS.Training.Application.Commands.CreateTrainingEvaluation;

public sealed record CreateTrainingEvaluationCommand(
    Guid TrainingSessionId,
    decimal OverallRating,
    DateTime EvaluationDate,
    Guid? EvaluatedBy,
    string? Feedback,
    string? Recommendations) : IRequest<Guid>;
