using NGO.PMS.SharedKernel.MultiTenancy;

namespace NGO.PMS.API.Middleware;

/// <summary>
/// Checks whether the current tenant has access to the requested module.
/// Returns 403 if the module is not enabled for the tenant's subscription.
/// Skipped for unauthenticated requests and platform admin routes.
/// </summary>
public sealed class ModuleAccessMiddleware(RequestDelegate next)
{
    // Maps URL segments to module names (as stored in platform.tenant_modules)
    internal static readonly Dictionary<string, string> RouteToModule = new()
    {
        ["projects"] = "projects",
        ["results-framework"] = "resultsframework",
        ["intervention-areas"] = "interventionareas",
        ["planning"] = "planning",
        ["dip"] = "dip",
        ["reporting"] = "reporting",
        ["meal"] = "meal",
        ["participants"] = "participants",
        ["graduation"] = "graduation",
        ["procurement"] = "procurement",
        ["fund-accounting"] = "fundacct",
        ["assets"] = "assets",
        ["training"] = "training",
        ["tasks"] = "tasks",
        ["risks"] = "risk",
        ["donors"] = "donors",
        ["chat"] = "chat",
        ["notifications"] = "notifications",
        ["documents"] = "documents",
        ["feedback"] = "feedback",
        ["dashboards"] = "dashboards",
    };

    internal static IReadOnlyCollection<string> AllModuleNames => RouteToModule.Values.Distinct().ToList();

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";

        // Only check /api/v1/{resource} paths, skip auth/identity/platform routes
        if (path.StartsWith("/api/v1/") &&
            !path.StartsWith("/api/v1/auth") &&
            !path.StartsWith("/api/v1/platform") &&
            !path.StartsWith("/api/v1/users") &&
            !path.StartsWith("/api/v1/roles") &&
            !path.StartsWith("/api/v1/offices") &&
            !path.StartsWith("/api/v1/organizations") &&
            !path.StartsWith("/api/v1/locations"))
        {
            var segment = path.Split('/').ElementAtOrDefault(3);

            if (segment is not null && RouteToModule.TryGetValue(segment, out var moduleName))
            {
                var tenantAccessor = context.RequestServices
                    .GetService<ITenantContextAccessor>();
                var tenant = tenantAccessor?.CurrentTenant;

                if (tenant is not null && !tenant.EnabledModules.Contains(moduleName))
                {
                    context.Response.StatusCode = 403;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsJsonAsync(new
                    {
                        success = false,
                        errors = new[] { $"Module '{moduleName}' is not enabled for this organization." }
                    });
                    return;
                }
            }
        }

        await next(context);
    }
}
