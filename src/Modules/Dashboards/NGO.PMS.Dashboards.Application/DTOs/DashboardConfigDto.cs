namespace NGO.PMS.Dashboards.Application.DTOs;

public record DashboardConfigDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string DashboardType { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid OwnerId { get; init; }
    public bool IsDefault { get; init; }
    public bool IsShared { get; init; }
    public string? LayoutJson { get; init; }
    public int WidgetCount { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}
