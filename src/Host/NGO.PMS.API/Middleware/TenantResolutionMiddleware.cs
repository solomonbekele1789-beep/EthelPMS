using NGO.PMS.SharedKernel.MultiTenancy;

namespace NGO.PMS.API.Middleware;

/// <summary>
/// Resolves the current tenant from JWT claims and populates the ITenantContextAccessor.
/// Replaces Finbuckle's UseMultiTenant() middleware with a simpler, custom implementation.
/// Must run after UseAuthentication() so that User.Claims are populated.
/// </summary>
public sealed class TenantResolutionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var tenantAccessor = context.RequestServices.GetRequiredService<ITenantContextAccessor>();

        // Extract tenant ID from JWT claim
        var tenantClaim = context.User.FindFirst("tenant_id");

        if (tenantClaim?.Value is not null)
        {
            // Look up tenant info from configuration
            var configuration = context.RequestServices.GetRequiredService<IConfiguration>();
            var tenantsSection = configuration.GetSection("MultiTenancy:Tenants");

            foreach (var tenantSection in tenantsSection.GetChildren())
            {
                var tenantId = tenantSection["Id"];
                var tenantIdentifier = tenantSection["Identifier"];

                // Match by Id or Identifier
                if (tenantId == tenantClaim.Value || tenantIdentifier == tenantClaim.Value)
                {
                    tenantAccessor.CurrentTenant = new EthelTenantInfo
                    {
                        Id = tenantId ?? tenantClaim.Value,
                        Identifier = tenantIdentifier ?? string.Empty,
                        Name = tenantSection["Name"],
                        ConnectionString = tenantSection["ConnectionString"],
                        IsActive = bool.TryParse(tenantSection["IsActive"], out var isActive) && isActive,
                        SubscriptionTier = tenantSection["SubscriptionTier"] ?? "free",
                        MaxUsers = int.TryParse(tenantSection["MaxUsers"], out var mu) ? mu : 0,
                        MaxProjects = int.TryParse(tenantSection["MaxProjects"], out var mp) ? mp : 0,
                        MaxStorageMb = int.TryParse(tenantSection["MaxStorageMb"], out var ms) ? ms : 0,
                        EnabledModules = tenantSection.GetSection("EnabledModules")
                            .GetChildren()
                            .Select(c => c.Value!)
                            .Where(v => v is not null)
                            .ToList()
                    };
                    break;
                }
            }

            // If no config match, still set basic tenant info from the claim.
            // In Development, enable all modules so unconfigured tenants can work.
            if (tenantAccessor.CurrentTenant is null)
            {
                var env = context.RequestServices.GetRequiredService<IHostEnvironment>();
                tenantAccessor.CurrentTenant = new EthelTenantInfo
                {
                    Id = tenantClaim.Value,
                    Identifier = tenantClaim.Value,
                    IsActive = true,
                    SubscriptionTier = env.IsDevelopment() ? "enterprise" : "free",
                    EnabledModules = env.IsDevelopment()
                        ? [.. ModuleAccessMiddleware.AllModuleNames]
                        : []
                };
            }
        }

        await next(context);
    }
}
