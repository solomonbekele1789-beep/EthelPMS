# EthelPMS — Unified NGO Project Management System
# Complete Implementation Plan

**Version:** 2.0
**Date:** October 12, 2026 (v2 — merged Nati team architectural improvements)
**Stack:** ASP.NET Core 8 + Angular 18 + Supabase PostgreSQL
**Source Systems:** EECMY-DASSC-WEB (MERHA PMS) + EOTC-PMS (DICAC PMS)

> **Rule:** No phase may begin until all exit criteria of the preceding phase are satisfied. See `AI_AGENT_IMPLEMENTATION_RULES.md` for mandatory coding standards.

---

## Requirements Traceability

Every requirement carries a unique identifier: `REQ-{MODULE}-{NNN}`. The master traceability matrix is maintained in `docs/REQUIREMENTS_MATRIX.md`. Each requirement maps to: source system (A, B, or NEW), implementation phase, backend tasks, frontend tasks, database entities, API endpoints, tests, and acceptance criteria.

---

# PHASE 0: Project Bootstrap & Environment Setup
**Duration:** Week 1
**Objective:** Working development environment with CI/CD, empty project structure, and database connectivity.

## 0.1 Objectives & Expected Outcomes
- Monorepo initialized with backend, frontend, and shared documentation
- Local development environment runs with Docker Compose
- CI/CD pipeline builds and runs empty test suites
- Supabase project created with connection verified
- All team members can clone, build, and run locally

## 0.2 Tasks

### Backend
- [ ] Create ASP.NET Core 8 solution as **Modular Monolith** with schema-per-module:
  - `src/Shared/NGO.PMS.SharedKernel` — base entities, value objects, common interfaces
  - `src/Shared/NGO.PMS.Contracts` — published integration events + public query interfaces (cross-module API)
  - `src/Modules/Identity/` — Domain, Application, Infrastructure, API (schema: `identity`)
  - `src/Modules/Projects/` — Domain, Application, Infrastructure, API (schema: `projects`)
  - `src/Modules/Planning/` — Domain, Application, Infrastructure, API (schema: `planning`)
  - `src/Modules/Reporting/` — Domain, Application, Infrastructure, API (schema: `reporting`)
  - `src/Modules/MEAL/` — Domain, Application, Infrastructure, API (schema: `meal`)
  - `src/Modules/Participants/` — Domain, Application, Infrastructure, API (schema: `participants`)
  - `src/Modules/Procurement/` — Domain, Application, Infrastructure, API (schema: `procurement`)
  - `src/Modules/FundAccounting/` — Domain, Application, Infrastructure, API (schema: `fundacct`) ← NEW
  - `src/Modules/Assets/` — Domain, Application, Infrastructure, API (schema: `assets`) ← NEW
  - `src/Modules/Training/` — Domain, Application, Infrastructure, API (schema: `training`)
  - `src/Modules/Tasks/` — Domain, Application, Infrastructure, API (schema: `tasks`)
  - `src/Modules/Risk/` — Domain, Application, Infrastructure, API (schema: `risk`)
  - `src/Modules/Donors/` — Domain, Application, Infrastructure, API (schema: `donors`)
  - `src/Modules/Chat/` — Domain, Application, Infrastructure, API (schema: `chat`)
  - `src/Modules/Notifications/` — Domain, Application, Infrastructure, API (schema: `notifications`)
  - `src/Modules/Documents/` — Domain, Application, Infrastructure, API (schema: `documents`)
  - `src/Modules/Feedback/` — Domain, Application, Infrastructure, API (schema: `feedback`)
  - `src/Modules/Dashboard/` — read-only projections (schema: `reporting`)
  - `src/Host/NGO.PMS.API` — composition root, registers all modules
  - Each module has its own EF Core DbContext with `HasDefaultSchema()` and its own PostgreSQL role with GRANT only on its schema
  - Cross-module communication ONLY through `NGO.PMS.Contracts` (integration events + public interfaces)
  - NO cross-module database joins — enforced by ArchUnitNET tests in CI
- [ ] Configure EF Core 8 with Npgsql provider
- [ ] Configure Serilog with Console + File sinks
- [ ] Add Swagger/OpenAPI via Swashbuckle
- [ ] Add MediatR + FluentValidation pipeline
- [ ] Add AutoMapper
- [ ] Add Finbuckle.MultiTenant for tenant resolution (subdomain/header/JWT → cached ITenantInfo → connection string)
- [ ] Add Transactional Outbox Pattern: outbox table per module (same ACID transaction as business write), Hangfire poller for relay, inbox tracking for idempotent consumers
- [ ] Add Audit.NET for automatic audit trail with INSERT-only PostgreSQL role on `audit` schema
- [ ] Add Microsoft.RulesEngine for dynamic business policies (approval thresholds, budget ceilings per org)
- [ ] Add Stateless library for state machine workflows (procurement, graduation, approvals)
- [ ] Add NodaMoney for financial arithmetic (no floating-point rounding errors)
- [ ] Add OpenFeature (CNCF) for per-tenant feature flags (module/sub-feature toggles)
- [ ] Add ArchUnitNET architecture fitness tests (enforce no cross-module dependencies, dependency direction)
- [ ] Create base entity classes: `BaseEntity`, `AuditableEntity`, `ISoftDeletable`
- [ ] Create `AuditableEntityInterceptor` for automatic created_at/updated_at
- [ ] Create `SoftDeleteInterceptor`
- [ ] Create standard API response envelope: `ApiResponse<T>`, `PagedResponse<T>`, `ErrorResponse`
- [ ] Configure CORS for Angular dev server
- [ ] Add health check endpoint (/health)

### Frontend
- [ ] Create Angular 18 **Nx monorepo workspace** with:
  - `apps/web` — tenant-facing Angular app
  - `apps/platform-console` — SuperAdmin control plane (separate app, dark ops-console theme)
  - `libs/shared/ui` — shared UI components (reused by both apps)
  - `libs/shared/core` — shared services, interceptors, auth
  - `libs/modules/*` — 1:1 library per backend module (e.g., libs/modules/identity, libs/modules/projects)
- [ ] Configure Angular Material 18 with custom theme
- [ ] Set up NgRx Store (auth, ui slices)
- [ ] Set up @ngx-translate with en.json and am.json skeleton
- [ ] Configure HttpClient with base URL interceptor
- [ ] Set up OpenAPI-generated typed client (openapi-typescript + openapi-fetch) — auto-generate Angular HTTP services from Swagger spec
- [ ] Configure error handling interceptor
- [ ] Create shared module structure
- [ ] Create core module structure
- [ ] Create lazy-loaded feature module skeleton
- [ ] Set up Jest test runner replacing Karma

### Database
- [ ] Create Supabase project (or local PostgreSQL via Docker)
- [ ] Create initial EF Core migration (empty baseline)
- [ ] Configure connection string with environment variables
- [ ] Create DbUp runner for PostgreSQL-specific objects (functions, triggers, RLS)
- [ ] Create PostgreSQL schemas for each module (identity, projects, planning, reporting, meal, participants, procurement, fundacct, assets, training, tasks, risk, donors, chat, notifications, documents, feedback, audit, reference)
- [ ] Create PostgreSQL roles per module schema with restricted GRANT/REVOKE
- [ ] Create immutable `audit` schema with INSERT-only PostgreSQL role (no UPDATE/DELETE)
- [ ] Create shared `reference` schema for global read-only data (currencies, geography, Ethiopian calendar)

### Infrastructure
- [ ] Create Docker Compose file: api, angular-dev, postgres, valkey
- [ ] Create Dockerfile for API (multi-stage build)
- [ ] Create .github/workflows/ci.yml: build + test backend and frontend
- [ ] Create .editorconfig, .prettierrc, eslint config
- [ ] Create CLAUDE.md with project rules (references AI_AGENT_IMPLEMENTATION_RULES.md)

### Documentation
- [ ] Create `docs/REQUIREMENTS_MATRIX.md` (skeleton with REQ IDs from analysis)
- [ ] Create `docs/API_CONTRACTS.md` (skeleton)
- [ ] Create `docs/ARCHITECTURE_DECISIONS.md` (ADR log)
- [ ] Create `docs/MODULE_DEPENDENCY_MAP.md`

## 0.3 Acceptance Criteria
- `dotnet build` succeeds with zero warnings
- `ng build` succeeds
- `docker-compose up` brings up all services
- Swagger UI accessible at /swagger
- Health check returns 200 OK with DB status
- CI pipeline green on push
- ArchUnitNET tests pass (no cross-module dependency violations)
- Outbox table created and relay job scheduled
- Audit schema INSERT-only constraint verified
- Finbuckle tenant resolution working (test with two test tenants)
- OpenAPI spec generated and typed client compiles

## 0.4 Exit Criteria (Gate to Phase 1)
- [ ] All acceptance criteria met
- [ ] Repository access confirmed for all contributors
- [ ] CLAUDE.md committed with project rules
- [ ] Empty test suites run green in CI
- [ ] Schema-per-module isolation verified (each module DbContext targets its own schema)
- [ ] ArchUnitNET fitness tests green in CI
- [ ] Nx workspace builds both apps (web + platform-console)

---

# PHASE 1: Authentication, Authorization & Organization
**Duration:** Weeks 2-3
**Objective:** Full multi-tenant SaaS from day one. Users can register, login, receive JWT tokens, and be scoped to their organization and office. Organization onboarding, RLS-based tenant isolation, and full RBAC operational.

## 1.1 Prerequisites
- Phase 0 complete

## 1.2 Modules & Features
- REQ-AUTH-001 through REQ-AUTH-012: Authentication (login, logout, refresh, password setup, reset, SSO)
- REQ-RBAC-001 through REQ-RBAC-008: Roles, permissions, privilege delegation
- REQ-ORG-001 through REQ-ORG-010: Organizations, offices, office hierarchy, data scoping
- REQ-GEO-001 through REQ-GEO-005: Geographic hierarchy (Region, Zone, Woreda, Kebele)
- REQ-LOC-001 through REQ-LOC-003: Localization (EN/Amharic, dual calendar)
- REQ-THEME-001: Theme system (dark/light, organization branding)

## 1.3 Backend Tasks

### SuperAdmin Control Plane (NEW — `platform` schema)
- [ ] Create PlatformAdmin entities: PlatformTenant, SubscriptionPackage, TenantAccessKey, ModuleAccessGrant, SuperAdminAuditLog
- [ ] Implement TenantLifecycleService: state machine (Provisioned → Active → Expiring → Suspended → Terminated) using Stateless library
- [ ] Implement TenantOnboardingService: generate crypto-random one-time activation key (hash-only storage), guided activation wizard
- [ ] Implement ModuleAccessService: per-tenant module toggles (OpenFeature), live propagation via SignalR
- [ ] Implement PlatformRBAC: 4 roles (Platform Owner, Support Engineer, Billing Admin, Compliance Officer) — distinct claim namespace from tenant RBAC
- [ ] Implement PlatformTenantsController: tenant directory, provision, activate, suspend, terminate
- [ ] Implement PlatformAnalyticsService: active tenants by tier, module adoption rates, platform KPIs

### Tenant Identity & Organization
- [ ] Create domain entities: Organization, User, Role, Permission, RolePermission, RefreshToken, PrivilegeDelegation, Office, OfficeHierarchy, Location (Region/Zone/Woreda/Kebele)
- [ ] Create EF Core configurations for all entities
- [ ] Create migration for identity and organization tables
- [ ] Implement ASP.NET Core Identity with custom User entity
- [ ] Implement JWT token service (access 6h, refresh 7d, HttpOnly cookies)
- [ ] Implement mobile client detection (User-Agent/header) for token-in-body response
- [ ] Implement AuthController: Login, Logout, Refresh, ForgotPassword, ResetPassword, SetupPassword
- [ ] Implement permission-based authorization handler (IAuthorizationHandler)
- [ ] Create [RequirePermission] attribute
- [ ] Create [RequireRole] attribute
- [ ] Implement OfficeDataScopeFilter (IQueryable extension for office-based filtering)
- [ ] Implement RLS policies in PostgreSQL for organization isolation
- [ ] Implement CurrentUserService (extracts user context from JWT)
- [ ] Implement TenantResolutionMiddleware (sets app.current_org_id for RLS)
- [ ] Seed 200+ permissions organized by module
- [ ] Seed default role templates (Super Admin, Programs Director, Area Office Manager, Branch Office Manager, Field Worker, MEAL Manager, etc.)
- [ ] Implement UsersController: CRUD, role assignment, status toggle, resend invite
- [ ] Implement RolesController: CRUD, permission assignment
- [ ] Implement OfficesController: CRUD for area/branch offices
- [ ] Implement LocationsController: CRUD for geographic hierarchy (cascade)
- [ ] Implement OrganizationOnboardingService: create org, seed default roles/permissions, create admin user
- [ ] Implement OrganizationsController: org registration, org settings, branding (logo, colors)
- [ ] Implement email service (MailKit) with branded templates for: account setup, password reset, role assignment
- [ ] Write unit tests for: JwtTokenService, PermissionAuthorizationHandler, OfficeDataScopeFilter
- [ ] Write integration tests for: Auth endpoints (login success/failure, token refresh, 401/403 scenarios), RBAC enforcement

### Frontend Tasks

### Platform Console (SuperAdmin App — apps/platform-console)
- [ ] Build Platform Console shell (dark ops-console theme, separate from tenant app)
- [ ] Build Tenant Directory page (searchable/filterable list with status badges)
- [ ] Build Tenant Provisioning wizard (create tenant → generate access key → display QR)
- [ ] Build Module Access Matrix (AG Grid toggle matrix: tenant × module)
- [ ] Build Subscription Management page (package assignment, expiry tracking)

### Tenant App (apps/web)
- [ ] Create AuthService (login, logout, refresh, password operations)
- [ ] Create JwtInterceptor (attach cookies, handle 401 redirect)
- [ ] Create AuthGuard (route protection)
- [ ] Create PermissionGuard (permission-based route protection)
- [ ] Create HasPermissionDirective (*appHasPermission structural directive)
- [ ] Create HasRoleDirective
- [ ] Build Login page with bilingual support
- [ ] Build Setup Password page (token-based activation)
- [ ] Build Forgot/Reset Password pages
- [ ] Build Main Layout (sidebar + topbar + content area)
- [ ] Build Sidebar component with permission-gated menu items, collapse/expand state
- [ ] Build Topbar with user profile, language toggle (EN/AM), theme toggle (dark/light)
- [ ] Build User Management page (list, create, edit, role assignment, status toggle, resend invite)
- [ ] Build Role Management page (list, create, edit, permission matrix)
- [ ] Build Office Management page (area/branch offices CRUD)
- [ ] Build Location Management page (Region > Zone > Woreda > Kebele cascade CRUD)
- [ ] Create shared LocationCascadeSelector component
- [ ] Create shared DualCalendarDatePicker component (Ethiopian + Gregorian)
- [ ] Create shared DataTable component (AG Grid wrapper with standard config)
- [ ] Create shared ConfirmDialog component
- [ ] Create shared StatusBadge component
- [ ] Create shared EmptyState component
- [ ] Create shared LoadingSpinner component
- [ ] Create shared ErrorBoundary component
- [ ] Create shared CurrencyInput component
- [ ] Set up theme service with CSS custom properties (organization-specific branding)
- [ ] Set up calendar service (Ethiopian/Gregorian conversion)
- [ ] Write unit tests for: AuthService, PermissionGuard, DualCalendarDatePicker
- [ ] Write E2E tests (Playwright): Login flow, permission denied scenario

### Database Tasks
- [ ] Create RLS policies for organizations table
- [ ] Create trigger for updated_at timestamp
- [ ] Create audit_logs table with trigger for auth events
- [ ] Create database function for office hierarchy traversal (recursive CTE)

### API Contracts
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- POST /api/v1/auth/refresh
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password
- POST /api/v1/auth/setup-password
- GET/POST/PUT/DELETE /api/v1/users
- GET/POST/PUT/DELETE /api/v1/roles
- GET/POST/PUT/DELETE /api/v1/offices
- GET/POST/PUT/DELETE /api/v1/locations

## 1.4 Acceptance Criteria
- Users can login and receive HttpOnly cookie JWT tokens
- Mobile clients receive tokens in response body
- Token refresh works without re-login
- Password setup via email token works
- Password reset via email works
- 401 returned for unauthenticated requests
- 403 returned for unauthorized requests (wrong permission)
- Data scoping: area office user sees only their office data
- RLS prevents cross-organization data access
- Location cascade selector works (select Region → Zone auto-filters)
- Dual calendar date picker shows both Ethiopian and Gregorian dates
- Dark/light theme toggle works and persists
- EN/Amharic language toggle switches all UI text
- All tests pass, CI green

## 1.5 Documentation Updates
- [ ] Update REQUIREMENTS_MATRIX.md with REQ-AUTH, REQ-RBAC, REQ-ORG, REQ-GEO, REQ-LOC, REQ-THEME status
- [ ] Document all API contracts in API_CONTRACTS.md
- [ ] Record architecture decisions (JWT strategy, RLS approach, office scoping) in ARCHITECTURE_DECISIONS.md

## 1.6 Exit Criteria (Gate to Phase 2)
- [ ] All acceptance criteria met
- [ ] Auth integration tests pass (login, 401, 403, refresh, office scoping)
- [ ] E2E login flow passes in Playwright
- [ ] Shared components (DataTable, DatePicker, LocationCascade, ConfirmDialog, StatusBadge) are documented and reusable
- [ ] Code reviewed and merged to main

---

# PHASE 2: Core Project Management & Results Framework
**Duration:** Weeks 4-6
**Objective:** Projects can be created, approved, and linked to a full results framework (Outcomes > Outputs > Indicators > Activities). Intervention areas configured.

## 2.1 Prerequisites
- Phase 1 complete (auth, RBAC, organization, shared components)

## 2.2 Modules & Features
- REQ-PROJ-001 through REQ-PROJ-015: Project CRUD, dual status, approval, amendments, intervention area allocation
- REQ-RF-001 through REQ-RF-012: Outcomes, Outputs, Indicators, Activities, Units
- REQ-IA-001 through REQ-IA-005: Intervention area hierarchy and linkage
- REQ-CUR-001 through REQ-CUR-003: Currency, exchange rates, multi-currency
- REQ-TOC-001 through REQ-TOC-003: Theory of Change module (NEW — NGO best practice)
- REQ-LFA-001 through REQ-LFA-003: LogFrame Assumptions tracking linked to risk register (NEW — NGO best practice)
- REQ-STK-001 through REQ-STK-005: Stakeholder management (registry, engagement plan, communication log) (NEW — NGO best practice)
- REQ-EXIT-001 through REQ-EXIT-003: Sustainability/exit strategy planning with milestone tracking (NEW — NGO best practice)

## 2.3 Backend Tasks
- [ ] Create domain entities: Project, ProjectRevision, Outcome, Output, Indicator, Activity, Unit, InterventionArea (hierarchical), Currency, ExchangeRate, and all pivot/junction tables
- [ ] Create EF Core configurations with proper relationships, indexes, constraints
- [ ] Create migrations
- [ ] Implement ProjectsController with: CRUD, submit, approve/reject, status change, amendments
- [ ] Implement dual status validation (approval_status + operational status)
- [ ] Implement intervention area allocation with budget/beneficiary distribution validation
- [ ] Implement OutcomesController, OutputsController, ActivitiesController, IndicatorsController (all CRUD with parent-child enforcement)
- [ ] Implement UnitsController
- [ ] Implement InterventionAreasController (hierarchical CRUD with cascade selection support)
- [ ] Implement CurrencyController + ExchangeRateController
- [ ] Implement CurrencyConverterService (base amount calculation)
- [ ] Implement BelongsToOffice equivalent scoping on Project queries
- [ ] Implement ProjectLogframeQuery (returns full hierarchy for a project)
- [ ] Implement TheoryOfChangeController: CRUD for ToC elements (causal pathways from activities to impact), linking to results framework entities
- [ ] Implement LogFrame Assumptions: add Assumptions field at Outcome/Output/Activity level, link violated assumptions to ProjectRisk entries
- [ ] Implement StakeholdersController: stakeholder registry (name, type, influence, interest, engagement level), engagement plan, communication log
- [ ] Implement SustainabilityPlanController: exit strategy milestones, handover tracking, sustainability indicators
- [ ] Write unit tests for: dual status workflow, budget allocation validation, currency conversion
- [ ] Write integration tests for: project CRUD with office scoping, results framework hierarchy

### Frontend Tasks
- [ ] Build Project List page (filtered by office scope, search, status filters)
- [ ] Build Project Create/Edit form (all fields including beneficiary disaggregation, intervention areas)
- [ ] Build Project Detail page (summary, status actions, tabs for results framework)
- [ ] Build Project Approval workflow UI (submit/approve/reject with reason)
- [ ] Build Project Amendment dialog
- [ ] Build Intervention Area Allocation UI (budget + beneficiary distribution per area)
- [ ] Build Outcomes list/form (under project)
- [ ] Build Outputs list/form (under outcome)
- [ ] Build Activities list/form (under output, with user assignment)
- [ ] Build Indicators list/form (linked to outputs/outcomes)
- [ ] Build Units management (simple CRUD)
- [ ] Build Logframe View (hierarchical read-only view: Project > Outcomes > Outputs > Indicators > Activities)
- [ ] Build Intervention Area tree selector (shared component for all modules)
- [ ] Build Currency management (admin page)
- [ ] Build Exchange Rate management
- [ ] Build Theory of Change visual editor (causal pathway diagram linked to results framework)
- [ ] Build LogFrame Assumptions column in logframe view (with risk register link for violated assumptions)
- [ ] Build Stakeholder Registry page (list, create, edit with influence/interest matrix)
- [ ] Build Stakeholder Engagement Plan page
- [ ] Build Sustainability/Exit Strategy page (milestones, handover checklist, sustainability indicators)
- [ ] Create shared ApprovalWorkflow component (reusable for projects, reports, plans, procurement)
- [ ] Write unit tests for project forms, logframe view
- [ ] Write E2E test: Create project → submit → approve → view logframe

### Database Tasks
- [ ] Create partial indexes on projects (status = 'active')
- [ ] Create materialized view for project portfolio summary
- [ ] Apply RLS policies to project-related tables

### API Contracts (13 project endpoints + 16 results framework + 5 intervention area + 4 currency)

## 2.4 Acceptance Criteria
- Projects created with all fields (including beneficiary disaggregation)
- Dual status workflow: create → submit → approve/reject → status changes
- Approved projects cannot be edited without amendment
- Results framework hierarchy enforced (outcome requires project, output requires outcome, etc.)
- Intervention area allocation: budget and beneficiary totals validated against project caps
- Multi-currency: amounts converted to base currency automatically
- Office scoping: users see only their office's projects
- Logframe view shows complete hierarchy

## 2.5 Exit Criteria (Gate to Phase 3)
- [ ] All acceptance criteria met
- [ ] ApprovalWorkflow shared component tested and documented
- [ ] Intervention area tree selector works for all hierarchy levels
- [ ] E2E test for project lifecycle passes

---

# PHASE 3: Planning & Detailed Implementation Plans
**Duration:** Weeks 7-9
**Objective:** 5-level hierarchical planning fully operational with approval workflows. DIPs functional.

## 3.1 Prerequisites
- Phase 2 complete (projects, results framework)

## 3.2 Modules & Features
- REQ-PLAN-001 through REQ-PLAN-020: Annual, Quarterly, Monthly, Weekly, Daily plans
- REQ-DIP-001 through REQ-DIP-005: Detailed Implementation Plans
- REQ-PLAN-APPROVE-001 through REQ-PLAN-APPROVE-005: Plan approval workflows

## 3.3 Backend Tasks
- [ ] Create entities: AnnualPlan, QuarterlyPlan, MonthlyPlan, WeeklyPlan, DailyPlan, AnnualPlanTarget, QuarterlyPlanTarget, DetailedImplementationPlan
- [ ] Implement polymorphic plan linking (plan → outcome/output/activity)
- [ ] Implement cascading constraint validation:
  - Quarterly dates within annual dates
  - Monthly dates within quarterly dates (max 3 per quarter)
  - Weekly dates within monthly dates (max 5 per month)
  - Daily dates within weekly dates (max 7 per week)
  - Child budgets cannot exceed parent budget
- [ ] Implement DIP validation: budget cannot exceed activity budget, dates within activity dates, responsible user must be assigned to activity
- [ ] Implement plan approval workflow (draft → submitted → approved/rejected)
- [ ] Implement PlanningController for each level: CRUD + approve endpoints
- [ ] Implement DIPController: CRUD under activities
- [ ] Write unit tests for: cascading constraint validation, max-children validation, DIP budget validation
- [ ] Write integration tests for: plan hierarchy creation, approval workflow

### Frontend Tasks
- [ ] Build Annual Plan list/form (linked to project results framework)
- [ ] Build Quarterly Plan list/form (under annual plan)
- [ ] Build Monthly/Weekly/Daily plan forms with parent constraints displayed
- [ ] Build Plan Hierarchy View (expandable tree: annual → quarterly → monthly → weekly → daily)
- [ ] Build Plan Approval UI (using shared ApprovalWorkflow component)
- [ ] Build DIP list/form under activities
- [ ] Build Plan-Indicator target allocation form (annual + quarterly targets)
- [ ] Write E2E test: Create annual plan → break into quarterly → approve

### Database Tasks
- [ ] Create indexes on plan tables (parent_id, status, year/quarter)

## 3.4 Acceptance Criteria
- 5-level plan hierarchy creates and cascades correctly
- Date and budget constraints enforced at every level
- Max children per parent enforced (3 monthly/quarter, 5 weekly/month, 7 daily/week)
- DIP sub-activities cannot exceed activity budget
- Plan approval workflow works
- Indicator targets allocated across plan periods

## 3.5 Exit Criteria (Gate to Phase 4)
- [ ] All acceptance criteria met
- [ ] E2E plan lifecycle test passes

---

# PHASE 4: Reporting System
**Duration:** Weeks 10-12
**Objective:** All 7 report types operational with multi-level approval, aggregation, and export.

## 4.1 Prerequisites
- Phase 3 complete (planning provides data for reports)

## 4.2 Modules & Features
- REQ-RPT-001 through REQ-RPT-035: Activity, Weekly, Monthly, Quarterly, Bi-annual, Annual, Incident reports
- REQ-RPT-APPROVE-001 through REQ-RPT-APPROVE-010: Multi-level report approval
- REQ-RPT-AGG-001 through REQ-RPT-AGG-005: Report aggregation service
- REQ-RPT-EXPORT-001 through REQ-RPT-EXPORT-005: PDF, Excel, Word export
- REQ-SYS-RPT-001 through REQ-SYS-RPT-015: System reports center

## 4.3 Backend Tasks
- [ ] Create all report entities (16+ tables) with proper relationships
- [ ] Create ReportApproval entity (polymorphic: reportable_id, reportable_type, approver_id, level, status)
- [ ] Create ReportAssignment entity
- [ ] Implement 7 report controllers with: CRUD, submit, multi-level approve/reject
- [ ] Implement ReportAggregationService: aggregates lower-level report data into higher-level suggestions
- [ ] Implement report financial calculations: planned vs actual, variance, cumulative, burn rate, budget utilization
- [ ] Implement PDF export via QuestPDF (all report types)
- [ ] Implement Excel export via ClosedXML (all report types)
- [ ] Implement Word export via Open XML SDK (narrative reports: quarterly, annual)
- [ ] Implement system reports: SP contribution, progress/achievement, donor, government, management, beneficiary summary, portfolio, logframe, budget vs actual, activity completion, risk summary
- [ ] Implement ReportAssignment CRUD (who reports to whom, deadlines)
- [ ] Write unit tests for: aggregation service, financial calculations, approval level progression
- [ ] Write integration tests for: report submission → approval → export pipeline

### Frontend Tasks
- [ ] Build report form for each type (7 forms with type-specific fields)
- [ ] Build report list page with type filter, status filter, period filter
- [ ] Build report detail/view page
- [ ] Build multi-level approval UI (shows current level, history, approve/reject actions)
- [ ] Build report aggregation suggestion UI (pre-fill from lower-level data)
- [ ] Build PDF/Excel/Word export buttons with loading state
- [ ] Build System Reports Center page (15+ report types with parameter forms)
- [ ] Build Report Assignment management page
- [ ] Write E2E test: Create activity report → submit → approve → export PDF

### Database Tasks
- [ ] Create materialized views for: report aggregation queries, system report queries
- [ ] Create refresh schedule for materialized views (via Hangfire)

## 4.4 Acceptance Criteria
- All 7 report types: create, edit (draft only), submit, multi-level approve/reject
- Report aggregation suggests content for higher-level reports from lower-level data
- Financial calculations correct: planned, actual, variance, cumulative YTD, burn rate
- PDF, Excel, Word exports generate correctly for all report types
- System reports center produces all 15+ report types with correct data
- Only report creator can edit (draft status only)
- Multi-level approval progresses through configured levels

## 4.5 Exit Criteria (Gate to Phase 5)
- [ ] All acceptance criteria met
- [ ] Export documents verified visually (PDF layout, Excel formatting, Word structure)
- [ ] System reports return correct aggregated data

---

# PHASE 5: MEAL Module
**Duration:** Weeks 13-14
**Objective:** Complete MEAL plan lifecycle, evaluation pipeline, monitoring plans/reports.

## 5.1 Prerequisites
- Phase 4 complete (reporting infrastructure)

## 5.2 Modules & Features (including NEW NGO best practice enhancements)
- REQ-MEAL-001 through REQ-MEAL-025: Full MEAL plan lifecycle
- REQ-GESI-001 through REQ-GESI-005: Gender and Social Inclusion mainstreaming (NEW — NGO best practice): GESI analysis template at project level, gender markers on activities, GESI-disaggregated reporting, IASC Gender with Age Marker scoring
- REQ-ENV-001 through REQ-ENV-003: Environmental and Social Safeguards (NEW — optional): screening checklist, mitigation tracking

## 5.2.1 Backend Tasks
- [ ] Create all MEAL entities (14+ tables)
- [ ] Implement 8-section MEAL plan: Results & Indicators, Data Quality, Indicator Progress Plans, Learning Plan, MEL Activities, MEL Budget, Reporting Plan, Communication Plan
- [ ] Implement GESI Analysis entity: project-level GESI assessment template, gender markers on activities (scored 0-4 per IASC), GESI indicators in results framework
- [ ] Implement Environmental Safeguards entity (optional module): screening checklist, mitigation plan, compliance tracking
- [ ] Implement completeness scoring (0-100 across 8 dimensions)
- [ ] Implement evaluation pipeline: Evaluation → Findings (DAC criteria) → Management Responses → Progress Updates → Verification (separation of duties)
- [ ] Implement Monitoring Plan/Report with findings
- [ ] Implement MEL Budget with multi-currency and quarterly allocations
- [ ] Write unit tests for: completeness scoring, DAC criteria classification, verification separation of duties

### Frontend Tasks
- [ ] Build MEAL Plan wizard (8-section tabbed interface)
- [ ] Build completeness indicator (progress bar per section)
- [ ] Build Evaluation management (create, findings, management responses, verification)
- [ ] Build Monitoring Plan/Report forms
- [ ] Build MEL Dashboard
- [ ] Build GESI Analysis page (project-level assessment, gender marker scoring per activity)
- [ ] Build GESI-disaggregated report view (filter indicators by gender/age/disability)
- [ ] Build Environmental Safeguards screening checklist page (optional module)

## 5.3 Acceptance Criteria
- 8-section MEAL plan creates and completeness score computes correctly
- Evaluation → Findings → Management Response → Verification pipeline works
- Verifier cannot be the person responsible for or who created the response (separation of duties)
- MEL budget supports multi-currency with quarterly allocations

---

# PHASE 6: Participants, Cohorts & Graduation
**Duration:** Weeks 15-18
**Objective:** Individual participant tracking, 360-degree profiles, cohort management, dynamic form builder, 4-pillar graduation system fully operational.

## 6.1 Prerequisites
- Phase 2 complete (projects)

## 6.2 Modules & Features
- REQ-PART-001 through REQ-PART-015: Participant CRUD, 360 profile, import/export, targeting
- REQ-COH-001 through REQ-COH-005: Cohort management
- REQ-FORM-001 through REQ-FORM-012: Dynamic form builder
- REQ-GRAD-001 through REQ-GRAD-010: Graduation system
- REQ-FI-001 through REQ-FI-005: Financial Inclusion (Pillar 2)
- REQ-LIV-001 through REQ-LIV-008: Livelihood (Pillar 3)
- REQ-PROT-001 through REQ-PROT-008: Protection (Pillar 4)
- REQ-SC-001 through REQ-SC-005: Social Cohesion (Pillar 4)
- REQ-GEO-F-001 through REQ-GEO-F-005: Geofence verification
- REQ-BEN-001 through REQ-BEN-010: Aggregate beneficiary tracking

## 6.3 Backend Tasks
- [ ] Create participant entities: Participant, Household, ParticipantProject, ParticipantIndicatorScore
- [ ] Create cohort entity
- [ ] Create form entities: Form, Submission, FormSubmissionApproval
- [ ] Create graduation entities: IndicatorDomain, IndicatorCriteria, GraduationApproval
- [ ] Create pillar entities: FinancialInclusionRecord, TvetEnrollment, IgaStatusHistory, IgaProgressWeekly, ProtectionCase, CashAssistance, MedicalRefund, SocialCohesionRecord
- [ ] Create geofence entities: GeofenceAlert, GeofenceSetting
- [ ] Implement ParticipantsController: CRUD, 360-profile assembly, import/export, targeting pipeline, batch enrollment
- [ ] Implement auto-generated participant codes (ETHEL-P-NNNNNN)
- [ ] Implement vulnerability scoring with configurable dimensions
- [ ] Implement CohortsController: CRUD, enrollment, reassignment
- [ ] Implement FormsController: form schema CRUD, submission with GPS capture, approval for out-of-bounds
- [ ] Implement auto-participant creation from semantic-tagged form fields
- [ ] Implement GeofenceService: Haversine distance calculation, dual-location verification (home + work), configurable thresholds
- [ ] Implement GraduationService: pillar stage computation (>=80% = P4, >=50% = P3, >=25% = P2), ready-to-graduate check (P4 OR requiredMetPct >= 85%), irreversible graduation approval
- [ ] Implement FinancialInclusionService: 12-indicator scoring, monthly assessments
- [ ] Implement LivelihoodService: TVET enrollment, IGA status tracking with history, weekly progress
- [ ] Implement ProtectionService: case management (6 types), cash assistance, medical refunds, confidentiality
- [ ] Implement SocialCohesionService: 14-indicator scoring, monthly assessments
- [ ] Implement aggregate beneficiary disaggregation (separate from individual participant tracking)
- [ ] Implement Excel import with preview and duplicate detection
- [ ] Write unit tests for: Haversine calculation, pillar stage computation, vulnerability scoring, financial inclusion scoring, social cohesion scoring
- [ ] Write integration tests for: enrollment pipeline, form submission with GPS → geofence verification, graduation approval

### Frontend Tasks
- [ ] Build Participant List page (search, filters, status, pillar stage)
- [ ] Build Participant 360-degree Profile page (demographics, submissions, training attendance, photos, household, indicators)
- [ ] Build Participant Create/Edit form
- [ ] Build Import Wizard (upload, preview, duplicate detection, confirm)
- [ ] Build Targeting Center (vulnerability scoring, candidate selection, batch enrollment)
- [ ] Build Cohort Management page (list, create, enrollment, reassignment)
- [ ] Build Form Builder page (drag-and-drop question editor, 12+ question types, semantic tags, PMT criteria)
- [ ] Build Form Renderer page (dynamic form from JSON schema with GPS capture)
- [ ] Build Form Submission list with approval workflow
- [ ] Build Geofence Settings page
- [ ] Build Geofence Alert review page (map view, resolve/dismiss)
- [ ] Build Geofence Map visualization (participants, submissions, alerts)
- [ ] Build Graduation Dashboard (pipeline funnel: P1 → P2 → P3 → P4 → Graduated)
- [ ] Build Graduation Pipeline detail view (per-participant indicator breakdown)
- [ ] Build Graduation Approval page (single + bulk)
- [ ] Build Financial Inclusion assessment form and scorecard
- [ ] Build Livelihood tracker (TVET enrollment, IGA status, progress)
- [ ] Build Protection case management pages
- [ ] Build Social Cohesion assessment form
- [ ] Write E2E tests: Participant enrollment → form submission → geofence check → pillar scoring → graduation

## 6.4 Acceptance Criteria
- Individual participant tracking with 360-degree profiles works
- Aggregate beneficiary disaggregation works separately on results framework entities
- Form builder creates forms with all question types
- Form submissions capture GPS and trigger geofence verification
- Out-of-bounds submissions flagged and require approval
- Auto-participant creation from semantic-tagged form fields works
- Pillar stages auto-compute from indicator scores
- Graduation approval is irreversible
- All 4 pillar modules score correctly and feed into graduation computation
- Import/export with preview and duplicate detection works

---

# PHASE 7: Procurement, Budget, Finance, Fund Accounting & Assets
**Duration:** Weeks 19-22 (extended +1 week for new modules)
**Objective:** Complete procurement lifecycle (Stateless state machine), budget management, simplified fund accounting, asset register, finance dashboard.

## 7.1 Prerequisites
- Phase 2 complete (projects, currency)

## 7.2 Backend Tasks
- [ ] Create all procurement entities (16 tables)
- [ ] Create budget entities (7 tables)
- [ ] Implement full procurement lifecycle: Plan → Request → Budget Verify → Approve → RFQ/Proforma → Bid Evaluation → PO → GR → Invoice → Payment → Contract
- [ ] Implement ProcurementService: sequential reference numbers, budget verification, threshold verification with currency conversion, donor compliance check, three-way matching, weighted bid scoring
- [ ] ~~Vendor self-service portal~~ — EXCLUDED per decision D8
- [ ] Implement BudgetController: categories (hierarchical), lines, requests with multi-level approval
- [ ] ~~PayrollController~~ — EXCLUDED per decision D10 (use dedicated HR/payroll software)
- [ ] Implement FinanceDashboardService: aggregate spend from activity reports + procurement payments
- [ ] **Fund Accounting (NEW):**
  - [ ] Create fund accounting entities in `fundacct` schema: ChartOfAccounts, Account, FundType (unrestricted/temporarily restricted/permanently restricted), JournalEntry, JournalLine, FundRestriction, RestrictionRelease
  - [ ] Implement ChartOfAccountsService: hierarchical account tree, seeded templates per org type
  - [ ] Implement JournalEntryService: double-entry posting, debit/credit validation (must balance using NodaMoney), fund restriction tracking
  - [ ] Implement RestrictionReleaseService: track when restricted funds are spent per donor conditions
  - [ ] Implement FinancialStatementService: generate Statement of Financial Position, Statement of Activities, Statement of Cash Flows (all using Dapper for read performance)
  - [ ] Implement fund-to-grant linking (each grant maps to a restricted fund)
  - [ ] Use Microsoft.RulesEngine for configurable indirect cost allocation rules per org
- [ ] **Asset & Supply Chain (NEW):**
  - [ ] Create asset entities in `assets` schema: FixedAsset, AssetCategory, AssetDisposal, Vehicle, VehicleLog, MaintenanceRecord
  - [ ] Implement AssetRegisterService: CRUD, depreciation calculation (straight-line, reducing balance), donor tagging
  - [ ] Implement VehicleManagementService: vehicle log, fuel tracking, maintenance scheduling
  - [ ] Implement AssetDisposalService: disposal workflow with donor approval requirement
  - [ ] Link assets to procurement (PO → GR → Asset auto-creation)
- [ ] Write unit tests for: budget verification, threshold checking, three-way matching, bid scoring, double-entry balance validation, depreciation calculation

### Frontend Tasks
- [ ] Build Procurement Dashboard (pipeline status, spend analysis)
- [ ] Build procurement stage-by-stage forms (plan, request, vendor, RFQ, bid eval, PO, GR, invoice, payment, contract)
- [ ] Build Vendor Management page (CRUD, rating, blacklisting)
- [ ] ~~Build Public Vendor Portal~~ — EXCLUDED per decision D8
- [ ] Build Bid Comparison view
- [ ] Build Three-Way Match view
- [ ] Build Budget tree view (categories → lines)
- [ ] Build Budget Request workflow pages
- [ ] Build Finance Dashboard (budget vs actual, burn rate, currency breakdown)
- [ ] **Fund Accounting UI (NEW):**
  - [ ] Build Chart of Accounts tree view (hierarchical, collapsible)
  - [ ] Build Journal Entry form (double-entry with debit/credit columns, auto-balance check)
  - [ ] Build Fund Restrictions dashboard (restricted vs unrestricted balances, restriction release timeline)
  - [ ] Build Financial Statements viewer (Statement of Financial Position, Activities, Cash Flows — PDF/Excel export)
- [ ] **Asset Management UI (NEW):**
  - [ ] Build Asset Register page (AG Grid with filters by category, location, donor, status)
  - [ ] Build Asset Detail page (depreciation schedule, maintenance history, disposal record)
  - [ ] Build Vehicle Fleet dashboard (utilization, fuel costs, upcoming maintenance)
  - [ ] Build Asset Disposal workflow page (request → approve → record)
- [ ] Write E2E test: Procurement request → approve → PO → GR → three-way match → asset created

## 7.3 Acceptance Criteria
- Complete procurement lifecycle end-to-end (Stateless state machine)
- Budget and threshold validations enforce limits
- Three-way matching detects discrepancies with 0.01 tolerance (NodaMoney arithmetic)
- Finance dashboard aggregates from both activity reports and procurement
- Fund Accounting: journal entries always balance (debit = credit); restricted fund balances track correctly; restriction releases deduct from correct fund
- Asset Register: assets auto-created from goods receipt; depreciation calculates correctly; disposal requires approval
- Vehicle log: fuel and maintenance records linked to vehicle

---

# PHASE 8: Training, Tasks, Risk, Donors
**Duration:** Weeks 22-24
**Objective:** Remaining operational modules fully functional.

## 8.1 Modules
- Training Management (settings, curriculum, sessions, attendance)
- Task Management (multi-level approval, comments)
- Risk Management (register, scoring, automated evaluation, mitigation)
- Donor Compliance & Agreements (compliance rules, RAG status, agreements)

## 8.2 Acceptance Criteria
- Training attendance feeds into graduation Pillar 1
- Task approval chains work with configurable levels
- Automated risk evaluation detects schedule and financial risks
- Donor compliance RAG auto-computes from dates (Green/Amber/Red)

---

# PHASE 9: Communication & Collaboration
**Duration:** Weeks 25-26
**Objective:** Real-time chat, notifications, documents, feedback/GRM operational.

## 9.1 Modules
- Chat (SignalR, conversations, messages, reactions, presence)
- Notifications (3 channels: WebSocket, FCM, Email with per-user preferences)
- Document Management (folders, versioning, comments)
- Feedback/GRM — CHS-aligned Complaints and Feedback Mechanism (NEW — NGO best practice):
  - Acknowledge receipt within 24 hours (automated)
  - Response timeframe tracking with SLA configuration per feedback type
  - Escalation paths for safeguarding concerns (GBV, child protection, fraud)
  - Anonymous reporting with case tracking (no account required)
  - Confidential case handling with restricted access
  - Feedback categorization (complaint, suggestion, positive feedback, safeguarding concern)
  - Dashboard with response time metrics, resolution rate, category breakdown
- Data Protection & Responsible Data Management (NEW — NGO best practice):
  - REQ-DP-001: Data retention policies (configurable per entity type, auto-archive/delete after retention period)
  - REQ-DP-002: Consent tracking (record consent for data collection per participant, purpose-specific)
  - REQ-DP-003: Data anonymization tools (anonymize graduated/exited participant PII on demand)
  - REQ-DP-004: Right-to-erasure capability (delete participant PII on request while preserving aggregate statistics)
  - REQ-DP-005: Sensitive data access logging (log every access to protection cases, GBV records, medical data)
  - REQ-DP-006: Data classification labels (public, internal, confidential, restricted) on documents and records

## 9.2 Backend Tasks (additional for new features)
- [ ] Implement CHS-aligned Feedback: auto-acknowledge within 24h (Hangfire job), SLA tracking per feedback type, escalation triggers for safeguarding keywords, confidential case routing, response time metrics
- [ ] Implement Data Protection: data retention policy engine (configurable per entity, Hangfire scheduled archival), consent tracking model (participant, purpose, date, revocation), anonymization service (replace PII with hashed values preserving aggregate stats), erasure service (cascade PII deletion), sensitive access logger (middleware that logs reads of protection/medical/GBV records)

### Frontend Tasks (additional for new features)
- [ ] Build CHS Feedback dashboard (response time SLAs, resolution rate, escalation alerts)
- [ ] Build Safeguarding Escalation queue (restricted to designated safeguarding officers)
- [ ] Build Data Protection settings page (retention policies per entity, data classification)
- [ ] Build Consent Management page (per-participant consent records)
- [ ] Build Anonymization/Erasure tool (admin-only, with confirmation and audit trail)

## 9.3 Acceptance Criteria
- Real-time chat with presence tracking works across browser tabs
- Notifications delivered on all 3 channels respecting user preferences
- Bilingual notification templates (EN + Amharic)
- Document versioning maintains history
- Anonymous feedback submission works without authentication
- CHS: Feedback auto-acknowledged within 24h; SLA tracking shows overdue responses; safeguarding escalation triggers for sensitive keywords
- Data Protection: Retention policies auto-archive records after configured period; anonymization removes PII while keeping aggregate statistics; sensitive record access is logged

---

# PHASE 10: Dashboards, System Reports & Polish
**Duration:** Weeks 27-28
**Objective:** Executive dashboards, system reports center, import/export, settings.

## 10.1 Modules
- 9 dashboard types (Executive, Project Portfolio, Finance, MEAL, Participant, Risk, Procurement, Performance, Office-scoped)
- System Reports Center (15+ report types)
- Import/Export module (centralized wizard)
- Settings & Configuration (organization settings, module configs, report assignments, activity approval mappings)
- Knowledge Management / Lessons Learned Repository (NEW — NGO best practice): searchable repository linked to evaluation findings and learning plans, tagging by theme/sector/project, accessible across projects for institutional learning
- Partnership/Sub-grant Management (NEW — NGO best practice): sub-grantee registry, disbursement schedules, partner compliance monitoring, partner reporting obligations tracking

## 10.2 Acceptance Criteria
- All dashboards display correct aggregated data
- Dashboards are office-scoped (area/branch users see their data only)
- System reports export to PDF/Excel/Word
- Import wizard handles all importable entity types with preview
- Organization settings control feature activation, branding, calendar preference

---

# PHASE 11: Advanced Features & Mobile
**Duration:** Weeks 29-32
**Objective:** AI integration, Flutter mobile app, optional modules.

## 11.1 Modules
- AI Integration (Ollama default, configurable providers)
- Flutter Mobile App (auth, offline sync, forms, training, participants, notifications, chat)
- Landing Page / CMS (optional)

---

# PHASE 12: Testing, Security & Deployment
**Duration:** Weeks 33-34
**Objective:** Production-ready system with comprehensive testing, security audit, and deployment.

## 12.1 Tasks
- [ ] Full security audit (OWASP Top 10 checklist)
- [ ] Performance testing with NBomber (load test critical APIs)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Data migration scripts from both existing systems
- [ ] Production deployment (VPS + Supabase)
- [ ] Monitoring setup (Uptime Kuma, Serilog dashboards)
- [ ] User documentation
- [ ] API documentation (Swagger)
- [ ] Developer documentation
- [ ] Training materials

## 12.2 Exit Criteria
- [ ] All E2E tests pass against production-like environment
- [ ] Zero critical security findings
- [ ] API response times < 500ms for standard operations
- [ ] Report generation < 10s for complex aggregations
- [ ] Data migration validated (checksums match)
- [ ] Monitoring alerts configured and tested
