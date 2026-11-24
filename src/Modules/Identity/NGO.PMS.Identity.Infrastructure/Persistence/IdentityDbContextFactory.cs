using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Identity.Infrastructure.Persistence;

/// <summary>
/// Design-time factory enabling `dotnet ef migrations add` for IdentityDbContext.
/// </summary>
public sealed class IdentityDbContextFactory : IDesignTimeDbContextFactory<IdentityDbContext>
{
    public IdentityDbContext CreateDbContext(string[] args)
    {
        var connStr = Environment.GetEnvironmentVariable("ETHELPMS_CONNECTION_STRING")
            ?? "Host=localhost;Port=5432;Database=ethelpms;Username=postgres;Password=postgres";

        var optionsBuilder = new DbContextOptionsBuilder<IdentityDbContext>();
        optionsBuilder.UseNpgsql(connStr, npgsql =>
            npgsql.MigrationsHistoryTable("__EFMigrationsHistory_Identity", "identity"))
            .UseSnakeCaseNamingConvention();

        return new IdentityDbContext(optionsBuilder.Options, new DesignTimeCurrentUserService());
    }

    private sealed class DesignTimeCurrentUserService : ICurrentUserService
    {
        public Guid UserId => Guid.Empty;
        public string Email => "design-time@ethelpms.local";
        public string FullName => "Design Time";
        public Guid OrganizationId => Guid.Empty;
        public IReadOnlyList<string> Permissions => [];
        public IReadOnlyList<string> Roles => [];
        public bool IsAuthenticated => false;
    }
}
