namespace NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;

public record TenantListItemDto(
    Guid Id,
    string Name,
    string Slug,
    string Status,
    string SubscriptionName,
    int MaxUsers,
    int MaxProjects,
    DateTimeOffset CreatedAt);
