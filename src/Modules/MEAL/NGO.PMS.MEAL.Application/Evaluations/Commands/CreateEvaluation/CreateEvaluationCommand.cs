using MediatR;
using NGO.PMS.MEAL.Domain.Enums;

namespace NGO.PMS.MEAL.Application.Evaluations.Commands.CreateEvaluation;

public sealed record CreateEvaluationCommand(
    string Title,
    Guid ProjectId,
    EvaluationType EvaluationType,
    DateTimeOffset PlannedStartDate,
    DateTimeOffset PlannedEndDate,
    DacCriteria? PrimaryDacCriteria,
    decimal? Budget,
    string? Description) : IRequest<Guid>;
