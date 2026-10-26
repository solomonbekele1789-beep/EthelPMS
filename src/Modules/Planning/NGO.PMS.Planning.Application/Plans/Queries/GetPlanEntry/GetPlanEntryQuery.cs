using MediatR;
using NGO.PMS.Planning.Application.DTOs;

namespace NGO.PMS.Planning.Application.Plans.Queries.GetPlanEntry;

public record GetPlanEntryQuery(Guid PlanEntryId) : IRequest<PlanEntryDto>;
