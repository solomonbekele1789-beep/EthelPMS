using DbUp;
using DbUp.Helpers;

namespace NGO.PMS.API.DbUp;

public interface IDbUpRunner
{
    /// <summary>Run infrastructure scripts (schemas, roles, extensions, functions) — scripts 0001-0007.</summary>
    Task RunInfrastructureAsync();

    /// <summary>Run post-migration scripts (RLS policies, post-table alters, seed data) — scripts 0008+ and SeedData.</summary>
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

    private static int GetScriptPrefixNumber(string filePath)
    {
        var name = Path.GetFileName(filePath);
        var prefix = name.Split('_').FirstOrDefault();
        return int.TryParse(prefix, out var num) ? num : int.MaxValue;
    }

    public Task RunInfrastructureAsync()
    {
        var connectionString = GetConnectionString();

        // Phase 1: Only scripts 0001-0007 (schemas, roles, extensions, reference tables, audit/outbox schemas, functions)
        var infraResult = DeployChanges.To
            .PostgresqlDatabase(connectionString)
            .WithScriptsFromFileSystem(
                Path.Combine(AppContext.BaseDirectory, "DbUp", "Scripts"),
                new global::DbUp.ScriptProviders.FileSystemScriptOptions
                {
                    Filter = path => GetScriptPrefixNumber(path) <= 7
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

        logger.LogInformation("DbUp infrastructure scripts (0001-0007) applied successfully");
        return Task.CompletedTask;
    }

    public Task RunPostMigrationAsync()
    {
        var connectionString = GetConnectionString();

        // Phase 3a: Scripts 0008+ (RLS policies and post-table schema alterations) — tables now exist
        var postResult = DeployChanges.To
            .PostgresqlDatabase(connectionString)
            .WithScriptsFromFileSystem(
                Path.Combine(AppContext.BaseDirectory, "DbUp", "Scripts"),
                new global::DbUp.ScriptProviders.FileSystemScriptOptions
                {
                    Filter = path => GetScriptPrefixNumber(path) >= 8
                })
            .WithTransactionPerScript()
            .LogTo(new SerilogDbUpLog(logger))
            .Build()
            .PerformUpgrade();

        if (!postResult.Successful)
            throw new InvalidOperationException(
                $"DbUp post-migration scripts failed: {postResult.Error}",
                postResult.Error);

        // Phase 3b: Seed data scripts
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

        logger.LogInformation("DbUp post-migration and seed data scripts applied successfully");
        return Task.CompletedTask;
    }

    public async Task RunAsync()
    {
        await RunInfrastructureAsync();
        await RunPostMigrationAsync();
    }
}

internal sealed class SerilogDbUpLog(ILogger logger) : global::DbUp.Engine.Output.IUpgradeLog
{
    public void LogTrace(string format, params object[] args) => logger.LogTrace(format, args);
    public void LogDebug(string format, params object[] args) => logger.LogDebug(format, args);
    public void LogInformation(string format, params object[] args) => logger.LogInformation(format, args);
    public void LogWarning(string format, params object[] args) => logger.LogWarning(format, args);
    public void LogError(string format, params object[] args) => logger.LogError(format, args);
    public void LogError(Exception ex, string format, params object[] args) => logger.LogError(ex, format, args);
}
