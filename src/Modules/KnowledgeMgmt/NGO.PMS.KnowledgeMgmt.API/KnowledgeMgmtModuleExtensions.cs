using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NGO.PMS.KnowledgeMgmt.Application.Abstractions;
using NGO.PMS.KnowledgeMgmt.Infrastructure.Persistence;

namespace NGO.PMS.KnowledgeMgmt.API;

public static class KnowledgeMgmtModuleExtensions
{
    public static IServiceCollection AddKnowledgeMgmtModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

        services.AddDbContext<KnowledgeMgmtDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory_KnowledgeMgmt", "dashboards"))
            .UseSnakeCaseNamingConvention();
            options.AddInterceptors(
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.AuditableEntityInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.SoftDeleteInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.TenantConnectionInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.DomainEventDispatchInterceptor>());
        });

        services.AddScoped<IKnowledgeMgmtDbContext>(sp => sp.GetRequiredService<KnowledgeMgmtDbContext>());

        return services;
    }
}
