using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NGO.PMS.PlatformAdmin.Application;
using NGO.PMS.PlatformAdmin.Domain.Constants;
using NGO.PMS.PlatformAdmin.Domain.Entities;

namespace NGO.PMS.PlatformAdmin.Infrastructure.Services;

/// <summary>
/// Runs the multi-step tenant provisioning pipeline.
/// Called from a Hangfire background job after ProvisionTenantCommand sets status to Provisioning.
/// </summary>
public interface ITenantProvisioningService
{
    Task ProvisionAsync(Guid tenantId, CancellationToken ct = default);
}

public class TenantProvisioningService : ITenantProvisioningService
{
    private readonly IPlatformDbContext _db;
    private readonly ILogger<TenantProvisioningService> _logger;

    public TenantProvisioningService(IPlatformDbContext db, ILogger<TenantProvisioningService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task ProvisionAsync(Guid tenantId, CancellationToken ct = default)
    {
        _logger.LogInformation("Starting provisioning for tenant {TenantId}", tenantId);

        await ExecuteStep(tenantId, "CreateOrganization", async () =>
        {
            // TODO: Insert into identity.organizations via Dapper or cross-module event
            _logger.LogInformation("Step: CreateOrganization for tenant {TenantId}", tenantId);
        }, ct);

        await ExecuteStep(tenantId, "SeedPermissions", async () =>
        {
            // Permissions are global — skip if already seeded
            _logger.LogInformation("Step: SeedPermissions (global, skip if exists)");
            await Task.CompletedTask;
        }, ct);

        await ExecuteStep(tenantId, "CreateDefaultRoles", async () =>
        {
            // TODO: Create OrgAdmin, ProjectManager, FieldOfficer, MEALOfficer, FinanceOfficer, Viewer
            _logger.LogInformation("Step: CreateDefaultRoles for tenant {TenantId}", tenantId);
        }, ct);

        await ExecuteStep(tenantId, "CreateAdminUser", async () =>
        {
            // TODO: Create user with tenant.AdminEmail, assign OrgAdmin role, send setup email
            _logger.LogInformation("Step: CreateAdminUser for tenant {TenantId}", tenantId);
        }, ct);

        await ExecuteStep(tenantId, "EnableModules", async () =>
        {
            var tenant = await _db.Tenants
                .Include(t => t.SubscriptionPackage)
                .FirstAsync(t => t.Id == tenantId, ct);

            var defaultModules = PlatformModules.TierDefaults.GetValueOrDefault(
                tenant.SubscriptionPackage.Name, ["identity"]);

            foreach (var module in defaultModules)
            {
                _db.TenantModules.Add(new TenantModule
                {
                    TenantId = tenantId,
                    ModuleName = module,
                    IsEnabled = true,
                    EnabledAt = DateTimeOffset.UtcNow
                });
            }
            await _db.SaveChangesAsync(ct);
        }, ct);

        // Mark as provisioned — ActivateTenantCommand will set Active status
        _logger.LogInformation("Provisioning completed for tenant {TenantId}", tenantId);
    }

    private async Task ExecuteStep(Guid tenantId, string step, Func<Task> action, CancellationToken ct)
    {
        var log = new ProvisioningLog
        {
            TenantId = tenantId,
            Step = step,
            Status = "Running",
            StartedAt = DateTimeOffset.UtcNow
        };
        _db.ProvisioningLogs.Add(log);
        await _db.SaveChangesAsync(ct);

        try
        {
            await action();
            log.Status = "Completed";
            log.CompletedAt = DateTimeOffset.UtcNow;
        }
        catch (Exception ex)
        {
            log.Status = "Failed";
            log.Message = ex.Message;
            log.CompletedAt = DateTimeOffset.UtcNow;
            _logger.LogError(ex, "Provisioning step '{Step}' failed for tenant {TenantId}", step, tenantId);
            throw;
        }
        finally
        {
            await _db.SaveChangesAsync(ct);
        }
    }
}
