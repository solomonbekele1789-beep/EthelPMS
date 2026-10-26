using MediatR;

namespace NGO.PMS.Dashboards.Application.Commands.RemoveWidget;

public sealed record RemoveWidgetCommand(Guid Id) : IRequest<Unit>;
