using NGO.PMS.PlatformAdmin.Application.Subscriptions.DTOs;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;

public record TenantDetailDto(
    Guid Id,
    string Name,
    string Slug,
    string AdminEmail,
    string Status,
    string? LogoUrl,
    string? PrimaryColor,
    int MaxUsers,
    int MaxProjects,
    string Timezone,
    SubscriptionPackageDto Subscription,
    List<TenantModuleDto> Modules,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ActivatedAt,
    DateTimeOffset? SuspendedAt,
    string? SuspensionReason);
