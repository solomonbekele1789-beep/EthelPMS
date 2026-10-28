using Hangfire.Dashboard;

namespace NGO.PMS.API.Jobs;

/// <summary>
/// Authorization filter for the Hangfire dashboard.
/// In development: allows all access.
/// In production: requires SuperAdmin role.
/// </summary>
public sealed class HangfireAuthFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        // In development, allow unrestricted access
        var env = httpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
        if (env.IsDevelopment())
            return true;

        // In production, require SuperAdmin role
        return httpContext.User.Identity?.IsAuthenticated == true
            && httpContext.User.HasClaim("roles", "SuperAdmin");
    }
}
