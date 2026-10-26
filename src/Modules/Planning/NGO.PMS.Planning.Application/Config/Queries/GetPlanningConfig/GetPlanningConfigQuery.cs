using MediatR;
using NGO.PMS.Planning.Application.DTOs;

namespace NGO.PMS.Planning.Application.Config.Queries.GetPlanningConfig;

public record GetPlanningConfigQuery : IRequest<PlanningConfigurationDto>;
