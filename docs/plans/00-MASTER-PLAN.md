# EthelPMS — Master Implementation Plan

**Version:** 3.0 (Supersedes IMPLEMENTATION_PLAN.md v2.0)
**Date:** October 15, 2026
**Team:** 2 developers (Backend lead + Frontend lead)
**Stack:** ASP.NET Core (.NET 10) + Angular 22 + Supabase PostgreSQL
**Repository:** https://github.com/Solomon-Bekele789/ethel-pms.git

> This is the single source of truth for what gets built, when, and by whom.
> For how to build it, see the per-module plans in `backend/`, `frontend/`, and `shared/`.
> For version numbers and packages, see `00-TECH-STACK.md`.
> For coding rules, see `00-CODING-STANDARDS.md`.

---

## How to Use This Plan

1. Read `00-DEVELOPER-SETUP.md` to get your environment running
2. Read `00-CODING-STANDARDS.md` for conventions and patterns
3. Check this file to find your current phase and assigned tasks
4. Read the relevant `shared/` plans for cross-cutting concerns you need
5. Read your module's `backend/` or `frontend/` plan for implementation-ready detail
6. Check `integration/API-CONTRACTS.md` for the API contract you implement or consume

---

## Team Structure

| Role | Responsibilities | Key Plans to Read |
|------|-----------------|-------------------|
| **Developer A (Backend)** | .NET modules, EF Core, API controllers, database migrations, background jobs, tests | `backend/BACKEND-OVERVIEW.md` + module-specific backend plans |
| **Developer B (Frontend)** | Angular components, pages, routing, state management, shared UI, E2E tests | `frontend/FRONTEND-OVERVIEW.md` + module-specific frontend plans |
| **Both** | Shared infrastructure, API contract reviews, integration testing, code reviews | `shared/*`, `integration/API-CONTRACTS.md` |

---

## Phase Overview

| Phase | Name | Weeks | Backend Tasks | Frontend Tasks | Dependencies |
|-------|------|-------|---------------|----------------|-------------|
| **0A** | Infrastructure Foundation | 1 | .sln, global.json, Directory.Build.props, CI/CD, secrets | Angular app.config, platform-console app, Nx libs | None |
| **0B** | Cross-Cutting Infrastructure | 2 | DbContexts, schemas, Finbuckle, Outbox, MediatR pipeline | HttpClient, interceptors, NgRx setup, i18n skeleton | 0A |
| **1** | Authentication & Organization | 3-4 | Identity entities, JWT, RBAC, RLS, offices, locations | Login, layout, user/role/office management, shared components | 0B |
| **2** | Core Project Management | 5-7 | Projects, Results Framework, Intervention Areas, Currency | Project CRUD, Results Framework tree, dashboards | 1 |
| **3** | Planning & DIPs | 8-9 | 5-level planning hierarchy, DIP engine | Planning calendar, DIP forms, Gantt view | 2 |
| **4** | Reporting System | 10-12 | 7 report types, approval workflow, aggregation, export | Report builder, approval UI, export dialogs | 3 |
| **5** | MEAL Module | 13-14 | MEAL plan, evaluation pipeline, GESI, safeguards | MEAL plan builder, indicator tracking, evaluation forms | 2 |
| **6** | Participants & Graduation | 15-18 | Participant profiles, dynamic forms, graduation model | Participant management, form builder, graduation tracker | 2, 5 |
| **7** | Procurement, Finance & Assets | 19-22 | Procurement lifecycle, fund accounting, asset management | Procurement wizard, journal entries, asset register | 2 |
| **8** | Training, Tasks, Risk, Donors | 23-25 | Training programs, task management, risk register, donor CRM | Training calendar, Kanban board, risk matrix, donor portal | 2 |
| **9** | Communication & Collaboration | 26-27 | Chat (SignalR), notifications, documents, feedback/GRM | Chat UI, notification center, document library, feedback forms | 1 |
| **10** | Dashboards & Polish | 28-29 | Dashboard projections, system reports, KM, settings | 9 dashboard types, report viewer, system settings | All above |
| **11** | AI & Mobile | 30-33 | AI service integration, RAG pipeline | AI assistant UI, Flutter mobile app | All above |
| **12** | Testing, Security & Deployment | 34-36 | Security audit, performance testing, deployment | E2E test suite, accessibility audit | All above |

---

## Phase 0A: Infrastructure Foundation (Week 1)

**Goal:** Both developers can clone, build, and run the full stack. CI catches broken builds.

### Backend Tasks (Developer A)

| # | Task | Plan Reference | Status |
|---|------|---------------|--------|
| 1 | Create `EthelPMS.sln` with all projects (~75 src + ~20 test) | `backend/BACKEND-OVERVIEW.md` | Pending |
| 2 | Create `global.json` pinning .NET 10 SDK | `00-TECH-STACK.md` | Pending |
| 3 | Create `Directory.Build.props` with shared properties | `00-CODING-STANDARDS.md` | Pending |
| 4 | Standardize EF Core to 10.0.12 across all projects | `00-TECH-STACK.md` | Pending |
| 5 | Fix project reference chain (Module.API → Module.Infrastructure) | `backend/BACKEND-OVERVIEW.md` | Pending |
| 6 | Remove Host → Module.Infrastructure direct references | `backend/BACKEND-OVERVIEW.md` | Pending |
| 7 | Move Supabase credentials to `dotnet user-secrets` | `shared/DATABASE-ARCHITECTURE.md` | Pending |
| 8 | Create `appsettings.Development.template.json` | `00-DEVELOPER-SETUP.md` | Pending |
| 9 | Delete all `Class1.cs` placeholder files | — | Pending |
| 10 | Add NuGet packages to all modules (MediatR, FluentValidation, AutoMapper, EF Core) | `00-TECH-STACK.md` | Pending |
| 11 | Create `.github/workflows/ci.yml` (build + test backend and frontend) | `00-DEVELOPER-SETUP.md` | Pending |
| 12 | Create `CLAUDE.md` with project rules | `00-CODING-STANDARDS.md` | Pending |

### Frontend Tasks (Developer B)

| # | Task | Plan Reference | Status |
|---|------|---------------|--------|
| 1 | Create `platform-console` Angular app in Nx | `frontend/FRONTEND-OVERVIEW.md` | Pending |
| 2 | Configure `app.config.ts` (HttpClient, Animations, NgRx, ngx-translate) | `frontend/FRONTEND-OVERVIEW.md` | Pending |
| 3 | Set up NgRx root store (auth slice, UI slice) | `frontend/FRONTEND-OVERVIEW.md` | Pending |
| 4 | Set up ngx-translate with `en.json` and `am.json` skeletons | `frontend/FRONTEND-OVERVIEW.md` | Pending |
| 5 | Configure HttpClient base URL interceptor | `shared/API-CONVENTIONS.md` | Pending |
| 6 | Configure error handling interceptor | `shared/API-CONVENTIONS.md` | Pending |
| 7 | Fix `tsconfig.base.json` to `strict: true` | `00-CODING-STANDARDS.md` | Pending |
| 8 | Fix `nx.json` defaultBase from `master` to `main` | — | Pending |
| 9 | Update `index.html` title to "EthelPMS" | — | Pending |
| 10 | Restructure `shared-core` lib (remove component, create services structure) | `frontend/FRONTEND-OVERVIEW.md` | Pending |
| 11 | Generate module feature libraries: `libs/modules/identity`, `libs/modules/projects` (skeletons) | `frontend/FRONTEND-OVERVIEW.md` | Pending |

### Exit Criteria (Both verify)

- [ ] `dotnet build EthelPMS.sln` succeeds with zero errors and zero warnings
- [ ] `npx nx build web` succeeds
- [ ] `npx nx build platform-console` succeeds
- [ ] CI pipeline (GitHub Actions) green on push to main
- [ ] No credentials in source control (verified by `git log --all -p | grep -c "password"` returns 0 for new commits)
- [ ] Both developers can clone fresh and build successfully following `00-DEVELOPER-SETUP.md`

---

## Phase 0B: Cross-Cutting Infrastructure (Week 2)

**Goal:** Every shared service and pattern is in place. Modules built in later phases just follow the established patterns.

### Backend Tasks (Developer A)

| # | Task | Plan Reference | Status |
|---|------|---------------|--------|
| 1 | Create per-module DbContexts with `HasDefaultSchema()` | `shared/DATABASE-ARCHITECTURE.md` | Pending |
| 2 | Create PostgreSQL schemas via DbUp (identity, projects, planning, ..., audit, reference) | `shared/DATABASE-ARCHITECTURE.md` | Pending |
| 3 | Create PostgreSQL roles per schema with restricted GRANT/REVOKE | `shared/DATABASE-ARCHITECTURE.md` | Pending |
| 4 | Create immutable `audit` schema with INSERT-only role | `shared/DATABASE-ARCHITECTURE.md` | Pending |
| 5 | Create shared `reference` schema (currencies, geography, calendar) | `shared/DATABASE-ARCHITECTURE.md` | Pending |
| 6 | Configure Finbuckle.MultiTenant (JWT claim strategy) | `shared/MULTI-TENANCY.md` | Pending |
| 7 | Implement Transactional Outbox (outbox table per module, Hangfire relay) | `shared/CROSS-MODULE-EVENTS.md` | Pending |
| 8 | Implement inbox tracking for idempotent consumers | `shared/CROSS-MODULE-EVENTS.md` | Pending |
| 9 | Configure MediatR pipeline with FluentValidation behavior | `backend/BACKEND-OVERVIEW.md` | Pending |
| 10 | Configure AutoMapper with module profile scanning | `backend/BACKEND-OVERVIEW.md` | Pending |
| 11 | Implement Audit.NET with PostgreSQL provider | `shared/DATABASE-ARCHITECTURE.md` | Pending |
| 12 | Create ArchUnitNET fitness tests (no cross-module deps) | `00-CODING-STANDARDS.md` | Pending |
| 13 | Create EF Core initial migration (empty baseline) | `shared/DATABASE-ARCHITECTURE.md` | Pending |
| 14 | Create DbUp runner for PostgreSQL objects (RLS, functions, triggers) | `shared/DATABASE-ARCHITECTURE.md` | Pending |
| 15 | Add health check with database connectivity | `backend/BACKEND-OVERVIEW.md` | Pending |
| 16 | Configure Serilog with correlation IDs | `backend/BACKEND-OVERVIEW.md` | Pending |
| 17 | Create `ICurrentUserService` interface and implementation | `shared/AUTHENTICATION.md` | Pending |
| 18 | Wire `AuditableEntityInterceptor` with `ICurrentUserService` | `shared/DATABASE-ARCHITECTURE.md` | Pending |

### Frontend Tasks (Developer B)

| # | Task | Plan Reference | Status |
|---|------|---------------|--------|
| 1 | Create core Angular services: `AuthService`, `TenantService`, `ThemeService` | `frontend/FRONTEND-OVERVIEW.md` | Pending |
| 2 | Create `AuthInterceptor` (handle 401 redirect, attach XSRF token for cookie auth) | `shared/AUTHENTICATION.md` | Pending |
| 3 | Create `TenantInterceptor` (attach tenant header) | `shared/MULTI-TENANCY.md` | Pending |
| 4 | Create `ErrorInterceptor` (global error handling, toast notifications) | `shared/API-CONVENTIONS.md` | Pending |
| 5 | Create `AuthGuard` and `PermissionGuard` | `shared/AUTHORIZATION-RBAC.md` | Pending |
| 6 | Create `HasPermissionDirective` and `HasRoleDirective` | `shared/AUTHORIZATION-RBAC.md` | Pending |
| 7 | Create shared `LoadingSpinnerComponent` | `shared/SHARED-COMPONENTS.md` | Pending |
| 8 | Create shared `ConfirmDialogComponent` | `shared/SHARED-COMPONENTS.md` | Pending |
| 9 | Create shared `StatusBadgeComponent` | `shared/SHARED-COMPONENTS.md` | Pending |
| 10 | Create shared `EmptyStateComponent` | `shared/SHARED-COMPONENTS.md` | Pending |
| 11 | Create shared `ErrorBoundaryComponent` | `shared/SHARED-COMPONENTS.md` | Pending |
| 12 | Set up environment configuration (dev/staging/prod base URLs) | `frontend/FRONTEND-OVERVIEW.md` | Pending |

### Exit Criteria (Both verify)

- [ ] Schema-per-module isolation verified (each module DbContext targets its own schema)
- [ ] Finbuckle resolves test tenants correctly (test with 2 test tenants)
- [ ] Outbox relay processes test events end-to-end
- [ ] ArchUnitNET tests prevent cross-module direct dependencies
- [ ] Health check at `/health` returns 200 with database status
- [ ] MediatR pipeline processes a test command through validation → handler → response
- [ ] Frontend `AuthGuard` blocks unauthenticated navigation
- [ ] Frontend `ErrorInterceptor` displays toast on API error
- [ ] All shared components render correctly in Storybook or a test page

---

## Phase 1: Authentication & Organization (Weeks 3-4)

**Detailed plan:** `shared/AUTHENTICATION.md`, `shared/AUTHORIZATION-RBAC.md`, `backend/identity/IDENTITY-BACKEND.md`, `frontend/identity/IDENTITY-FRONTEND.md`

### Requirements Covered

REQ-AUTH-001 to 012, REQ-RBAC-001 to 008, REQ-ORG-001 to 010, REQ-GEO-001 to 005, REQ-LOC-001 to 003, REQ-THEME-001, REQ-PLAT-001 to 008

### Backend Tasks (Developer A) — Summary

- Identity domain entities (User, Role, Permission, Organization, Office, Location, RefreshToken)
- PlatformAdmin entities (PlatformTenant, SubscriptionPackage, TenantAccessKey)
- ASP.NET Core Identity with custom User entity
- JWT token service (access + refresh)
- Permission-based authorization handler
- RLS policies for organization isolation
- Tenant resolution middleware
- Seed 200+ permissions and default role templates
- Auth, Users, Roles, Offices, Locations, Organizations controllers
- Email service (MailKit) with branded templates
- Unit + integration tests

### Frontend Tasks (Developer B) — Summary

- Login, Setup Password, Forgot/Reset Password pages
- Main Layout (sidebar + topbar + content area)
- User Management, Role Management, Office Management, Location Management pages
- Platform Console shell with Tenant Directory, Provisioning Wizard
- Shared components: DualCalendarDatePicker, LocationCascadeSelector, DataTable, CurrencyInput
- Theme service with CSS custom properties
- Calendar service (Ethiopian/Gregorian conversion)
- E2E tests: login flow, permission denied scenario

### API Contract (Handshake)

```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/setup-password
GET|POST|PUT|DELETE  /api/v1/users
GET|POST|PUT|DELETE  /api/v1/roles
GET|POST|PUT|DELETE  /api/v1/offices
GET|POST|PUT|DELETE  /api/v1/locations
GET|POST|PUT         /api/v1/organizations
GET|POST|PUT|DELETE  /api/v1/platform/tenants      (SuperAdmin only)
GET|PUT              /api/v1/platform/modules       (SuperAdmin only)
```

### Exit Criteria

- [ ] Users can login and receive JWT tokens
- [ ] Token refresh works without re-login
- [ ] 401 for unauthenticated, 403 for unauthorized
- [ ] RLS prevents cross-organization data access
- [ ] Location cascade selector works
- [ ] Dual calendar date picker works
- [ ] Dark/light theme toggle works
- [ ] EN/Amharic language toggle works
- [ ] All tests pass, CI green

---

## Phases 2-12: Summary

Each subsequent phase follows the same structure. Detailed per-module plans will be created in `backend/{module}/` and `frontend/{module}/` before that phase begins.

| Phase | Backend Module Plans Needed | Frontend Module Plans Needed |
|-------|---------------------------|----------------------------|
| 2 | projects, results-framework | projects, results-framework |
| 3 | planning | planning |
| 4 | reporting | reporting |
| 5 | meal | meal |
| 6 | participants, graduation | participants, graduation |
| 7 | procurement, fund-accounting, assets | procurement, fund-accounting, assets |
| 8 | training, tasks, risk, donors | training, tasks, risk, donors |
| 9 | chat, notifications, documents, feedback | chat, notifications, documents, feedback |
| 10 | dashboards | dashboards |
| 11 | ai-integration, mobile | ai-integration, mobile |
| 12 | (testing & deployment plan) | (testing & deployment plan) |

---

## Requirements Summary

**Total:** 413 requirements across 47 modules
**Priority breakdown:** 314 Must | 89 Should | 10 Could
**Status tracking:** Updated in `docs/REQUIREMENTS_MATRIX.md` as features are completed

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| C: drive space issues block development | High | Medium | Move all caches to E:, use Supabase cloud DB |
| .NET 10 preview breaks before GA (Nov 2026) | Low | High | Pin SDK version, test with each preview |
| 36-week timeline is aggressive for 2 developers | High | Medium | Prioritize Must requirements, defer Should/Could |
| Angular 22 library compatibility | Medium | Medium | Verify all planned libraries before Phase 1 |
| Supabase free tier limits | Low | Low | Monitor usage, upgrade to Pro if needed |

---

## Document Map

| What you need | Where to find it |
|--------------|-----------------|
| What to build and when | This file (`00-MASTER-PLAN.md`) |
| What versions and packages | `00-TECH-STACK.md` |
| How to code (conventions, patterns) | `00-CODING-STANDARDS.md` |
| How to run the project | `00-DEVELOPER-SETUP.md` |
| Authentication design | `shared/AUTHENTICATION.md` |
| Authorization/RBAC design | `shared/AUTHORIZATION-RBAC.md` |
| Database design | `shared/DATABASE-ARCHITECTURE.md` |
| API rules | `shared/API-CONVENTIONS.md` |
| Shared UI components | `shared/SHARED-COMPONENTS.md` |
| Module event flows | `shared/CROSS-MODULE-EVENTS.md` |
| Multi-tenancy design | `shared/MULTI-TENANCY.md` |
| Backend module implementation | `backend/{module}/{MODULE}-BACKEND.md` |
| Frontend module implementation | `frontend/{module}/{MODULE}-FRONTEND.md` |
| API endpoint contracts | `integration/API-CONTRACTS.md` |
| Module dependencies | `integration/MODULE-DEPENDENCY-MAP.md` *(to be created before Phase 2)* |
| Test patterns | `integration/TESTING-STRATEGY.md` *(to be created before Phase 2)* |
| All requirements | `docs/REQUIREMENTS_MATRIX.md` |
| Architecture decisions | `DECISIONS_LOG.md` |
| Architecture review | `docs/ARCHITECTURE_REVIEW.md` |
| Deferred features | `docs/DEFERRED_FEATURES.md` |
