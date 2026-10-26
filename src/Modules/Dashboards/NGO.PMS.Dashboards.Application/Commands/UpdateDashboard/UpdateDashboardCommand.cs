using MediatR;

namespace NGO.PMS.Dashboards.Application.Commands.UpdateDashboard;

public sealed record UpdateDashboardCommand(
    Guid Id,
    string Name,
    string? Description,
    bool IsShared,
    string? LayoutJson) : IRequest<Unit>;
