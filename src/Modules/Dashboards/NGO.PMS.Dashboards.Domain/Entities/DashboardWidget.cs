using NGO.PMS.Dashboards.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Dashboards.Domain.Entities;

public class DashboardWidget : BaseEntity, IMultiTenant
{
    public Guid OrganizationId { get; set; }
    public Guid DashboardConfigId { get; private set; }
    public WidgetType WidgetType { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string DataSourceModule { get; private set; } = string.Empty;
    public string? QueryDefinition { get; private set; }
    public string? DisplayConfig { get; private set; }
    public int Position { get; private set; }
    public int Width { get; private set; }
    public int Height { get; private set; }
    public int? RefreshIntervalMinutes { get; private set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    // Navigation
    public DashboardConfig DashboardConfig { get; private set; } = null!;

    private DashboardWidget() { }

    public static DashboardWidget Create(
        Guid organizationId,
        Guid dashboardConfigId,
        WidgetType widgetType,
        string title,
        string dataSourceModule,
        string? queryDefinition,
        string? displayConfig,
        int position,
        int width,
        int height,
        int? refreshIntervalMinutes)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        return new DashboardWidget
        {
            OrganizationId = organizationId,
            DashboardConfigId = dashboardConfigId,
            WidgetType = widgetType,
            Title = title,
            DataSourceModule = dataSourceModule,
            QueryDefinition = queryDefinition,
            DisplayConfig = displayConfig,
            Position = position,
            Width = width,
            Height = height,
            RefreshIntervalMinutes = refreshIntervalMinutes
        };
    }

    public void Update(
        string title,
        string? queryDefinition,
        string? displayConfig,
        int position,
        int width,
        int height)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        Title = title;
        QueryDefinition = queryDefinition;
        DisplayConfig = displayConfig;
        Position = position;
        Width = width;
        Height = height;
    }
}
