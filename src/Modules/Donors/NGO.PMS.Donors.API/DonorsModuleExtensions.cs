using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.Donors.Infrastructure.Persistence;

namespace NGO.PMS.Donors.API;

public static class DonorsModuleExtensions
{
    public static IServiceCollection AddDonorsModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

        services.AddDbContext<DonorsDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory_Donors", "donors"))
            .UseSnakeCaseNamingConvention();
            options.AddInterceptors(
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.AuditableEntityInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.SoftDeleteInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.TenantConnectionInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.DomainEventDispatchInterceptor>());
        });

        services.AddScoped<IDonorsDbContext>(sp => sp.GetRequiredService<DonorsDbContext>());

        return services;
    }
}
