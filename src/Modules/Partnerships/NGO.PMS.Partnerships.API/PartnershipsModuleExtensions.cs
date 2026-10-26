using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.Partnerships.Infrastructure.Persistence;

namespace NGO.PMS.Partnerships.API;

public static class PartnershipsModuleExtensions
{
    public static IServiceCollection AddPartnershipsModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

        services.AddDbContext<PartnershipsDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory_Partnerships", "partnerships"))
            .UseSnakeCaseNamingConvention();
            options.AddInterceptors(
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.AuditableEntityInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.SoftDeleteInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.TenantConnectionInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.DomainEventDispatchInterceptor>());
        });

        services.AddScoped<IPartnershipsDbContext>(sp => sp.GetRequiredService<PartnershipsDbContext>());

        return services;
    }
}
