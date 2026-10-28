using MediatR;
using NGO.PMS.Projects.Application.DTOs;

namespace NGO.PMS.Projects.Application.ResultsFramework.Queries.ListOutcomes;

public record ListOutcomesQuery(Guid ProjectId) : IRequest<List<OutcomeDto>>;
