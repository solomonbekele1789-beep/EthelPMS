using NGO.PMS.Identity.Domain.Entities;

namespace NGO.PMS.Identity.Application;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user, IReadOnlyList<string> permissions, IReadOnlyList<string> roles);
    string GenerateRefreshToken();
    Task<RefreshToken?> ValidateRefreshTokenAsync(string token, CancellationToken ct = default);
    Task StoreRefreshTokenAsync(Guid userId, string token, string deviceInfo, DateTimeOffset expiresAt, CancellationToken ct = default);
    Task RevokeRefreshTokenAsync(string token, CancellationToken ct = default);
    Task RevokeAllUserTokensAsync(Guid userId, CancellationToken ct = default);
}
