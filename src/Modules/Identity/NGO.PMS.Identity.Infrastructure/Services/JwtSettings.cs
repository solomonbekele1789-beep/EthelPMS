namespace NGO.PMS.Identity.Infrastructure.Services;

/// <summary>
/// Strongly-typed JWT configuration settings bound from "JwtSettings".
/// </summary>
public sealed class JwtSettings
{
    public const string SectionName = "JwtSettings";

    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = "EthelPMS";
    public string Audience { get; set; } = "EthelPMS.Client";
    /// <summary>Access token lifetime in minutes (default: 360 = 6 hours per REQ-AUTH-008).</summary>
    public int AccessTokenExpirationMinutes { get; set; } = 360;
    /// <summary>Refresh token lifetime in days (default: 7 days).</summary>
    public int RefreshTokenExpirationDays { get; set; } = 7;
}
