namespace NGO.PMS.PlatformAdmin.Application.AccessKeys.DTOs;

public record AccessKeyDto(Guid Id, string Label, string[] Scopes, string MaskedKey, DateTimeOffset CreatedAt, DateTimeOffset? ExpiresAt, bool IsRevoked);
