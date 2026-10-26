using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NGO.PMS.SystemReports.Application.Abstractions;
using NGO.PMS.SystemReports.Domain.Abstractions;
using NGO.PMS.SystemReports.Infrastructure.Persistence;
using NGO.PMS.SystemReports.Infrastructure.Services;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.SystemReports.API;

public static class SystemReportsModuleExtensions
{
    public static IServiceCollection AddSystemReportsModule(
        this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

        services.AddDbContext<SystemReportsDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "reports"))
            .UseSnakeCaseNamingConvention();
            options.AddInterceptors(
                sp.GetRequiredService<AuditableEntityInterceptor>(),
                sp.GetRequiredService<SoftDeleteInterceptor>(),
                sp.GetRequiredService<TenantConnectionInterceptor>(),
                sp.GetRequiredService<DomainEventDispatchInterceptor>());
        });

        services.AddScoped<ISystemReportsDbContext>(sp => sp.GetRequiredService<SystemReportsDbContext>());
        services.AddScoped<IReportGenerator, ReportGenerator>();

        return services;
    }
}
