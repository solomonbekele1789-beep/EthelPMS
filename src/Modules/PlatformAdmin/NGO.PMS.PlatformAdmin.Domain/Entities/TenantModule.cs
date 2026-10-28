using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.PlatformAdmin.Domain.Entities;

public class TenantModule : BaseEntity
{
    public Guid TenantId { get; set; }
    public string ModuleName { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public DateTimeOffset? EnabledAt { get; set; }
    public DateTimeOffset? DisabledAt { get; set; }

    // Navigation
    public PlatformTenant Tenant { get; set; } = null!;
}
