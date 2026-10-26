using MediatR;
using NGO.PMS.Dashboards.Application.DTOs;

namespace NGO.PMS.Dashboards.Application.Queries.GetDashboardById;

public sealed record GetDashboardByIdQuery(Guid Id) : IRequest<DashboardConfigDto>;
