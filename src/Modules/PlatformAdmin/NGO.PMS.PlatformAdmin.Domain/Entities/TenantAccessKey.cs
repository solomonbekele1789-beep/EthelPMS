using System.Security.Cryptography;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.PlatformAdmin.Domain.Entities;

public class TenantAccessKey : AuditableEntity
{
    public Guid TenantId { get; set; }
    public string KeyHash { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string[] Scopes { get; set; } = [];
    public DateTimeOffset? ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }

    public bool IsRevoked => RevokedAt.HasValue;
    public bool IsExpired => ExpiresAt.HasValue && DateTimeOffset.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevoked && !IsExpired;

    // Navigation
    public PlatformTenant Tenant { get; set; } = null!;

    public void Revoke() => RevokedAt = DateTimeOffset.UtcNow;

    public static string GenerateKey() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

    public static string HashKey(string key) =>
        Convert.ToBase64String(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(key)));

    public static string MaskKey(string key) =>
        key.Length > 8 ? $"{key[..4]}...{key[^4..]}" : "****";
}
