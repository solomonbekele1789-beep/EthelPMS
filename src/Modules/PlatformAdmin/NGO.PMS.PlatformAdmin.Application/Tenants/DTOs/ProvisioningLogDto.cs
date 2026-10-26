namespace NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;

public record ProvisioningLogDto(string Step, string Status, string? Message, DateTimeOffset StartedAt, DateTimeOffset? CompletedAt);
