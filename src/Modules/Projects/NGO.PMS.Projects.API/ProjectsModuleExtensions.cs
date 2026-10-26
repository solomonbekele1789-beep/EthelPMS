using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NGO.PMS.Projects.Application;
using NGO.PMS.Projects.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Projects.API;

public static class ProjectsModuleExtensions
{
    public static IServiceCollection AddProjectsModule(
        this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

        services.AddDbContext<ProjectsDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "projects"))
            .UseSnakeCaseNamingConvention();
            options.AddInterceptors(
                sp.GetRequiredService<AuditableEntityInterceptor>(),
                sp.GetRequiredService<SoftDeleteInterceptor>(),
                sp.GetRequiredService<TenantConnectionInterceptor>(),
                sp.GetRequiredService<DomainEventDispatchInterceptor>());
        });

        services.AddScoped<IProjectsDbContext>(sp => sp.GetRequiredService<ProjectsDbContext>());

        return services;
    }
}
