using MediatR;
using NGO.PMS.MEAL.Application.DTOs;

namespace NGO.PMS.MEAL.Application.Evaluations.Queries.GetEvaluation;

public sealed record GetEvaluationQuery(Guid EvaluationId) : IRequest<EvaluationDto>;
