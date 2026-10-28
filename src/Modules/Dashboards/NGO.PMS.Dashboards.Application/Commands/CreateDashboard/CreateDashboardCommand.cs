using MediatR;
using NGO.PMS.Dashboards.Domain.Enums;

namespace NGO.PMS.Dashboards.Application.Commands.CreateDashboard;

public sealed record CreateDashboardCommand(
    string Name,
    DashboardType DashboardType,
    string? Description,
    bool IsShared,
    string? LayoutJson) : IRequest<Guid>;
