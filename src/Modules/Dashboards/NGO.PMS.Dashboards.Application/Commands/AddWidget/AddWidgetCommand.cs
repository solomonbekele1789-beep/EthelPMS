using MediatR;
using NGO.PMS.Dashboards.Domain.Enums;

namespace NGO.PMS.Dashboards.Application.Commands.AddWidget;

public sealed record AddWidgetCommand(
    Guid DashboardConfigId,
    WidgetType WidgetType,
    string Title,
    string DataSourceModule,
    string? QueryDefinition,
    string? DisplayConfig,
    int Position,
    int Width,
    int Height,
    int? RefreshIntervalMinutes) : IRequest<Guid>;
