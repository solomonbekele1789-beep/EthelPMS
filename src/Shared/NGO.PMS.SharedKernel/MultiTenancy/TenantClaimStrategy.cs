using Microsoft.AspNetCore.Http;

namespace NGO.PMS.SharedKernel.MultiTenancy;

/// <summary>
/// Resolves the tenant identifier from the JWT 'tenant_id' claim.
/// Used by the tenant resolution middleware to determine the current tenant.
/// </summary>
public class TenantClaimStrategy
{
    private readonly string _claimType;

    public TenantClaimStrategy(string claimType = "tenant_id")
    {
        _claimType = claimType;
    }

    /// <summary>
    /// Extracts the tenant identifier from the HttpContext's authenticated user claims.
    /// </summary>
    public string? GetIdentifier(HttpContext httpContext)
    {
        return httpContext.User.FindFirst(_claimType)?.Value;
    }
}
