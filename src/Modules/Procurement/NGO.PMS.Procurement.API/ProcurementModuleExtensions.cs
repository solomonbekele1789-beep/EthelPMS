using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Infrastructure.Persistence;

namespace NGO.PMS.Procurement.API;

public static class ProcurementModuleExtensions
{
    public static IServiceCollection AddProcurementModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

        services.AddDbContext<ProcurementDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory_Procurement", "procurement"))
            .UseSnakeCaseNamingConvention();
            options.AddInterceptors(
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.AuditableEntityInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.SoftDeleteInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.TenantConnectionInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.DomainEventDispatchInterceptor>());
        });

        services.AddScoped<IProcurementDbContext>(sp => sp.GetRequiredService<ProcurementDbContext>());

        return services;
    }
}
