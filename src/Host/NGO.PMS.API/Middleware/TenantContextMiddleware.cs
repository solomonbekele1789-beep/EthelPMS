using NGO.PMS.SharedKernel.MultiTenancy;

namespace NGO.PMS.API.Middleware;

/// <summary>
/// Validates that the resolved tenant is active before allowing request execution.
/// PostgreSQL RLS context ('app.current_org_id') is applied per-connection by TenantConnectionInterceptor.
/// </summary>
public sealed class TenantContextMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;

        // Always allow health, auth, and platform-admin endpoints
        if (!path.StartsWith("/api/v1/auth") &&
            !path.StartsWith("/api/v1/platform") &&
            !path.StartsWith("/health"))
        {
            var tenantAccessor = context.RequestServices.GetService<ITenantContextAccessor>();
            var tenant = tenantAccessor?.CurrentTenant;

            if (tenant is not null && !tenant.IsActive)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    code = "TENANT_SUSPENDED",
                    message = "This organization account is currently suspended or inactive."
                });
                return;
            }
        }

        await next(context);
    }
}
