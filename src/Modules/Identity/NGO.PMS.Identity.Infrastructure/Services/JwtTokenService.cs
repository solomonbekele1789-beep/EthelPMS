using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using NGO.PMS.Identity.Application;
using NGO.PMS.Identity.Domain.Entities;

namespace NGO.PMS.Identity.Infrastructure.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IIdentityDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<JwtTokenService> _logger;

    public JwtTokenService(IIdentityDbContext db, IConfiguration config, ILogger<JwtTokenService> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    public string GenerateAccessToken(User user, IReadOnlyList<string> permissions, IReadOnlyList<string> roles)
    {
        var secret = _config["JwtSettings:SecretKey"]
            ?? throw new InvalidOperationException("JWT secret not configured. Set JwtSettings:SecretKey in appsettings or user-secrets.");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

        var claims = new List<Claim>
        {
            new("sub", user.Id.ToString()),
            new("email", user.Email),
            new("name", $"{user.FirstName} {user.LastName}"),
            new("tenant_id", user.OrganizationId.ToString()),
        };

        foreach (var role in roles)
            claims.Add(new Claim("roles", role));

        foreach (var perm in permissions)
            claims.Add(new Claim("permissions", perm));

        var expMinutes = int.TryParse(_config["JwtSettings:AccessTokenExpirationMinutes"], out var m) ? m : 15;

        var token = new JwtSecurityToken(
            issuer: _config["JwtSettings:Issuer"],
            audience: _config["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expMinutes),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }

    public async Task<RefreshToken?> ValidateRefreshTokenAsync(string token, CancellationToken ct = default)
    {
        var tokenHash = HashToken(token);
        var refreshToken = await _db.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);

        if (refreshToken is null || !refreshToken.IsActive)
            return null;

        return refreshToken;
    }

    public async Task StoreRefreshTokenAsync(Guid userId, string token, string deviceInfo, DateTimeOffset expiresAt, CancellationToken ct = default)
    {
        var refreshToken = new RefreshToken
        {
            UserId = userId,
            TokenHash = HashToken(token),
            DeviceInfo = deviceInfo,
            ExpiresAt = expiresAt
        };
        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync(ct);
    }

    public async Task RevokeRefreshTokenAsync(string token, CancellationToken ct = default)
    {
        var tokenHash = HashToken(token);
        var refreshToken = await _db.RefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);

        if (refreshToken is not null)
        {
            refreshToken.RevokedAt = DateTimeOffset.UtcNow;
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task RevokeAllUserTokensAsync(Guid userId, CancellationToken ct = default)
    {
        var tokens = await _db.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ToListAsync(ct);

        foreach (var token in tokens)
            token.RevokedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Revoked {Count} refresh tokens for user {UserId}", tokens.Count, userId);
    }

    private static string HashToken(string token)
    {
        return Convert.ToBase64String(
            SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }
}
