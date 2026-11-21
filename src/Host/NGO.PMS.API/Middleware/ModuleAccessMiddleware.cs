using NGO.PMS.SharedKernel.MultiTenancy;

namespace NGO.PMS.API.Middleware;

/// <summary>
/// Checks whether the current tenant has access to the requested module.
/// Returns 403 MODULE_DISABLED if the module is not enabled for the tenant's subscription.
/// </summary>
public sealed class ModuleAccessMiddleware(RequestDelegate next)
{
    internal static readonly Dictionary<string, string> RouteToModule = new(StringComparer.OrdinalIgnoreCase)
    {
        ["projects"] = "projects",
        ["results-framework"] = "results-framework",
        ["intervention-areas"] = "projects",
        ["planning"] = "planning",
        ["plans"] = "planning",
        ["activities"] = "planning",
        ["dip"] = "planning",
        ["reporting"] = "reporting",
        ["reports"] = "reporting",
        ["meal"] = "meal",
        ["meal-plans"] = "meal",
        ["indicators"] = "meal",
        ["evaluations"] = "meal",
        ["participants"] = "participants",
        ["graduation"] = "participants",
        ["graduation-criteria"] = "participants",
        ["procurement"] = "procurement",
        ["purchase-requests"] = "procurement",
        ["purchase-orders"] = "procurement",
        ["vendors"] = "procurement",
        ["fund-accounting"] = "fund-accounting",
        ["budgets"] = "fund-accounting",
        ["journal-entries"] = "fund-accounting",
        ["accounts"] = "fund-accounting",
        ["assets"] = "assets",
        ["training"] = "training",
        ["trainings"] = "training",
        ["tasks"] = "tasks",
        ["risks"] = "risk",
        ["donors"] = "donors",
        ["grants"] = "donors",
        ["chat"] = "chat",
        ["chat-rooms"] = "chat",
        ["notifications"] = "notifications",
        ["documents"] = "documents",
        ["feedback"] = "feedback",
        ["dashboards"] = "dashboards",
        ["settings"] = "settings",
        ["knowledge"] = "knowledge",
        ["partnerships"] = "partnerships",
        ["system-reports"] = "system-reports",
        ["import-export"] = "import-export",
    };

    internal static IReadOnlyCollection<string> AllModuleNames =>
        RouteToModule.Values.Distinct(StringComparer.OrdinalIgnoreCase).ToList();

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;

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
                var tenantAccessor = context.RequestServices.GetService<ITenantContextAccessor>();
                var tenant = tenantAccessor?.CurrentTenant;

                if (tenant is not null &&
                    !tenant.EnabledModules.Contains(moduleName, StringComparer.OrdinalIgnoreCase))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsJsonAsync(new
                    {
                        success = false,
                        code = "MODULE_DISABLED",
                        message = $"Module '{moduleName}' is not enabled for this organization.",
                        errors = new[] { $"Module '{moduleName}' is not enabled for this organization." }
                    });
                    return;
                }
            }
        }

        await next(context);
    }
}
