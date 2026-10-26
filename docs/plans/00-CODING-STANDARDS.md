# EthelPMS — Coding Standards & Architecture Rules

**Version:** 1.0
**Date:** October 15, 2026

> Every developer on EthelPMS must read this document before writing code.
> These rules are enforced by CI (ArchUnitNET, ESLint, Prettier) and code review.

---

## 1. Solution Structure

```
ethel-pms/                              ← Repository root (cloned from Git)
├── EthelPMS.sln
├── global.json
├── Directory.Build.props
├── .gitignore
├── CLAUDE.md
├── docker-compose.yml
│
├── src/
│   ├── Shared/
│   │   ├── NGO.PMS.SharedKernel/          ← Base entities, value objects, interfaces
│   │   └── NGO.PMS.Contracts/             ← Integration events, public query interfaces
│   │
│   ├── Modules/
│   │   ├── Identity/
│   │   │   ├── NGO.PMS.Identity.Domain/        ← Entities, value objects, domain events
│   │   │   ├── NGO.PMS.Identity.Application/   ← Commands, queries, handlers, DTOs, validators
│   │   │   ├── NGO.PMS.Identity.Infrastructure/ ← DbContext, repos, external service adapters
│   │   │   └── NGO.PMS.Identity.API/           ← Controllers, DI registration, module startup
│   │   ├── Projects/
│   │   │   └── (same 4-layer pattern)
│   │   └── ... (18 modules total)
│   │
│   └── Host/
│       └── NGO.PMS.API/                    ← Composition root, Program.cs, middleware
│
├── tests/
│   ├── NGO.PMS.Identity.Tests/
│   ├── NGO.PMS.Projects.Tests/
│   ├── NGO.PMS.API.Tests/                  ← Integration tests
│   └── NGO.PMS.Architecture.Tests/         ← ArchUnitNET fitness tests
│
├── client/                                  ← Angular Nx monorepo
│   ├── apps/
│   │   ├── web/                            ← Tenant-facing app
│   │   └── platform-console/               ← SuperAdmin app
│   └── libs/
│       ├── shared/
│       │   ├── ui/                         ← Shared components
│       │   └── core/                       ← Services, guards, interceptors, models
│       └── modules/
│           ├── identity/                   ← Identity feature library
│           ├── projects/                   ← Projects feature library
│           └── ... (1:1 with backend modules)
│
└── docs/
    └── plans/                              ← Implementation plans (this folder)
```

---

## 2. Dependency Rules

### Backend Project References (MANDATORY)

```
Module.Domain         → SharedKernel ONLY
Module.Application    → Module.Domain + Contracts
Module.Infrastructure → Module.Application
Module.API            → Module.Application + Module.Infrastructure
Host (NGO.PMS.API)    → All Module.API + SharedKernel
```

**Forbidden:**
- Module.Domain → ANY infrastructure package (EF Core, HttpClient, etc.)
- Module.Application → Module.Infrastructure (dependency inversion!)
- Module A.Domain → Module B.Domain (cross-module dependency!)
- Module A.Infrastructure → Module B.Infrastructure
- Host → Module.Infrastructure directly (go through Module.API)

These rules are enforced by ArchUnitNET tests in `NGO.PMS.Architecture.Tests`.

### Frontend Dependency Rules

```
libs/shared/core      → No other lib dependencies
libs/shared/ui        → libs/shared/core only
libs/modules/{name}   → libs/shared/core + libs/shared/ui
apps/web              → libs/modules/* + libs/shared/*
apps/platform-console → libs/modules/* + libs/shared/*
```

**Forbidden:**
- `libs/modules/identity` → `libs/modules/projects` (cross-module!)
- `apps/web` → direct Angular Material imports (use shared/ui wrappers)

Enforced by Nx module boundaries (`@nx/enforce-module-boundaries` ESLint rule).

---

## 3. Naming Conventions

### C# / Backend

| Element | Convention | Example |
|---------|-----------|---------|
| Namespace | `NGO.PMS.{Module}.{Layer}` | `NGO.PMS.Identity.Domain` |
| Entity class | PascalCase, singular | `User`, `Project`, `JournalEntry` |
| Interface | `I` prefix | `IUserRepository`, `ICurrentUserService` |
| DbContext | `{Module}DbContext` | `IdentityDbContext`, `ProjectsDbContext` |
| Command | `{Verb}{Noun}Command` | `CreateUserCommand`, `UpdateProjectCommand` |
| Query | `Get{Noun}Query` / `List{Noun}Query` | `GetUserQuery`, `ListProjectsQuery` |
| Handler | `{Command/Query}Handler` | `CreateUserCommandHandler` |
| DTO | `{Noun}Dto` / `{Noun}Response` | `UserDto`, `CreateUserRequest` |
| Validator | `{Command/Query}Validator` | `CreateUserCommandValidator` |
| Controller | `{Noun}Controller` (plural) | `UsersController`, `ProjectsController` |
| Service interface | `I{Noun}Service` | `IJwtTokenService`, `IEmailService` |
| Repository interface | `I{Noun}Repository` | `IUserRepository` |
| Domain event | `{Noun}{PastTense}Event` | `UserCreatedEvent`, `ProjectApprovedEvent` |
| Integration event | `{Noun}{PastTense}IntegrationEvent` | `UserCreatedIntegrationEvent` |

### Database

| Element | Convention | Example |
|---------|-----------|---------|
| Schema | lowercase, module name | `identity`, `projects`, `fundacct` |
| Table | snake_case, plural | `users`, `projects`, `journal_entries` |
| Column | snake_case | `first_name`, `created_at`, `organization_id` |
| Primary key | `id` (UUID) | `id uuid DEFAULT gen_random_uuid()` |
| Foreign key | `{referenced_table_singular}_id` | `user_id`, `project_id` |
| Index | `ix_{table}_{columns}` | `ix_users_email`, `ix_projects_org_status` |
| Unique constraint | `uq_{table}_{columns}` | `uq_users_email_org` |

### Angular / Frontend

| Element | Convention | Example |
|---------|-----------|---------|
| Component | kebab-case file, PascalCase class | `user-list.component.ts` → `UserListComponent` |
| Service | kebab-case file | `auth.service.ts` → `AuthService` |
| Guard | kebab-case file | `auth.guard.ts` → `authGuard` (functional) |
| Interceptor | kebab-case file | `jwt.interceptor.ts` → `jwtInterceptor` (functional) |
| NgRx Action | `[Source] Description` | `[Auth] Login`, `[Auth] Login Success` |
| NgRx Selector | `select{Noun}` | `selectCurrentUser`, `selectIsAuthenticated` |
| Route path | kebab-case | `/user-management`, `/project-details/:id` |
| Translation key | dot.notation | `auth.login.title`, `projects.create.submit` |
| Shared component selector | `app-{name}` | `app-data-table`, `app-confirm-dialog` |

### API Endpoints

| Element | Convention | Example |
|---------|-----------|---------|
| Base path | `/api/v1/{resource}` | `/api/v1/projects` |
| List | `GET /api/v1/{resources}` | `GET /api/v1/projects` |
| Get one | `GET /api/v1/{resources}/{id}` | `GET /api/v1/projects/abc-123` |
| Create | `POST /api/v1/{resources}` | `POST /api/v1/projects` |
| Update | `PUT /api/v1/{resources}/{id}` | `PUT /api/v1/projects/abc-123` |
| Delete | `DELETE /api/v1/{resources}/{id}` | `DELETE /api/v1/projects/abc-123` |
| Nested | `GET /api/v1/{parent}/{id}/{child}` | `GET /api/v1/projects/abc-123/outcomes` |
| Action | `POST /api/v1/{resources}/{id}/{action}` | `POST /api/v1/projects/abc-123/approve` |

---

## 4. Vertical Slice Pattern (Per Feature)

Every feature follows this file structure within its module:

### Backend

```
src/Modules/Projects/NGO.PMS.Projects.Application/
├── Projects/
│   ├── Commands/
│   │   ├── CreateProject/
│   │   │   ├── CreateProjectCommand.cs        ← MediatR IRequest<T>
│   │   │   ├── CreateProjectCommandHandler.cs ← Business logic
│   │   │   └── CreateProjectCommandValidator.cs ← FluentValidation
│   │   ├── UpdateProject/
│   │   └── ApproveProject/
│   ├── Queries/
│   │   ├── GetProject/
│   │   │   ├── GetProjectQuery.cs
│   │   │   └── GetProjectQueryHandler.cs
│   │   └── ListProjects/
│   ├── DTOs/
│   │   ├── ProjectDto.cs
│   │   ├── CreateProjectRequest.cs
│   │   └── ProjectListItemDto.cs
│   └── Mappings/
│       └── ProjectMappingProfile.cs           ← AutoMapper profile
```

### Frontend

```
client/libs/modules/projects/src/lib/
├── pages/
│   ├── project-list/
│   │   ├── project-list.component.ts
│   │   ├── project-list.component.html
│   │   ├── project-list.component.scss
│   │   └── project-list.component.spec.ts
│   ├── project-detail/
│   └── project-create/
├── components/                    ← Module-specific components (not shared)
│   └── project-status-badge/
├── services/
│   └── project.service.ts        ← HTTP calls to backend API
├── store/
│   ├── project.actions.ts
│   ├── project.reducer.ts
│   ├── project.effects.ts
│   └── project.selectors.ts
├── models/
│   └── project.model.ts          ← TypeScript interfaces matching backend DTOs
└── routes.ts                      ← Lazy-loaded routes for this module
```

---

## 5. Module DI Registration Pattern

Each module registers its own services. The Host never directly instantiates module internals.

### Module.API — `{Module}ModuleExtensions.cs`

```csharp
namespace NGO.PMS.Projects.API;

public static class ProjectsModuleExtensions
{
    public static IServiceCollection AddProjectsModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Application layer
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(
            typeof(CreateProjectCommandHandler).Assembly));
        services.AddValidatorsFromAssembly(
            typeof(CreateProjectCommandValidator).Assembly);
        services.AddAutoMapper(typeof(ProjectMappingProfile).Assembly);

        // Infrastructure layer
        services.AddDbContext<ProjectsDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
        services.AddScoped<IProjectRepository, ProjectRepository>();

        return services;
    }
}
```

### Host Program.cs

```csharp
// Module registration (one line per module)
builder.Services.AddIdentityModule(builder.Configuration);
builder.Services.AddProjectsModule(builder.Configuration);
builder.Services.AddPlanningModule(builder.Configuration);
// ... etc.
```

---

## 6. Git Conventions

### Branch Strategy

| Branch | Purpose | Naming |
|--------|---------|--------|
| `main` | Production-ready code | Protected, requires PR |
| `develop` | Integration branch | Feature PRs merge here |
| Feature | New feature | `feature/{module}/{description}` |
| Bugfix | Bug fix | `bugfix/{module}/{description}` |
| Hotfix | Production fix | `hotfix/{description}` |

**Examples:** `feature/identity/jwt-auth`, `feature/projects/crud-endpoints`, `bugfix/identity/refresh-token-expiry`

### Commit Convention

Format: `{type}({scope}): {description}`

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes nor adds |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Build, CI, config changes |

**Examples:**
```
feat(identity): implement JWT token service with refresh
fix(projects): prevent duplicate project codes per organization
test(identity): add integration tests for login endpoint
chore(ci): add build caching to GitHub Actions workflow
docs(plans): add identity backend implementation plan
```

---

## 7. Code Quality Rules

### Backend (Enforced by CI)

- `TreatWarningsAsErrors` is `true` in Directory.Build.props
- No `#pragma warning disable` without a code review comment explaining why
- All public API methods must have XML documentation comments
- No `async void` methods (use `async Task`)
- No `Console.WriteLine` (use `ILogger<T>`)
- No hardcoded connection strings, secrets, or API keys
- All entity properties must be validated (FluentValidation or data annotations)
- All controllers must have `[Authorize]` or `[AllowAnonymous]` explicitly
- Every command/query handler is in its own file (no multi-class files)

### Frontend (Enforced by ESLint + Prettier)

- `strict: true` in tsconfig
- No `any` types without `// eslint-disable-next-line` with justification
- All components must have at least one unit test
- No inline styles (use SCSS or Tailwind utilities)
- No direct `console.log` (use a logging service)
- All HTTP calls go through dedicated service classes (not direct HttpClient in components)
- All forms use Reactive Forms (no template-driven forms)
- Lazy load all feature modules

---

## 8. Testing Requirements

### Per Feature Minimum

| Layer | Minimum Tests |
|-------|--------------|
| Domain entity | 1 test per business rule / validation |
| Command handler | 1 success + 1 validation failure + 1 authorization failure |
| Query handler | 1 success + 1 empty result |
| Controller | Integration test for each endpoint |
| Angular component | 1 render test + 1 interaction test |
| Angular service | 1 test per public method |
| E2E (Playwright) | 1 per critical user flow (login, CRUD, approval) |

### Test Naming Convention

```csharp
// C#: {MethodName}_Should{ExpectedBehavior}_When{Condition}
public void CreateUser_ShouldReturnSuccess_WhenValidRequest()
public void CreateUser_ShouldThrowValidationException_WhenEmailMissing()
```

```typescript
// TypeScript: describe('{Component}') → it('should {behavior} when {condition}')
describe('ProjectListComponent', () => {
  it('should display loading spinner when data is fetching', () => {});
  it('should show empty state when no projects exist', () => {});
});
```

---

## 9. Standard API Response Envelope

Every API response uses these wrappers (defined in SharedKernel):

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Project created successfully"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 142,
  "totalPages": 8
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "errors": [
    "Email is required",
    "Project code must be unique within the organization"
  ]
}
```

---

## 10. Security Rules

- Never log passwords, tokens, or sensitive PII
- JWT tokens stored in HttpOnly cookies (web) or secure storage (mobile)
- All passwords hashed with ASP.NET Core Identity (PBKDF2)
- Rate limiting on auth endpoints (10 requests/minute per IP)
- CORS restricted to known origins
- RLS enforced at database level (defense in depth)
- All file uploads validated (type, size, content scan)
- SQL injection prevented by parameterized queries (EF Core / Dapper)
- XSS prevented by Angular's built-in sanitization + CSP headers

---

## 11. Requirements Traceability

- Every approved requirement has a unique identifier: `REQ-{MODULE}-{NNN}` (e.g., REQ-PROJ-001, REQ-AUTH-005). The master list lives in `docs/REQUIREMENTS_MATRIX.md`.
- Before implementing any feature, locate its REQ ID in the matrix. If no REQ ID exists, the feature has not been approved — stop and request clarification.
- When completing a task, update the matrix to reflect: status (not started / in progress / done / tested), the PR or commit reference, and the date.
- **Never silently omit, simplify, or replace a required feature.** If a feature seems unnecessary, document your reasoning and request approval before skipping it.
- **Never silently change business rules.** If conflicting rules exist between source systems, follow the requirement as written in the matrix.

---

## 12. Business Logic Placement

A business rule must be defined in exactly ONE place:

| Location | What goes here | Example |
|----------|---------------|---------|
| **Domain entity / domain service** | Rules intrinsic to the entity | "A project in Approved status cannot be edited directly" |
| **Application handler** | Rules coordinating multiple entities | "DIP budget cannot exceed parent activity budget" |
| **Database constraint** | Data integrity that must hold even with application bugs | Foreign keys, unique constraints, check constraints |

If the same rule exists in two places, one will inevitably drift. Find the canonical location and remove the duplicate.

---

## 13. Financial Arithmetic

- **All monetary calculations MUST use NodaMoney** (or `decimal` with explicit rounding). Never use `float` or `double` for money.
- Currency conversion must go through `ICurrencyConverterService` with historical exchange rates.
- Fund accounting journal entries must always balance: sum of debits = sum of credits. Enforce with a database CHECK constraint.

---

## 14. State Machine Workflows

Use the **Stateless** library for all multi-step lifecycle workflows:

| Workflow | States |
|----------|--------|
| Procurement | Plan → Request → Approve → PO → GR → Pay |
| Graduation | Enrolled → Training → Assessed → Graduated |
| Tenant lifecycle | Pending → Provisioning → Active → Suspended → Decommissioned |
| Report approval | Draft → Submitted → UnderReview → Approved / Rejected |

Define states and triggers as enums in the Domain layer. Configure the state machine in the Application handler. Persist the current state as an enum column on the entity — Stateless rehydrates from this on each request.

---

## 15. Migration Rules

- All schema changes go through EF Core migrations (`dotnet ef migrations add {DescriptiveName}`).
- Migration names must be descriptive: `AddParticipantGraduationFields`, `CreateProcurementTables` — not `Update1` or `Migration20261012`.
- **Never modify a migration that has been applied to any environment.** Create a new migration instead.
- PostgreSQL-specific objects (functions, triggers, RLS policies, materialized views) are managed via DbUp SQL scripts in `Infrastructure/Persistence/Scripts/`.
- Every migration must be reversible (implement `Down` method).

---

## 16. Foreign Key Conventions

Every relationship must have a foreign key constraint.

| Relationship type | ON DELETE | Example |
|------------------|-----------|---------|
| Parent-child (owned) | `CASCADE` | Project → Outcomes |
| Reference (lookup) | `RESTRICT` | Project → Office |
| Optional reference | `SET NULL` | Task → Assigned User |

Use check constraints for enum-like columns that aren't PostgreSQL enums. Use unique constraints for natural keys (e.g., participant code, project code, form code).

---

## 17. Approval Workflow Pattern

All approval workflows in the system follow ONE shared pattern:

1. Entity has `Status` (operational) and `ApprovalStatus` (approval-specific).
2. `ApprovalStatus` transitions: `Draft` → `Submitted` → `UnderReview` → `Approved` | `Rejected`.
3. On submission: `SubmittedAt` is set, notification sent to designated approver.
4. On approval: `ApprovedBy` and `ApprovedAt` are set.
5. On rejection: `RejectedBy`, `RejectedAt`, and `RejectionReason` are set. Entity returns to `Draft` for revision.
6. Multi-level approval (where configured): Level 1 approver approves → moves to Level 2 → ... → Final approval.
7. **Only the creator can edit a Draft.** Only an assigned approver can approve/reject. These checks are in the Application handler, not just permission-based.

This pattern applies to: Projects, Reports (all 7 types), Plans (all 5 levels), Procurement (each stage), Budget Requests, Tasks, MEAL Plans, Evaluations.

---

## 18. Page Layout Standards

| Page type | Structure |
|-----------|-----------|
| **List page** | Page title + description → Filters bar (search, status, date range) → Action buttons (Create, Export) → Data table → Pagination |
| **Detail page** | Breadcrumb → Page title with status badge → Action buttons (Edit, Delete, Submit, Approve) → Tab navigation → Content |
| **Form page** | Breadcrumb → Page title → Form sections with clear section headers → Inline validation errors → Submit/Cancel buttons at bottom |
| **Dashboard** | Page title → KPI cards row → Charts (2-3 column grid) → Recent activity table |

Every page must handle all UI states: **Loading** (spinner), **Empty** (empty state with action), **Error** (message with retry), **Success** (toast notification, 3s duration), **Permission denied** (message with dashboard link), **Not found** (404 message).

---

## 19. Responsive Design

All pages must work at: Desktop (1024px+), Tablet (768px-1023px), Large Mobile (480px-767px).

- Data tables on mobile: switch to card/list view below 768px, or horizontal scrolling with pinned first column.
- Sidebar: collapsible to icon-only on tablet, slide-out drawer on mobile.
- Forms: single-column on mobile, multi-column on desktop where appropriate.
- **Test every new page at 768px width** before marking the task complete.

---

## 20. Performance Targets

- All list endpoints paginated (default page size: 20, max: 100).
- Use materialized views for dashboard aggregations and system reports. Refresh via Hangfire on schedule.
- Avoid N+1 queries: use EF Core `.Include()` / `.ThenInclude()` for related data, or use explicit projection (`.Select()`).
- API response targets: < 500ms for standard CRUD, < 2s for complex aggregations, < 10s for report generation.

---

## 21. Safe Code Change Rules

- **Read before write:** Before modifying any file, understand what it currently does. Before modifying a shared component, search for all modules that use it.
- **Focused changes:** Each PR should address ONE feature, ONE bug fix, or ONE refactoring task. Do not combine unrelated changes.
- **No broad refactoring without approval:** Refactoring that touches 10+ files requires documentation and approval.
- **Delete with verification:** Before deleting any code or file, search the entire codebase for references to confirm nothing depends on it.
- **Test after every change:** Backend → `dotnet test`, Frontend → `nx test`, Schema → integration tests with Testcontainers.

---

## 22. Feature Completion Checklist

Before marking ANY feature task as complete, verify ALL of the following:

**Backend:** Entity created with relationships, EF Core configuration with indexes/constraints/FKs, migration created and tested, MediatR handlers implemented, FluentValidation validators cover business rules, controller endpoints with `[Authorize]` and `[RequirePermission]`, RLS policy covers new entities.

**Frontend:** Angular component uses shared components where applicable, all strings in translation files (en.json + am.json), form uses Reactive Forms with validation, loading/empty/error/success/permission-denied states handled, responsive at 768px, dark mode + light mode both work, permission checks gate UI elements.

**Integration:** Backend and frontend work end-to-end, cross-module data flows verified, approval workflow uses shared pattern. All tests pass in CI.

---

## 23. Anti-Patterns (Do NOT Do)

1. Do not create a page that only displays static text or placeholder content — every page connects to real data.
2. Do not implement a feature "frontend only" or "backend only" — both sides must be completed together.
3. Do not create module-specific versions of shared components — enhance the shared component instead.
4. Do not bypass RBAC for convenience — permissions are part of the feature, not an afterthought.
5. Do not use `any` type in TypeScript — define proper interfaces for all API responses and component inputs.
6. Do not ignore compiler warnings — treat warnings as errors, zero warnings policy.
7. Do not create utility files named `helpers.ts`, `utils.ts`, or `common.ts` as catch-all dumping grounds.
8. Do not duplicate database queries across handlers — extract common queries into repository methods.
9. Do not write tests that only verify "component renders without error" — tests must verify behavior.
10. Do not use `Console.WriteLine` — use `ILogger<T>` everywhere.
