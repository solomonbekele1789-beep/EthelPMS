using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.PlatformAdmin.Domain.Entities;

public class ProvisioningLog : BaseEntity
{
    public Guid TenantId { get; set; }
    public string Step { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public string? Message { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }

    // Navigation
    public PlatformTenant Tenant { get; set; } = null!;
}
