using MediatR;
using NGO.PMS.Dashboards.Application.DTOs;

namespace NGO.PMS.Dashboards.Application.Queries.GetDashboardWidgets;

public sealed record GetDashboardWidgetsQuery(Guid DashboardConfigId) : IRequest<List<DashboardWidgetDto>>;
