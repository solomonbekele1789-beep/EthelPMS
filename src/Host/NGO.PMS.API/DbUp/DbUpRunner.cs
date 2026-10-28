using DbUp;
using DbUp.Helpers;

namespace NGO.PMS.API.DbUp;

public interface IDbUpRunner
{
    /// <summary>Run infrastructure scripts (schemas, roles, extensions, functions) — scripts 0001-0007.</summary>
    Task RunInfrastructureAsync();

    /// <summary>Run post-migration scripts (RLS policies, seed data) — scripts 0008+ and SeedData.</summary>
    Task RunPostMigrationAsync();

    /// <summary>Run all scripts in order (legacy convenience method).</summary>
    Task RunAsync();
}

public sealed class DbUpRunner(
    IConfiguration configuration,
    ILogger<DbUpRunner> logger) : IDbUpRunner
{
    private string GetConnectionString() =>
        configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

    public Task RunInfrastructureAsync()
    {
        var connectionString = GetConnectionString();

        // Infrastructure-only scripts: schemas, roles, extensions, functions (0001-0007)
        // These must run BEFORE EF Core creates tables.
        // NullJournal = always run; safe because every script is idempotent
        // (IF NOT EXISTS / CREATE OR REPLACE).
        var infraResult = DeployChanges.To
            .PostgresqlDatabase(connectionString)
            .WithScriptsFromFileSystem(
                Path.Combine(AppContext.BaseDirectory, "DbUp", "Scripts"),
                new global::DbUp.ScriptProviders.FileSystemScriptOptions
                {
                    Filter = path => !Path.GetFileName(path).Contains("_rls_policies")
                })
            .JournalTo(new NullJournal())
            .WithTransactionPerScript()
            .LogTo(new SerilogDbUpLog(logger))
            .Build()
            .PerformUpgrade();

        if (!infraResult.Successful)
            throw new InvalidOperationException(
                $"DbUp infrastructure scripts failed: {infraResult.Error}",
                infraResult.Error);

        logger.LogInformation("DbUp infrastructure scripts applied successfully");
        return Task.CompletedTask;
    }

    public Task RunPostMigrationAsync()
    {
        var connectionString = GetConnectionString();

        // RLS policy scripts (0008-0030) — tables must exist first
        var rlsResult = DeployChanges.To
            .PostgresqlDatabase(connectionString)
            .WithScriptsFromFileSystem(
                Path.Combine(AppContext.BaseDirectory, "DbUp", "Scripts"),
                new global::DbUp.ScriptProviders.FileSystemScriptOptions
                {
                    Filter = path => Path.GetFileName(path).Contains("_rls_policies")
                })
            .WithTransactionPerScript()
            .LogTo(new SerilogDbUpLog(logger))
            .Build()
            .PerformUpgrade();

        if (!rlsResult.Successful)
            throw new InvalidOperationException(
                $"DbUp RLS policy scripts failed: {rlsResult.Error}",
                rlsResult.Error);

        // Seed data scripts
        var seedResult = DeployChanges.To
            .PostgresqlDatabase(connectionString)
            .WithScriptsFromFileSystem(
                Path.Combine(AppContext.BaseDirectory, "DbUp", "SeedData"))
            .WithTransactionPerScript()
            .LogTo(new SerilogDbUpLog(logger))
            .Build()
            .PerformUpgrade();

        if (!seedResult.Successful)
            throw new InvalidOperationException(
                $"DbUp seed data scripts failed: {seedResult.Error}",
                seedResult.Error);

        logger.LogInformation("DbUp post-migration scripts applied successfully");
        return Task.CompletedTask;
    }

    public async Task RunAsync()
    {
        await RunInfrastructureAsync();
        await RunPostMigrationAsync();
    }
}

/// <summary>
/// Bridges DbUp logging to Serilog via ILogger.
/// </summary>
internal sealed class SerilogDbUpLog(ILogger logger) : global::DbUp.Engine.Output.IUpgradeLog
{
    public void LogTrace(string format, params object[] args)
        => logger.LogTrace(format, args);

    public void LogDebug(string format, params object[] args)
        => logger.LogDebug(format, args);

    public void LogInformation(string format, params object[] args)
        => logger.LogInformation(format, args);

    public void LogWarning(string format, params object[] args)
        => logger.LogWarning(format, args);

    public void LogError(string format, params object[] args)
        => logger.LogError(format, args);

    public void LogError(Exception ex, string format, params object[] args)
        => logger.LogError(ex, format, args);
}
