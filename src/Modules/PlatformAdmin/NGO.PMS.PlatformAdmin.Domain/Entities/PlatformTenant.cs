using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.PlatformAdmin.Domain.Constants;
using NGO.PMS.PlatformAdmin.Domain.Events;

namespace NGO.PMS.PlatformAdmin.Domain.Entities;

public class PlatformTenant : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string AdminEmail { get; private set; } = string.Empty;
    public string? LogoUrl { get; private set; }
    public string? PrimaryColor { get; private set; }
    public string Status { get; private set; } = TenantStatus.Pending;
    public Guid SubscriptionPackageId { get; private set; }
    public DateTimeOffset? ActivatedAt { get; private set; }
    public DateTimeOffset? SuspendedAt { get; private set; }
    public string? SuspensionReason { get; private set; }
    public int MaxUsers { get; private set; } = 10;
    public int MaxProjects { get; private set; } = 5;
    public string Timezone { get; private set; } = "Africa/Addis_Ababa";

    // Navigation
    public SubscriptionPackage SubscriptionPackage { get; private set; } = null!;
    public ICollection<TenantModule> TenantModules { get; private set; } = [];
    public ICollection<TenantAccessKey> AccessKeys { get; private set; } = [];

    public static PlatformTenant Create(string name, string slug, string adminEmail, Guid packageId)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name required.", nameof(name));
        if (string.IsNullOrWhiteSpace(slug)) throw new ArgumentException("Slug required.", nameof(slug));

        var tenant = new PlatformTenant
        {
            Name = name.Trim(),
            Slug = slug.ToLowerInvariant().Trim(),
            AdminEmail = adminEmail.ToLowerInvariant().Trim(),
            SubscriptionPackageId = packageId,
            Status = TenantStatus.Pending
        };
        tenant.AddDomainEvent(new TenantCreatedEvent(tenant.Id, tenant.Name, tenant.AdminEmail));
        return tenant;
    }

    public void StartProvisioning()
    {
        Status = TenantStatus.Provisioning;
    }

    public void Activate()
    {
        Status = TenantStatus.Active;
        ActivatedAt = DateTimeOffset.UtcNow;
        AddDomainEvent(new TenantActivatedEvent(Id, Name));
    }

    public void Suspend(string reason)
    {
        if (string.IsNullOrWhiteSpace(reason)) throw new ArgumentException("Reason is required.", nameof(reason));
        Status = TenantStatus.Suspended;
        SuspendedAt = DateTimeOffset.UtcNow;
        SuspensionReason = reason;
        AddDomainEvent(new TenantSuspendedEvent(Id, Name, reason));
    }

    public void Reactivate()
    {
        Status = TenantStatus.Active;
        SuspendedAt = null;
        SuspensionReason = null;
    }

    public void Update(string? name, int? maxUsers, int? maxProjects, string? timezone)
    {
        if (name is not null) Name = name.Trim();
        if (maxUsers.HasValue) MaxUsers = maxUsers.Value;
        if (maxProjects.HasValue) MaxProjects = maxProjects.Value;
        if (timezone is not null) Timezone = timezone;
    }

    public void UpdateBranding(string? logoUrl, string? primaryColor)
    {
        LogoUrl = logoUrl;
        PrimaryColor = primaryColor;
    }

    public void ChangeSubscription(Guid packageId, int maxUsers, int maxProjects)
    {
        SubscriptionPackageId = packageId;
        MaxUsers = maxUsers;
        MaxProjects = maxProjects;
    }
}
