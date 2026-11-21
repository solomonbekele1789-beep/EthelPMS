using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace NGO.PMS.PlatformAdmin.Infrastructure.Persistence;

/// <summary>
/// Design-time factory enabling `dotnet ef migrations add` for PlatformDbContext.
/// </summary>
public sealed class PlatformDbContextFactory : IDesignTimeDbContextFactory<PlatformDbContext>
{
    public PlatformDbContext CreateDbContext(string[] args)
    {
        var connStr = Environment.GetEnvironmentVariable("ETHELPMS_CONNECTION_STRING")
            ?? "Host=localhost;Port=5432;Database=ethelpms;Username=postgres;Password=postgres";

        var optionsBuilder = new DbContextOptionsBuilder<PlatformDbContext>();
        optionsBuilder.UseNpgsql(connStr, npgsql =>
            npgsql.MigrationsHistoryTable("__EFMigrationsHistory_Platform", "platform"))
            .UseSnakeCaseNamingConvention();

        return new PlatformDbContext(optionsBuilder.Options);
    }
}
