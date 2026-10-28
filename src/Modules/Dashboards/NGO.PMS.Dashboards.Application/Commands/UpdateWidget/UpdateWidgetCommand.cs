using MediatR;

namespace NGO.PMS.Dashboards.Application.Commands.UpdateWidget;

public sealed record UpdateWidgetCommand(
    Guid Id,
    string Title,
    string? QueryDefinition,
    string? DisplayConfig,
    int Position,
    int Width,
    int Height) : IRequest<Unit>;
