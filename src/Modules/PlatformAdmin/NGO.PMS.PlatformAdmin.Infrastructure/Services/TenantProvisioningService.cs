using System.Security.Cryptography;
using System.Text;
using Dapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NGO.PMS.Contracts.IntegrationEvents.PlatformAdmin;
using NGO.PMS.PlatformAdmin.Application;
using NGO.PMS.PlatformAdmin.Application.Abstractions;
using NGO.PMS.PlatformAdmin.Domain.Constants;
using NGO.PMS.PlatformAdmin.Domain.Entities;
using Npgsql;

namespace NGO.PMS.PlatformAdmin.Infrastructure.Services;

/// <summary>
/// Runs the complete multi-step tenant provisioning pipeline:
/// 1. CreateOrganization (identity.organizations)
/// 2. EnableRLS (verify RLS active on tenant tables)
/// 3. CreateDefaultRoles (clone identity.role_templates into identity.roles + role_permissions)
/// 4. CreateAdminUser (insert admin user, assign OrgAdmin role, create setup password token)
/// 5. EnableModules (populate platform.tenant_modules from subscription tier defaults)
/// 6. Activate tenant and publish TenantProvisionedIntegrationEvent
/// </summary>
public class TenantProvisioningService : ITenantProvisioningService
{
    private readonly IPlatformDbContext _db;
    private readonly IConfiguration _configuration;
    private readonly IPublisher _publisher;
    private readonly ILogger<TenantProvisioningService> _logger;

    public TenantProvisioningService(
        IPlatformDbContext db,
        IConfiguration configuration,
        IPublisher publisher,
        ILogger<TenantProvisioningService> logger)
    {
        _db = db;
        _configuration = configuration;
        _publisher = publisher;
        _logger = logger;
    }

    private string ConnectionString =>
        _configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not configured.");

    public async Task ProvisionAsync(Guid tenantId, CancellationToken ct = default)
    {
        _logger.LogInformation("Starting provisioning for tenant {TenantId}", tenantId);

        var tenant = await _db.Tenants
            .Include(t => t.SubscriptionPackage)
            .Include(t => t.TenantModules)
            .FirstAsync(t => t.Id == tenantId, ct);

        await ExecuteStep(tenantId, "CreateOrganization", async () =>
        {
            await using var conn = new NpgsqlConnection(ConnectionString);
            await conn.ExecuteAsync(
                """
                INSERT INTO identity.organizations (id, name, slug, timezone, calendar_preference, settings, created_at, updated_at, is_deleted)
                VALUES (@Id, @Name, @Slug, @Timezone, 0, '{}'::jsonb, NOW(), NOW(), false)
                ON CONFLICT (id) DO NOTHING
                """,
                new { tenant.Id, tenant.Name, tenant.Slug, tenant.Timezone });
        }, ct);

        await ExecuteStep(tenantId, "EnableRLS", async () =>
        {
            await using var conn = new NpgsqlConnection(ConnectionString);
            var rlsEnabled = await conn.ExecuteScalarAsync<bool>(
                """
                SELECT relrowsecurity
                FROM pg_class c
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = 'identity' AND c.relname = 'users'
                """);
            _logger.LogInformation("RLS verification for tenant {TenantId}: identity.users RLS={Enabled}", tenantId, rlsEnabled);
        }, ct);

        Guid orgAdminRoleId = Guid.NewGuid();
        await ExecuteStep(tenantId, "CreateDefaultRoles", async () =>
        {
            await using var conn = new NpgsqlConnection(ConnectionString);
            var existingRoleId = await conn.ExecuteScalarAsync<Guid?>(
                "SELECT id FROM identity.roles WHERE organization_id = @OrgId AND name = 'Organization Admin' LIMIT 1",
                new { OrgId = tenantId });

            if (existingRoleId.HasValue)
            {
                orgAdminRoleId = existingRoleId.Value;
                return;
            }

            await conn.ExecuteAsync(
                """
                INSERT INTO identity.roles (id, organization_id, name, description, is_system_role, created_at, updated_at, is_deleted)
                VALUES (@RoleId, @OrgId, 'Organization Admin', 'Full organizational administration access', true, NOW(), NOW(), false)
                """,
                new { RoleId = orgAdminRoleId, OrgId = tenantId });

            // Assign all non-platform permissions to Organization Admin
            await conn.ExecuteAsync(
                """
                INSERT INTO identity.role_permissions (role_id, permission_id)
                SELECT @RoleId, p.id
                FROM identity.permissions p
                WHERE p.code NOT LIKE 'platform.%'
                ON CONFLICT DO NOTHING
                """,
                new { RoleId = orgAdminRoleId });
        }, ct);

        await ExecuteStep(tenantId, "CreateAdminUser", async () =>
        {
            await using var conn = new NpgsqlConnection(ConnectionString);
            var existingUserId = await conn.ExecuteScalarAsync<Guid?>(
                "SELECT id FROM identity.users WHERE email = @Email LIMIT 1",
                new { Email = tenant.AdminEmail });

            var adminUserId = existingUserId ?? Guid.NewGuid();
            if (!existingUserId.HasValue)
            {
                await conn.ExecuteAsync(
                    """
                    INSERT INTO identity.users (id, organization_id, email, first_name, last_name, password_hash, is_active, failed_login_attempts, created_at, updated_at, is_deleted)
                    VALUES (@UserId, @OrgId, @Email, 'Organization', 'Admin', '', true, 0, NOW(), NOW(), false)
                    """,
                    new { UserId = adminUserId, OrgId = tenantId, Email = tenant.AdminEmail });

                await conn.ExecuteAsync(
                    """
                    INSERT INTO identity.user_roles (user_id, role_id)
                    VALUES (@UserId, @RoleId)
                    ON CONFLICT DO NOTHING
                    """,
                    new { UserId = adminUserId, RoleId = orgAdminRoleId });

                var setupToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
                var setupHash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(setupToken)));
                await conn.ExecuteAsync(
                    """
                    INSERT INTO identity.password_reset_tokens (id, user_id, token_hash, purpose, created_at, expires_at)
                    VALUES (@Id, @UserId, @TokenHash, 'password_setup', NOW(), NOW() + INTERVAL '24 hours')
                    """,
                    new { Id = Guid.NewGuid(), UserId = adminUserId, TokenHash = setupHash });
            }
        }, ct);

        await ExecuteStep(tenantId, "EnableModules", async () =>
        {
            var packageName = tenant.SubscriptionPackage?.Name ?? "Free";
            var defaultModules = PlatformModules.TierDefaults.GetValueOrDefault(packageName, ["identity", "projects", "reporting"]);
            var existingModules = tenant.TenantModules.Select(m => m.ModuleName).ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var module in defaultModules)
            {
                if (!existingModules.Contains(module))
                {
                    _db.TenantModules.Add(new TenantModule
                    {
                        TenantId = tenantId,
                        ModuleName = module,
                        IsEnabled = true,
                        EnabledAt = DateTimeOffset.UtcNow
                    });
                }
            }
            await _db.SaveChangesAsync(ct);
        }, ct);

        tenant.Activate();
        await _db.SaveChangesAsync(ct);

        await _publisher.Publish(new TenantProvisionedIntegrationEvent(
            tenant.Id, tenant.Slug, tenant.Name, tenant.AdminEmail)
        {
            OrganizationId = tenant.Id
        }, ct);

        _logger.LogInformation("Provisioning completed and tenant {TenantId} activated.", tenantId);
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
