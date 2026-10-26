using MediatR;
using NGO.PMS.MEAL.Application.DTOs;

namespace NGO.PMS.MEAL.Application.Gesi.Queries.ListGesiAssessments;

public sealed record ListGesiAssessmentsQuery(Guid ProjectId) : IRequest<List<GesiAssessmentDto>>;
