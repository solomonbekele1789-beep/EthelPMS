using MediatR;
using NGO.PMS.MEAL.Domain.Enums;

namespace NGO.PMS.MEAL.Application.Evaluations.Commands.AddFinding;

public sealed record AddFindingCommand(
    Guid EvaluationId,
    string Finding,
    DacCriteria? DacCriteria,
    string? Recommendation,
    int SortOrder) : IRequest<Guid>;
