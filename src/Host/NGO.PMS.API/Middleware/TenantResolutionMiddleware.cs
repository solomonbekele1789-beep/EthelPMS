using Dapper;
using Microsoft.Extensions.Caching.Memory;
using NGO.PMS.SharedKernel.MultiTenancy;
using Npgsql;

namespace NGO.PMS.API.Middleware;

/// <summary>
/// Resolves the current tenant from JWT 'tenant_id' (or 'org_id') claim by querying
/// platform.tenants and platform.tenant_modules (cached in IMemoryCache for 2 minutes).
/// </summary>
public sealed class TenantResolutionMiddleware(RequestDelegate next)
{
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(2);

    public async Task InvokeAsync(HttpContext context)
    {
        var tenantAccessor = context.RequestServices.GetRequiredService<ITenantContextAccessor>();
        var tenantClaim = context.User.FindFirst("tenant_id") ?? context.User.FindFirst("org_id");

        if (tenantClaim?.Value is not null && Guid.TryParse(tenantClaim.Value, out var tenantId))
        {
            var cache = context.RequestServices.GetRequiredService<IMemoryCache>();
            var config = context.RequestServices.GetRequiredService<IConfiguration>();
            var env = context.RequestServices.GetRequiredService<IHostEnvironment>();
            var logger = context.RequestServices.GetRequiredService<ILogger<TenantResolutionMiddleware>>();

            var cacheKey = $"tenant:info:{tenantId}";
            var tenantInfo = await cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = CacheTtl;
                var connStr = config.GetConnectionString("DefaultConnection");
                if (!string.IsNullOrWhiteSpace(connStr))
                {
                    try
                    {
                        await using var conn = new NpgsqlConnection(connStr);
                        var row = await conn.QueryFirstOrDefaultAsync<TenantRow>(
                            """
                            SELECT id, slug, name, status, connection_string, max_users, max_projects
                            FROM platform.tenants
                            WHERE id = @Id AND is_deleted = false
                            """,
                            new { Id = tenantId });

                        if (row is not null)
                        {
                            var modules = (await conn.QueryAsync<string>(
                                """
                                SELECT module_name
                                FROM platform.tenant_modules
                                WHERE tenant_id = @Id AND is_enabled = true
                                """,
                                new { Id = tenantId })).ToList();

                            return new EthelTenantInfo
                            {
                                Id = row.Id.ToString(),
                                Identifier = row.Slug,
                                Name = row.Name,
                                ConnectionString = row.ConnectionString,
                                IsActive = string.Equals(row.Status, "Active", StringComparison.OrdinalIgnoreCase),
                                MaxUsers = row.MaxUsers,
                                MaxProjects = row.MaxProjects,
                                EnabledModules = modules
                            };
                        }
                    }
                    catch (Exception ex)
                    {
                        logger.LogWarning(ex, "DB tenant resolution failed for {TenantId}; using fallback.", tenantId);
                    }
                }

                // Fallback for development seeded org not yet in platform.tenants
                return new EthelTenantInfo
                {
                    Id = tenantId.ToString(),
                    Identifier = tenantId.ToString(),
                    IsActive = true,
                    SubscriptionTier = env.IsDevelopment() ? "enterprise" : "free",
                    EnabledModules = env.IsDevelopment()
                        ? [.. ModuleAccessMiddleware.AllModuleNames]
                        : ["identity", "projects", "reporting"]
                };
            });

            tenantAccessor.CurrentTenant = tenantInfo;
        }

        await next(context);
    }

    private sealed record TenantRow(
        Guid Id,
        string Slug,
        string Name,
        string Status,
        string? ConnectionString,
        int MaxUsers,
        int MaxProjects);
}
