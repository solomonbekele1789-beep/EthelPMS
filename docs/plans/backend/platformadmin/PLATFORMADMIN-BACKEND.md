# EthelPMS — PlatformAdmin Module Backend Plan

**Version:** 1.0
**Date:** October 17, 2026
**Owner:** Developer A (Backend lead)
**Phase:** 1 (Weeks 3-4)

> Covers: Tenant management, subscription packages, module toggling, tenant provisioning, platform-level operations.
> Prerequisites: Phase 0B infrastructure (Finbuckle, schemas, outbox).
> Cross-references: `shared/MULTI-TENANCY.md`, `shared/DATABASE-ARCHITECTURE.md`

---

## 1. Requirements Covered

| ID | Requirement | Priority |
|----|-------------|----------|
| REQ-PLAT-001 | SuperAdmin can create/manage tenants | Must |
| REQ-PLAT-002 | Tenant provisioning (schema, admin user, defaults) | Must |
| REQ-PLAT-003 | Module toggling per tenant | Must |
| REQ-PLAT-004 | Subscription tier management (free/pro/enterprise) | Must |
| REQ-PLAT-005 | Tenant access keys for API integration | Should |
| REQ-PLAT-006 | Usage dashboard per tenant | Should |
| REQ-PLAT-007 | Tenant deactivation/suspension | Must |
| REQ-PLAT-008 | Tenant branding (logo, colors, subdomain) | Should |

---

## 2. Schema

The PlatformAdmin module uses the `platform` schema. This is the ONLY schema NOT filtered by RLS — SuperAdmin sees all tenants.

---

## 3. Domain Entities

### 3.1 PlatformTenant

**File:** `src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.Domain/Entities/PlatformTenant.cs`

```csharp
namespace NGO.PMS.PlatformAdmin.Domain.Entities;

public class PlatformTenant : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string AdminEmail { get; private set; } = string.Empty;
    public string? LogoUrl { get; private set; }
    public string? PrimaryColor { get; private set; }
    public string Status { get; private set; } = TenantStatus.Pending;
    public Guid SubscriptionPackageId { get; private set; }
    public DateTime? ActivatedAt { get; private set; }
    public DateTime? SuspendedAt { get; private set; }
    public string? SuspensionReason { get; private set; }
    public int MaxUsers { get; private set; } = 10;
    public int MaxProjects { get; private set; } = 5;
    public string Timezone { get; private set; } = "Africa/Addis_Ababa";
    public string ConnectionString { get; private set; } = string.Empty;

    // Navigation
    public SubscriptionPackage SubscriptionPackage { get; private set; } = null!;
    public ICollection<TenantModule> TenantModules { get; private set; } = [];
    public ICollection<TenantAccessKey> AccessKeys { get; private set; } = [];

    public static PlatformTenant Create(string name, string slug, string adminEmail, Guid packageId)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name required");
        if (string.IsNullOrWhiteSpace(slug)) throw new ArgumentException("Slug required");
        return new PlatformTenant
        {
            Name = name, Slug = slug.ToLowerInvariant().Trim(),
            AdminEmail = adminEmail.ToLowerInvariant().Trim(),
            SubscriptionPackageId = packageId, Status = TenantStatus.Pending
        };
    }

    public void Activate()
    {
        Status = TenantStatus.Active;
        ActivatedAt = DateTime.UtcNow;
        AddDomainEvent(new TenantActivatedEvent(Id, Name));
    }

    public void Suspend(string reason)
    {
        Status = TenantStatus.Suspended;
        SuspendedAt = DateTime.UtcNow;
        SuspensionReason = reason;
        AddDomainEvent(new TenantSuspendedEvent(Id, Name, reason));
    }

    public void Reactivate()
    {
        Status = TenantStatus.Active;
        SuspendedAt = null;
        SuspensionReason = null;
    }

    public void UpdateLimits(int maxUsers, int maxProjects)
    {
        MaxUsers = maxUsers;
        MaxProjects = maxProjects;
    }

    public void UpdateBranding(string? logoUrl, string? primaryColor)
    {
        LogoUrl = logoUrl;
        PrimaryColor = primaryColor;
    }
}

public static class TenantStatus
{
    public const string Pending = "Pending";
    public const string Provisioning = "Provisioning";
    public const string Active = "Active";
    public const string Suspended = "Suspended";
    public const string Decommissioned = "Decommissioned";
}
```

### 3.2 Other Entities

| Entity | File | Key Properties |
|--------|------|---------------|
| `SubscriptionPackage` | `Domain/Entities/SubscriptionPackage.cs` | Name (Free/Pro/Enterprise), MaxUsers, MaxProjects, IncludedModules[], PriceMonthlyUsd, IsActive |
| `TenantModule` | `Domain/Entities/TenantModule.cs` | TenantId, ModuleName, IsEnabled, EnabledAt, DisabledAt |
| `TenantAccessKey` | `Domain/Entities/TenantAccessKey.cs` | TenantId, KeyHash (SHA256), Label, Scopes[], ExpiresAt, RevokedAt |
| `ProvisioningLog` | `Domain/Entities/ProvisioningLog.cs` | TenantId, Step, Status (Pending/Running/Completed/Failed), Message, StartedAt, CompletedAt |

### 3.3 Domain Events

```csharp
public record TenantCreatedEvent(Guid TenantId, string Name, string AdminEmail) : IDomainEvent;
public record TenantActivatedEvent(Guid TenantId, string Name) : IDomainEvent;
public record TenantSuspendedEvent(Guid TenantId, string Name, string Reason) : IDomainEvent;
public record TenantModuleToggledEvent(Guid TenantId, string Module, bool Enabled) : IDomainEvent;
```

### 3.4 Available Modules (constant list)

```csharp
public static class PlatformModules
{
    public static readonly IReadOnlyList<string> All =
    [
        "identity", "projects", "results-framework", "planning",
        "reporting", "meal", "participants", "graduation",
        "procurement", "fund-accounting", "assets", "training",
        "tasks", "risk", "donors", "chat", "notifications", "documents"
    ];

    public static readonly IReadOnlyDictionary<string, string[]> TierDefaults = new Dictionary<string, string[]>
    {
        ["Free"] = ["identity", "projects", "reporting"],
        ["Pro"] = ["identity", "projects", "results-framework", "planning", "reporting", "meal", "participants", "tasks", "notifications"],
        ["Enterprise"] = All.ToArray()
    };
}
```

---

## 4. Application Layer — Commands

| Command | Handler Logic | Validator Rules |
|---------|--------------|-----------------|
| `CreateTenantCommand(Name, Slug, AdminEmail, SubscriptionPackageId)` | Create PlatformTenant, enqueue provisioning job | Slug unique, valid email, package exists |
| `ProvisionTenantCommand(TenantId)` | Run provisioning pipeline (see §6) | Tenant must be in Pending status |
| `ActivateTenantCommand(TenantId)` | Set status=Active, record timestamp | Provisioning must be Complete |
| `SuspendTenantCommand(TenantId, Reason)` | Set status=Suspended, publish event | Reason required, tenant must be Active |
| `ReactivateTenantCommand(TenantId)` | Set status=Active, clear suspension | Tenant must be Suspended |
| `UpdateTenantCommand(TenantId, Name?, MaxUsers?, MaxProjects?, Timezone?)` | Update fields | TenantId required |
| `UpdateTenantBrandingCommand(TenantId, LogoUrl?, PrimaryColor?)` | Update branding | TenantId required |
| `ToggleModuleCommand(TenantId, ModuleName, Enabled)` | Enable/disable module for tenant | ModuleName must be in PlatformModules.All |
| `UpdateSubscriptionCommand(TenantId, SubscriptionPackageId)` | Change tier, auto-toggle modules per tier | Package exists |
| `CreateAccessKeyCommand(TenantId, Label, Scopes[], ExpiresAt?)` | Generate key, store hash | Label required, ≥1 scope |
| `RevokeAccessKeyCommand(KeyId)` | Set RevokedAt | Key exists |

---

## 5. Application Layer — Queries

| Query | Returns | Notes |
|-------|---------|-------|
| `ListTenantsQuery(Page, PageSize, Search?, Status?)` | `PagedResponse<TenantListItemDto>` | Filterable by status |
| `GetTenantQuery(TenantId)` | `TenantDetailDto` | Includes modules, package, keys, provisioning status |
| `ListSubscriptionPackagesQuery` | `List<SubscriptionPackageDto>` | Active packages only |
| `GetTenantUsageQuery(TenantId)` | `TenantUsageDto` | User count, project count, storage |
| `GetProvisioningStatusQuery(TenantId)` | `List<ProvisioningLogDto>` | Step-by-step status |
| `ListAccessKeysQuery(TenantId)` | `List<AccessKeyDto>` | Active + revoked |

---

## 6. Tenant Provisioning Pipeline

**File:** `src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.Infrastructure/Services/TenantProvisioningService.cs`

The provisioning pipeline runs as a Hangfire background job. Steps:

```csharp
public interface ITenantProvisioningService
{
    Task ProvisionAsync(Guid tenantId, CancellationToken ct);
}

public class TenantProvisioningService : ITenantProvisioningService
{
    // Injected: PlatformDbContext, IDbConnectionFactory, IEmailService, ILogger

    public async Task ProvisionAsync(Guid tenantId, CancellationToken ct)
    {
        var tenant = await _db.Tenants.Include(t => t.SubscriptionPackage).FirstAsync(t => t.Id == tenantId, ct);

        await ExecuteStep(tenantId, "CreateOrganization", async () =>
        {
            // INSERT into identity.organizations (id = tenantId)
            await _connection.ExecuteAsync("""
                INSERT INTO identity.organizations (id, name, slug, timezone, created_at)
                VALUES (@Id, @Name, @Slug, @Tz, now())
            """, new { Id = tenantId, tenant.Name, tenant.Slug, Tz = tenant.Timezone });
        }, ct);

        await ExecuteStep(tenantId, "EnableRLS", async () =>
        {
            // SET app.current_org_id for this tenant's data
            await _connection.ExecuteAsync($"SELECT set_config('app.current_org_id', '{tenantId}', false)");
        }, ct);

        await ExecuteStep(tenantId, "SeedPermissions", async () =>
        {
            // Permissions are global (no org filter), skip if already seeded
        }, ct);

        await ExecuteStep(tenantId, "CreateDefaultRoles", async () =>
        {
            // Create OrgAdmin, ProjectManager, FieldOfficer, MEALOfficer, FinanceOfficer, Viewer
            // for this organization with org-scoped role templates
        }, ct);

        await ExecuteStep(tenantId, "CreateAdminUser", async () =>
        {
            // Create user with tenant.AdminEmail, assign OrgAdmin role
            // Generate setup password token, send email
        }, ct);

        await ExecuteStep(tenantId, "EnableModules", async () =>
        {
            var defaultModules = PlatformModules.TierDefaults[tenant.SubscriptionPackage.Name];
            foreach (var module in defaultModules)
            {
                _db.TenantModules.Add(new TenantModule
                {
                    TenantId = tenantId, ModuleName = module,
                    IsEnabled = true, EnabledAt = DateTime.UtcNow
                });
            }
            await _db.SaveChangesAsync(ct);
        }, ct);

        await ExecuteStep(tenantId, "RegisterFinbuckle", async () =>
        {
            // Register tenant in Finbuckle store so JWT claim resolves correctly
        }, ct);

        tenant.Activate();
        await _db.SaveChangesAsync(ct);
    }

    private async Task ExecuteStep(Guid tenantId, string step, Func<Task> action, CancellationToken ct)
    {
        var log = new ProvisioningLog { TenantId = tenantId, Step = step, Status = "Running", StartedAt = DateTime.UtcNow };
        _db.ProvisioningLogs.Add(log);
        await _db.SaveChangesAsync(ct);

        try
        {
            await action();
            log.Status = "Completed";
            log.CompletedAt = DateTime.UtcNow;
        }
        catch (Exception ex)
        {
            log.Status = "Failed";
            log.Message = ex.Message;
            log.CompletedAt = DateTime.UtcNow;
            throw; // Hangfire will retry
        }
        finally
        {
            await _db.SaveChangesAsync(ct);
        }
    }
}
```

---

## 7. DTOs

```csharp
// Application/Tenants/DTOs/
public record TenantListItemDto(Guid Id, string Name, string Slug, string Status,
    string SubscriptionName, int UserCount, int ProjectCount, DateTime CreatedAt);

public record TenantDetailDto(Guid Id, string Name, string Slug, string AdminEmail,
    string Status, string? LogoUrl, string? PrimaryColor, int MaxUsers, int MaxProjects,
    string Timezone, SubscriptionPackageDto Subscription, List<TenantModuleDto> Modules,
    DateTime CreatedAt, DateTime? ActivatedAt, DateTime? SuspendedAt, string? SuspensionReason);

public record TenantModuleDto(string ModuleName, bool IsEnabled, DateTime? EnabledAt);

public record SubscriptionPackageDto(Guid Id, string Name, int MaxUsers, int MaxProjects,
    decimal PriceMonthlyUsd, string[] IncludedModules);

public record TenantUsageDto(int CurrentUsers, int MaxUsers, int CurrentProjects,
    int MaxProjects, long StorageUsedBytes);

public record ProvisioningLogDto(string Step, string Status, string? Message,
    DateTime StartedAt, DateTime? CompletedAt);

public record AccessKeyDto(Guid Id, string Label, string[] Scopes, string MaskedKey,
    DateTime CreatedAt, DateTime? ExpiresAt, bool IsRevoked);

// Request DTOs
public record CreateTenantRequest(string Name, string Slug, string AdminEmail, Guid SubscriptionPackageId);
public record UpdateTenantRequest(string? Name, int? MaxUsers, int? MaxProjects, string? Timezone);
public record ToggleModuleRequest(string ModuleName, bool Enabled);
public record CreateAccessKeyRequest(string Label, string[] Scopes, DateTime? ExpiresAt);
```

---

## 8. Infrastructure — PlatformDbContext

**File:** `src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.Infrastructure/Persistence/PlatformDbContext.cs`

```csharp
public class PlatformDbContext : DbContext
{
    // NOTE: This does NOT inherit from MultiTenantDbContext.
    // The platform schema is tenant-agnostic — SuperAdmin sees everything.

    public DbSet<PlatformTenant> Tenants => Set<PlatformTenant>();
    public DbSet<SubscriptionPackage> SubscriptionPackages => Set<SubscriptionPackage>();
    public DbSet<TenantModule> TenantModules => Set<TenantModule>();
    public DbSet<TenantAccessKey> AccessKeys => Set<TenantAccessKey>();
    public DbSet<ProvisioningLog> ProvisioningLogs => Set<ProvisioningLog>();

    public PlatformDbContext(DbContextOptions<PlatformDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("platform");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PlatformDbContext).Assembly);
    }
}
```

---

## 9. API Layer — Controllers

### TenantsController

**File:** `src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.API/Controllers/TenantsController.cs`

```csharp
[ApiController]
[Route("api/v1/platform/tenants")]
[Authorize(Policy = "SuperAdmin")]
public class TenantsController : ControllerBase
{
    private readonly ISender _mediator;
    public TenantsController(ISender mediator) => _mediator = mediator;

    [HttpGet]                              → ListTenantsQuery
    [HttpGet("{id:guid}")]                 → GetTenantQuery
    [HttpPost]                             → CreateTenantCommand (returns 201 + Location header)
    [HttpPut("{id:guid}")]                 → UpdateTenantCommand
    [HttpPost("{id:guid}/provision")]       → ProvisionTenantCommand (triggers background job)
    [HttpPost("{id:guid}/activate")]        → ActivateTenantCommand
    [HttpPost("{id:guid}/suspend")]         → SuspendTenantCommand
    [HttpPost("{id:guid}/reactivate")]      → ReactivateTenantCommand
    [HttpPut("{id:guid}/branding")]         → UpdateTenantBrandingCommand
    [HttpPut("{id:guid}/subscription")]     → UpdateSubscriptionCommand
    [HttpGet("{id:guid}/usage")]            → GetTenantUsageQuery
    [HttpGet("{id:guid}/provisioning")]     → GetProvisioningStatusQuery
}
```

### ModulesController

```csharp
[Route("api/v1/platform/tenants/{tenantId:guid}/modules")]
[Authorize(Policy = "SuperAdmin")]

[HttpGet]                                  → List tenant's modules
[HttpPut("{moduleName}")]                  → ToggleModuleCommand
```

### SubscriptionsController

```csharp
[Route("api/v1/platform/subscriptions")]
[Authorize(Policy = "SuperAdmin")]

[HttpGet]                                  → ListSubscriptionPackagesQuery
```

### AccessKeysController

```csharp
[Route("api/v1/platform/tenants/{tenantId:guid}/keys")]
[Authorize(Policy = "SuperAdmin")]

[HttpGet]                                  → ListAccessKeysQuery
[HttpPost]                                 → CreateAccessKeyCommand (returns key in response ONCE)
[HttpDelete("{keyId:guid}")]               → RevokeAccessKeyCommand
```

---

## 10. Authorization

The PlatformAdmin module uses a simple policy-based authorization rather than the standard permission system:

```csharp
// In module registration:
services.AddAuthorization(options =>
{
    options.AddPolicy("SuperAdmin", policy =>
        policy.RequireClaim("role", "SuperAdmin"));
});
```

Only users with the `SuperAdmin` role (assigned at the platform level, not org level) can access any PlatformAdmin endpoint. There are no granular permissions within the platform module.

---

## 11. Module Registration

**File:** `src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.API/PlatformAdminModuleExtensions.cs`

```csharp
public static class PlatformAdminModuleExtensions
{
    public static IServiceCollection AddPlatformAdminModule(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(
            typeof(CreateTenantCommandHandler).Assembly));
        services.AddValidatorsFromAssembly(typeof(CreateTenantCommandValidator).Assembly);
        services.AddAutoMapper(typeof(TenantMappingProfile).Assembly);

        services.AddDbContext<PlatformDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<ITenantProvisioningService, TenantProvisioningService>();

        return services;
    }
}
```

---

## 12. Database Migration

### DbUp Scripts

| Script | Content |
|--------|---------|
| `0001_platform_schema.sql` | `CREATE SCHEMA IF NOT EXISTS platform;` |
| `0002_platform_tables.sql` | tenants, subscription_packages, tenant_modules, tenant_access_keys, provisioning_logs |
| `0004_seed_subscription_packages.sql` | Free, Pro, Enterprise packages with defaults |

---

## 13. Integration Events Published

| Event | Trigger | Consumers |
|-------|---------|-----------|
| `TenantProvisionedIntegrationEvent` | ProvisionTenantCommand | Identity (creates org + admin user) |
| `TenantSuspendedIntegrationEvent` | SuspendTenantCommand | All modules (block access) |
| `ModuleToggledIntegrationEvent` | ToggleModuleCommand | Frontend (refresh available modules) |

---

## 14. Testing Checklist

### Unit Tests

| Test | Type |
|------|------|
| `PlatformTenant_Create_ShouldSetPendingStatus` | Domain |
| `PlatformTenant_Activate_ShouldSetTimestamp` | Domain |
| `PlatformTenant_Suspend_ShouldRequireReason` | Domain |
| `CreateTenantCommandHandler_ShouldCreateAndEnqueueProvisioning` | Application |
| `CreateTenantCommandValidator_ShouldFail_WhenSlugDuplicate` | Application |
| `ToggleModuleCommandHandler_ShouldEnableModule` | Application |

### Integration Tests

| Test | Endpoint |
|------|----------|
| `ListTenants_ShouldReturn200_ForSuperAdmin` | GET /api/v1/platform/tenants |
| `ListTenants_ShouldReturn403_ForOrgAdmin` | GET /api/v1/platform/tenants |
| `CreateTenant_ShouldReturn201` | POST /api/v1/platform/tenants |
| `ProvisionTenant_ShouldCreateOrgAndAdmin` | POST /api/v1/platform/tenants/{id}/provision |
| `SuspendTenant_ShouldBlockAccess` | POST /api/v1/platform/tenants/{id}/suspend |
| `ToggleModule_ShouldDisableModule` | PUT /api/v1/platform/tenants/{id}/modules/projects |

---

## 15. Complete File Index

| File | Action |
|------|--------|
| `Domain/Entities/PlatformTenant.cs` | Create |
| `Domain/Entities/SubscriptionPackage.cs` | Create |
| `Domain/Entities/TenantModule.cs` | Create |
| `Domain/Entities/TenantAccessKey.cs` | Create |
| `Domain/Entities/ProvisioningLog.cs` | Create |
| `Domain/Constants/TenantStatus.cs` | Create |
| `Domain/Constants/PlatformModules.cs` | Create |
| `Domain/Events/TenantCreatedEvent.cs` | Create |
| `Domain/Events/TenantActivatedEvent.cs` | Create |
| `Domain/Events/TenantSuspendedEvent.cs` | Create |
| `Application/Tenants/Commands/CreateTenant/*` (3 files) | Create |
| `Application/Tenants/Commands/ProvisionTenant/*` (2 files) | Create |
| `Application/Tenants/Commands/ActivateTenant/*` (2 files) | Create |
| `Application/Tenants/Commands/SuspendTenant/*` (3 files) | Create |
| `Application/Tenants/Commands/ReactivateTenant/*` (2 files) | Create |
| `Application/Tenants/Commands/UpdateTenant/*` (3 files) | Create |
| `Application/Tenants/Commands/UpdateTenantBranding/*` (2 files) | Create |
| `Application/Tenants/Commands/ToggleModule/*` (3 files) | Create |
| `Application/Tenants/Commands/UpdateSubscription/*` (3 files) | Create |
| `Application/AccessKeys/Commands/CreateAccessKey/*` (3 files) | Create |
| `Application/AccessKeys/Commands/RevokeAccessKey/*` (2 files) | Create |
| `Application/Tenants/Queries/ListTenants/*` (2 files) | Create |
| `Application/Tenants/Queries/GetTenant/*` (2 files) | Create |
| `Application/Tenants/Queries/GetTenantUsage/*` (2 files) | Create |
| `Application/Tenants/Queries/GetProvisioningStatus/*` (2 files) | Create |
| `Application/Subscriptions/Queries/ListSubscriptionPackages/*` (2 files) | Create |
| `Application/AccessKeys/Queries/ListAccessKeys/*` (2 files) | Create |
| `Application/Tenants/DTOs/*.cs` (6 files) | Create |
| `Application/Mappings/TenantMappingProfile.cs` | Create |
| `Infrastructure/Persistence/PlatformDbContext.cs` | Create |
| `Infrastructure/Persistence/Configurations/*.cs` (5 files) | Create |
| `Infrastructure/Services/TenantProvisioningService.cs` | Create |
| `API/Controllers/TenantsController.cs` | Create |
| `API/Controllers/ModulesController.cs` | Create |
| `API/Controllers/SubscriptionsController.cs` | Create |
| `API/Controllers/AccessKeysController.cs` | Create |
| `API/PlatformAdminModuleExtensions.cs` | Create |

**Total: ~55 files for PlatformAdmin backend**

---

## Dependencies

| This plan depends on | For |
|---------------------|-----|
| `shared/MULTI-TENANCY.md` | Finbuckle tenant store, RLS, tenant resolution |
| `shared/DATABASE-ARCHITECTURE.md` | Schema layout, migration strategy |
| `shared/CROSS-MODULE-EVENTS.md` | Outbox for integration events |
| `backend/identity/IDENTITY-BACKEND.md` | Admin user creation during provisioning |
| `backend/BACKEND-OVERVIEW.md` | Module registration pattern, MediatR pipeline |
