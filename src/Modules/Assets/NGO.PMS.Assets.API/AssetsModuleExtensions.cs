using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Infrastructure.Persistence;

namespace NGO.PMS.Assets.API;

public static class AssetsModuleExtensions
{
    public static IServiceCollection AddAssetsModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

        services.AddDbContext<AssetsDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory_Assets", "assets"))
            .UseSnakeCaseNamingConvention();
            options.AddInterceptors(
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.AuditableEntityInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.SoftDeleteInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.TenantConnectionInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.DomainEventDispatchInterceptor>());
        });

        services.AddScoped<IAssetsDbContext>(sp => sp.GetRequiredService<AssetsDbContext>());

        return services;
    }
}
