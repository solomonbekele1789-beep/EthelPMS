using NGO.PMS.PlatformAdmin.Application.Abstractions;
using NGO.PMS.SharedKernel.Audit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NGO.PMS.PlatformAdmin.Application;
using NGO.PMS.PlatformAdmin.Infrastructure.Persistence;
using NGO.PMS.PlatformAdmin.Infrastructure.Services;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.PlatformAdmin.API;

/// <summary>
/// Registers all PlatformAdmin module services with the DI container.
/// Called from Program.cs: builder.Services.AddPlatformAdminModule(configuration);
/// </summary>
public static class PlatformAdminModuleExtensions
{
    public static IServiceCollection AddPlatformAdminModule(
        this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

        // DbContext — PlatformAdmin uses 'platform' schema (NOT multi-tenant)
        services.AddDbContext<PlatformDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "platform"))
            .UseSnakeCaseNamingConvention();
            options.AddInterceptors(
                sp.GetRequiredService<AuditableEntityInterceptor>(),
                sp.GetRequiredService<SoftDeleteInterceptor>(),
                sp.GetRequiredService<DomainEventDispatchInterceptor>());
            var auditInterceptor = sp.GetService<IAuditInterceptor>();
            if (auditInterceptor is not null) options.AddInterceptors(auditInterceptor);
        });

        services.AddScoped<IPlatformDbContext>(sp => sp.GetRequiredService<PlatformDbContext>());

        // Services
        services.AddScoped<ITenantProvisioningService, TenantProvisioningService>();
        services.AddScoped<ITenantUsageReader, TenantUsageReader>();

        // Authorization policy for SuperAdmin — strictly platform-level SuperAdmin only
        services.AddAuthorization(options =>
        {
            options.AddPolicy("SuperAdmin", policy =>
                policy.RequireClaim("roles", "SuperAdmin"));
        });

        return services;
    }
}
