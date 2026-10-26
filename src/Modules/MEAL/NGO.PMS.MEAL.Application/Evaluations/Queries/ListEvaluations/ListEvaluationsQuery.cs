using MediatR;
using NGO.PMS.MEAL.Application.DTOs;
using NGO.PMS.MEAL.Domain.Enums;

namespace NGO.PMS.MEAL.Application.Evaluations.Queries.ListEvaluations;

public sealed record ListEvaluationsQuery(
    Guid? ProjectId,
    EvaluationStatus? Status) : IRequest<List<EvaluationDto>>;
