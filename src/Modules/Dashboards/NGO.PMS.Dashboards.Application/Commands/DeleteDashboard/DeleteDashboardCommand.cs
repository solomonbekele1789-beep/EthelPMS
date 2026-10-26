using MediatR;

namespace NGO.PMS.Dashboards.Application.Commands.DeleteDashboard;

public sealed record DeleteDashboardCommand(Guid Id) : IRequest<Unit>;
