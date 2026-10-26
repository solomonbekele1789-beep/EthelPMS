using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NGO.PMS.ImportExport.Application.Abstractions;
using NGO.PMS.ImportExport.Domain.Abstractions;
using NGO.PMS.ImportExport.Infrastructure.Persistence;
using NGO.PMS.ImportExport.Infrastructure.Services;

namespace NGO.PMS.ImportExport.API;

public static class ImportExportModuleExtensions
{
    public static IServiceCollection AddImportExportModule(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

        services.AddDbContext<ImportExportDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString, npgsql =>
                npgsql.MigrationsHistoryTable("__EFMigrationsHistory", "importexport"))
            .UseSnakeCaseNamingConvention();
            options.AddInterceptors(
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.AuditableEntityInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.SoftDeleteInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.TenantConnectionInterceptor>(),
                sp.GetRequiredService<NGO.PMS.SharedKernel.Persistence.DomainEventDispatchInterceptor>());
        });

        services.AddScoped<IImportExportDbContext>(sp => sp.GetRequiredService<ImportExportDbContext>());
        services.AddScoped<IImportProcessor, CsvImportProcessor>();
        services.AddScoped<IExportProcessor, CsvExportProcessor>();

        return services;
    }
}
