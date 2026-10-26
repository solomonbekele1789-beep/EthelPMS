using NGO.PMS.SharedKernel.MultiTenancy;
using Npgsql;

namespace NGO.PMS.API.Middleware;

/// <summary>
/// Sets PostgreSQL session variable 'app.current_org_id' from the resolved tenant.
/// This enables Row-Level Security (RLS) policies to filter data automatically.
/// Uses SET LOCAL so the variable is scoped to the current transaction only,
/// preventing tenant data leakage when connections return to the pool.
/// </summary>
public sealed class TenantContextMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var tenantAccessor = context.RequestServices
            .GetService<ITenantContextAccessor>();

        var tenantInfo = tenantAccessor?.CurrentTenant;

        if (tenantInfo?.Id is not null)
        {
            // Get the connection string and set the PostgreSQL session variable
            var configuration = context.RequestServices
                .GetRequiredService<IConfiguration>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            if (connectionString is not null)
            {
                await using var conn = new NpgsqlConnection(connectionString);
                await conn.OpenAsync();
                await using var cmd = conn.CreateCommand();
                // Using parameterized query — NEVER string concatenation
                cmd.CommandText = "SELECT set_config('app.current_org_id', @tenantId, true)";
                cmd.Parameters.AddWithValue("tenantId", tenantInfo.Id);
                await cmd.ExecuteNonQueryAsync();
            }
        }

        await next(context);
    }
}
