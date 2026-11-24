using Dapper;
using Hangfire;
using Npgsql;

namespace NGO.PMS.API.Jobs;

/// <summary>
/// Periodic PostgreSQL maintenance job: purges expired refresh tokens (over 30d) and runs ANALYZE.
/// </summary>
public sealed class DatabaseMaintenanceJob(
    IConfiguration configuration,
    ILogger<DatabaseMaintenanceJob> logger)
{
    [AutomaticRetry(Attempts = 2)]
    public async Task PurgeExpiredTokensAsync()
    {
        var connStr = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connStr)) return;

        await using var conn = new NpgsqlConnection(connStr);
        var cutoff = DateTimeOffset.UtcNow.AddDays(-30);
        var deleted = await conn.ExecuteAsync(
            "DELETE FROM identity.refresh_tokens WHERE expires_at < @Cutoff OR (revoked_at IS NOT NULL AND revoked_at < @Cutoff)",
            new { Cutoff = cutoff });
        logger.LogInformation("Database maintenance purged {Count} expired/revoked refresh tokens.", deleted);
    }

    [AutomaticRetry(Attempts = 1)]
    public async Task RunAnalyzeAsync()
    {
        var connStr = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connStr)) return;

        await using var conn = new NpgsqlConnection(connStr);
        await conn.ExecuteAsync("ANALYZE;");
        logger.LogInformation("Database maintenance completed weekly ANALYZE.");
    }
}
