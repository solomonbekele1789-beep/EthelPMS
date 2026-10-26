namespace NGO.PMS.PlatformAdmin.Application.Subscriptions.DTOs;

public record SubscriptionPackageDto(Guid Id, string Name, int MaxUsers, int MaxProjects, decimal PriceMonthlyUsd, string[] IncludedModules);
