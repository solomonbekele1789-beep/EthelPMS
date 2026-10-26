> **⚠ SUPERSEDED** — This architecture design is outdated. It shows a flat single-Domain structure.
> The authoritative architecture is the modular monolith (schema-per-module) described in:
> `docs/plans/00-CODING-STANDARDS.md`, `docs/plans/backend/BACKEND-OVERVIEW.md`, `docs/plans/shared/DATABASE-ARCHITECTURE.md`.

# DELIVERABLE 5: Unified Architecture Design

## 5.1 System Architecture Overview

```
                    ┌─────────────────────────────────────────────┐
                    │              Client Layer                    │
                    │  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
                    │  │ Angular  │ │ Flutter  │ │ Vendor      │ │
                    │  │ SPA      │ │ Mobile   │ │ Portal      │ │
                    │  └────┬─────┘ └────┬─────┘ └──────┬──────┘ │
                    └───────┼────────────┼──────────────┼────────┘
                            │            │              │
                    ┌───────┼────────────┼──────────────┼────────┐
                    │       ▼            ▼              ▼        │
                    │        API Gateway / Reverse Proxy          │
                    │           (YARP / Nginx)                    │
                    └───────────────────┬────────────────────────┘
                                        │
                    ┌───────────────────┼────────────────────────┐
                    │           ASP.NET Core Web API              │
                    │                                             │
                    │  ┌─────────────────────────────────────┐   │
                    │  │        Presentation Layer             │   │
                    │  │   Controllers / Minimal APIs          │   │
                    │  │   Middleware (Auth, CORS, Logging)     │   │
                    │  │   SignalR Hubs (Chat, Notifications)   │   │
                    │  └──────────────────┬────────────────────┘   │
                    │                     │                        │
                    │  ┌──────────────────┼────────────────────┐   │
                    │  │        Application Layer               │   │
                    │  │   Use Cases / Application Services     │   │
                    │  │   DTOs / Validators (FluentValidation) │   │
                    │  │   AutoMapper Profiles                  │   │
                    │  │   Background Jobs (Hangfire/Quartz)    │   │
                    │  └──────────────────┬────────────────────┘   │
                    │                     │                        │
                    │  ┌──────────────────┼────────────────────┐   │
                    │  │          Domain Layer                   │   │
                    │  │   Entities / Value Objects              │   │
                    │  │   Domain Services                       │   │
                    │  │   Repository Interfaces                 │   │
                    │  │   Domain Events                         │   │
                    │  └──────────────────┬────────────────────┘   │
                    │                     │                        │
                    │  ┌──────────────────┼────────────────────┐   │
                    │  │       Infrastructure Layer              │   │
                    │  │   EF Core DbContext + Repositories     │   │
                    │  │   Supabase Client (Storage, RLS)       │   │
                    │  │   Email Service (SMTP)                 │   │
                    │  │   FCM Push Notification Service        │   │
                    │  │   S3/Supabase Storage Service          │   │
                    │  │   Redis Cache Service                  │   │
                    │  │   KoboToolbox Integration Service      │   │
                    │  │   AI Provider Service                  │   │
                    │  └──────────────────┬────────────────────┘   │
                    └─────────────────────┼──────────────────────┘
                                          │
                    ┌─────────────────────┼──────────────────────┐
                    │          Supabase PostgreSQL                │
                    │   ┌─────────┐ ┌──────┐ ┌───────┐ ┌─────┐ │
                    │   │ Tables  │ │ RLS  │ │ Funcs │ │Views│ │
                    │   └─────────┘ └──────┘ └───────┘ └─────┘ │
                    └────────────────────────────────────────────┘
```

## 5.2 Backend Architecture (ASP.NET Core)

### Solution Structure
```
src/
├── NGO.PMS.Domain/                    # Domain Layer (no dependencies)
│   ├── Entities/
│   │   ├── Projects/                  # Project, ProjectRevision
│   │   ├── ResultsFramework/          # Outcome, Output, Indicator, Activity, Unit
│   │   ├── Planning/                  # AnnualPlan, QuarterlyPlan, MonthlyPlan, WeeklyPlan, DailyPlan, DIP
│   │   ├── Reporting/                 # Report, ActivityReport, QuarterlyReport, etc.
│   │   ├── MEAL/                      # MelPlan, ResultAndIndicator, EvaluationFinding, etc.
│   │   ├── Participants/              # Participant, Household, ParticipantIndicatorScore
│   │   ├── Graduation/               # IndicatorDomain, IndicatorCriteria
│   │   ├── Procurement/              # ProcurementRequest, Vendor, PurchaseOrder, etc.
│   │   ├── Budget/                    # BudgetCategory, BudgetLine, BudgetRequest, PayrollEntry
│   │   ├── Training/                  # TrainingSetting, TrainingTopic, Training, Attendance
│   │   ├── Tasks/                     # Task, TaskApprovalMapping, TaskComment
│   │   ├── Risk/                      # ProjectRisk, RiskMitigationAction
│   │   ├── Donors/                    # Donor, DonorComplianceRule, Agreement
│   │   ├── Forms/                     # Form, Submission
│   │   ├── Chat/                      # Conversation, ChatMessage
│   │   ├── Documents/                 # DocumentFolder, Document
│   │   ├── Feedback/                  # Feedback
│   │   ├── Notifications/            # Notification, NotificationPreference
│   │   ├── Organization/             # Office, OrganizationUnit, Location, InterventionArea
│   │   ├── Identity/                  # User (reference only), Role, Permission
│   │   └── Common/                    # BaseEntity, AuditableEntity, ISoftDeletable
│   ├── Enums/
│   ├── ValueObjects/                  # Money, GpsCoordinate, DateRange, EthiopianDate
│   ├── Events/                        # Domain events
│   ├── Interfaces/                    # IRepository<T>, IUnitOfWork, domain service interfaces
│   └── Services/                      # Domain services (PillarStageCalculator, RiskScoreCalculator, etc.)
│
├── NGO.PMS.Application/              # Application Layer
│   ├── Common/
│   │   ├── Interfaces/               # IApplicationDbContext, ICacheService, IEmailService, etc.
│   │   ├── Behaviors/                # ValidationBehavior, LoggingBehavior (MediatR pipeline)
│   │   ├── Mappings/                 # AutoMapper profiles
│   │   └── Exceptions/              # AppException, NotFoundException, ForbiddenException
│   ├── Features/                     # One folder per feature (vertical slices)
│   │   ├── Projects/
│   │   │   ├── Commands/            # CreateProject, UpdateProject, ApproveProject, etc.
│   │   │   ├── Queries/             # GetProject, ListProjects, GetProjectDashboard
│   │   │   ├── DTOs/
│   │   │   └── Validators/
│   │   ├── Planning/
│   │   ├── Reporting/
│   │   ├── MEAL/
│   │   ├── Participants/
│   │   ├── Graduation/
│   │   ├── Procurement/
│   │   ├── Budget/
│   │   ├── Training/
│   │   ├── Tasks/
│   │   ├── Risk/
│   │   ├── Donors/
│   │   ├── Forms/
│   │   ├── Chat/
│   │   ├── Notifications/
│   │   ├── Documents/
│   │   ├── Feedback/
│   │   ├── Import/
│   │   ├── Export/
│   │   └── AI/
│   └── Services/                    # Application services (ReportAggregation, CurrencyConverter, etc.)
│
├── NGO.PMS.Infrastructure/          # Infrastructure Layer
│   ├── Persistence/
│   │   ├── ApplicationDbContext.cs
│   │   ├── Configurations/          # EF Core entity configurations (one per entity)
│   │   ├── Migrations/
│   │   ├── Repositories/
│   │   ├── Interceptors/           # AuditableEntityInterceptor, SoftDeleteInterceptor
│   │   └── Seeds/                  # Role/Permission seeds, system data
│   ├── Services/
│   │   ├── EmailService.cs
│   │   ├── FcmNotificationService.cs
│   │   ├── StorageService.cs
│   │   ├── CacheService.cs
│   │   ├── KoboToolboxService.cs
│   │   ├── AiProviderService.cs
│   │   └── GeofenceService.cs
│   ├── Identity/
│   │   ├── JwtTokenService.cs
│   │   ├── CurrentUserService.cs
│   │   └── PermissionAuthorizationHandler.cs
│   └── BackgroundJobs/
│       ├── EvaluateProjectRisksJob.cs
│       ├── CheckContractExpiryJob.cs
│       └── SyncKoboFormsJob.cs
│
├── NGO.PMS.API/                     # Presentation Layer
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── ProjectsController.cs
│   │   ├── PlanningController.cs
│   │   ├── ReportsController.cs
│   │   ├── MealController.cs
│   │   ├── ParticipantsController.cs
│   │   ├── GraduationController.cs
│   │   ├── ProcurementController.cs
│   │   ├── BudgetController.cs
│   │   ├── TrainingController.cs
│   │   ├── TasksController.cs
│   │   ├── RiskController.cs
│   │   ├── DonorsController.cs
│   │   ├── FormsController.cs
│   │   ├── ChatController.cs
│   │   ├── NotificationsController.cs
│   │   ├── DocumentsController.cs
│   │   ├── FeedbackController.cs
│   │   ├── UsersController.cs
│   │   ├── OrganizationController.cs
│   │   ├── ImportController.cs
│   │   ├── ExportController.cs
│   │   ├── DashboardController.cs
│   │   ├── ConfigController.cs
│   │   └── PublicController.cs       # Vendor portal, public survey, password setup
│   ├── Hubs/
│   │   ├── ChatHub.cs
│   │   └── NotificationHub.cs
│   ├── Middleware/
│   │   ├── ExceptionHandlingMiddleware.cs
│   │   ├── RequestLoggingMiddleware.cs
│   │   ├── TenantResolutionMiddleware.cs
│   │   └── LocalizationMiddleware.cs
│   ├── Filters/
│   │   ├── PermissionAttribute.cs
│   │   └── OfficeDataScopeFilter.cs
│   └── Program.cs
│
└── NGO.PMS.Shared/                  # Shared kernel
    ├── Constants/
    ├── Extensions/
    ├── Helpers/                     # EthiopianCalendarHelper, HaversineCalculator
    └── Models/                      # Pagination, ApiResponse, ErrorResponse
```

## 5.3 Frontend Architecture (Angular)

```
src/
├── app/
│   ├── core/                        # Singleton services, guards, interceptors
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   ├── permission.guard.ts
│   │   │   ├── jwt.interceptor.ts
│   │   │   └── auth.models.ts
│   │   ├── services/
│   │   │   ├── api.service.ts       # Base HTTP client with error handling
│   │   │   ├── notification.service.ts
│   │   │   ├── signalr.service.ts   # WebSocket connection management
│   │   │   ├── cache.service.ts
│   │   │   ├── theme.service.ts
│   │   │   ├── localization.service.ts
│   │   │   └── calendar.service.ts  # Ethiopian/Gregorian conversion
│   │   ├── interceptors/
│   │   ├── guards/
│   │   └── models/                  # Shared interfaces, enums
│   │
│   ├── shared/                      # Reusable components, directives, pipes
│   │   ├── components/
│   │   │   ├── data-table/          # Configurable table with sort, filter, pagination
│   │   │   ├── form-builder/        # Dynamic form renderer
│   │   │   ├── approval-workflow/   # Reusable approval status/actions
│   │   │   ├── file-upload/
│   │   │   ├── date-picker/         # Dual calendar date picker
│   │   │   ├── location-cascade/    # Region > Zone > Woreda > Kebele selector
│   │   │   ├── user-selector/
│   │   │   ├── intervention-area-selector/
│   │   │   ├── currency-input/
│   │   │   ├── map-view/
│   │   │   ├── chart-wrapper/
│   │   │   ├── status-badge/
│   │   │   ├── confirm-dialog/
│   │   │   └── empty-state/
│   │   ├── directives/
│   │   │   ├── has-permission.directive.ts
│   │   │   └── has-role.directive.ts
│   │   ├── pipes/
│   │   │   ├── ethiopian-date.pipe.ts
│   │   │   ├── currency.pipe.ts
│   │   │   └── translate.pipe.ts
│   │   └── layouts/
│   │       ├── main-layout/
│   │       ├── sidebar/
│   │       └── topbar/
│   │
│   ├── features/                    # Lazy-loaded feature modules
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── results-framework/
│   │   ├── planning/
│   │   ├── reporting/
│   │   ├── meal/
│   │   ├── participants/
│   │   ├── graduation/
│   │   ├── procurement/
│   │   ├── budget/
│   │   ├── training/
│   │   ├── tasks/
│   │   ├── risk/
│   │   ├── donors/
│   │   ├── forms/
│   │   ├── chat/
│   │   ├── documents/
│   │   ├── feedback/
│   │   ├── notifications/
│   │   ├── users/
│   │   ├── organization/
│   │   ├── settings/
│   │   ├── import-export/
│   │   └── ai-assistant/
│   │
│   ├── store/                       # NgRx state management
│   │   ├── auth/
│   │   ├── ui/
│   │   └── app.state.ts
│   │
│   └── app.routes.ts
│
├── assets/
│   ├── i18n/                        # Translation files (en.json, am.json, etc.)
│   ├── icons/
│   └── themes/
│
└── environments/
```

## 5.4 Database Design (Supabase PostgreSQL)

### Key Design Decisions
- Use UUID primary keys for all tables (Supabase default, better for distributed systems)
- Use JSONB for flexible fields (form schemas, custom data, disaggregation)
- Implement Row-Level Security (RLS) for multi-tenant data isolation
- Use PostgreSQL enums for status fields
- Use materialized views for reporting aggregations
- Use database functions for complex calculations (pillar stage, risk score)
- Use triggers for audit logging
- Use indexes on all foreign keys, status fields, and commonly filtered columns

### RLS Strategy
```sql
-- Every main table has organization_id
-- RLS policy ensures users only see their organization's data
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON projects
  USING (organization_id = current_setting('app.current_org_id')::uuid);

-- Office-level scoping layered on top
CREATE POLICY "office_scope" ON projects
  USING (
    current_setting('app.office_level') = 'head_office'
    OR (current_setting('app.office_level') = 'area_office'
        AND area_office_id = current_setting('app.office_id')::uuid)
    OR (current_setting('app.office_level') = 'branch_office'
        AND branch_office_id = current_setting('app.office_id')::uuid)
  );
```

## 5.5 Authentication & Authorization

### Authentication Flow
1. User submits email/password to POST /api/auth/login
2. Server validates credentials via ASP.NET Core Identity + bcrypt
3. On success: generates JWT access token (6h) + refresh token (7d)
4. Tokens set as HttpOnly, Secure, SameSite=Strict cookies
5. Mobile clients receive tokens in response body (detected via User-Agent/header)
6. Refresh endpoint rotates both tokens
7. Optional SSO via Auth0/Entra ID using OpenID Connect

### Authorization Layers
1. **JWT Authentication** — ASP.NET Core [Authorize] attribute
2. **Role-Based** — Custom [RequireRole("SUPER_ADMIN", "PROJECT_MANAGER")] attribute
3. **Permission-Based** — Custom [RequirePermission("projects.approve")] attribute with IAuthorizationHandler
4. **Data Scoping** — Office-based query filtering via IQueryable extension + RLS
5. **Resource-Based** — Ownership checks (e.g., only report creator can edit draft)

### Permission Structure
```
Format: module.action
Examples: projects.create, projects.approve, reports.submit, procurement.verify_budget

Modules: projects, outcomes, outputs, indicators, activities, planning, reporting,
         meal, participants, graduation, procurement, budget, training, tasks,
         risk, donors, agreements, forms, chat, documents, feedback, users,
         roles, organization, locations, notifications, config, import, export,
         dashboard, ai, performance

Actions: create, read, update, delete, approve, reject, submit, review, verify,
         export, import, manage, assign, delegate
```

## 5.6 API Design Principles
- RESTful endpoints with consistent naming: /api/{version}/{resource}
- Versioned API (v1, v2) via URL path
- Standard response envelope: { data, meta, errors }
- Pagination: cursor-based for lists, offset for simple cases
- Filtering: query parameters with operators (?status=active&budget_gte=10000)
- Sorting: ?sort=created_at:desc
- Field selection: ?fields=id,title,status
- Rate limiting: 100 req/min for authenticated, 20/min for public
- OpenAPI/Swagger documentation auto-generated

---

# DELIVERABLE 6: Database Design

## 6.1 Core Tables Summary

The unified database contains approximately 120+ tables organized into these domains:

**Identity (7 tables):** organizations, users, roles, permissions, role_permissions, refresh_tokens, privilege_delegations

**Organization (8 tables):** offices, office_hierarchy, locations, regions, zones, woredas, kebeles, intervention_areas

**Projects (6 tables):** projects, project_revisions, project_intervention_areas, project_indicators, project_staff, project_beneficiary_disaggregation

**Results Framework (8 tables):** outcomes, outputs, indicators, activities, units, outcome_indicators, output_indicators, user_activities

**Planning (8 tables):** annual_plans, quarterly_plans, monthly_plans, weekly_plans, daily_plans, annual_plan_targets, quarterly_plan_targets, detailed_implementation_plans

**Reporting (16 tables):** reports (base), activity_reports, weekly_reports, monthly_reports, quarterly_reports, biannual_reports, annual_reports, incident_reports, quarterly_report_outcomes, quarterly_report_outputs, quarterly_report_activities, (same pattern for biannual/annual), report_approvals, report_assignments

**MEAL (14 tables):** mel_plans, mel_plan_reports, result_and_indicators, data_quality_verifications, indicator_progress_plans, woreda_indicator_progress_plans, learning_plans, mel_activities, mel_budgets, reporting_plans, communication_plans, evaluations, evaluation_findings, management_responses, evaluation_audit_logs, monitoring_plans, monitoring_reports

**Participants (6 tables):** participants, households, participant_projects, participant_indicator_scores, participant_photos, participant_custom_data

**Graduation (4 tables):** indicator_domains, indicator_criteria, graduation_approvals, graduation_history

**Pillar Modules (8 tables):** tvet_enrollments, iga_status_history, iga_progress_weekly, financial_inclusion_records, protection_cases, cash_assistances, medical_refunds, social_cohesion_records

**Procurement (16 tables):** procurement_plans, procurement_plan_items, procurement_requests, procurement_request_items, procurement_categories, procurement_methods, procurement_thresholds, vendors, bid_evaluations, purchase_orders, purchase_order_items, goods_receipts, supplier_invoices, payment_requests, procurement_contracts, procurement_approvals

**Budget (7 tables):** budget_categories, budget_lines, budget_requests, budget_approval_mappings, budget_approval_history, payroll_entries, currencies, exchange_rates

**Training (6 tables):** training_settings, training_topics, training_subtopics, trainings, training_attendance, group_trainings

**Tasks (4 tables):** tasks, task_approval_mappings, task_approval_history, task_comments

**Risk (3 tables):** project_risks, risk_mitigation_actions, risk_evaluation_history

**Donors (5 tables):** donors, donor_compliance_rules, agreements, agreement_types, co_financing_partners

**Forms (3 tables):** forms, form_submissions, form_submission_approvals

**Chat (6 tables):** conversations, conversation_participants, chat_messages, chat_message_reactions, chat_message_attachments, chat_read_receipts

**Documents (3 tables):** document_folders, documents, document_comments

**Notifications (3 tables):** notifications, notification_preferences, fcm_tokens

**Feedback (2 tables):** feedbacks, feedback_replies

**Geofence (2 tables):** geofence_alerts, geofence_settings

**System (5 tables):** audit_logs, system_logs, configurations, dashboard_configs, landing_page_configs

**AI (3 tables):** ai_conversations, ai_messages, ai_settings

## 6.2 Key Entity Relationships (ERD Summary)

```
Organization (1) ──── (*) Office ──── (*) User
                                            │
Project (*) ──── (1) Organization          │
    │                                       │
    ├── (*) Outcome ── (*) Output ── (*) Activity ── (*) User (assigned)
    │       │              │              │
    │       └── Indicator ─┘              └── DIP
    │
    ├── (*) AnnualPlan ── (*) QuarterlyPlan ── (*) MonthlyPlan ── (*) WeeklyPlan ── (*) DailyPlan
    │
    ├── (*) Report (Activity/Weekly/Monthly/Quarterly/Biannual/Annual/Incident)
    │
    ├── (*) MelPlan
    │
    ├── (*) ProjectRisk ── (*) MitigationAction
    │
    ├── (*) ProcurementRequest ── PO ── GR ── Invoice ── Payment
    │
    ├── (*) BudgetLine ── (*) BudgetRequest
    │
    ├── (*) Task
    │
    ├── (*) Cohort ── (*) Participant
    │                      │
    │                      ├── (*) FormSubmission
    │                      ├── (*) ParticipantIndicatorScore
    │                      ├── (*) TrainingAttendance
    │                      ├── (*) FinancialInclusionRecord
    │                      ├── (*) TvetEnrollment
    │                      ├── (*) ProtectionCase
    │                      └── (*) SocialCohesionRecord
    │
    ├── (*) Agreement ── (1) Donor
    │
    └── (*) Document
```

---

# DELIVERABLE 7: Module & Workflow Specifications

## 7.1 Project Management Module

**Purpose:** Central module for creating and managing NGO development/humanitarian projects.

**Entities:** Project, ProjectRevision, ProjectInterventionArea, ProjectIndicator, ProjectStaff

**Workflow:**
```
[Create Draft] → [Submit for Approval] → [Review]
                                            ├── [Approve] → [Active] → [InProgress/Suspended/Completed/Cancelled]
                                            └── [Reject] → [Revise] → [Resubmit]

Amendment: [Active Project] → [Create Amendment] → [Submit] → [Approve/Reject]
```

**API Endpoints:**
- POST /api/v1/projects — Create project
- GET /api/v1/projects — List projects (filtered by office scope)
- GET /api/v1/projects/{id} — Get project details
- PUT /api/v1/projects/{id} — Update project (draft/rejected only)
- POST /api/v1/projects/{id}/submit — Submit for approval
- POST /api/v1/projects/{id}/approve — Approve project
- POST /api/v1/projects/{id}/reject — Reject project
- PATCH /api/v1/projects/{id}/status — Change operational status
- POST /api/v1/projects/{id}/amendments — Create amendment
- GET /api/v1/projects/{id}/logframe — Get logical framework
- GET /api/v1/projects/{id}/dashboard — Project dashboard data

## 7.2 Planning Module

**Purpose:** Hierarchical operational planning from annual down to daily level.

**Workflow:**
```
[Annual Plan] → [Quarterly Plans (4)] → [Monthly Plans (max 3/quarter)]
                                          → [Weekly Plans (max 5/month)]
                                            → [Daily Plans (max 7/week)]

Each level: [Create] → [Submit] → [Approve/Reject]
Constraint: child dates must fall within parent dates; child budgets cannot exceed parent
```

**Key API Endpoints:**
- CRUD for each plan level: /api/v1/plans/{level} (annual, quarterly, monthly, weekly, daily)
- POST /api/v1/plans/{level}/{id}/approve
- CRUD for DIPs: /api/v1/activities/{activityId}/dips

## 7.3 Reporting Module

**Purpose:** Multi-type reporting with approval workflows and aggregation.

**Workflow (all 7 types):**
```
[Create Draft] → [Edit] → [Submit] → [Assigned Approver Reviews]
                                        ├── [Approve] → [Locked]
                                        └── [Reject with reason] → [Revise] → [Resubmit]

Multi-level: Level 1 Approve → Level 2 Review → ... → Final Approve
```

## 7.4 Participant & Graduation Module

**Purpose:** Individual participant tracking through a graduation pathway.

**Workflow:**
```
[Targeting] → [Enroll in Cohort] → [Active] → [Track across 4 Pillars]
                                                  │
                                     [Pillar Stage Auto-Computed]
                                                  │
                                     [Ready to Graduate (>=85% required met)]
                                                  │
                                     [Graduation Approval (irreversible)]
                                                  │
                                     [Graduated]
```

## 7.5 Procurement Module

**Purpose:** Full procurement lifecycle from planning to payment.

**Workflow:**
```
[Plan] → [Request] → [Budget Verify] → [Approve] → [RFQ/Proforma]
  → [Bid Evaluation] → [Award] → [Purchase Order] → [Issue PO]
  → [Goods Receipt] → [Three-Way Match] → [Supplier Invoice]
  → [Payment Request] → [Payment Approve] → [Contract Close]
```

## 7.6 Other Module Summaries

**MEAL:** 8-section plan creation → section-by-section completion → completeness scoring → submit → approve. Evaluation pipeline: create evaluation → record findings (DAC criteria) → management responses → progress updates → verification.

**Risk:** Auto-detect (schedule + financial) + manual register → score → assign mitigations → track → close. Dashboard with geographic heat map.

**Training:** Configure settings → define curriculum → schedule sessions → record attendance → compute training completion for graduation pillar.

**Budget:** Define categories → create lines per project → submit requests → multi-level approve → track actual vs budget → payroll tracking.

**Chat:** Create conversation → add participants → send messages → reactions/threading → presence tracking. 4 conversation types (direct/group/project/task).

**Forms:** Build form (JSON schema) → publish → field staff submits with GPS → geofence verify → approve/reject → data feeds into indicators and participant profiles.

---

# DELIVERABLE 8: API Design

## 8.1 API Endpoints Summary

All endpoints prefixed with /api/v1/. Authentication required unless noted as [Public].

### Auth
| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | /auth/login | [Public] | Login with email/password |
| POST | /auth/refresh | [Public] | Refresh JWT tokens |
| POST | /auth/logout | Authenticated | Logout and revoke tokens |
| POST | /auth/forgot-password | [Public] | Request password reset |
| POST | /auth/reset-password | [Public] | Reset password with token |
| POST | /auth/setup-password | [Public] | First-time account setup |

### Projects (13 endpoints)
| POST | /projects | projects.create |
| GET | /projects | projects.read |
| GET | /projects/{id} | projects.read |
| PUT | /projects/{id} | projects.update |
| DELETE | /projects/{id} | projects.delete |
| POST | /projects/{id}/submit | projects.update |
| POST | /projects/{id}/approve | projects.approve |
| POST | /projects/{id}/reject | projects.approve |
| PATCH | /projects/{id}/status | projects.update |
| POST | /projects/{id}/amendments | projects.update |
| GET | /projects/{id}/logframe | projects.read |
| GET | /projects/{id}/dashboard | dashboard.read |
| GET | /projects/{id}/intervention-areas | projects.read |

### Results Framework (16 endpoints)
CRUD for outcomes, outputs, indicators, activities (4 endpoints each) under /projects/{projectId}/...

### Planning (25 endpoints)
CRUD + approve for each of 5 plan levels. CRUD for DIPs under activities.

### Reporting (20 endpoints)
CRUD + submit + approve/reject for each report type. Aggregation suggestions. System reports.

### MEAL (18 endpoints)
MEL plan CRUD + section endpoints. Evaluation findings CRUD. Management responses. Monitoring plans/reports.

### Participants (15 endpoints)
CRUD + 360 profile + enrollment + targeting + import/export + stats + photo gallery.

### Graduation (8 endpoints)
Pipeline view + approve + bulk approve + pillar-specific scoring endpoints.

### Procurement (25 endpoints)
Full lifecycle endpoints for each stage. Vendor CRUD. Public proforma submission [Public].

### Budget (12 endpoints)
Categories, lines, requests, approvals, payroll. Import/export.

### Training (10 endpoints)
Settings, topics/subtopics, sessions, attendance.

### Tasks (10 endpoints)
CRUD + approval mappings + approve/reject + comments + dashboard stats.

### Other modules
Risk (8), Donors/Agreements (10), Forms (10), Chat (12), Documents (8), Feedback (6), Notifications (6), Users (8), Organization (10), Config (4), Dashboard (8), Import/Export (6), AI (6).

**Total: ~250+ API endpoints**

## 8.2 Standard Response Format

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 150,
    "totalPages": 8
  },
  "errors": null
}
```

Error response:
```json
{
  "data": null,
  "meta": null,
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Budget exceeds project limit",
      "field": "budget",
      "detail": "DIP budget (5000) would exceed activity budget (4000)"
    }
  ]
}
```
