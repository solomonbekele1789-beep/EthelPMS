namespace NGO.PMS.Dashboards.Application.DTOs;

public record DashboardWidgetDto
{
    public Guid Id { get; init; }
    public Guid DashboardConfigId { get; init; }
    public string WidgetType { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string DataSourceModule { get; init; } = string.Empty;
    public string? QueryDefinition { get; init; }
    public string? DisplayConfig { get; init; }
    public int Position { get; init; }
    public int Width { get; init; }
    public int Height { get; init; }
    public int? RefreshIntervalMinutes { get; init; }
}
