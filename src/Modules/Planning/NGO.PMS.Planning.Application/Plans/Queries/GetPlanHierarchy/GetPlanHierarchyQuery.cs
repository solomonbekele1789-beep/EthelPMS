using MediatR;
using NGO.PMS.Planning.Application.DTOs;

namespace NGO.PMS.Planning.Application.Plans.Queries.GetPlanHierarchy;

public record GetPlanHierarchyQuery(Guid ProjectId, int? FiscalYear) : IRequest<List<PlanHierarchyDto>>;
