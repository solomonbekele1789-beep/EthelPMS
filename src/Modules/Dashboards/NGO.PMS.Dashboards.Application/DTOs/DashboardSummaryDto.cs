namespace NGO.PMS.Dashboards.Application.DTOs;

public record DashboardSummaryDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string DashboardType { get; init; } = string.Empty;
    public int WidgetCount { get; init; }
    public bool IsDefault { get; init; }
}
