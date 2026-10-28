using MediatR;

namespace NGO.PMS.MEAL.Application.Evaluations.Commands.CompleteEvaluation;

public sealed record CompleteEvaluationCommand(
    Guid EvaluationId,
    DateTimeOffset ActualEndDate) : IRequest;
