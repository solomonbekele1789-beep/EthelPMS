using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Audit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NGO.PMS.Identity.Application;
using NGO.PMS.Identity.Infrastructure.Persistence;
using NGO.PMS.Identity.Infrastructure.Services;
using NGO.PMS.SharedKernel.Authorization;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Identity.API;

/// <summary>
/// Registers all Identity module services with the DI container.
/// Called from Program.cs: builder.Services.AddIdentityModule(configuration);
/// </summary>
public static class IdentityModuleExtensions
{
    public static IServiceCollection AddIdentityModule(
        this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

        // DbContext — Identity uses its own context with 'identity' schema
        services.AddDbContext<IdentityDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "identity"))
            .UseSnakeCaseNamingConvention();
            options.AddInterceptors(
                sp.GetRequiredService<AuditableEntityInterceptor>(),
                sp.GetRequiredService<SoftDeleteInterceptor>(),
                sp.GetRequiredService<TenantConnectionInterceptor>(),
                sp.GetRequiredService<DomainEventDispatchInterceptor>());
            var auditInterceptor = sp.GetService<IAuditInterceptor>();
            if (auditInterceptor is not null) options.AddInterceptors(auditInterceptor);
        });

        services.AddScoped<IIdentityDbContext>(sp => sp.GetRequiredService<IdentityDbContext>());
        services.AddScoped<IOutboxWriter, OutboxWriter<IdentityDbContext>>();

        // Services
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IPermissionService, NGO.PMS.Identity.Infrastructure.Services.PermissionService>();
        services.AddHttpContextAccessor();

        return services;
    }
}
