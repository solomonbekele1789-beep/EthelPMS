# EthelPMS — Multi-Tenancy Plan

**Version:** 1.0
**Date:** October 16, 2026
**Owner:** Developer A (Backend lead), Developer B assists with frontend

> Single database, shared schemas, RLS-based isolation.
> Every tenant is an NGO organization. Every data row belongs to exactly one tenant.

---

## 1. Multi-Tenancy Strategy

| Aspect | Decision |
|--------|----------|
| Database topology | Single database, shared schemas |
| Isolation mechanism | PostgreSQL RLS (defense in depth) + EF Core global query filters (primary) |
| Tenant identifier | `organization_id` (UUID) on every tenant-scoped table |
| Tenant resolution | Finbuckle.MultiTenant 10.1.4 — resolves from JWT `tenant_id` claim |
| Tenant = | One NGO organization |
| Non-tenant tables | `reference.*` (currencies, geography), `platform.*` (tenants, modules), `identity.permissions` |

**Defense in depth:** Even if application code has a bug that skips the EF query filter, the PostgreSQL RLS policy blocks cross-tenant reads at the database level.

---

## 2. Database Schema

### 2.1 Platform Schema — `platform.tenants`

```sql
CREATE SCHEMA IF NOT EXISTS platform;

CREATE TABLE platform.tenants (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier        varchar(50)  NOT NULL UNIQUE,  -- URL-safe slug: 'mercy-corps-et'
    name              varchar(200) NOT NULL,
    connection_string text,                           -- NULL = shared DB (current strategy)
    is_active         boolean      NOT NULL DEFAULT true,
    subscription_tier varchar(20)  NOT NULL DEFAULT 'free',  -- free, pro, enterprise
    max_users         int          NOT NULL DEFAULT 10,
    max_projects      int          NOT NULL DEFAULT 5,
    max_storage_mb    int          NOT NULL DEFAULT 500,
    settings_json     jsonb        NOT NULL DEFAULT '{}',
    created_at        timestamptz  NOT NULL DEFAULT now(),
    updated_at        timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX ix_tenants_identifier ON platform.tenants (identifier);
CREATE INDEX ix_tenants_active ON platform.tenants (is_active) WHERE is_active = true;
```

### 2.2 Platform Schema — `platform.tenant_modules`

```sql
CREATE TABLE platform.tenant_modules (
    tenant_id   uuid        NOT NULL REFERENCES platform.tenants(id) ON DELETE CASCADE,
    module_name varchar(50) NOT NULL,  -- 'identity', 'projects', 'meal', etc.
    is_enabled  boolean     NOT NULL DEFAULT true,
    enabled_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (tenant_id, module_name)
);

CREATE INDEX ix_tenant_modules_tenant ON platform.tenant_modules (tenant_id);
```

### 2.3 PostgreSQL Tenant Context Function

```sql
-- Called by RLS policies to get current tenant
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS uuid AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_org_id', true), '')::uuid;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;
```

### 2.4 RLS Policies

**Template for every tenant-scoped table:**

```sql
-- Example: projects.projects table
ALTER TABLE projects.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.projects FORCE ROW LEVEL SECURITY;

-- Read policy: can only see own tenant's rows
CREATE POLICY tenant_isolation_select ON projects.projects
    FOR SELECT
    USING (organization_id = current_tenant_id());

-- Insert policy: can only insert for own tenant
CREATE POLICY tenant_isolation_insert ON projects.projects
    FOR INSERT
    WITH CHECK (organization_id = current_tenant_id());

-- Update policy: can only update own tenant's rows
CREATE POLICY tenant_isolation_update ON projects.projects
    FOR UPDATE
    USING (organization_id = current_tenant_id())
    WITH CHECK (organization_id = current_tenant_id());

-- Delete policy: can only delete own tenant's rows
CREATE POLICY tenant_isolation_delete ON projects.projects
    FOR DELETE
    USING (organization_id = current_tenant_id());
```

**Apply the same pattern to every tenant-scoped table across all schemas:**
- `identity.users`, `identity.roles`, `identity.user_roles`, `identity.attribute_rules`
- `projects.projects`, `projects.milestones`
- `planning.annual_plans`, `planning.quarterly_plans`
- `fundacct.journal_entries`, `fundacct.budgets`, `fundacct.accounts`
- `procurement.purchase_requests`, `procurement.contracts`
- `participants.profiles`, `graduation.tracking`
- `meal.meal_plans`, `meal.evaluations`
- `reporting.reports`
- All other tenant-scoped tables

**Tables NOT using RLS** (shared/global data):
- `reference.currencies`, `reference.countries`, `reference.regions`, `reference.zones`, `reference.woredas`
- `platform.tenants`, `platform.tenant_modules`
- `identity.permissions` (global permission definitions)

### 2.5 Database Role for Application

```sql
-- Application connects as this role (not superuser)
CREATE ROLE ethelpms_app LOGIN PASSWORD '...';

-- Grant schema access
GRANT USAGE ON SCHEMA identity, projects, planning, dip, reporting,
    meal, participants, graduation, procurement, fundacct, assets,
    training, tasks, risk, donors, collab, content, platform, reference, audit
    TO ethelpms_app;

-- Grant table access per schema
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA identity TO ethelpms_app;
-- ... repeat for each schema

-- RLS applies to this role (not to superuser)
-- Superuser bypasses RLS, ethelpms_app does not
```

---

## 3. Backend Implementation

### 3.1 SharedKernel — IMultiTenant Interface

**File:** `src/Shared/NGO.PMS.SharedKernel/Domain/IMultiTenant.cs`

```csharp
namespace NGO.PMS.SharedKernel.Domain;

public interface IMultiTenant
{
    Guid OrganizationId { get; set; }
}
```

> Already created in earlier phase. Included here for completeness.

### 3.2 SharedKernel — Tenant Info

**File:** `src/Shared/NGO.PMS.SharedKernel/MultiTenancy/EthelTenantInfo.cs`

```csharp
using Finbuckle.MultiTenant.Abstractions;

namespace NGO.PMS.SharedKernel.MultiTenancy;

public class EthelTenantInfo : ITenantInfo
{
    public string? Id { get; set; }
    public string? Identifier { get; set; }  // slug
    public string? Name { get; set; }
    public string? ConnectionString { get; set; }

    // Custom properties
    public bool IsActive { get; set; }
    public string SubscriptionTier { get; set; } = "free";
    public int MaxUsers { get; set; }
    public int MaxProjects { get; set; }
    public List<string> EnabledModules { get; set; } = [];
}
```

### 3.3 SharedKernel — Tenant Claim Strategy

**File:** `src/Shared/NGO.PMS.SharedKernel/MultiTenancy/TenantClaimStrategy.cs`

```csharp
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Http;

namespace NGO.PMS.SharedKernel.MultiTenancy;

public class TenantClaimStrategy : IMultiTenantStrategy
{
    public async Task<string?> GetIdentifierAsync(object context)
    {
        if (context is not HttpContext httpContext) return null;

        // Extract tenant_id from JWT claims
        var tenantClaim = httpContext.User.FindFirst("tenant_id");
        return tenantClaim?.Value;
    }
}
```

### 3.4 SharedKernel — MultiTenantDbContext Base

**File:** `src/Shared/NGO.PMS.SharedKernel/Persistence/MultiTenantDbContext.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.SharedKernel.Persistence;

public abstract class MultiTenantDbContext : DbContext
{
    private readonly ICurrentUserService _currentUser;

    protected MultiTenantDbContext(
        DbContextOptions options,
        ICurrentUserService currentUser) : base(options)
    {
        _currentUser = currentUser;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply global query filter to all IMultiTenant entities
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(IMultiTenant).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(MultiTenantDbContext)
                    .GetMethod(nameof(ApplyTenantFilter),
                        System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
                    .MakeGenericMethod(entityType.ClrType);
                method.Invoke(null, [modelBuilder, _currentUser]);
            }
        }
    }

    private static void ApplyTenantFilter<TEntity>(
        ModelBuilder modelBuilder, ICurrentUserService currentUser)
        where TEntity : class, IMultiTenant
    {
        modelBuilder.Entity<TEntity>()
            .HasQueryFilter(e => e.OrganizationId == currentUser.OrganizationId);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        // Auto-set OrganizationId on new entities
        foreach (var entry in ChangeTracker.Entries<IMultiTenant>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.OrganizationId = _currentUser.OrganizationId;
            }

            // Prevent changing tenant on existing entities
            if (entry.State == EntityState.Modified)
            {
                entry.Property(nameof(IMultiTenant.OrganizationId)).IsModified = false;
            }
        }

        return await base.SaveChangesAsync(ct);
    }
}
```

### 3.5 Tenant Context Middleware (RLS)

**File:** `src/Host/NGO.PMS.API/Middleware/TenantContextMiddleware.cs`

```csharp
using Npgsql;

namespace NGO.PMS.API.Middleware;

public class TenantContextMiddleware
{
    private readonly RequestDelegate _next;

    public TenantContextMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, IDbContextFactory<ProjectsDbContext> dbFactory)
    {
        var tenantId = context.User.FindFirst("tenant_id")?.Value;

        if (tenantId is not null)
        {
            // Set PostgreSQL session variable for RLS
            // Using parameterized query — NEVER string concatenation
            var connectionString = context.RequestServices
                .GetRequiredService<IConfiguration>()
                .GetConnectionString("DefaultConnection");

            await using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT set_config('app.current_org_id', @tenantId, true)";
            cmd.Parameters.AddWithValue("tenantId", tenantId);
            await cmd.ExecuteNonQueryAsync();
        }

        await _next(context);
    }
}
```

> **Note:** In practice, the RLS tenant context is set via the EF Core connection interceptor below for better integration:

**File:** `src/Shared/NGO.PMS.SharedKernel/Persistence/TenantConnectionInterceptor.cs`

```csharp
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Data.Common;

namespace NGO.PMS.SharedKernel.Persistence;

public class TenantConnectionInterceptor : DbConnectionInterceptor
{
    private readonly ICurrentUserService _currentUser;

    public TenantConnectionInterceptor(ICurrentUserService currentUser)
        => _currentUser = currentUser;

    public override async Task ConnectionOpenedAsync(
        DbConnection connection,
        ConnectionEndEventData eventData,
        CancellationToken ct = default)
    {
        if (_currentUser.OrganizationId != Guid.Empty)
        {
            await using var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT set_config('app.current_org_id', @p0, true)";
            var param = cmd.CreateParameter();
            param.ParameterName = "p0";
            param.Value = _currentUser.OrganizationId.ToString();
            cmd.Parameters.Add(param);
            await cmd.ExecuteNonQueryAsync(ct);
        }
    }
}
```

### 3.6 Module Access Middleware

**File:** `src/Host/NGO.PMS.API/Middleware/ModuleAccessMiddleware.cs`

```csharp
using Finbuckle.MultiTenant.Abstractions;
using NGO.PMS.SharedKernel.MultiTenancy;

namespace NGO.PMS.API.Middleware;

public class ModuleAccessMiddleware
{
    private readonly RequestDelegate _next;

    // Maps URL segments to module names
    private static readonly Dictionary<string, string> RouteToModule = new()
    {
        ["projects"] = "projects",
        ["results-framework"] = "resultsframework",
        ["planning"] = "planning",
        ["dip"] = "dip",
        ["reporting"] = "reporting",
        ["meal"] = "meal",
        ["participants"] = "participants",
        ["graduation"] = "graduation",
        ["procurement"] = "procurement",
        ["fund-accounting"] = "fundacct",
        ["assets"] = "assets",
        ["training"] = "training",
        ["tasks"] = "tasks",
        ["risks"] = "risk",
        ["donors"] = "donors",
        ["chat"] = "chat",
        ["notifications"] = "notifications",
        ["documents"] = "documents",
        ["feedback"] = "feedback",
        ["dashboards"] = "dashboards",
    };

    public ModuleAccessMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLower() ?? "";

        // Only check /api/v1/{resource} paths
        if (path.StartsWith("/api/v1/"))
        {
            var segment = path.Split('/').ElementAtOrDefault(3);
            if (segment is not null && RouteToModule.TryGetValue(segment, out var moduleName))
            {
                var tenant = context.RequestServices
                    .GetRequiredService<IMultiTenantContextAccessor<EthelTenantInfo>>()
                    .MultiTenantContext?.TenantInfo;

                if (tenant is not null && !tenant.EnabledModules.Contains(moduleName))
                {
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        success = false,
                        errors = new[] { $"Module '{moduleName}' is not enabled for this organization." }
                    });
                    return;
                }
            }
        }

        await _next(context);
    }
}
```

### 3.7 PlatformAdmin — Tenant CRUD

**File:** `src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.Application/Tenants/Commands/CreateTenant/CreateTenantCommand.cs`

```csharp
using MediatR;
namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.CreateTenant;

public record CreateTenantCommand(
    string Identifier,
    string Name,
    string SubscriptionTier,
    int MaxUsers,
    int MaxProjects,
    string AdminEmail,
    string AdminFirstName,
    string AdminLastName,
    List<string> EnabledModules
) : IRequest<Guid>;
```

**Handler** creates the tenant record, seeds default roles from templates, creates the admin user, and sends the invitation email. See `AUTHENTICATION.md` for the invitation flow.

Additional commands:
- `UpdateTenantCommand(Guid TenantId, string Name, string SubscriptionTier, int MaxUsers, int MaxProjects)`
- `DeactivateTenantCommand(Guid TenantId)` — sets `is_active = false`, all tenant users blocked on next login
- `ToggleModuleCommand(Guid TenantId, string ModuleName, bool IsEnabled)`

**File:** `src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.API/Controllers/TenantsController.cs`

```csharp
[ApiController]
[Route("api/v1/platform/tenants")]
[RequirePermission("platform.tenants.read")]
public class TenantsController : ControllerBase
{
    private readonly ISender _mediator;
    public TenantsController(ISender mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] ListTenantsQuery query)
        => Ok(await _mediator.Send(query));

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
        => Ok(await _mediator.Send(new GetTenantQuery(id)));

    [HttpPost]
    [RequirePermission("platform.tenants.create")]
    public async Task<IActionResult> Create([FromBody] CreateTenantCommand command)
        => CreatedAtAction(nameof(Get), new { id = await _mediator.Send(command) }, null);

    [HttpPut("{id}")]
    [RequirePermission("platform.tenants.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTenantCommand command)
    {
        await _mediator.Send(command with { TenantId = id });
        return NoContent();
    }

    [HttpPost("{id}/deactivate")]
    [RequirePermission("platform.tenants.deactivate")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        await _mediator.Send(new DeactivateTenantCommand(id));
        return NoContent();
    }

    [HttpPost("{id}/modules")]
    [RequirePermission("platform.modules.manage")]
    public async Task<IActionResult> ToggleModule(Guid id, [FromBody] ToggleModuleCommand command)
    {
        await _mediator.Send(command with { TenantId = id });
        return NoContent();
    }
}
```

### 3.8 Program.cs — Finbuckle Registration

```csharp
// Multi-Tenancy
builder.Services.AddMultiTenant<EthelTenantInfo>()
    .WithClaimStrategy("tenant_id")
    .WithEFCoreStore<PlatformDbContext, EthelTenantInfo>();

// Register tenant connection interceptor
builder.Services.AddScoped<TenantConnectionInterceptor>();

// Middleware pipeline (order matters)
app.UseAuthentication();
app.UseMultiTenant();              // Resolves tenant from JWT
app.UseMiddleware<ModuleAccessMiddleware>();  // Checks module access
app.UseAuthorization();
```

---

## 4. Frontend Implementation

### 4.1 Tenant Service

**File:** `client/libs/shared/core/src/lib/services/tenant.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../store/auth.selectors';
import { map, Observable } from 'rxjs';

export interface TenantInfo {
  id: string;
  identifier: string;
  name: string;
  subscriptionTier: string;
  enabledModules: string[];
  maxUsers: number;
  maxProjects: number;
}

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly store = inject(Store);

  readonly currentTenant$: Observable<TenantInfo | null> = this.store.select(selectCurrentUser).pipe(
    map(user => user?.tenant ?? null)
  );

  isModuleEnabled(moduleName: string): Observable<boolean> {
    return this.currentTenant$.pipe(
      map(tenant => tenant?.enabledModules.includes(moduleName) ?? false)
    );
  }
}
```

### 4.2 Tenant Interceptor

**File:** `client/libs/shared/core/src/lib/interceptors/tenant.interceptor.ts`

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../store/auth.selectors';
import { first, switchMap } from 'rxjs';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return store.select(selectCurrentUser).pipe(
    first(),
    switchMap(user => {
      if (user?.tenant?.id) {
        const cloned = req.clone({
          setHeaders: { 'X-Tenant-ID': user.tenant.id }
        });
        return next(cloned);
      }
      return next(req);
    })
  );
};
```

### 4.3 Module Guard

**File:** `client/libs/shared/core/src/lib/guards/module.guard.ts`

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TenantService } from '../services/tenant.service';
import { map, take } from 'rxjs';

export function moduleGuard(moduleName: string): CanActivateFn {
  return () => {
    const tenantService = inject(TenantService);
    const router = inject(Router);

    return tenantService.isModuleEnabled(moduleName).pipe(
      take(1),
      map(enabled => enabled || router.createUrlTree(['/module-not-available']))
    );
  };
}

// Usage in routes:
// { path: 'meal', loadChildren: () => ..., canActivate: [moduleGuard('meal')] }
```

### 4.4 Platform Console — Tenant Management Pages

Located in `client/apps/platform-console/src/app/`:

| Page | Path | Description |
|------|------|-------------|
| `tenant-list/` | `/tenants` | Paginated table with search, filter by tier/status |
| `tenant-detail/` | `/tenants/:id` | View tenant details, usage stats |
| `tenant-create/` | `/tenants/new` | Form: name, slug, tier, modules, admin email |
| `tenant-edit/` | `/tenants/:id/edit` | Edit tenant settings |
| `module-toggle/` | `/tenants/:id/modules` | Toggle module access with checkboxes |

---

## 5. RLS Implementation Step-by-Step

### Step 1: Enable pgcrypto extension (for gen_random_uuid)

```sql
-- DbUp script: 0001_extensions.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### Step 2: Create tenant context function

```sql
-- DbUp script: 0002_tenant_function.sql
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS uuid AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_org_id', true), '')::uuid;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;
```

### Step 3: Enable RLS on each table (after EF migration creates it)

```sql
-- DbUp script: 0010_rls_identity.sql
ALTER TABLE identity.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.users FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON identity.users
    USING (organization_id = current_tenant_id());
CREATE POLICY tenant_insert ON identity.users
    FOR INSERT WITH CHECK (organization_id = current_tenant_id());

-- Repeat for identity.roles, identity.user_roles, identity.attribute_rules
```

```sql
-- DbUp script: 0011_rls_projects.sql
ALTER TABLE projects.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.projects FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON projects.projects
    USING (organization_id = current_tenant_id());
CREATE POLICY tenant_insert ON projects.projects
    FOR INSERT WITH CHECK (organization_id = current_tenant_id());

-- Repeat for all tenant-scoped tables in projects schema
```

### Step 4: Verify RLS is working

```sql
-- As ethelpms_app role, set a tenant context
SET LOCAL app.current_org_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
SELECT * FROM projects.projects;  -- only rows for that tenant

-- Reset and try another
SET LOCAL app.current_org_id = '11111111-2222-3333-4444-555555555555';
SELECT * FROM projects.projects;  -- only rows for that tenant

-- Without setting tenant_id, should return empty
RESET app.current_org_id;
SELECT * FROM projects.projects;  -- empty (current_tenant_id() returns NULL, no rows match)
```

---

## 6. Tenant Provisioning Flow

```
SuperAdmin (platform-console)
    │
    ├── 1. POST /api/v1/platform/tenants
    │       Body: { identifier, name, tier, modules, adminEmail, adminFirstName, adminLastName }
    │
    ├── 2. CreateTenantCommandHandler:
    │       a. INSERT INTO platform.tenants (...)
    │       b. INSERT INTO platform.tenant_modules (...) for each enabled module
    │       c. INSERT INTO identity.organizations (id, name, ...) with id = tenant.id
    │       d. Copy role templates → INSERT INTO identity.roles (per-tenant copies)
    │       e. Copy permission assignments → INSERT INTO identity.role_permissions
    │       f. INSERT INTO identity.users (admin user, password = null, email_confirmed = false)
    │       g. INSERT INTO identity.user_roles (admin → OrgAdmin role)
    │       h. Generate password setup token
    │       i. Publish TenantProvisionedIntegrationEvent
    │
    ├── 3. Email service sends invitation to adminEmail:
    │       "Welcome to EthelPMS. Click here to set up your password."
    │       Link: https://app.ethelpms.com/auth/setup-password?token=xxx
    │
    └── 4. Admin clicks link → Setup Password page → sets password → redirected to login
            → Login → First-time setup wizard (org details, logo, timezone, calendar preference)
```

---

## 7. Feature Flags per Tenant

### How it works

1. When a tenant is provisioned, the enabled modules are recorded in `platform.tenant_modules`.
2. On login, the JWT token includes (or the user profile API returns) the list of enabled modules.
3. Backend: `ModuleAccessMiddleware` checks the module before routing.
4. Frontend: `moduleGuard` blocks navigation to disabled modules; sidebar hides disabled modules.

### Default Modules by Tier

| Tier | Modules Enabled |
|------|----------------|
| **free** | identity, orgsetup, projects, reporting, tasks, documents |
| **pro** | All of free + resultsframework, planning, dip, meal, participants, procurement, fundacct, assets, training, risk, donors, feedback, dashboards |
| **enterprise** | All modules including chat, notifications, graduation, knowledgemgmt, ai |

### Adding/Removing Modules

```
POST /api/v1/platform/tenants/{id}/modules
Body: { "moduleName": "meal", "isEnabled": true }
```

Changes take effect on next login (JWT refresh picks up new modules).

---

## 8. Performance Considerations

### Connection Pooling

Supabase uses PgBouncer in transaction mode. `SET LOCAL` is transaction-scoped and safe with pooling — the setting is automatically reset when the transaction ends.

```
NpgsqlConnection string parameters:
  Pooling=true;
  Minimum Pool Size=5;
  Maximum Pool Size=50;  // Supabase free tier: 60 connections max
```

### Indexing

Every tenant-scoped table MUST have an index on `organization_id`:

```sql
CREATE INDEX ix_{table}_org ON {schema}.{table} (organization_id);
```

For common filtered queries, add composite indexes:

```sql
CREATE INDEX ix_projects_org_status ON projects.projects (organization_id, status);
CREATE INDEX ix_users_org_active ON identity.users (organization_id) WHERE is_active = true;
```

### RLS Query Plan Impact

With the `organization_id` index, RLS adds a simple index scan filter. Run `EXPLAIN ANALYZE` to verify:

```sql
SET LOCAL app.current_org_id = '...';
EXPLAIN ANALYZE SELECT * FROM projects.projects WHERE status = 'active';
-- Should show: Index Scan using ix_projects_org_status
```

### Monitoring

Track per-tenant query counts and latency. If one tenant's queries dominate, consider connection limits per tenant at the application level.

---

## 9. Testing

### Integration Tests

1. **Isolation test:** Create 2 tenants, insert data for each, verify tenant A cannot see tenant B's data through EF Core queries.
2. **RLS test:** Directly query PostgreSQL as `ethelpms_app` role with wrong `app.current_org_id`, verify zero rows.
3. **Provisioning test:** Call `CreateTenantCommand`, verify all seed data (roles, permissions) exists.
4. **Module access test:** Disable a module for tenant, hit that module's endpoint, expect 403.
5. **Deactivation test:** Deactivate tenant, verify login returns 403.

### Frontend Tests

1. `TenantInterceptor` attaches `X-Tenant-ID` header.
2. `ModuleGuard` blocks navigation when module disabled.
3. Sidebar hides disabled module links.

---

## 10. File Index

### Backend (Developer A)

| File | Action |
|------|--------|
| `src/Shared/NGO.PMS.SharedKernel/Domain/IMultiTenant.cs` | Already exists — verify |
| `src/Shared/NGO.PMS.SharedKernel/MultiTenancy/EthelTenantInfo.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/MultiTenancy/TenantClaimStrategy.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Persistence/MultiTenantDbContext.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Persistence/TenantConnectionInterceptor.cs` | Create |
| `src/Host/NGO.PMS.API/Middleware/TenantContextMiddleware.cs` | Create |
| `src/Host/NGO.PMS.API/Middleware/ModuleAccessMiddleware.cs` | Create |
| `src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.Domain/Entities/Tenant.cs` | Create |
| `src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.Domain/Entities/TenantModule.cs` | Create |
| `src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.Application/Tenants/Commands/*` | Create |
| `src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.Application/Tenants/Queries/*` | Create |
| `src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.API/Controllers/TenantsController.cs` | Create |
| `src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.Infrastructure/Persistence/PlatformDbContext.cs` | Create |
| `src/Host/NGO.PMS.API/Program.cs` | Modify — Finbuckle + middleware |
| DbUp: `0001_extensions.sql` | Create |
| DbUp: `0002_tenant_function.sql` | Create |
| DbUp: `0010_rls_identity.sql` | Create |
| DbUp: `0011_rls_projects.sql` | Create |
| DbUp: `0012_rls_planning.sql` through `0020_rls_content.sql` | Create |

### Frontend (Developer B)

| File | Action |
|------|--------|
| `client/libs/shared/core/src/lib/services/tenant.service.ts` | Create |
| `client/libs/shared/core/src/lib/interceptors/tenant.interceptor.ts` | Create |
| `client/libs/shared/core/src/lib/guards/module.guard.ts` | Create |
| `client/apps/platform-console/src/app/tenant-list/` | Create |
| `client/apps/platform-console/src/app/tenant-detail/` | Create |
| `client/apps/platform-console/src/app/tenant-create/` | Create |
| `client/apps/platform-console/src/app/tenant-edit/` | Create |
| `client/apps/platform-console/src/app/module-toggle/` | Create |

---

## Dependencies

| This plan depends on | For |
|---------------------|-----|
| `shared/AUTHENTICATION.md` | JWT with tenant_id claim, invitation flow |
| `shared/AUTHORIZATION-RBAC.md` | Permission seeding, role templates |
| `shared/DATABASE-ARCHITECTURE.md` | Schema layout, migration strategy, DbUp |
| `00-CODING-STANDARDS.md` | Naming conventions |
