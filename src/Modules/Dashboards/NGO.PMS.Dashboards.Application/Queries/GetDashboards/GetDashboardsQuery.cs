using MediatR;
using NGO.PMS.Dashboards.Application.DTOs;

namespace NGO.PMS.Dashboards.Application.Queries.GetDashboards;

public sealed record GetDashboardsQuery : IRequest<List<DashboardSummaryDto>>;
