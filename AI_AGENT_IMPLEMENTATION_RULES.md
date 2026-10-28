> **⚠ SUPERSEDED** — Unique rules from this file have been merged into `docs/plans/00-CODING-STANDARDS.md` (sections 11-23).
> Do NOT use this document for implementation. It references .NET 8 + Angular 18 (outdated).
> The authoritative coding rules are now in `docs/plans/00-CODING-STANDARDS.md`.
> Kept for historical reference only.

# EthelPMS — AI Agent Implementation Rules

> ~~**MANDATORY INSTRUCTION**~~: Rules merged into `docs/plans/00-CODING-STANDARDS.md`. See that file instead.

**Stack:** ASP.NET Core 8 + Angular 18 (Nx) + Supabase PostgreSQL
**Architecture:** Modular Monolith — schema-per-module, Clean Architecture per module, Transactional Outbox
**Companion Document:** `IMPLEMENTATION_PLAN.md` defines WHAT to build and WHEN. This document defines HOW to build it.

---

# A. Requirements and Feature Coverage

## A1. Requirement Identifiers
- Every approved requirement has a unique identifier: `REQ-{MODULE}-{NNN}` (e.g., REQ-PROJ-001, REQ-AUTH-005).
- The master list lives in `docs/REQUIREMENTS_MATRIX.md`. This file is the single source of truth for what the system must do.
- Before implementing any feature, locate its REQ ID in the matrix. If no REQ ID exists, the feature has not been approved — stop and request clarification.

## A2. Traceability
- Every REQ ID maps to: source system (A = MERHA, B = DICAC, NEW = enhancement), implementation phase, backend task(s), frontend task(s), database entities, API endpoints, test(s), and acceptance criteria.
- When completing a task, update the matrix to reflect: status (not started / in progress / done / tested), the PR or commit reference, and the date.

## A3. No Silent Changes
- **Never silently omit a required feature.** If a feature seems unnecessary, document your reasoning and request approval before skipping it.
- **Never silently simplify a feature.** If the requirement says "5-level planning hierarchy with cascading budget constraints," implement all 5 levels with cascading budget constraints. Do not implement 3 levels and note "remaining levels can be added later."
- **Never silently replace a feature** with a different implementation unless the replacement demonstrably covers all the same acceptance criteria.
- **Never silently change business rules.** If System A says "max 3 monthly plans per quarter" and System B has no such limit, the unified requirement says "max 3 per quarter." Implement that, not "unlimited."

## A4. Conflict Resolution
- If a requirement is unclear, conflicts with another requirement, or seems incorrect, add an entry to `docs/UNRESOLVED_DECISIONS.md` with: the REQ IDs involved, the conflict description, your recommended resolution, and the impact of each option.
- Do not make consequential decisions silently. A "consequential decision" is one that: changes data structure, alters a workflow, removes or replaces a feature, changes permission semantics, or affects cross-module integration.

---

# B. Architecture and Business Logic

## B1. Solution Structure (Mandatory — Modular Monolith)
```
src/
  Shared/
    NGO.PMS.SharedKernel/     — Base entities, value objects, common interfaces. ZERO external deps.
    NGO.PMS.Contracts/        — Integration events + public query interfaces (cross-module API)
  Modules/
    Identity/                 — schema: identity
      NGO.PMS.Identity.Domain/
      NGO.PMS.Identity.Application/
      NGO.PMS.Identity.Infrastructure/
      NGO.PMS.Identity.API/
    Projects/                 — schema: projects
      NGO.PMS.Projects.Domain/  ... (same 4-layer pattern)
    Planning/                 — schema: planning
    Reporting/                — schema: reporting
    MEAL/                     — schema: meal
    Participants/             — schema: participants
    Procurement/              — schema: procurement
    FundAccounting/           — schema: fundacct
    Assets/                   — schema: assets
    Training/                 — schema: training
    Tasks/                    — schema: tasks
    Risk/                     — schema: risk
    Donors/                   — schema: donors
    Chat/                     — schema: chat
    Notifications/            — schema: notifications
    Documents/                — schema: documents
    Feedback/                 — schema: feedback
    PlatformAdmin/            — schema: platform (SuperAdmin control plane)
  Host/
    NGO.PMS.API/              — Composition root, registers all modules
tests/
  per-module test projects + E2E
```

### B1a. Schema-per-Module Rules (CRITICAL)
- Each module's DbContext MUST call `HasDefaultSchema("{schema_name}")`.
- Each module has its own PostgreSQL role with GRANT only on its own schema.
- **NO cross-module database joins.** If Module A needs data from Module B, use `NGO.PMS.Contracts` integration events or public query interfaces.
- Shared read-only reference data (currencies, geography, calendars) lives in the `reference` schema.
- Audit records go to the `audit` schema (INSERT-only PostgreSQL role — no UPDATE/DELETE).
- ArchUnitNET tests in CI enforce: no module references another module's Domain/Application/Infrastructure directly.

### B1b. Transactional Outbox Pattern (CRITICAL)
- When a module needs to publish an integration event, it writes to its own `outbox` table in the SAME database transaction as the business write.
- A Hangfire poller reads unpublished outbox entries and dispatches them to consumers.
- Consumer modules track processed events in an `inbox` table for idempotency.
- **Never publish events outside a transaction.** This guarantees delivery even if the consumer is temporarily down.

### B1c. Immutable Audit Trail
- The `audit` schema uses a PostgreSQL role with INSERT-only permissions (no UPDATE, no DELETE).
- Use Audit.NET for automatic audit record creation on all entity changes.
- Audit records include: entity type, entity ID, action (create/update/delete), old values, new values, user ID, timestamp, organization ID.

## B2. Dependency Direction (Per Module)
- **Module.Domain has ZERO references** to any other project, NuGet package (except SharedKernel), or external service.
- **Module.Application references only Module.Domain + SharedKernel + Contracts.** Defines interfaces; Infrastructure implements them.
- **Module.Infrastructure references Module.Application and Module.Domain.** This is where EF Core DbContext, external service clients, and outbox relay live.
- **Module.API references Module.Infrastructure and Module.Application.** Controllers are thin — dispatch via MediatR, return response.
- **Cross-module:** A module may reference `NGO.PMS.Contracts` to consume integration events or call public query interfaces from other modules. It must NEVER reference another module's Domain/Application/Infrastructure directly.
- **Never add a direct reference from Domain or Application to Infrastructure.** If you need an infrastructure capability in Application, define an interface in Application and implement it in Infrastructure.

## B3. Feature Organization (Vertical Slices)
Inside each module's Application layer (e.g., `src/Modules/Projects/NGO.PMS.Projects.Application/Features/`):
```
Features/
  Projects/
    Commands/
      CreateProject/
        CreateProjectCommand.cs
        CreateProjectHandler.cs
        CreateProjectValidator.cs
    Queries/
      GetProject/
        GetProjectQuery.cs
        GetProjectHandler.cs
    DTOs/
      ProjectDto.cs
      CreateProjectDto.cs
```
- Each command/query is a separate class in its own folder.
- Each handler handles exactly one command or query.
- Validators are co-located with their command.

## B4. No Duplicate Business Logic
- A business rule must be defined in exactly ONE place:
  - **Domain entity or domain service** — for rules intrinsic to the entity (e.g., "a project in approved status cannot be edited directly").
  - **Application handler** — for rules that coordinate multiple entities (e.g., "DIP budget cannot exceed parent activity budget").
  - **Database constraint** — for data integrity rules that must be enforced even if application code has bugs (e.g., foreign keys, unique constraints, check constraints).
- If the same rule exists in two places, one will inevitably drift. Find the canonical location and remove the duplicate.

## B5. Shared Services
These services are defined in SharedKernel (interface) and implemented in relevant modules:
- `ICurrencyConverterService` — all currency conversion goes through this
- `IGeofenceService` — all GPS distance calculations go through this
- `IEmailService` — all email sending goes through this
- `INotificationService` — all notification dispatch (3 channels) goes through this
- `IStorageService` — all file upload/download goes through this
- `IReportAggregationService` — all report data aggregation goes through this
- `IAuditLogService` — all audit logging goes through this (backed by Audit.NET)
- `IPillarStageCalculator` — graduation pillar computation goes through this
- `ITenantContext` — current tenant info from Finbuckle (org ID, tier, schema)
- `IOutboxPublisher` — publish integration events to module outbox table
- `IRulesEngineService` — evaluate dynamic business rules (Microsoft.RulesEngine)
- `IFeatureFlagService` — check per-tenant feature flags (OpenFeature)
- **Never call an external service directly from a controller or handler.** Always go through the service interface.

## B6. No Unauthorized Dependencies
- Do not add NuGet packages, npm packages, or external services not listed in the approved technology stack (`NGO-PMS-Technology-Stack-Part1/2/3.md`).
- **Approved additional libraries (v2 additions):** Finbuckle.MultiTenant, ArchUnitNET, Stateless, NodaMoney, Audit.NET, Microsoft.RulesEngine, OpenFeature, openapi-typescript, openapi-fetch.
- If you believe a new dependency is needed, document it in `docs/ARCHITECTURE_DECISIONS.md` with: what it does, why it's needed, what alternatives exist, license implications, and request approval before adding it.

## B7. Financial Arithmetic (CRITICAL)
- **All monetary calculations MUST use NodaMoney** (or decimal with explicit rounding). Never use `float` or `double` for money.
- Currency conversion must go through `ICurrencyConverterService` with historical exchange rates.
- Fund accounting journal entries must always balance: sum of debits = sum of credits. Enforce with a database CHECK constraint.

## B8. State Machine Workflows
- Use the **Stateless** library for all multi-step lifecycle workflows: procurement (Plan→Request→Approve→PO→GR→Pay), graduation (enrolled→training→assessed→graduated), tenant lifecycle (provisioned→active→suspended→terminated).
- Define states and triggers as enums in the Domain layer. Configure the state machine in the Application handler.
- Persist the current state as an enum column on the entity. Stateless rehydrates from this on each request.

---

# C. Database and API Consistency

## C1. Entity Design Conventions
- **Primary key:** `Id` (UUID, generated by PostgreSQL `gen_random_uuid()`)
- **Audit fields on all entities:** `CreatedAt` (DateTimeOffset), `CreatedBy` (UUID, nullable), `UpdatedAt` (DateTimeOffset), `UpdatedBy` (UUID, nullable). Populated by `AuditableEntityInterceptor`.
- **Soft delete:** Entities requiring soft delete implement `ISoftDeletable` with `IsDeleted` (bool) and `DeletedAt` (DateTimeOffset?). Handled by `SoftDeleteInterceptor` and global query filter.
- **Multi-tenancy:** Every business entity has `OrganizationId` (UUID). Isolation enforced by Finbuckle.MultiTenant + RLS policy (belt-and-suspenders). Finbuckle resolves tenant from subdomain/header/JWT, sets `app.current_org_id` session variable for RLS.
- **Office scoping:** Entities scoped by office have `AreaOfficeId` and `BranchOfficeId` (both nullable UUIDs).
- **Schema isolation:** Each module's tables live in their own PostgreSQL schema. Never create tables in the `public` schema.

## C2. Naming Conventions

### Database (PostgreSQL)
- Tables: `snake_case` plural (e.g., `projects`, `annual_plans`, `procurement_requests`)
- Columns: `snake_case` (e.g., `created_at`, `area_office_id`, `approval_status`)
- Indexes: `ix_{table}_{column(s)}` (e.g., `ix_projects_status`, `ix_participants_cohort_id`)
- Foreign keys: `fk_{table}_{referenced_table}` (e.g., `fk_projects_organizations`)
- Unique constraints: `uq_{table}_{column(s)}`
- Check constraints: `ck_{table}_{description}`
- Enums: `PascalCase` PostgreSQL enum types (e.g., `ProjectStatus`, `ReportApprovalStatus`)

### C# Backend
- Entities: `PascalCase` singular (e.g., `Project`, `AnnualPlan`, `ProcurementRequest`)
- DTOs: `{Entity}Dto`, `Create{Entity}Dto`, `Update{Entity}Dto`
- Commands: `Create{Entity}Command`, `Update{Entity}Command`, `Approve{Entity}Command`
- Queries: `Get{Entity}Query`, `List{Entities}Query`
- Handlers: `{Command/Query}Handler`
- Validators: `{Command}Validator`
- Services: `I{Name}Service` (interface), `{Name}Service` (implementation)
- Controllers: `{Entities}Controller` (plural)

### Angular Frontend
- Components: `kebab-case` (e.g., `project-list`, `approval-workflow`, `dual-calendar-date-picker`)
- Services: `camelCase` with `.service.ts` suffix
- Models/interfaces: `PascalCase` in `.model.ts` files
- Feature modules: `kebab-case` directories under `features/`
- Shared components: under `shared/components/`
- Store: `{feature}.actions.ts`, `{feature}.reducer.ts`, `{feature}.effects.ts`, `{feature}.selectors.ts`

### API Endpoints
- URL pattern: `/api/v1/{resource}` (plural, kebab-case)
- Examples: `/api/v1/projects`, `/api/v1/annual-plans`, `/api/v1/procurement-requests`
- Nested resources: `/api/v1/projects/{projectId}/outcomes`
- Actions: `/api/v1/projects/{id}/approve` (POST), `/api/v1/projects/{id}/status` (PATCH)

## C3. Migration Rules
- All schema changes go through EF Core migrations (`dotnet ef migrations add {Name}`).
- Migration names must be descriptive: `AddParticipantGraduationFields`, `CreateProcurementTables`, not `Update1` or `Migration20261012`.
- **Never modify a migration that has been applied to any environment.** Create a new migration instead.
- PostgreSQL-specific objects (functions, triggers, RLS policies, materialized views) are managed via DbUp SQL scripts in `Infrastructure/Persistence/Scripts/`.
- Every migration must be reversible (implement `Down` method).
- **Test migrations against a clean database** before committing.

## C4. Foreign Keys and Constraints
- Every relationship must have a foreign key constraint.
- `ON DELETE` behavior:
  - Parent-child (owned): `CASCADE` (e.g., project → outcomes)
  - Reference (lookup): `RESTRICT` (e.g., project → office)
  - Optional reference: `SET NULL` (e.g., task → assigned_user)
- Use check constraints for enum-like columns that aren't PostgreSQL enums.
- Use unique constraints for natural keys (e.g., participant code, project code, form code).

## C5. API Contract Rules
- Every endpoint returns the standard envelope: `{ data, meta, errors }`.
- Error responses include: `code` (machine-readable), `message` (human-readable), `field` (for validation errors), `detail` (optional).
- Pagination: use `page` and `pageSize` query parameters. Response includes `meta: { page, pageSize, totalCount, totalPages }`.
- All list endpoints support: `search` (text search), `sort` (field:asc|desc), `fields` (sparse fieldset).
- Filter parameters use suffixes: `_eq`, `_gte`, `_lte`, `_in`, `_contains` (e.g., `?status_eq=active&budget_gte=10000`).
- **Backend and frontend must stay synchronized.** When a backend DTO field changes, the corresponding Angular interface must be updated in the same PR. The CI pipeline will catch type mismatches only if interfaces are kept current.

## C6. Authentication and Authorization on Every Endpoint
- Every controller class has `[Authorize]` attribute (except `PublicController`).
- Every action that modifies or reads sensitive data has `[RequirePermission("module.action")]`.
- Permission check is the LAST line of defense — business logic must also validate ownership and state (e.g., "only the report creator can edit a draft report" is checked in the handler, not just via permission).
- **No dummy auth, no "skip auth for now," no TODO comments that bypass security.** If auth isn't implemented yet, the endpoint should not exist yet.

## C7. No Hardcoded or Dummy Data
- Seed data (permissions, roles, default configurations) goes in `Infrastructure/Persistence/Seeds/` and runs via a migration or startup seed.
- Test data goes in test projects using Bogus.
- **Never return hardcoded JSON from an API endpoint.** Never use `if (condition) return dummyData;`. Never create a "demo mode" that bypasses real data access.

---

# D. UI/UX Consistency

## D1. Design System
- **Workspace:** Nx monorepo with `apps/web` (tenant app), `apps/platform-console` (SuperAdmin), and `libs/` for shared code.
- **Component library:** Angular Material 18 as base, with custom theme overrides.
- **Data grids:** AG Grid Community Edition for all tabular data.
- **Charts:** Apache ECharts (via ngx-echarts) for all visualizations.
- **Maps:** Leaflet with OpenStreetMap tiles.
- **Icons:** Material Icons (consistent set throughout).
- **Typography:** System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`). No custom web fonts (performance).
- **API client:** Auto-generated from OpenAPI spec using openapi-typescript + openapi-fetch. Never manually write HTTP service methods for API calls.
- **Module libraries:** Each backend module maps to an Angular library in `libs/modules/{name}`. Libraries enforce module boundaries at build time.

## D2. Theme & Branding
- All colors use CSS custom properties: `--theme-primary`, `--theme-primary-hover`, `--theme-accent`, `--theme-background`, `--theme-surface`, `--theme-text`, `--theme-text-secondary`, `--theme-border`, `--theme-success`, `--theme-warning`, `--theme-danger`.
- **Never hardcode color values** in component CSS or inline styles. Always reference CSS custom properties or Angular Material theme tokens.
- Dark mode and light mode must both work. Test every new component in both modes.
- Organization branding (primary color, logo) is loaded from the database and applied via CSS custom properties on app initialization.

## D3. Shared Components (Mandatory Reuse)
These shared components are defined once in `shared/components/`. When a UI pattern matches one of these, **you MUST use the shared component, not create a new one:**

| Component | Purpose | Used By |
|-----------|---------|---------|
| `app-data-table` | AG Grid wrapper with standard pagination, search, filters, export | Every list page |
| `app-approval-workflow` | Approval status display + approve/reject actions | Projects, Reports, Plans, Procurement, Budget, Tasks |
| `app-dual-calendar-date-picker` | Ethiopian + Gregorian date picker | Every date input |
| `app-location-cascade-selector` | Region > Zone > Woreda > Kebele dropdown cascade | Every location selection |
| `app-intervention-area-selector` | Hierarchical intervention area tree picker | Projects, Plans, Reports |
| `app-currency-input` | Amount input with currency selector and auto-conversion display | Budget, Procurement, Finance |
| `app-file-upload` | Drag-and-drop file upload with preview | Documents, Chat, Procurement, Reports |
| `app-user-selector` | Searchable user dropdown (respects office scoping) | Task assignment, Report assignment, approver selection |
| `app-status-badge` | Color-coded status indicator | Every entity with a status |
| `app-confirm-dialog` | Confirmation modal for destructive actions | Every delete/approve/reject action |
| `app-empty-state` | Placeholder for lists with no data | Every list page |
| `app-loading-spinner` | Consistent loading indicator | Every async operation |
| `app-rich-text-editor` | Quill wrapper for narrative fields | Reports, MEAL, Documents |
| `app-form-renderer` | Dynamic form renderer from JSON schema (ngx-formly) | Form Builder module |
| `app-chart-wrapper` | ECharts wrapper with responsive sizing and theme integration | Every dashboard |
| `app-permission-guard` | Structural directive to show/hide based on permission | Every permission-gated UI element |

- **Before creating any UI component, check this list.** If a shared component can serve your need (even with minor enhancement), enhance the shared component instead of creating a module-specific one.
- If a new shared component pattern emerges (used in 3+ modules), extract it to `shared/components/` and refactor existing usages.

## D4. Page Layout Standards
- Every list page follows: Page title + description → Filters bar (search, status, date range) → Action buttons (Create, Export) → Data table → Pagination.
- Every detail page follows: Breadcrumb → Page title with status badge → Action buttons (Edit, Delete, Submit, Approve) → Tab navigation for sub-sections → Content area.
- Every form page follows: Breadcrumb → Page title → Form sections with clear section headers → Validation errors displayed inline below each field → Submit/Cancel buttons at bottom.
- Every dashboard follows: Page title → KPI cards row → Charts (2-3 column grid) → Recent activity table.

## D5. State Handling
Every page must handle all states:
- **Loading:** Show `app-loading-spinner` centered in the content area.
- **Empty:** Show `app-empty-state` with relevant icon, message, and action button (e.g., "No projects yet. Create your first project.").
- **Error:** Show error message with retry button. Log error to console. Do not show raw stack traces to users.
- **Success:** Show toast notification (ngx-toastr) for successful operations. Duration: 3 seconds for success, 5 seconds for warnings, sticky for errors.
- **Permission denied:** Show a message "You don't have permission to access this page" with a link to the dashboard. Do not show a blank page.
- **Not found:** Show 404 message for invalid routes or deleted resources.

## D6. Responsive Design
- All pages must work on: Desktop (1024px+), Tablet (768px-1023px), Large Mobile (480px-767px).
- Data tables on mobile: switch to card/list view below 768px, or use horizontal scrolling with pinned first column.
- Sidebar: collapsible to icon-only on tablet, slide-out drawer on mobile.
- Forms: single-column on mobile, multi-column on desktop where appropriate.
- **Test every new page at 768px width** before marking the task complete.

## D7. Localization
- **Every user-visible string must be in translation files** (en.json, am.json). Never hardcode English text in templates.
- Use `{{ 'KEY' | translate }}` in templates, `this.translate.instant('KEY')` in TypeScript.
- Translation keys follow: `MODULE.SECTION.LABEL` (e.g., `PROJECTS.LIST.TITLE`, `PROJECTS.FORM.BUDGET_LABEL`, `COMMON.ACTIONS.APPROVE`).
- Common labels (Save, Cancel, Delete, Approve, Reject, Submit, Search, Filter, Export) are under `COMMON.ACTIONS.*`.
- Date formatting uses the calendar service (Ethiopian or Gregorian based on user preference).

---

# E. Workflow and Module Integration

## E1. Define Before Implement
- Before coding any module, document its complete workflow in the module's README or in `docs/workflows/{module}.md`:
  - Entity states and valid transitions (state diagram)
  - What data flows IN from other modules
  - What data flows OUT to other modules
  - What triggers notifications
  - What requires approval
  - What permissions gate each action

## E2. Cross-Module Data Flow Verification
These are the critical cross-module data flows. Each must be verified with an integration test:

| From Module | To Module | Data Flow | Test |
|-------------|-----------|-----------|------|
| Projects | Results Framework | Project creates container for outcomes/outputs/activities | Create project → verify outcome creation works |
| Results Framework | Planning | Plans link to outcomes/outputs/activities | Create activity → create annual plan for it |
| Planning | Reporting | Reports reference plan data for comparison | Create plan → create activity report → verify planned vs actual |
| Reporting | Reporting | Lower-level reports aggregate into higher-level reports | Create activity reports → generate quarterly report suggestions |
| Participants | Forms | Form submission links to participant | Submit form with participant → verify participant profile updated |
| Forms | Geofence | Submission GPS triggers geofence check | Submit form with GPS → verify geofence alert generated |
| Forms | Graduation | Submission data updates indicator scores | Submit form → verify participant indicator score updated |
| Graduation | Participants | Graduation changes participant status | Approve graduation → verify participant status = GRADUATED |
| Training | Graduation | Training attendance feeds Pillar 1 | Record attendance → verify pillar 1 progress updated |
| Financial Inclusion | Graduation | FI score feeds Pillar 2 | Submit FI assessment → verify pillar 2 score updated |
| Livelihood | Graduation | Livelihood status feeds Pillar 3 | Update IGA status → verify pillar 3 progress updated |
| Protection + Social Cohesion | Graduation | P4 data feeds Pillar 4 | Submit SC assessment → verify pillar 4 score updated |
| Activity Reports | Finance | Spent budget aggregates to finance dashboard | Submit activity report with spend → verify finance dashboard updated |
| Procurement | Finance | Payment amounts aggregate to finance dashboard | Complete procurement payment → verify finance dashboard updated |
| Procurement | Budget | Purchase requests verify against budget lines | Create procurement request → verify budget availability check |
| Risk | Projects | Auto-generated risks link to projects | Run risk evaluation job → verify system risks created for overdue projects |
| Donor Compliance | Procurement | Compliance rules checked during procurement | Create procurement request → verify donor compliance check runs |

## E3. Approval Workflow Consistency
All approval workflows in the system follow ONE shared pattern:
1. Entity has `Status` (operational) and `ApprovalStatus` (approval-specific).
2. `ApprovalStatus` transitions: `Draft` → `Submitted` → `UnderReview` → `Approved` | `Rejected`.
3. On submission: `SubmittedAt` is set, notification sent to designated approver.
4. On approval: `ApprovedBy` and `ApprovedAt` are set.
5. On rejection: `RejectedBy`, `RejectedAt`, and `RejectionReason` are set. Entity returns to `Draft` for revision.
6. Multi-level approval (where configured): Level 1 approver approves → moves to Level 2 → ... → Final approval.
7. **Only the creator can edit a Draft.** Only an assigned approver can approve/reject. These checks are in the Application handler, not just permission-based.

This pattern applies to: Projects, Reports (all 7 types), Plans (all 5 levels), Procurement (each stage), Budget Requests, Tasks, MEAL Plans, Evaluations.

**Use the shared `ApprovalWorkflow` domain service and the shared `app-approval-workflow` frontend component.** Do not create module-specific approval implementations.

## E4. No Disconnected Features
- A feature is NOT complete if it only works in isolation. It must integrate with the modules it depends on and the modules that depend on it.
- Example of a disconnected feature (NOT ACCEPTABLE): "Training attendance page works — users can record attendance." But training attendance does not update graduation Pillar 1 scores. This is incomplete.
- Example of a connected feature (ACCEPTABLE): "Training attendance page works, and when attendance is recorded, the participant's Pillar 1 training completion count is updated, which triggers a re-computation of their pillar stage in the graduation service."

---

# F. Safe Code Changes

## F1. Read Before Write
- Before modifying any file, read the file and understand what it currently does.
- Before modifying a shared component, identify all modules that use it (search for import references).
- Before modifying a domain entity, identify all handlers, controllers, and frontend forms that reference it.

## F2. Focused Changes
- Each PR should address ONE feature, ONE bug fix, or ONE refactoring task.
- Do not combine unrelated changes in a single PR.
- Do not "clean up" code in files unrelated to your current task.
- If you discover a problem in unrelated code, create a separate issue/task — do not fix it in the current PR.

## F3. No Broad Refactoring Without Approval
- Refactoring that touches 10+ files requires approval and must be documented in `docs/ARCHITECTURE_DECISIONS.md`.
- Renaming a shared service, changing a database column name, or restructuring a module's folder layout are all considered broad refactoring.
- Always provide: reason for refactoring, files affected, risk assessment, rollback plan.

## F4. Delete With Verification
- Before deleting any code, function, component, or file:
  1. Search the entire codebase for references to it.
  2. Verify that no other module depends on it.
  3. Document what was deleted and why in the commit message.
- **Never delete commented-out code that contains business logic** without first verifying the logic is implemented elsewhere. It may have been commented out temporarily during a refactor.

## F5. Test After Every Change
- After modifying backend code: run `dotnet test` for the affected project(s).
- After modifying frontend code: run `ng test` for the affected module(s).
- After modifying database schema: run integration tests with Testcontainers.
- After modifying shared components: run tests for ALL modules that use the component.
- **Never commit with failing tests.** If a test fails and you believe the test is wrong (not your code), fix the test and explain why in the commit message.

## F6. Regression Investigation
- If a previously passing test fails after your change, investigate the root cause before proceeding.
- The root cause is either: (a) your change introduced a bug — fix it, or (b) the test was fragile — fix the test and document why.
- **Never skip, disable, or delete a failing test** to make CI green. If a test must be temporarily disabled, mark it with `[Skip("Reason: ...")]` and create a task to re-enable it.

---

# G. Mandatory Completion Checklist

Before marking ANY feature task as complete, verify ALL of the following:

## G1. Requirements
- [ ] The REQ ID is identified and the requirement is fully implemented (not partially)
- [ ] The REQUIREMENTS_MATRIX.md is updated with status = done

## G2. Backend
- [ ] Domain entity created/updated with proper relationships
- [ ] EF Core configuration with indexes, constraints, foreign keys
- [ ] Migration created and tested against clean database
- [ ] MediatR command/query handlers implemented
- [ ] FluentValidation validators cover all business rules
- [ ] Controller endpoints with proper [Authorize] and [RequirePermission]
- [ ] Audit logging on all state-changing operations
- [ ] Office data scoping applied to queries
- [ ] RLS policy covers the new entities

## G3. Frontend
- [ ] Angular component uses shared components where applicable
- [ ] All strings in translation files (en.json + am.json)
- [ ] Form uses Reactive Forms with proper validation
- [ ] Loading, empty, error, success, permission-denied states handled
- [ ] Responsive at 768px width
- [ ] Dark mode and light mode both work
- [ ] Permission checks gate UI elements correctly

## G4. Integration
- [ ] Backend and frontend are integrated (API calls work end-to-end)
- [ ] Cross-module data flows verified (see E2 table)
- [ ] Approval workflow uses shared pattern (see E3)

## G5. Testing
- [ ] Unit tests for business logic (domain services, handlers, validators)
- [ ] Integration tests for API endpoints (happy path + error cases + auth)
- [ ] Frontend unit tests for complex components
- [ ] E2E test for the primary workflow (if applicable)
- [ ] All tests pass locally and in CI

## G6. Documentation
- [ ] API contract documented in API_CONTRACTS.md
- [ ] Workflow documented if new (docs/workflows/)
- [ ] Architecture decisions documented if any were made

**A feature is NOT complete if any checkbox above is unchecked.** "The page renders" is not complete. "The API returns data" is not complete. Complete means: requirement met, integrated, tested, documented, and passing CI.

---

# H. Progress Tracking and Handover

## H1. Status Updates
- After completing each implementation task, update `IMPLEMENTATION_PLAN.md` by checking off the completed item: `- [x]`.
- After completing a phase, add a summary to `docs/PHASE_COMPLETION_LOG.md`:
  - Date completed
  - Tasks completed
  - Outstanding items (if any)
  - Blockers encountered and how they were resolved
  - Architectural decisions made during this phase
  - Test coverage summary

## H2. Handover-Ready State
- The codebase must always be in a state where another agent can continue without repeating analysis.
- This means:
  - `IMPLEMENTATION_PLAN.md` shows which tasks are done and which are pending
  - `docs/UNRESOLVED_DECISIONS.md` documents any open questions
  - `docs/ARCHITECTURE_DECISIONS.md` records why things were built the way they are
  - All TODO comments in code include: what needs to be done, which REQ it relates to, and which phase it's planned for
  - No "work in progress" code merged to main without feature flags or clear TODO markers

## H3. Commit Message Convention
```
{type}({scope}): {description}

Types: feat, fix, refactor, test, docs, chore, style
Scope: module name (auth, projects, planning, reporting, meal, participants, graduation, procurement, budget, training, tasks, risk, donors, chat, notifications, documents, feedback, geofence, forms, dashboard, config, shared)

Examples:
feat(projects): implement dual status approval workflow
fix(reporting): correct quarterly budget aggregation rounding
test(graduation): add pillar stage computation unit tests
docs(api): document procurement endpoints
refactor(shared): extract approval workflow into shared service
```

## H4. Branch Strategy
- `main` — production-ready, always green
- `develop` — integration branch, always green
- `feature/{phase}-{module}-{description}` — feature branches (e.g., `feature/p2-projects-approval-workflow`)
- `fix/{issue-id}-{description}` — bug fix branches
- All branches merge to `develop` via PR with review. `develop` merges to `main` at phase completion.

---

# I. Platform-Specific Rules

## I1. Multi-Language (English & Amharic)
- Every screen, menu, header, button, badge, table column header, tooltip, error message, notification, and email template MUST be fully translated in both English and Amharic (አማርኛ).
- The language toggle lives in the topbar and persists to user settings.
- Translation is NOT optional. If a translation key is missing, the page is incomplete.

## I2. Dual Calendar System
- All date inputs use the shared `app-dual-calendar-date-picker` component.
- All date displays show both Ethiopian (ዓ.ም.) and Gregorian (G.C.) dates.
- Dates are stored in the database as ISO 8601 (Gregorian). Ethiopian dates are computed at display time.
- Date filters and reports support both calendar systems.

## I3. Responsive Design
- Every layout must support: Desktop (≥1024px), Tablet (768px-1023px), Large Mobile (480px-767px).
- Sidebar: collapsible on tablet, slide-out drawer on mobile.
- Tables: horizontal scroll or card view on mobile.
- Forms: single column on mobile.
- **Test at 768px width before marking any page complete.**

## I4. Dark & Light Mode
- Both modes must work on every page.
- Use CSS custom properties for all colors (see D2).
- Test both modes before marking any page complete.

## I5. Offline Mobile (Flutter)
- Local SQLite (Drift) is the source of truth on mobile.
- All data entered offline queues for sync when connectivity returns.
- Sync status (synced/pending/conflict) is visible to the user.
- Conflicts are flagged and must be resolved by the user or a coordinator.

## I6. Security
- Auth tokens in HttpOnly cookies only. **ZERO localStorage for tokens.**
- All API endpoints authenticated (except explicitly public: vendor portal, password setup/reset, public feedback, public survey).
- CSRF protection on all state-changing operations.
- File uploads validated for type and size.
- SQL injection prevented via EF Core parameterized queries and Dapper parameterized queries. **Never concatenate user input into SQL.**
- Secrets never committed to source control. Use environment variables or user-secrets in development.

## I7. Performance
- All list endpoints paginated (default page size: 20, max: 100).
- Use materialized views for dashboard aggregations and system reports. Refresh via Hangfire on schedule (every 15 minutes for active dashboards).
- Use Redis/Valkey cache for: permission lookups, configuration, dropdown options, exchange rates. TTL: 5 minutes for permissions, 1 hour for config, 15 minutes for exchange rates.
- Avoid N+1 queries: use EF Core `.Include()` / `.ThenInclude()` for related data, or use explicit projection (`.Select()`).
- API response target: < 500ms for standard CRUD, < 2 seconds for complex aggregations, < 10 seconds for report generation.

---

# J. What NOT to Do (Anti-Patterns)

1. **Do not create a page that only displays static text or placeholder content.** Every page must connect to real backend data.
2. **Do not implement a feature "frontend only" or "backend only."** Both sides must be completed together.
3. **Do not create module-specific versions of shared components.** Enhance the shared component instead.
4. **Do not bypass RBAC for convenience** ("I'll add permissions later"). Permissions are part of the feature, not an afterthought.
5. **Do not use `any` type in TypeScript.** Define proper interfaces for all API responses and component inputs.
6. **Do not ignore compiler warnings.** Treat warnings as errors. Zero warnings policy.
7. **Do not comment out code and commit it.** Either the code is needed (keep it) or it's not (delete it). Use version control to recover old code.
8. **Do not create utility files named `helpers.ts`, `utils.ts`, or `common.ts` as catch-all dumping grounds.** Name files by their purpose.
9. **Do not duplicate database queries across handlers.** Extract common queries into repository methods or shared query services.
10. **Do not write tests that only verify "component renders without error."** Tests must verify behavior — inputs, outputs, state changes, edge cases.
