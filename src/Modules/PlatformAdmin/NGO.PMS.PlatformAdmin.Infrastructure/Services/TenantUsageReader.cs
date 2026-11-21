using Dapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NGO.PMS.PlatformAdmin.Application.Abstractions;
using Npgsql;

namespace NGO.PMS.PlatformAdmin.Infrastructure.Services;

/// <summary>
/// Reads actual tenant usage (users, projects, storage bytes) across module schemas via Dapper.
/// </summary>
public sealed class TenantUsageReader(
    IConfiguration configuration,
    ILogger<TenantUsageReader> logger) : ITenantUsageReader
{
    public async Task<TenantActualUsage> GetUsageAsync(Guid tenantId, CancellationToken ct = default)
    {
        var connStr = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connStr))
            return new TenantActualUsage(0, 0, 0);

        try
        {
            await using var conn = new NpgsqlConnection(connStr);
            var users = await conn.ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM identity.users WHERE organization_id = @TenantId AND is_deleted = false",
                new { TenantId = tenantId });

            var projects = await conn.ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM projects.projects WHERE organization_id = @TenantId AND is_deleted = false",
                new { TenantId = tenantId });

            long storageBytes = 0;
            try
            {
                storageBytes = await conn.ExecuteScalarAsync<long>(
                    "SELECT COALESCE(SUM(file_size_bytes), 0) FROM content.documents WHERE organization_id = @TenantId AND is_deleted = false",
                    new { TenantId = tenantId });
            }
            catch
            {
                // content.documents table may not exist yet on minimal setups
            }

            return new TenantActualUsage(users, projects, storageBytes);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to query live usage for tenant {TenantId}; returning zeros.", tenantId);
            return new TenantActualUsage(0, 0, 0);
        }
    }
}
