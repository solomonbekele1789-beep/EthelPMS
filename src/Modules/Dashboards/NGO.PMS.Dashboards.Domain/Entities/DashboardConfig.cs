using NGO.PMS.Dashboards.Domain.Enums;
using NGO.PMS.Dashboards.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Dashboards.Domain.Entities;

public class DashboardConfig : AuditableEntity, ISoftDeletable, IMultiTenant
{
    public Guid OrganizationId { get; set; }
    public string Name { get; private set; } = string.Empty;
    public DashboardType DashboardType { get; private set; }
    public string? Description { get; private set; }
    public Guid OwnerId { get; private set; }
    public bool IsDefault { get; private set; }
    public bool IsShared { get; private set; }
    public string? LayoutJson { get; private set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    // Navigation
    public List<DashboardWidget> Widgets { get; private set; } = [];

    private DashboardConfig() { }

    public static DashboardConfig Create(
        Guid organizationId,
        string name,
        DashboardType dashboardType,
        string? description,
        Guid ownerId,
        bool isShared,
        string? layoutJson)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        var config = new DashboardConfig
        {
            OrganizationId = organizationId,
            Name = name,
            DashboardType = dashboardType,
            Description = description,
            OwnerId = ownerId,
            IsDefault = false,
            IsShared = isShared,
            LayoutJson = layoutJson
        };

        config.AddDomainEvent(new DashboardCreatedEvent(
            config.Id, organizationId, dashboardType.ToString()));

        return config;
    }

    public void Update(string name, string? description, bool isShared, string? layoutJson)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        Name = name;
        Description = description;
        IsShared = isShared;
        LayoutJson = layoutJson;
    }

    public void SetDefault(bool isDefault)
    {
        IsDefault = isDefault;
    }
}
