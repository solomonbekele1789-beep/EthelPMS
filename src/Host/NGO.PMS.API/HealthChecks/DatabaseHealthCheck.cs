using Microsoft.Extensions.Diagnostics.HealthChecks;
using Npgsql;

namespace NGO.PMS.API.HealthChecks;

/// <summary>
/// Health check that verifies PostgreSQL database connectivity
/// and that required schemas exist.
/// </summary>
public sealed class DatabaseHealthCheck(
    IConfiguration configuration,
    ILogger<DatabaseHealthCheck> logger) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken ct = default)
    {
        try
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                return HealthCheckResult.Unhealthy("Database connection string not configured.");
            }

            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync(ct);

            // Verify critical schemas exist
            await using var cmd = connection.CreateCommand();
            cmd.CommandText = @"
                SELECT schema_name
                FROM information_schema.schemata
                WHERE schema_name IN ('identity', 'platform', 'reference', 'audit', 'outbox')
                ORDER BY schema_name;";

            var schemas = new List<string>();
            await using var reader = await cmd.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                schemas.Add(reader.GetString(0));
            }

            var data = new Dictionary<string, object>
            {
                ["schemas_found"] = string.Join(", ", schemas),
                ["schema_count"] = schemas.Count
            };

            if (schemas.Count < 5)
            {
                return HealthCheckResult.Degraded(
                    $"Only {schemas.Count}/5 critical schemas found. Run DbUp scripts.",
                    data: data);
            }

            return HealthCheckResult.Healthy(
                "Database is accessible and all critical schemas exist.",
                data);
        }
        catch (NpgsqlException ex)
        {
            logger.LogError(ex, "Database health check failed");
            return HealthCheckResult.Unhealthy(
                "Cannot connect to database.",
                ex,
                new Dictionary<string, object> { ["error"] = ex.Message });
        }
    }
}
