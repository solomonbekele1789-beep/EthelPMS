# EthelPMS — Authorization & RBAC Plan

**Version:** 1.0
**Date:** October 16, 2026
**Owner:** Both developers (shared infrastructure)

> Hybrid RBAC + ABAC authorization. Every controller action must have an explicit permission check.
> Read `AUTHENTICATION.md` first — this plan assumes JWT tokens carry a `permissions` claim.

---

## 1. Authorization Model

**RBAC** — Role-Based Access Control:
- Roles contain permissions. Users are assigned one or more roles.
- Permission format: `{module}.{resource}.{action}` (e.g., `projects.projects.approve`)
- 7 pre-built role templates seeded per tenant on provisioning.

**ABAC** — Attribute-Based Access Control (layered on top of RBAC):
- Attribute rules constrain WHERE a permission applies (office scope, budget ceiling).
- Evaluated after RBAC passes — RBAC says "can approve", ABAC says "only in Addis office, under $50K".

```
Request → Authenticate (JWT) → RBAC check (permission in claims?) → ABAC check (attribute rules pass?) → Allow
```

---

## 2. Database Schema

All tables in the `identity` schema.

### 2.1 `identity.permissions`

```sql
CREATE TABLE identity.permissions (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code            varchar(100) NOT NULL UNIQUE,  -- 'projects.projects.create'
    display_name    varchar(200) NOT NULL,          -- 'Create Project'
    module          varchar(50)  NOT NULL,          -- 'projects'
    resource        varchar(50)  NOT NULL,          -- 'projects'
    action          varchar(50)  NOT NULL,          -- 'create'
    description     text,
    created_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX ix_permissions_module ON identity.permissions (module);
CREATE UNIQUE INDEX uq_permissions_code ON identity.permissions (code);
```

### 2.2 `identity.roles`

```sql
CREATE TABLE identity.roles (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            varchar(100) NOT NULL,
    description     text,
    is_system_role  boolean      NOT NULL DEFAULT false,
    organization_id uuid         NOT NULL REFERENCES identity.organizations(id),
    created_at      timestamptz  NOT NULL DEFAULT now(),
    updated_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_roles_name_org ON identity.roles (name, organization_id);
CREATE INDEX ix_roles_organization ON identity.roles (organization_id);
```

### 2.3 `identity.role_permissions`

```sql
CREATE TABLE identity.role_permissions (
    role_id       uuid NOT NULL REFERENCES identity.roles(id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES identity.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX ix_role_permissions_permission ON identity.role_permissions (permission_id);
```

### 2.4 `identity.user_roles`

```sql
CREATE TABLE identity.user_roles (
    user_id     uuid        NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    role_id     uuid        NOT NULL REFERENCES identity.roles(id) ON DELETE CASCADE,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    assigned_by uuid        REFERENCES identity.users(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX ix_user_roles_role ON identity.user_roles (role_id);
```

### 2.5 `identity.attribute_rules`

```sql
CREATE TABLE identity.attribute_rules (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_id   uuid        NOT NULL REFERENCES identity.permissions(id) ON DELETE CASCADE,
    attribute_name  varchar(100) NOT NULL,  -- 'office_id', 'max_budget_amount'
    operator        varchar(20)  NOT NULL,  -- 'equals', 'in', 'less_than', 'greater_than'
    attribute_value text         NOT NULL,  -- JSON value or scalar
    description     text,
    organization_id uuid         NOT NULL,
    created_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX ix_attribute_rules_perm ON identity.attribute_rules (permission_id);
CREATE INDEX ix_attribute_rules_org ON identity.attribute_rules (organization_id);
```

---

## 3. Backend Implementation

### 3.1 SharedKernel — Authorization Interfaces

**File:** `src/Shared/NGO.PMS.SharedKernel/Authorization/IPermissionService.cs`

```csharp
namespace NGO.PMS.SharedKernel.Authorization;

public interface IPermissionService
{
    Task<bool> HasPermissionAsync(Guid userId, string permissionCode, CancellationToken ct = default);
    Task<IReadOnlyList<string>> GetUserPermissionsAsync(Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<string>> GetUserRolesAsync(Guid userId, CancellationToken ct = default);
    Task<bool> EvaluateAttributeRulesAsync(Guid userId, string permissionCode,
        Dictionary<string, object> context, CancellationToken ct = default);
}
```

**File:** `src/Shared/NGO.PMS.SharedKernel/Authorization/PermissionRequirement.cs`

```csharp
using Microsoft.AspNetCore.Authorization;

namespace NGO.PMS.SharedKernel.Authorization;

public class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }
    public PermissionRequirement(string permission) => Permission = permission;
}
```

**File:** `src/Shared/NGO.PMS.SharedKernel/Authorization/PermissionAuthorizationHandler.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace NGO.PMS.SharedKernel.Authorization;

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IPermissionService _permissionService;

    public PermissionAuthorizationHandler(IPermissionService permissionService)
        => _permissionService = permissionService;

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var userId = context.User.FindFirstValue("sub");
        if (userId is null) return;

        // 1. Check JWT claims first (fast path)
        var permissionClaims = context.User.FindAll("permissions").Select(c => c.Value).ToList();
        if (permissionClaims.Count > 0)
        {
            if (permissionClaims.Contains(requirement.Permission))
            {
                context.Succeed(requirement);
                return;
            }
        }

        // 2. Fallback to DB check (for permission changes mid-session)
        if (await _permissionService.HasPermissionAsync(Guid.Parse(userId), requirement.Permission))
        {
            context.Succeed(requirement);
        }
    }
}
```

**File:** `src/Shared/NGO.PMS.SharedKernel/Authorization/RequirePermissionAttribute.cs`

```csharp
using Microsoft.AspNetCore.Authorization;

namespace NGO.PMS.SharedKernel.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class RequirePermissionAttribute : AuthorizeAttribute
{
    public RequirePermissionAttribute(string permission)
        : base(policy: permission) { }
}
```

**File:** `src/Shared/NGO.PMS.SharedKernel/Authorization/PermissionPolicyProvider.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace NGO.PMS.SharedKernel.Authorization;

public class PermissionPolicyProvider : IAuthorizationPolicyProvider
{
    private readonly DefaultAuthorizationPolicyProvider _fallback;

    public PermissionPolicyProvider(IOptions<AuthorizationOptions> options)
        => _fallback = new DefaultAuthorizationPolicyProvider(options);

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        // Every permission string becomes a policy on-the-fly
        if (policyName.Contains('.'))
        {
            var policy = new AuthorizationPolicyBuilder()
                .AddRequirements(new PermissionRequirement(policyName))
                .Build();
            return Task.FromResult<AuthorizationPolicy?>(policy);
        }
        return _fallback.GetPolicyAsync(policyName);
    }

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync() => _fallback.GetDefaultPolicyAsync();
    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() => _fallback.GetFallbackPolicyAsync();
}
```

### 3.2 Identity Module — Role Commands

**File:** `src/Modules/Identity/NGO.PMS.Identity.Application/Roles/Commands/CreateRole/CreateRoleCommand.cs`

```csharp
using MediatR;
namespace NGO.PMS.Identity.Application.Roles.Commands.CreateRole;

public record CreateRoleCommand(
    string Name,
    string? Description,
    List<Guid> PermissionIds
) : IRequest<Guid>;
```

**File:** `src/Modules/Identity/NGO.PMS.Identity.Application/Roles/Commands/CreateRole/CreateRoleCommandHandler.cs`

```csharp
public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, Guid>
{
    private readonly IdentityDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateRoleCommandHandler(IdentityDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateRoleCommand request, CancellationToken ct)
    {
        var role = new Role
        {
            Name = request.Name,
            Description = request.Description,
            OrganizationId = _currentUser.OrganizationId
        };

        foreach (var permId in request.PermissionIds)
        {
            role.RolePermissions.Add(new RolePermission { PermissionId = permId });
        }

        _db.Roles.Add(role);
        await _db.SaveChangesAsync(ct);
        return role.Id;
    }
}
```

**File:** `src/Modules/Identity/NGO.PMS.Identity.Application/Roles/Commands/CreateRole/CreateRoleCommandValidator.cs`

```csharp
using FluentValidation;
namespace NGO.PMS.Identity.Application.Roles.Commands.CreateRole;

public class CreateRoleCommandValidator : AbstractValidator<CreateRoleCommand>
{
    public CreateRoleCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PermissionIds).NotEmpty()
            .WithMessage("A role must have at least one permission.");
    }
}
```

Additional commands follow same pattern:
- `UpdateRoleCommand(Guid RoleId, string Name, string? Description, List<Guid> PermissionIds)`
- `DeleteRoleCommand(Guid RoleId)` — soft-delete, prevents deleting system roles
- `AssignRoleToUserCommand(Guid UserId, Guid RoleId)`
- `RemoveRoleFromUserCommand(Guid UserId, Guid RoleId)`

### 3.3 Identity Module — Role Queries

**File:** `src/Modules/Identity/NGO.PMS.Identity.Application/Roles/Queries/ListRoles/ListRolesQuery.cs`

```csharp
public record ListRolesQuery(int Page = 1, int PageSize = 20) : IRequest<PagedResponse<RoleDto>>;
```

**File:** `src/Modules/Identity/NGO.PMS.Identity.Application/Roles/Queries/GetUserPermissions/GetUserPermissionsQuery.cs`

```csharp
public record GetUserPermissionsQuery(Guid UserId) : IRequest<List<string>>;
```

### 3.4 Permission Service Implementation

**File:** `src/Modules/Identity/NGO.PMS.Identity.Infrastructure/Services/PermissionService.cs`

```csharp
using Dapper;
using Npgsql;
using NGO.PMS.SharedKernel.Authorization;

namespace NGO.PMS.Identity.Infrastructure.Services;

public class PermissionService : IPermissionService
{
    private readonly string _connectionString;

    public PermissionService(IConfiguration config)
        => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<IReadOnlyList<string>> GetUserPermissionsAsync(Guid userId, CancellationToken ct)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        var sql = """
            SELECT DISTINCT p.code
            FROM identity.user_roles ur
            JOIN identity.role_permissions rp ON rp.role_id = ur.role_id
            JOIN identity.permissions p ON p.id = rp.permission_id
            WHERE ur.user_id = @UserId
            """;
        var result = await conn.QueryAsync<string>(sql, new { UserId = userId });
        return result.ToList().AsReadOnly();
    }

    public async Task<bool> HasPermissionAsync(Guid userId, string permissionCode, CancellationToken ct)
    {
        var permissions = await GetUserPermissionsAsync(userId, ct);
        return permissions.Contains(permissionCode);
    }

    public async Task<bool> EvaluateAttributeRulesAsync(
        Guid userId, string permissionCode,
        Dictionary<string, object> context, CancellationToken ct)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        var sql = """
            SELECT ar.attribute_name, ar.operator, ar.attribute_value
            FROM identity.attribute_rules ar
            JOIN identity.permissions p ON p.id = ar.permission_id
            WHERE p.code = @Code AND ar.organization_id = (
                SELECT organization_id FROM identity.users WHERE id = @UserId
            )
            """;
        var rules = await conn.QueryAsync<AttributeRuleRow>(sql, new { Code = permissionCode, UserId = userId });

        foreach (var rule in rules)
        {
            if (!EvaluateRule(rule, context)) return false;
        }
        return true;
    }

    private static bool EvaluateRule(AttributeRuleRow rule, Dictionary<string, object> context)
    {
        if (!context.TryGetValue(rule.AttributeName, out var value)) return false;
        return rule.Operator switch
        {
            "equals"       => value.ToString() == rule.AttributeValue,
            "not_equals"   => value.ToString() != rule.AttributeValue,
            "in"           => rule.AttributeValue.Split(',').Contains(value.ToString()),
            "less_than"    => Convert.ToDecimal(value) < Convert.ToDecimal(rule.AttributeValue),
            "greater_than" => Convert.ToDecimal(value) > Convert.ToDecimal(rule.AttributeValue),
            _ => false
        };
    }

    private record AttributeRuleRow(string AttributeName, string Operator, string AttributeValue);
}
```

### 3.5 Controller Usage Example

```csharp
[ApiController]
[Route("api/v1/projects")]
[Authorize]
public class ProjectsController : ControllerBase
{
    [HttpPost]
    [RequirePermission("projects.projects.create")]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest request) { ... }

    [HttpPost("{id}/approve")]
    [RequirePermission("projects.projects.approve")]
    public async Task<IActionResult> Approve(Guid id) { ... }

    [HttpGet]
    [RequirePermission("projects.projects.read")]
    public async Task<IActionResult> List([FromQuery] ListProjectsQuery query) { ... }
}
```

### 3.6 Program.cs Registration

```csharp
// Authorization
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
builder.Services.AddScoped<IPermissionService, PermissionService>();

builder.Services.AddAuthorization();
```

---

## 4. Frontend Implementation

### 4.1 Permission Service

**File:** `client/libs/shared/core/src/lib/services/permission.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectPermissions, selectRoles } from '../store/auth.selectors';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly store = inject(Store);

  hasPermission(permission: string): Observable<boolean> {
    return this.store.select(selectPermissions).pipe(
      map(perms => perms.includes(permission))
    );
  }

  hasRole(role: string): Observable<boolean> {
    return this.store.select(selectRoles).pipe(
      map(roles => roles.includes(role))
    );
  }

  hasAnyPermission(permissions: string[]): Observable<boolean> {
    return this.store.select(selectPermissions).pipe(
      map(perms => permissions.some(p => perms.includes(p)))
    );
  }
}
```

### 4.2 Permission Guard

**File:** `client/libs/shared/core/src/lib/guards/permission.guard.ts`

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectPermissions } from '../store/auth.selectors';
import { map, take } from 'rxjs';

export function permissionGuard(requiredPermission: string): CanActivateFn {
  return () => {
    const store = inject(Store);
    const router = inject(Router);

    return store.select(selectPermissions).pipe(
      take(1),
      map(permissions => {
        if (permissions.includes(requiredPermission)) return true;
        return router.createUrlTree(['/unauthorized']);
      })
    );
  };
}

// Usage in routes:
// { path: 'projects/create', component: ProjectCreateComponent,
//   canActivate: [permissionGuard('projects.projects.create')] }
```

### 4.3 Has Permission Directive

**File:** `client/libs/shared/core/src/lib/directives/has-permission.directive.ts`

```typescript
import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit, OnDestroy } from '@angular/core';
import { PermissionService } from '../services/permission.service';
import { Subscription } from 'rxjs';

@Directive({ selector: '[appHasPermission]', standalone: true })
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input('appHasPermission') permission = '';

  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionService = inject(PermissionService);
  private sub?: Subscription;
  private isVisible = false;

  ngOnInit(): void {
    this.sub = this.permissionService.hasPermission(this.permission).subscribe(has => {
      if (has && !this.isVisible) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isVisible = true;
      } else if (!has && this.isVisible) {
        this.viewContainer.clear();
        this.isVisible = false;
      }
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}

// Usage: <button *appHasPermission="'projects.projects.create'">New Project</button>
```

### 4.4 Has Role Directive

**File:** `client/libs/shared/core/src/lib/directives/has-role.directive.ts`

```typescript
import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit, OnDestroy } from '@angular/core';
import { PermissionService } from '../services/permission.service';
import { Subscription } from 'rxjs';

@Directive({ selector: '[appHasRole]', standalone: true })
export class HasRoleDirective implements OnInit, OnDestroy {
  @Input('appHasRole') role = '';

  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionService = inject(PermissionService);
  private sub?: Subscription;
  private isVisible = false;

  ngOnInit(): void {
    this.sub = this.permissionService.hasRole(this.role).subscribe(has => {
      if (has && !this.isVisible) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isVisible = true;
      } else if (!has && this.isVisible) {
        this.viewContainer.clear();
        this.isVisible = false;
      }
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}

// Usage: <div *appHasRole="'OrgAdmin'">Admin Section</div>
```

### 4.5 NgRx Auth State (permissions portion)

```typescript
// In auth.reducer.ts — AuthState already includes:
export interface AuthState {
  user: UserProfile | null;
  permissions: string[];   // flat array of permission codes
  roles: string[];          // role names
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// In auth.selectors.ts:
export const selectPermissions = createSelector(selectAuthState, s => s.permissions);
export const selectRoles = createSelector(selectAuthState, s => s.roles);
export const selectHasPermission = (permission: string) =>
  createSelector(selectPermissions, perms => perms.includes(permission));
```

---

## 5. Permission Seed Data (~200 permissions)

### Identity Module

| Code | Display Name |
|------|-------------|
| `identity.users.create` | Create User |
| `identity.users.read` | View Users |
| `identity.users.update` | Edit User |
| `identity.users.delete` | Delete User |
| `identity.users.manage` | Manage Users (activate/deactivate) |
| `identity.roles.create` | Create Role |
| `identity.roles.read` | View Roles |
| `identity.roles.update` | Edit Role |
| `identity.roles.delete` | Delete Role |
| `identity.offices.create` | Create Office |
| `identity.offices.read` | View Offices |
| `identity.offices.update` | Edit Office |
| `identity.offices.delete` | Delete Office |
| `identity.locations.create` | Create Location |
| `identity.locations.read` | View Locations |
| `identity.locations.update` | Edit Location |
| `identity.locations.delete` | Delete Location |

### Platform Admin Module (SuperAdmin only)

| Code | Display Name |
|------|-------------|
| `platform.tenants.create` | Create Tenant |
| `platform.tenants.read` | View Tenants |
| `platform.tenants.update` | Edit Tenant |
| `platform.tenants.deactivate` | Deactivate Tenant |
| `platform.modules.manage` | Toggle Tenant Modules |
| `platform.subscriptions.manage` | Manage Subscriptions |
| `platform.analytics.read` | View Platform Analytics |

### Organization Setup Module

| Code | Display Name |
|------|-------------|
| `orgsetup.organization.read` | View Organization |
| `orgsetup.organization.update` | Edit Organization |
| `orgsetup.settings.read` | View Settings |
| `orgsetup.settings.update` | Edit Settings |
| `orgsetup.themes.update` | Customize Theme |

### Projects Module

| Code | Display Name |
|------|-------------|
| `projects.projects.create` | Create Project |
| `projects.projects.read` | View Projects |
| `projects.projects.update` | Edit Project |
| `projects.projects.delete` | Delete Project |
| `projects.projects.approve` | Approve Project |
| `projects.projects.close` | Close Project |
| `projects.milestones.create` | Create Milestone |
| `projects.milestones.read` | View Milestones |
| `projects.milestones.update` | Edit Milestone |

### Results Framework Module

| Code | Display Name |
|------|-------------|
| `results.outcomes.create` | Create Outcome |
| `results.outcomes.read` | View Outcomes |
| `results.outcomes.update` | Edit Outcome |
| `results.outputs.create` | Create Output |
| `results.outputs.read` | View Outputs |
| `results.outputs.update` | Edit Output |
| `results.indicators.create` | Create Indicator |
| `results.indicators.read` | View Indicators |
| `results.indicators.update` | Edit Indicator |
| `results.indicators.delete` | Delete Indicator |

### Intervention Areas Module

| Code | Display Name |
|------|-------------|
| `interventions.areas.create` | Create Intervention Area |
| `interventions.areas.read` | View Intervention Areas |
| `interventions.areas.update` | Edit Intervention Area |
| `interventions.sectors.manage` | Manage Sectors |

### Planning Module

| Code | Display Name |
|------|-------------|
| `planning.annual.create` | Create Annual Plan |
| `planning.annual.read` | View Annual Plans |
| `planning.annual.update` | Edit Annual Plan |
| `planning.annual.approve` | Approve Annual Plan |
| `planning.quarterly.create` | Create Quarterly Plan |
| `planning.quarterly.read` | View Quarterly Plans |
| `planning.quarterly.update` | Edit Quarterly Plan |
| `planning.quarterly.approve` | Approve Quarterly Plan |

### DIP Module

| Code | Display Name |
|------|-------------|
| `dip.entries.create` | Create DIP Entry |
| `dip.entries.read` | View DIP Entries |
| `dip.entries.update` | Edit DIP Entry |
| `dip.entries.approve` | Approve DIP Entry |

### Reporting Module

| Code | Display Name |
|------|-------------|
| `reporting.reports.create` | Create Report |
| `reporting.reports.read` | View Reports |
| `reporting.reports.update` | Edit Report |
| `reporting.reports.submit` | Submit Report |
| `reporting.reports.approve` | Approve Report |
| `reporting.reports.reject` | Reject Report |
| `reporting.reports.export` | Export Report |

### MEAL Module

| Code | Display Name |
|------|-------------|
| `meal.plans.create` | Create MEAL Plan |
| `meal.plans.read` | View MEAL Plans |
| `meal.plans.update` | Edit MEAL Plan |
| `meal.evaluations.create` | Create Evaluation |
| `meal.evaluations.read` | View Evaluations |
| `meal.evaluations.update` | Edit Evaluation |
| `meal.indicators.track` | Track Indicators |
| `meal.gesi.manage` | Manage GESI Data |

### Participants Module

| Code | Display Name |
|------|-------------|
| `participants.profiles.create` | Register Participant |
| `participants.profiles.read` | View Participants |
| `participants.profiles.update` | Edit Participant |
| `participants.profiles.delete` | Delete Participant |
| `participants.enrollment.manage` | Manage Enrollment |
| `participants.attendance.record` | Record Attendance |

### Graduation Module

| Code | Display Name |
|------|-------------|
| `graduation.criteria.create` | Create Graduation Criteria |
| `graduation.criteria.read` | View Criteria |
| `graduation.criteria.update` | Edit Criteria |
| `graduation.tracking.manage` | Manage Graduation Tracking |
| `graduation.tracking.approve` | Approve Graduation |

### Procurement Module

| Code | Display Name |
|------|-------------|
| `procurement.requests.create` | Create Purchase Request |
| `procurement.requests.read` | View Purchase Requests |
| `procurement.requests.approve` | Approve Purchase Request |
| `procurement.bids.create` | Create Bid |
| `procurement.bids.evaluate` | Evaluate Bids |
| `procurement.contracts.create` | Create Contract |
| `procurement.contracts.read` | View Contracts |
| `procurement.pos.create` | Create Purchase Order |
| `procurement.pos.approve` | Approve Purchase Order |

### Fund Accounting Module

| Code | Display Name |
|------|-------------|
| `fundacct.journals.create` | Create Journal Entry |
| `fundacct.journals.read` | View Journal Entries |
| `fundacct.journals.approve` | Approve Journal Entry |
| `fundacct.budgets.create` | Create Budget |
| `fundacct.budgets.read` | View Budgets |
| `fundacct.budgets.update` | Edit Budget |
| `fundacct.budgets.approve` | Approve Budget |
| `fundacct.accounts.manage` | Manage Chart of Accounts |
| `fundacct.reports.read` | View Financial Reports |

### Assets Module

| Code | Display Name |
|------|-------------|
| `assets.register.create` | Register Asset |
| `assets.register.read` | View Assets |
| `assets.register.update` | Edit Asset |
| `assets.register.dispose` | Dispose Asset |
| `assets.maintenance.manage` | Manage Maintenance |

### Training Module

| Code | Display Name |
|------|-------------|
| `training.programs.create` | Create Training Program |
| `training.programs.read` | View Training Programs |
| `training.programs.update` | Edit Training Program |
| `training.sessions.manage` | Manage Sessions |
| `training.attendance.record` | Record Training Attendance |

### Tasks Module

| Code | Display Name |
|------|-------------|
| `tasks.tasks.create` | Create Task |
| `tasks.tasks.read` | View Tasks |
| `tasks.tasks.update` | Edit Task |
| `tasks.tasks.assign` | Assign Task |
| `tasks.tasks.close` | Close Task |

### Risk Module

| Code | Display Name |
|------|-------------|
| `risk.risks.create` | Create Risk |
| `risk.risks.read` | View Risks |
| `risk.risks.update` | Edit Risk |
| `risk.mitigations.manage` | Manage Mitigations |

### Donors Module

| Code | Display Name |
|------|-------------|
| `donors.donors.create` | Create Donor |
| `donors.donors.read` | View Donors |
| `donors.donors.update` | Edit Donor |
| `donors.grants.create` | Create Grant |
| `donors.grants.read` | View Grants |
| `donors.grants.update` | Edit Grant |
| `donors.disbursements.record` | Record Disbursement |

### Communication Modules

| Code | Display Name |
|------|-------------|
| `chat.messages.send` | Send Messages |
| `chat.channels.create` | Create Channel |
| `chat.channels.manage` | Manage Channels |
| `notifications.manage` | Manage Notifications |
| `documents.upload` | Upload Documents |
| `documents.read` | View Documents |
| `documents.delete` | Delete Documents |
| `feedback.submit` | Submit Feedback |
| `feedback.read` | View Feedback |
| `feedback.manage` | Manage Feedback/GRM |

### Analytics & System

| Code | Display Name |
|------|-------------|
| `dashboards.read` | View Dashboards |
| `dashboards.create` | Create Custom Dashboard |
| `km.articles.create` | Create Knowledge Article |
| `km.articles.read` | View Knowledge Base |
| `km.articles.update` | Edit Knowledge Article |
| `settings.system.manage` | Manage System Settings |
| `settings.audit.read` | View Audit Logs |

**Total: ~195 permissions**

---

## 6. Role Templates

### SuperAdmin (platform-level)

All permissions. Operates across tenants.

### OrgAdmin (tenant-level)

All permissions within the tenant except `platform.*`.

### ProjectManager

| Modules | Permissions |
|---------|------------|
| Projects | create, read, update, close |
| Results Framework | all |
| Intervention Areas | all |
| Planning | create, read, update |
| DIP | create, read, update |
| Reporting | create, read, update, submit |
| MEAL | read |
| Participants | read |
| Tasks | all |
| Risk | all |
| Documents | upload, read |
| Dashboards | read |
| Chat | send, channels.create |

### MEALOfficer

| Modules | Permissions |
|---------|------------|
| MEAL | all |
| Results Framework | all |
| Participants | all |
| Graduation | all |
| Projects | read |
| Reporting | create, read, update, submit |
| Dashboards | read |
| Documents | upload, read |

### FinanceOfficer

| Modules | Permissions |
|---------|------------|
| Fund Accounting | all |
| Procurement | requests.read, contracts.read, pos.approve |
| Assets | all |
| Budgets | all |
| Projects | read |
| Donors | read, disbursements.record |
| Dashboards | read |
| Reports | read, export |

### FieldOfficer

| Modules | Permissions |
|---------|------------|
| Projects | read |
| Participants | create, read, update, attendance.record |
| Training | sessions.manage, attendance.record |
| Tasks | read, update |
| DIP | read |
| Reporting | create, read |
| Feedback | submit |
| Documents | upload, read |

### Viewer

All `*.read` permissions across all modules. No create, update, delete, approve.

---

## 7. ABAC Rules Engine

### How It Works

After RBAC grants access, the `PermissionAuthorizationHandler` checks if there are `attribute_rules` for that permission + user's organization. If rules exist, ALL must pass (AND logic).

### Example: Office Scoping

```sql
-- "ProjectManager can only edit projects in their assigned office"
INSERT INTO identity.attribute_rules (permission_id, attribute_name, operator, attribute_value, organization_id)
VALUES (
    (SELECT id FROM identity.permissions WHERE code = 'projects.projects.update'),
    'office_id',
    'equals',
    '{{user.office_id}}',  -- resolved at evaluation time
    '{{org_id}}'
);
```

In the handler, before allowing project update:
```csharp
var context = new Dictionary<string, object>
{
    ["office_id"] = project.OfficeId.ToString()
};
var allowed = await _permissionService.EvaluateAttributeRulesAsync(
    userId, "projects.projects.update", context);
```

### Example: Budget Ceiling

```sql
-- "FinanceOfficer can only approve journal entries under 500,000 ETB"
INSERT INTO identity.attribute_rules (permission_id, attribute_name, operator, attribute_value, organization_id)
VALUES (
    (SELECT id FROM identity.permissions WHERE code = 'fundacct.journals.approve'),
    'amount',
    'less_than',
    '500000',
    '{{org_id}}'
);
```

---

## 8. SuperAdmin vs Tenant Context

| Aspect | SuperAdmin | Tenant User |
|--------|-----------|------------|
| App | `platform-console` | `web` |
| JWT claim | `tenant_id` = platform tenant | `tenant_id` = their org |
| Permissions | `platform.*` + all | Tenant-scoped only |
| Data access | Cross-tenant via platform schema | Own org only (RLS enforced) |
| Role source | Seeded at platform level | Per-tenant role assignments |

SuperAdmin requests bypass tenant RLS by using a separate connection that doesn't set `app.current_org_id`, or by setting it to a wildcard recognized by RLS policies.

---

## 9. Testing Requirements

### Backend Unit Tests

- `PermissionAuthorizationHandler_ShouldSucceed_WhenPermissionInClaims`
- `PermissionAuthorizationHandler_ShouldFallbackToDb_WhenNotInClaims`
- `PermissionAuthorizationHandler_ShouldFail_WhenNoPermission`
- `PermissionService_ShouldReturnPermissions_ForUserWithRoles`
- `PermissionService_ShouldReturnEmpty_ForUserWithNoRoles`
- `AttributeRule_ShouldPass_WhenOfficeMatches`
- `AttributeRule_ShouldFail_WhenBudgetExceedsLimit`
- `CreateRoleCommandHandler_ShouldCreateRole_WhenValid`
- `CreateRoleCommandValidator_ShouldFail_WhenNameEmpty`

### Frontend Tests

- `HasPermissionDirective_ShouldRender_WhenPermissionGranted`
- `HasPermissionDirective_ShouldHide_WhenPermissionDenied`
- `PermissionGuard_ShouldRedirect_WhenUnauthorized`
- `PermissionService_ShouldReturnTrue_WhenPermissionExists`

---

## 10. File Index

### Backend (Developer A)

| File | Action |
|------|--------|
| `src/Shared/NGO.PMS.SharedKernel/Authorization/IPermissionService.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Authorization/PermissionRequirement.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Authorization/PermissionAuthorizationHandler.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Authorization/RequirePermissionAttribute.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Authorization/PermissionPolicyProvider.cs` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Domain/Entities/Role.cs` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Domain/Entities/Permission.cs` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Domain/Entities/RolePermission.cs` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Domain/Entities/UserRole.cs` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Domain/Entities/AttributeRule.cs` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Roles/Commands/CreateRole/*` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Roles/Commands/UpdateRole/*` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Roles/Commands/DeleteRole/*` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Roles/Commands/AssignRoleToUser/*` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Roles/Commands/RemoveRoleFromUser/*` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Roles/Queries/GetRole/*` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Roles/Queries/ListRoles/*` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Roles/Queries/GetUserPermissions/*` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Application/Roles/Queries/ListPermissions/*` | Create |
| `src/Modules/Identity/NGO.PMS.Identity.Infrastructure/Services/PermissionService.cs` | Create |
| `src/Host/NGO.PMS.API/Program.cs` | Modify — add authorization registration |
| DbUp seed script: `0005_seed_permissions.sql` | Create |
| DbUp seed script: `0006_seed_role_templates.sql` | Create |

### Frontend (Developer B)

| File | Action |
|------|--------|
| `client/libs/shared/core/src/lib/services/permission.service.ts` | Create |
| `client/libs/shared/core/src/lib/guards/permission.guard.ts` | Create |
| `client/libs/shared/core/src/lib/directives/has-permission.directive.ts` | Create |
| `client/libs/shared/core/src/lib/directives/has-role.directive.ts` | Create |
| `client/libs/modules/identity/src/lib/pages/role-management/` | Create |
| `client/libs/modules/identity/src/lib/pages/user-roles/` | Create |

---

## Dependencies

| This plan depends on | For |
|---------------------|-----|
| `shared/AUTHENTICATION.md` | JWT token structure, user entity, login flow |
| `shared/MULTI-TENANCY.md` | organization_id context, tenant scoping |
| `shared/DATABASE-ARCHITECTURE.md` | identity schema, migration strategy |
| `00-CODING-STANDARDS.md` | Naming conventions, vertical slice pattern |
