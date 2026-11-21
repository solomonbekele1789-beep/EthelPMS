using Dapper;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;
using Npgsql;

namespace NGO.PMS.API.Jobs;

/// <summary>
/// Hangfire recurring job that purges processed outbox and inbox messages older than 7 days.
/// </summary>
public sealed class OutboxCleanupJob(
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<OutboxCleanupJob> logger)
{
    private const int RetentionDays = 7;

    [AutomaticRetry(Attempts = 2)]
    public async Task CleanupAsync()
    {
        var cutoff = DateTimeOffset.UtcNow.AddDays(-RetentionDays);
        using var scope = scopeFactory.CreateScope();

        var dbContextTypes = AppDomain.CurrentDomain.GetAssemblies()
            .Where(a => a.FullName?.StartsWith("NGO.PMS.", StringComparison.Ordinal) == true)
            .SelectMany(a =>
            {
                try { return a.GetTypes(); }
                catch { return Array.Empty<Type>(); }
            })
            .Where(t => !t.IsAbstract && t.IsClass && typeof(MultiTenantDbContext).IsAssignableFrom(t))
            .Distinct();

        var totalDeleted = 0;
        foreach (var dbContextType in dbContextTypes)
        {
            try
            {
                if (scope.ServiceProvider.GetService(dbContextType) is not DbContext dbContext)
                    continue;
                if (dbContext.Model.FindEntityType(typeof(OutboxMessage)) is null)
                    continue;

                var deleted = await dbContext.Set<OutboxMessage>()
                    .Where(m => m.ProcessedAt != null && m.ProcessedAt < cutoff)
                    .ExecuteDeleteAsync();
                totalDeleted += deleted;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Outbox cleanup failed for {Context}", dbContextType.Name);
            }
        }

        // Purge processed inbox messages older than 7 days
        var connStr = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(connStr))
        {
            try
            {
                await using var conn = new NpgsqlConnection(connStr);
                var inboxDeleted = await conn.ExecuteAsync(
                    "DELETE FROM outbox.inbox_messages WHERE processed_at < @Cutoff",
                    new { Cutoff = cutoff });
                logger.LogInformation("Outbox cleanup removed {OutboxCount} outbox and {InboxCount} inbox messages.",
                    totalDeleted, inboxDeleted);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Inbox cleanup failed.");
            }
        }
    }
}
