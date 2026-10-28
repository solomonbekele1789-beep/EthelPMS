using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NGO.PMS.Dashboards.Application.Abstractions;
using NGO.PMS.Dashboards.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Dashboards.API;

public static class DashboardsModuleExtensions
{
    public static IServiceCollection AddDashboardsModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

        services.AddDbContext<DashboardsDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory_Dashboards", "dashboards"))
            .UseSnakeCaseNamingConvention();
            options.AddInterceptors(
                sp.GetRequiredService<AuditableEntityInterceptor>(),
                sp.GetRequiredService<SoftDeleteInterceptor>(),
                sp.GetRequiredService<TenantConnectionInterceptor>(),
                sp.GetRequiredService<DomainEventDispatchInterceptor>());
        });

        services.AddScoped<IDashboardsDbContext>(sp => sp.GetRequiredService<DashboardsDbContext>());

        return services;
    }
}
