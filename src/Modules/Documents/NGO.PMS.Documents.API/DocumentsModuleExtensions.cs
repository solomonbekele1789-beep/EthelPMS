using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NGO.PMS.Documents.Application.Abstractions;
using NGO.PMS.Documents.Infrastructure.Persistence;
using NGO.PMS.Documents.Infrastructure.Services;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Documents.API;

public static class DocumentsModuleExtensions
{
    public static IServiceCollection AddDocumentsModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

        services.AddDbContext<DocumentsDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory_Documents", "content"))
            .UseSnakeCaseNamingConvention();
            options.AddInterceptors(
                sp.GetRequiredService<AuditableEntityInterceptor>(),
                sp.GetRequiredService<SoftDeleteInterceptor>(),
                sp.GetRequiredService<TenantConnectionInterceptor>(),
                sp.GetRequiredService<DomainEventDispatchInterceptor>());
        });

        services.AddScoped<IDocumentsDbContext>(sp => sp.GetRequiredService<DocumentsDbContext>());
        services.AddScoped<IFileStorageService, LocalFileStorageService>();

        return services;
    }
}
