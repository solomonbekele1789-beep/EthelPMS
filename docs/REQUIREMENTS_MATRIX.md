# EthelPMS — Requirements Traceability Matrix
**Version:** 1.0
**Date:** 2026-10-12
**Source Legend:** A = MERHA PMS (System A), B = DICAC PMS (System B), A+B = Both systems, New = NGO best practice addition

---

## Phase 1: Authentication, Authorization & Organization (Weeks 2-3)

### Authentication (REQ-AUTH)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-AUTH-001 | User login with email/password, return JWT access + refresh tokens | A+B | 1 | Must | Pending |
| REQ-AUTH-002 | User logout with token revocation | A+B | 1 | Must | Pending |
| REQ-AUTH-003 | Token refresh using HttpOnly cookie (web) or body (mobile) | A+B | 1 | Must | Pending |
| REQ-AUTH-004 | Password setup via email invitation token for new users | A | 1 | Must | Pending |
| REQ-AUTH-005 | Forgot password — send reset email with time-limited token | A+B | 1 | Must | Pending |
| REQ-AUTH-006 | Reset password via email token | A+B | 1 | Must | Pending |
| REQ-AUTH-007 | Mobile client detection (User-Agent/header) for token-in-body response | A | 1 | Must | Pending |
| REQ-AUTH-008 | JWT access token with 6-hour expiry | A | 1 | Must | Pending |
| REQ-AUTH-009 | Refresh token with 7-day expiry, stored as HttpOnly cookie | A | 1 | Must | Pending |
| REQ-AUTH-010 | Account lockout after repeated failed login attempts | New | 1 | Should | Pending |
| REQ-AUTH-011 | Branded email templates for account setup, password reset, role assignment | A | 1 | Should | Pending |
| REQ-AUTH-012 | Optional SSO integration (future extensibility) | A | 1 | Could | Pending |

### Role-Based Access Control (REQ-RBAC)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-RBAC-001 | Permission-based authorization with 200+ granular permissions organized by module | A+B | 1 | Must | Pending |
| REQ-RBAC-002 | Role CRUD — create, edit, delete roles with permission assignment matrix | A+B | 1 | Must | Pending |
| REQ-RBAC-003 | Default role templates seeded on org creation (Super Admin, Programs Director, Area Office Manager, Branch Office Manager, Field Worker, MEAL Manager, etc.) | A | 1 | Must | Pending |
| REQ-RBAC-004 | User-role assignment with multi-role support | A+B | 1 | Must | Pending |
| REQ-RBAC-005 | [RequirePermission] and [RequireRole] attribute-based endpoint protection | A | 1 | Must | Pending |
| REQ-RBAC-006 | Frontend structural directives (*appHasPermission, *appHasRole) for UI gating | A | 1 | Must | Pending |
| REQ-RBAC-007 | Permission-gated sidebar menu items | A+B | 1 | Must | Pending |
| REQ-RBAC-008 | Privilege delegation — temporary permission escalation with expiry | A | 1 | Should | Pending |

### Organization Management (REQ-ORG)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-ORG-001 | Organization registration and onboarding (create org, seed defaults, create admin) | A+B | 1 | Must | Pending |
| REQ-ORG-002 | Organization settings: branding (logo, colors), calendar preference, feature toggles | A | 1 | Must | Pending |
| REQ-ORG-003 | Multi-tenant isolation via PostgreSQL RLS policies on organization_id | A+B | 1 | Must | Pending |
| REQ-ORG-004 | Office CRUD — area offices and branch offices under organization | A | 1 | Must | Pending |
| REQ-ORG-005 | Office hierarchy with configurable depth (default 3-level: Head/Area/Branch) | A+B | 1 | Must | Pending |
| REQ-ORG-006 | Office-based data scoping — users see only data from their office and below | A | 1 | Must | Pending |
| REQ-ORG-007 | TenantResolutionMiddleware setting app.current_org_id for RLS | New | 1 | Must | Pending |
| REQ-ORG-008 | CurrentUserService extracting user context (org, office, permissions) from JWT | A | 1 | Must | Pending |
| REQ-ORG-009 | Office hierarchy traversal via recursive CTE database function | A | 1 | Must | Pending |
| REQ-ORG-010 | User management: CRUD, role assignment, status toggle, resend invite | A+B | 1 | Must | Pending |

### Geographic Hierarchy (REQ-GEO)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-GEO-001 | Region CRUD (top-level geographic entity) | A+B | 1 | Must | Pending |
| REQ-GEO-002 | Zone CRUD (under Region) | A+B | 1 | Must | Pending |
| REQ-GEO-003 | Woreda CRUD (under Zone) | A+B | 1 | Must | Pending |
| REQ-GEO-004 | Kebele CRUD (under Woreda) | A+B | 1 | Must | Pending |
| REQ-GEO-005 | Cascade location selector component (select Region -> auto-filter Zones -> Woredas -> Kebeles) | A+B | 1 | Must | Pending |

### Localization (REQ-LOC)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-LOC-001 | Bilingual UI support: English and Amharic with runtime toggle | A+B | 1 | Must | Pending |
| REQ-LOC-002 | Dual calendar date picker showing both Ethiopian and Gregorian dates | B | 1 | Must | Pending |
| REQ-LOC-003 | Calendar preference configurable per organization (default ON for Ethiopian orgs) | B | 1 | Must | Pending |

### Theme (REQ-THEME)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-THEME-001 | Dark/light theme toggle with CSS custom properties, org-specific branding colors | A | 1 | Should | Pending |

---

## Phase 2: Core Project Management & Results Framework (Weeks 4-6)

### Project Management (REQ-PROJ)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-PROJ-001 | Project CRUD with all fields (title, code, dates, budget, currency, donor, location, sector) | A+B | 2 | Must | Pending |
| REQ-PROJ-002 | Dual status system: approval_status (pending/approved/rejected) + operational status (notStarted/inProgress/suspended/completed/cancelled) | A | 2 | Must | Pending |
| REQ-PROJ-003 | Project submission and approval workflow (draft -> submit -> approve/reject with reason) | A+B | 2 | Must | Pending |
| REQ-PROJ-004 | Project amendments — approved projects require amendment to edit, tracked via ProjectRevision | A | 2 | Must | Pending |
| REQ-PROJ-005 | Beneficiary disaggregation columns (direct/indirect by gender, age groups, PWD) | A | 2 | Must | Pending |
| REQ-PROJ-006 | Intervention area allocation per project with budget distribution | A | 2 | Must | Pending |
| REQ-PROJ-007 | Intervention area allocation — beneficiary distribution validation against project caps | A | 2 | Must | Pending |
| REQ-PROJ-008 | Office-scoped project queries (BelongsToOffice equivalent) | A | 2 | Must | Pending |
| REQ-PROJ-009 | Project list with filters: office scope, search, status, approval status | A+B | 2 | Must | Pending |
| REQ-PROJ-010 | Project detail page with summary, status actions, tabs for results framework | A | 2 | Must | Pending |
| REQ-PROJ-011 | Project portfolio materialized view for dashboard aggregation | A | 2 | Should | Pending |
| REQ-PROJ-012 | Project manager assignment and staff linkage | A | 2 | Must | Pending |
| REQ-PROJ-013 | Program pillar/thematic area categorization | A | 2 | Should | Pending |
| REQ-PROJ-014 | Project narrative fields: assumptions, risks, means of verification, scope | A | 2 | Should | Pending |
| REQ-PROJ-015 | Partial indexes on projects (status = 'active') for query performance | A | 2 | Should | Pending |

### Results Framework (REQ-RF)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-RF-001 | Outcome CRUD under project with code, description, baseline, target, beneficiary fields | A+B | 2 | Must | Pending |
| REQ-RF-002 | Output CRUD under outcome with code, description, baseline, target, beneficiary fields | A+B | 2 | Must | Pending |
| REQ-RF-003 | Activity CRUD under output with code, name, unit, dates, budget, lifetime target | A+B | 2 | Must | Pending |
| REQ-RF-004 | Indicator CRUD linked to outcomes and outputs via pivot tables | A+B | 2 | Must | Pending |
| REQ-RF-005 | Unit of measurement management (simple CRUD) | A+B | 2 | Must | Pending |
| REQ-RF-006 | User-activity assignment (who is responsible for each activity) | A | 2 | Must | Pending |
| REQ-RF-007 | Intervention area linkage at outcome, output, and activity level | A | 2 | Must | Pending |
| REQ-RF-008 | Logframe view — hierarchical read-only display: Project > Outcomes > Outputs > Indicators > Activities | A | 2 | Must | Pending |
| REQ-RF-009 | Parent-child enforcement (outcome requires project, output requires outcome, etc.) | A | 2 | Must | Pending |
| REQ-RF-010 | Project-level indicators with baseline and target | A | 2 | Must | Pending |
| REQ-RF-011 | Full logframe query returning complete hierarchy for a project | A | 2 | Must | Pending |
| REQ-RF-012 | Beneficiary disaggregation at outcome, output, and activity level | A | 2 | Should | Pending |

### Intervention Areas (REQ-IA)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-IA-001 | Hierarchical intervention area CRUD | A | 2 | Must | Pending |
| REQ-IA-002 | Intervention area tree selector shared component | A | 2 | Must | Pending |
| REQ-IA-003 | Intervention area cascade selection support in API | A | 2 | Must | Pending |
| REQ-IA-004 | Budget distribution validation per intervention area against project total | A | 2 | Must | Pending |
| REQ-IA-005 | Beneficiary distribution validation per intervention area | A | 2 | Must | Pending |

### Currency & Exchange Rates (REQ-CUR)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-CUR-001 | Currency CRUD with admin management page | A | 2 | Must | Pending |
| REQ-CUR-002 | Exchange rate management with historical rates | A | 2 | Must | Pending |
| REQ-CUR-003 | CurrencyConverterService — automatic base amount calculation from project currency | A | 2 | Must | Pending |

### Theory of Change (REQ-TOC)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-TOC-001 | Theory of Change CRUD — causal pathway elements from activities to impact | New | 2 | Should | Pending |
| REQ-TOC-002 | ToC visual editor — diagram linked to results framework entities | New | 2 | Should | Pending |
| REQ-TOC-003 | ToC elements linked to outcomes, outputs, and activities in results framework | New | 2 | Should | Pending |

### LogFrame Assumptions (REQ-LFA)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-LFA-001 | Assumptions field at Outcome, Output, and Activity level | New | 2 | Should | Pending |
| REQ-LFA-002 | Link violated assumptions to ProjectRisk entries in risk register | New | 2 | Should | Pending |
| REQ-LFA-003 | Assumptions column displayed in logframe view with risk register link | New | 2 | Should | Pending |

### Stakeholder Management (REQ-STK)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-STK-001 | Stakeholder registry CRUD (name, type, influence, interest, engagement level) | New | 2 | Should | Pending |
| REQ-STK-002 | Influence/interest matrix visualization | New | 2 | Should | Pending |
| REQ-STK-003 | Stakeholder engagement plan per project | New | 2 | Should | Pending |
| REQ-STK-004 | Communication log for stakeholder interactions | New | 2 | Could | Pending |
| REQ-STK-005 | Stakeholder linkage to project entities | New | 2 | Could | Pending |

### Exit/Sustainability Strategy (REQ-EXIT)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-EXIT-001 | Sustainability/exit strategy planning per project | New | 2 | Should | Pending |
| REQ-EXIT-002 | Exit strategy milestones with progress tracking | New | 2 | Should | Pending |
| REQ-EXIT-003 | Handover checklist and sustainability indicators | New | 2 | Should | Pending |

---

## Phase 3: Planning & Detailed Implementation Plans (Weeks 7-9)

### Planning (REQ-PLAN)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-PLAN-001 | Annual plan CRUD linked to project results framework (outcomes/outputs/activities) | A | 3 | Must | Pending |
| REQ-PLAN-002 | Quarterly plan CRUD under annual plan with quarter designation | A | 3 | Must | Pending |
| REQ-PLAN-003 | Monthly plan CRUD under quarterly plan (max 3 per quarter) | A | 3 | Must | Pending |
| REQ-PLAN-004 | Weekly plan CRUD under monthly plan (max 5 per month) | A | 3 | Must | Pending |
| REQ-PLAN-005 | Daily plan CRUD under weekly plan (max 7 per week) | A | 3 | Must | Pending |
| REQ-PLAN-006 | Cascading date constraints: child plan dates must fall within parent plan dates | A | 3 | Must | Pending |
| REQ-PLAN-007 | Cascading budget constraints: child plan budgets cannot exceed parent budget | A | 3 | Must | Pending |
| REQ-PLAN-008 | Max children per parent enforcement (3 monthly/quarter, 5 weekly/month, 7 daily/week) | A | 3 | Must | Pending |
| REQ-PLAN-009 | Plan approval workflow (draft -> submitted -> approved/rejected) | A | 3 | Must | Pending |
| REQ-PLAN-010 | Annual plan indicator target allocation | A | 3 | Must | Pending |
| REQ-PLAN-011 | Quarterly plan indicator target allocation | A | 3 | Must | Pending |
| REQ-PLAN-012 | Plan hierarchy view — expandable tree: annual -> quarterly -> monthly -> weekly -> daily | A | 3 | Must | Pending |
| REQ-PLAN-013 | Plan status tracking (notStarted/inProgress/completed/delayed/pending/cancelled) | A | 3 | Must | Pending |
| REQ-PLAN-014 | Plan beneficiary fields (male/female/total) at each level | A | 3 | Should | Pending |
| REQ-PLAN-015 | Plan progress percentage tracking | A | 3 | Should | Pending |
| REQ-PLAN-016 | Plan actual start/end date tracking alongside planned dates | A | 3 | Should | Pending |
| REQ-PLAN-017 | Polymorphic plan linking (plan -> outcome/output/activity) | A | 3 | Must | Pending |
| REQ-PLAN-018 | Plan-level approval using shared ApprovalWorkflow component | A | 3 | Must | Pending |
| REQ-PLAN-019 | Indexes on plan tables (parent_id, status, year/quarter) | A | 3 | Should | Pending |
| REQ-PLAN-020 | Configurable planning levels per organization (org chooses which levels to use) | A+B | 3 | Must | Pending |

### Detailed Implementation Plans (REQ-DIP)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-DIP-001 | DIP CRUD as sub-activities under activities | A | 3 | Must | Pending |
| REQ-DIP-002 | DIP budget validation — cannot exceed parent activity budget | A | 3 | Must | Pending |
| REQ-DIP-003 | DIP date validation — dates within parent activity dates | A | 3 | Must | Pending |
| REQ-DIP-004 | DIP responsible user must be assigned to parent activity | A | 3 | Must | Pending |
| REQ-DIP-005 | DIP list/form UI under activities | A | 3 | Must | Pending |

---

## Phase 4: Reporting System (Weeks 10-12)

### Reporting (REQ-RPT)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-RPT-001 | Activity report CRUD — per-activity with spent budget, achievement, progress description | A | 4 | Must | Pending |
| REQ-RPT-002 | Weekly report CRUD — period-based summary with financial fields | A | 4 | Must | Pending |
| REQ-RPT-003 | Monthly report CRUD — period-based summary with financial fields | A | 4 | Must | Pending |
| REQ-RPT-004 | Quarterly report CRUD — executive summary, financial section, challenges/lessons/adjustments, risk update | A | 4 | Must | Pending |
| REQ-RPT-005 | Bi-annual report CRUD — half-year period, same structure as quarterly | A | 4 | Must | Pending |
| REQ-RPT-006 | Annual report CRUD — reporting year, financial summary, narrative sections | A | 4 | Must | Pending |
| REQ-RPT-007 | Incident report CRUD — date/time, location, type, people involved, injuries, impact | A | 4 | Must | Pending |
| REQ-RPT-008 | Multi-level report approval (draft -> submitted -> under review -> approved/rejected) | A | 4 | Must | Pending |
| REQ-RPT-009 | Configurable approval chain per report type | A | 4 | Must | Pending |
| REQ-RPT-010 | Report approval history tracking (who approved/rejected at each level) | A | 4 | Must | Pending |
| REQ-RPT-011 | Only report creator can edit in draft status | A | 4 | Must | Pending |
| REQ-RPT-012 | Report aggregation service — suggest higher-level report content from lower-level data | A | 4 | Must | Pending |
| REQ-RPT-013 | Report financial calculations: planned vs actual, variance | A | 4 | Must | Pending |
| REQ-RPT-014 | Report financial calculations: cumulative YTD figures | A | 4 | Must | Pending |
| REQ-RPT-015 | Report financial calculations: burn rate, budget utilization rate | A | 4 | Must | Pending |
| REQ-RPT-016 | PDF export via QuestPDF for all report types | A | 4 | Must | Pending |
| REQ-RPT-017 | Excel export via ClosedXML for all report types | A | 4 | Must | Pending |
| REQ-RPT-018 | Word export via Open XML SDK for narrative reports (quarterly, annual) | A | 4 | Should | Pending |
| REQ-RPT-019 | Report assignment management — who reports to whom, deadlines | A | 4 | Must | Pending |
| REQ-RPT-020 | System report: Strategic Plan contribution report | A | 4 | Must | Pending |
| REQ-RPT-021 | System report: Progress/achievement report | A | 4 | Must | Pending |
| REQ-RPT-022 | System report: Donor report | A | 4 | Must | Pending |
| REQ-RPT-023 | System report: Government report | A | 4 | Must | Pending |
| REQ-RPT-024 | System report: Management report | A | 4 | Must | Pending |
| REQ-RPT-025 | System report: Beneficiary summary report | A | 4 | Must | Pending |
| REQ-RPT-026 | System report: Project portfolio report | A | 4 | Must | Pending |
| REQ-RPT-027 | System report: Logframe report | A | 4 | Must | Pending |
| REQ-RPT-028 | System report: Budget vs actual report | A | 4 | Must | Pending |
| REQ-RPT-029 | System report: Activity completion report | A | 4 | Must | Pending |
| REQ-RPT-030 | System report: Risk summary report | A | 4 | Must | Pending |
| REQ-RPT-031 | Materialized views for report aggregation queries | A | 4 | Should | Pending |
| REQ-RPT-032 | Materialized view refresh schedule via Hangfire | A | 4 | Should | Pending |
| REQ-RPT-033 | Report list page with type, status, and period filters | A | 4 | Must | Pending |
| REQ-RPT-034 | Report detail/view page with formatted display | A | 4 | Must | Pending |
| REQ-RPT-035 | Report aggregation suggestion UI — pre-fill from lower-level data | A | 4 | Should | Pending |

---

## Phase 5: MEAL Module (Weeks 13-14)

### MEAL (REQ-MEAL)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-MEAL-001 | MEAL plan CRUD with 8-section structure | A | 5 | Must | Pending |
| REQ-MEAL-002 | Section 1: Results & Indicators — goal/outcome/output level with baseline, target, MoV, data source, collection tool, frequency | A | 5 | Must | Pending |
| REQ-MEAL-003 | Section 2: Data Quality — per-indicator analysis method, quality risks, verification method, frequency | A | 5 | Must | Pending |
| REQ-MEAL-004 | Section 3: Indicator Progress Plans — year-by-year quarterly allocations, woreda-level breakdowns | A | 5 | Must | Pending |
| REQ-MEAL-005 | Section 4: Learning Plan — questions with purpose, focus area, data method, expected benefit | A | 5 | Must | Pending |
| REQ-MEAL-006 | Section 5: MEL Activities — typed as Monitoring/Evaluation/Learning, quarterly timeframe, budget | A | 5 | Must | Pending |
| REQ-MEAL-007 | Section 6: MEL Budget — hierarchical budget template with serial numbering, multi-currency | A | 5 | Must | Pending |
| REQ-MEAL-008 | Section 7: Reporting Plan | A | 5 | Must | Pending |
| REQ-MEAL-009 | Section 8: Communication Plan | A | 5 | Must | Pending |
| REQ-MEAL-010 | Completeness scoring (0-100 across 8 dimensions) | A | 5 | Must | Pending |
| REQ-MEAL-011 | MEAL plan wizard UI with 8-section tabbed interface | A | 5 | Must | Pending |
| REQ-MEAL-012 | MEAL plan approval workflow | A | 5 | Must | Pending |
| REQ-MEAL-013 | Evaluation CRUD with DAC criteria classification (Relevance, Coherence, Effectiveness, Efficiency, Impact, Sustainability) | A | 5 | Must | Pending |
| REQ-MEAL-014 | Evaluation findings recording | A | 5 | Must | Pending |
| REQ-MEAL-015 | Management response to evaluation findings | A | 5 | Must | Pending |
| REQ-MEAL-016 | Management response verification with separation of duties (verifier != creator/responsible) | A | 5 | Must | Pending |
| REQ-MEAL-017 | Evaluation progress updates tracking | A | 5 | Must | Pending |
| REQ-MEAL-018 | Monitoring plan CRUD | A | 5 | Must | Pending |
| REQ-MEAL-019 | Monitoring report with findings | A | 5 | Must | Pending |
| REQ-MEAL-020 | MEL budget with multi-currency and quarterly allocations | A | 5 | Must | Pending |
| REQ-MEAL-021 | Completeness indicator UI (progress bar per section) | A | 5 | Should | Pending |
| REQ-MEAL-022 | MEL Dashboard — overview of MEAL plan status, evaluation status, monitoring activities | A | 5 | Should | Pending |
| REQ-MEAL-023 | Evaluation audit log | A | 5 | Should | Pending |
| REQ-MEAL-024 | Disaggregation types configurable per indicator | A | 5 | Should | Pending |
| REQ-MEAL-025 | Learning plan yearly progress tracking | A | 5 | Should | Pending |

### Gender & Social Inclusion (REQ-GESI)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-GESI-001 | GESI analysis template at project level | New | 5 | Should | Pending |
| REQ-GESI-002 | Gender markers on activities (scored 0-4 per IASC Gender with Age Marker) | New | 5 | Should | Pending |
| REQ-GESI-003 | GESI indicators integrated into results framework | New | 5 | Should | Pending |
| REQ-GESI-004 | GESI-disaggregated reporting (filter indicators by gender/age/disability) | New | 5 | Should | Pending |
| REQ-GESI-005 | GESI analysis page and gender marker scoring UI | New | 5 | Should | Pending |

### Environmental & Social Safeguards (REQ-ENV)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-ENV-001 | Environmental screening checklist (optional module) | New | 5 | Could | Pending |
| REQ-ENV-002 | Environmental mitigation plan tracking | New | 5 | Could | Pending |
| REQ-ENV-003 | Environmental compliance tracking and reporting | New | 5 | Could | Pending |

---

## Phase 6: Participants, Cohorts & Graduation (Weeks 15-18)

### Participant Management (REQ-PART)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-PART-001 | Participant CRUD with comprehensive demographics | B | 6 | Must | Pending |
| REQ-PART-002 | Auto-generated participant codes (ETHEL-P-NNNNNN) | A+B | 6 | Must | Pending |
| REQ-PART-003 | 360-degree participant profile (demographics, submissions, training, photos, household, indicators) | B | 6 | Must | Pending |
| REQ-PART-004 | Household tracking and linkage | B | 6 | Must | Pending |
| REQ-PART-005 | Participant-project enrollment (many-to-many) | A+B | 6 | Must | Pending |
| REQ-PART-006 | Excel import with preview and duplicate detection | A+B | 6 | Must | Pending |
| REQ-PART-007 | Excel/CSV export of participant data | A+B | 6 | Must | Pending |
| REQ-PART-008 | Vulnerability scoring with configurable dimensions | B | 6 | Must | Pending |
| REQ-PART-009 | Targeting pipeline — candidate selection based on vulnerability scores | B | 6 | Must | Pending |
| REQ-PART-010 | Batch enrollment of targeted participants | B | 6 | Must | Pending |
| REQ-PART-011 | Participant list with search, filters (status, pillar stage, project) | B | 6 | Must | Pending |
| REQ-PART-012 | Participant indicator scores tracking | B | 6 | Must | Pending |
| REQ-PART-013 | Participant photo gallery | B | 6 | Should | Pending |
| REQ-PART-014 | Import wizard UI (upload, preview, duplicate detection, confirm) | B | 6 | Must | Pending |
| REQ-PART-015 | Targeting center UI (vulnerability scoring, candidate selection, batch enrollment) | B | 6 | Must | Pending |

### Cohort Management (REQ-COH)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-COH-001 | Cohort CRUD under projects | B | 6 | Must | Pending |
| REQ-COH-002 | Participant enrollment into cohorts | B | 6 | Must | Pending |
| REQ-COH-003 | Participant reassignment between cohorts | B | 6 | Must | Pending |
| REQ-COH-004 | Rolling cohort support with graduation date tracking | B | 6 | Should | Pending |
| REQ-COH-005 | Cohort statistics and summary view | B | 6 | Should | Pending |

### Dynamic Form Builder (REQ-FORM)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-FORM-001 | Form schema CRUD with JSON-based question definitions | B | 6 | Must | Pending |
| REQ-FORM-002 | 12+ question types (text, number, select, multi-select, date, GPS, photo, signature, etc.) | B | 6 | Must | Pending |
| REQ-FORM-003 | Drag-and-drop form builder UI | B | 6 | Must | Pending |
| REQ-FORM-004 | Dynamic form renderer from JSON schema | B | 6 | Must | Pending |
| REQ-FORM-005 | Form submission with GPS coordinate capture | B | 6 | Must | Pending |
| REQ-FORM-006 | Submission approval workflow for out-of-bounds submissions | B | 6 | Must | Pending |
| REQ-FORM-007 | Semantic tagging of form fields (for auto-participant creation) | B | 6 | Must | Pending |
| REQ-FORM-008 | Auto-participant creation from semantic-tagged form fields | B | 6 | Must | Pending |
| REQ-FORM-009 | PMT (Proxy Means Test) criteria support on form fields | B | 6 | Should | Pending |
| REQ-FORM-010 | Form submission list with status and approval tracking | B | 6 | Must | Pending |
| REQ-FORM-011 | Form publish/unpublish lifecycle | B | 6 | Must | Pending |
| REQ-FORM-012 | KoboToolbox form synchronization | B | 6 | Could | Pending |

### Graduation System (REQ-GRAD)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-GRAD-001 | Indicator domain and criteria framework CRUD | B | 6 | Must | Pending |
| REQ-GRAD-002 | Pillar stage auto-computation from indicator scores (>=80% = P4, >=50% = P3, >=25% = P2) | B | 6 | Must | Pending |
| REQ-GRAD-003 | Ready-to-graduate check (P4 OR requiredMetPct >= 85%) | B | 6 | Must | Pending |
| REQ-GRAD-004 | Graduation approval — single and bulk | B | 6 | Must | Pending |
| REQ-GRAD-005 | Irreversible graduation (once approved, cannot be reversed) | B | 6 | Must | Pending |
| REQ-GRAD-006 | Graduation dashboard — pipeline funnel: P1 -> P2 -> P3 -> P4 -> Graduated | B | 6 | Must | Pending |
| REQ-GRAD-007 | Per-participant indicator breakdown in pipeline detail view | B | 6 | Must | Pending |
| REQ-GRAD-008 | Participant indicator score recording and history | B | 6 | Must | Pending |
| REQ-GRAD-009 | Graduation pipeline statistics per cohort/project | B | 6 | Should | Pending |
| REQ-GRAD-010 | Graduation date tracking and reporting | B | 6 | Should | Pending |

### Financial Inclusion — Pillar 2 (REQ-FI)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-FI-001 | Financial inclusion record CRUD with 12-indicator scoring | B | 6 | Must | Pending |
| REQ-FI-002 | Monthly financial inclusion assessments | B | 6 | Must | Pending |
| REQ-FI-003 | Financial inclusion scorecard UI | B | 6 | Must | Pending |
| REQ-FI-004 | Financial inclusion score feeds into graduation pillar computation | B | 6 | Must | Pending |
| REQ-FI-005 | Financial inclusion trend analysis per participant | B | 6 | Should | Pending |

### Livelihood — Pillar 3 (REQ-LIV)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-LIV-001 | TVET enrollment tracking | B | 6 | Must | Pending |
| REQ-LIV-002 | IGA (Income Generating Activity) status tracking with history | B | 6 | Must | Pending |
| REQ-LIV-003 | IGA weekly progress recording | B | 6 | Must | Pending |
| REQ-LIV-004 | IGA status history with transition tracking | B | 6 | Must | Pending |
| REQ-LIV-005 | Livelihood tracker UI (TVET enrollment, IGA status, progress) | B | 6 | Must | Pending |
| REQ-LIV-006 | Livelihood score feeds into graduation pillar computation | B | 6 | Must | Pending |
| REQ-LIV-007 | Livelihood watchlist for at-risk participants | B | 6 | Should | Pending |
| REQ-LIV-008 | Livelihood trend analysis per participant | B | 6 | Should | Pending |

### Protection — Pillar 4a (REQ-PROT)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-PROT-001 | Protection case management CRUD (6 case types) | B | 6 | Must | Pending |
| REQ-PROT-002 | Cash assistance tracking per participant | B | 6 | Must | Pending |
| REQ-PROT-003 | Medical refund tracking | B | 6 | Must | Pending |
| REQ-PROT-004 | Case confidentiality with restricted access | B | 6 | Must | Pending |
| REQ-PROT-005 | Protection case status workflow | B | 6 | Must | Pending |
| REQ-PROT-006 | Protection case management pages UI | B | 6 | Must | Pending |
| REQ-PROT-007 | Protection score feeds into graduation pillar computation | B | 6 | Must | Pending |
| REQ-PROT-008 | Protection case statistics and reporting | B | 6 | Should | Pending |

### Social Cohesion — Pillar 4b (REQ-SC)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-SC-001 | Social cohesion record CRUD with 14-indicator scoring | B | 6 | Must | Pending |
| REQ-SC-002 | Monthly social cohesion assessments | B | 6 | Must | Pending |
| REQ-SC-003 | Social cohesion assessment form UI | B | 6 | Must | Pending |
| REQ-SC-004 | Social cohesion score feeds into graduation pillar computation | B | 6 | Must | Pending |
| REQ-SC-005 | Social cohesion trend analysis per participant | B | 6 | Should | Pending |

### Aggregate Beneficiary Tracking (REQ-BEN)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-BEN-001 | Aggregate beneficiary counts at project level (separate from individual participants) | A | 6 | Must | Pending |
| REQ-BEN-002 | Beneficiary disaggregation by gender (male/female) | A | 6 | Must | Pending |
| REQ-BEN-003 | Beneficiary disaggregation by age groups (under5, children, youth, adults) | A | 6 | Must | Pending |
| REQ-BEN-004 | Beneficiary disaggregation for PWD (persons with disabilities) | A | 6 | Must | Pending |
| REQ-BEN-005 | Direct vs indirect beneficiary classification | A | 6 | Must | Pending |
| REQ-BEN-006 | Beneficiary counts at outcome, output, and activity level | A | 6 | Must | Pending |
| REQ-BEN-007 | UN age band disaggregation (0-4, 5-9, 10-14, ... 65+) | A | 6 | Should | Pending |
| REQ-BEN-008 | Beneficiary totals validation against project caps | A | 6 | Must | Pending |
| REQ-BEN-009 | Beneficiary summary reporting | A | 6 | Must | Pending |
| REQ-BEN-010 | Per-project mode selection: aggregate only vs individual tracking vs both | A+B | 6 | Must | Pending |

---

## Phase 7: Procurement, Budget & Finance (Weeks 19-21)

### Procurement (REQ-PROC)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-PROC-001 | Procurement plan CRUD with items | A | 7 | Must | Pending |
| REQ-PROC-002 | Procurement request creation with budget verification | A | 7 | Must | Pending |
| REQ-PROC-003 | Procurement approval workflow with threshold-based rules | A | 7 | Must | Pending |
| REQ-PROC-004 | Vendor management CRUD (rating, blacklisting) | A+B | 7 | Must | Pending |
| REQ-PROC-005 | RFQ/Proforma request creation and tracking | A+B | 7 | Must | Pending |
| REQ-PROC-006 | Bid evaluation with weighted scoring | A | 7 | Must | Pending |
| REQ-PROC-007 | Purchase order generation | A+B | 7 | Must | Pending |
| REQ-PROC-008 | Goods receipt recording | A+B | 7 | Must | Pending |
| REQ-PROC-009 | Supplier invoice processing | A | 7 | Must | Pending |
| REQ-PROC-010 | Payment request with approval | A | 7 | Must | Pending |
| REQ-PROC-011 | Three-way matching (PO vs GR vs Invoice) with 0.01 tolerance | A | 7 | Must | Pending |
| REQ-PROC-012 | Procurement contract management | A | 7 | Must | Pending |
| REQ-PROC-013 | Sequential reference number generation per procurement type | A | 7 | Must | Pending |
| REQ-PROC-014 | Donor compliance check on procurement | A | 7 | Must | Pending |
| REQ-PROC-015 | Procurement dashboard (pipeline status, spend analysis) | A | 7 | Must | Pending |

### Budget Management (REQ-BUD)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-BUD-001 | Hierarchical budget category CRUD | A | 7 | Must | Pending |
| REQ-BUD-002 | Budget line CRUD under categories | A | 7 | Must | Pending |
| REQ-BUD-003 | Budget request workflow with multi-level approval | A | 7 | Must | Pending |
| REQ-BUD-004 | Budget tree view UI (categories -> lines) | A | 7 | Must | Pending |
| REQ-BUD-005 | Budget vs actual aggregation from activity reports + procurement payments | A | 7 | Must | Pending |
| REQ-BUD-006 | Finance dashboard (budget vs actual, burn rate, currency breakdown) | A | 7 | Must | Pending |
| REQ-BUD-007 | Budget import/export | A | 7 | Should | Pending |
| REQ-BUD-008 | Budget threshold verification with currency conversion | A | 7 | Must | Pending |
| REQ-BUD-009 | Budget utilization rate calculation | A | 7 | Must | Pending |
| REQ-BUD-010 | Multi-currency budget support with base currency normalization | A | 7 | Must | Pending |

---

## Phase 8: Training, Tasks, Risk, Donors (Weeks 22-24)

### Training Management (REQ-TRN)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-TRN-001 | Training settings configuration (types, categories) | A+B | 8 | Must | Pending |
| REQ-TRN-002 | Training curriculum builder (topics and subtopics) | A+B | 8 | Must | Pending |
| REQ-TRN-003 | Training session scheduling and management | A+B | 8 | Must | Pending |
| REQ-TRN-004 | Training attendance tracking (registered + walk-in participants) | A+B | 8 | Must | Pending |
| REQ-TRN-005 | Training attendance feeds into graduation Pillar 1 computation | B | 8 | Must | Pending |
| REQ-TRN-006 | Training session calendar view | A | 8 | Should | Pending |
| REQ-TRN-007 | Topic progress dashboard | A | 8 | Should | Pending |
| REQ-TRN-008 | Training completion certificates/tracking | A | 8 | Could | Pending |

### Task Management (REQ-TSK)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-TSK-001 | Task CRUD with assignment and due dates | A+B | 8 | Must | Pending |
| REQ-TSK-002 | Multi-level task approval with configurable chains | A | 8 | Must | Pending |
| REQ-TSK-003 | Task approval mapping configuration (who approves whom) | A | 8 | Must | Pending |
| REQ-TSK-004 | Task comments and discussion thread | A | 8 | Must | Pending |
| REQ-TSK-005 | Task progress tracking with percentage and status | A+B | 8 | Must | Pending |
| REQ-TSK-006 | Task board view (kanban and list views) | B | 8 | Should | Pending |
| REQ-TSK-007 | Task dashboard statistics | A | 8 | Should | Pending |
| REQ-TSK-008 | Task approval history log | A | 8 | Must | Pending |

### Risk Management (REQ-RISK)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-RISK-001 | Project risk register CRUD (description, likelihood, impact, scoring) | A | 8 | Must | Pending |
| REQ-RISK-002 | Risk mitigation action assignment and tracking | A | 8 | Must | Pending |
| REQ-RISK-003 | Automated risk evaluation — detect schedule risks from plan delays | A | 8 | Must | Pending |
| REQ-RISK-004 | Automated risk evaluation — detect financial risks from budget variance | A | 8 | Must | Pending |
| REQ-RISK-005 | Risk evaluation history tracking | A | 8 | Must | Pending |
| REQ-RISK-006 | Risk matrix visualization (likelihood x impact grid) | A | 8 | Must | Pending |
| REQ-RISK-007 | Geographic risk aggregation and dashboard | A | 8 | Should | Pending |
| REQ-RISK-008 | Risk summary reporting integration | A | 8 | Must | Pending |

### Donor Compliance & Agreements (REQ-DON)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-DON-001 | Donor CRUD (name, contact, requirements, compliance rules) | A | 8 | Must | Pending |
| REQ-DON-002 | Donor compliance rules with auto RAG status (Green/Amber/Red based on dates) | A | 8 | Must | Pending |
| REQ-DON-003 | Agreement CRUD with lifecycle management (types, dates, amounts) | A | 8 | Must | Pending |
| REQ-DON-004 | Agreement approval workflow | A | 8 | Must | Pending |
| REQ-DON-005 | Co-financing partner tracking | A | 8 | Should | Pending |
| REQ-DON-006 | Donor compliance dashboard with RAG indicators | A | 8 | Must | Pending |
| REQ-DON-007 | Donor-specific procurement threshold rules | A | 8 | Must | Pending |
| REQ-DON-008 | Compliance matrix (donor requirements vs project status) | A | 8 | Should | Pending |

---

## Phase 9: Communication & Collaboration (Weeks 25-26)

### Chat (REQ-CHAT)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-CHAT-001 | Conversation CRUD (direct, group, channel) | B | 9 | Must | Pending |
| REQ-CHAT-002 | Real-time messaging via SignalR | B | 9 | Must | Pending |
| REQ-CHAT-003 | Message send, edit, delete | B | 9 | Must | Pending |
| REQ-CHAT-004 | Message reactions (emoji) | B | 9 | Should | Pending |
| REQ-CHAT-005 | Message threading | B | 9 | Should | Pending |
| REQ-CHAT-006 | File attachments in messages | B | 9 | Must | Pending |
| REQ-CHAT-007 | User presence tracking (online/offline/away) | B | 9 | Must | Pending |
| REQ-CHAT-008 | Chat UI with conversation list, message area, online indicators | B | 9 | Must | Pending |

### Notifications (REQ-NOTIF)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-NOTIF-001 | WebSocket real-time notifications via SignalR | A+B | 9 | Must | Pending |
| REQ-NOTIF-002 | FCM push notifications for mobile devices | A+B | 9 | Must | Pending |
| REQ-NOTIF-003 | Email notifications with bilingual templates (EN + Amharic) | A+B | 9 | Must | Pending |
| REQ-NOTIF-004 | Per-user notification preferences (which channels, which event types) | A+B | 9 | Must | Pending |
| REQ-NOTIF-005 | Notification bell UI with notification center | A+B | 9 | Must | Pending |

### Document Management (REQ-DOC)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-DOC-001 | Document folder hierarchy CRUD | A | 9 | Must | Pending |
| REQ-DOC-002 | Document upload with versioning | A | 9 | Must | Pending |
| REQ-DOC-003 | Document download and version history | A | 9 | Must | Pending |
| REQ-DOC-004 | Document comments | A | 9 | Should | Pending |
| REQ-DOC-005 | Document categorization | A | 9 | Should | Pending |
| REQ-DOC-006 | Document integration with tasks, chat, and procurement | A | 9 | Should | Pending |
| REQ-DOC-007 | File browser UI with upload, preview, version history | A | 9 | Must | Pending |
| REQ-DOC-008 | Document search by name, category, date | A | 9 | Should | Pending |

### Feedback / CHS-Aligned GRM (REQ-CFM)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-CFM-001 | Anonymous feedback submission without authentication | A+B | 9 | Must | Pending |
| REQ-CFM-002 | Authenticated feedback submission for staff | A | 9 | Must | Pending |
| REQ-CFM-003 | Feedback categorization (complaint, suggestion, positive feedback, safeguarding concern) | New | 9 | Must | Pending |
| REQ-CFM-004 | Auto-acknowledge receipt within 24 hours (Hangfire job) | New | 9 | Must | Pending |
| REQ-CFM-005 | Response timeframe tracking with SLA configuration per feedback type | New | 9 | Must | Pending |
| REQ-CFM-006 | Escalation paths for safeguarding concerns (GBV, child protection, fraud) | New | 9 | Must | Pending |
| REQ-CFM-007 | Confidential case handling with restricted access | New | 9 | Must | Pending |
| REQ-CFM-008 | Feedback dashboard (response time metrics, resolution rate, category breakdown) | New | 9 | Must | Pending |

### Data Protection (REQ-DP)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-DP-001 | Data retention policies — configurable per entity type, auto-archive/delete after retention period | New | 9 | Must | Pending |
| REQ-DP-002 | Consent tracking — record consent per participant, purpose-specific | New | 9 | Must | Pending |
| REQ-DP-003 | Data anonymization tools — anonymize graduated/exited participant PII on demand | New | 9 | Must | Pending |
| REQ-DP-004 | Right-to-erasure — delete participant PII on request, preserve aggregate statistics | New | 9 | Must | Pending |
| REQ-DP-005 | Sensitive data access logging — log every access to protection cases, GBV, medical data | New | 9 | Must | Pending |
| REQ-DP-006 | Data classification labels (public, internal, confidential, restricted) on documents and records | New | 9 | Should | Pending |

---

## Phase 10: Dashboards, System Reports & Polish (Weeks 27-28)

### Dashboards (REQ-DASH)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-DASH-001 | Executive dashboard — KPIs across all modules | A | 10 | Must | Pending |
| REQ-DASH-002 | Project portfolio dashboard | A | 10 | Must | Pending |
| REQ-DASH-003 | Finance dashboard (budget vs actual, burn rate, currency) | A | 10 | Must | Pending |
| REQ-DASH-004 | MEAL dashboard (indicator progress, evaluation status) | A | 10 | Must | Pending |
| REQ-DASH-005 | Participant dashboard (enrollment, graduation pipeline, pillar distribution) | B | 10 | Must | Pending |
| REQ-DASH-006 | Risk dashboard (risk matrix, geographic heat map) | A | 10 | Must | Pending |
| REQ-DASH-007 | Procurement dashboard (pipeline status, spend analysis) | A | 10 | Must | Pending |
| REQ-DASH-008 | Performance dashboard | A | 10 | Should | Pending |
| REQ-DASH-009 | Office-scoped dashboards (area/branch level views, users see only their data) | A | 10 | Must | Pending |
| REQ-DASH-010 | Dashboard color configuration per organization | A | 10 | Could | Pending |

### System Reports (REQ-SRPT)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-SRPT-001 | System reports center page with 15+ report types and parameter forms | A | 10 | Must | Pending |
| REQ-SRPT-002 | System reports export to PDF, Excel, Word | A | 10 | Must | Pending |
| REQ-SRPT-003 | Scheduled report generation (Hangfire) | A | 10 | Should | Pending |
| REQ-SRPT-004 | Report sharing and distribution | A | 10 | Should | Pending |
| REQ-SRPT-005 | Report template extensibility for donor-specific formats | A | 10 | Should | Pending |

### Import/Export (REQ-IMP)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-IMP-001 | Centralized import wizard with preview and duplicate detection | A+B | 10 | Must | Pending |
| REQ-IMP-002 | Bulk data export with filters | A | 10 | Must | Pending |
| REQ-IMP-003 | Template-based import for each entity type | A | 10 | Must | Pending |
| REQ-IMP-004 | KoboToolbox form synchronization | B | 10 | Could | Pending |
| REQ-IMP-005 | Import validation and error reporting | A+B | 10 | Must | Pending |

### Settings & Configuration (REQ-SET)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-SET-001 | Organization settings (branding, theme, calendar preference, feature activation) | A | 10 | Must | Pending |
| REQ-SET-002 | Module-specific configurations | A | 10 | Must | Pending |
| REQ-SET-003 | Report approval assignment configuration | A | 10 | Must | Pending |
| REQ-SET-004 | Activity approval mapping configuration | A | 10 | Must | Pending |
| REQ-SET-005 | Performance alert threshold configuration | A | 10 | Should | Pending |

### Knowledge Management (REQ-KM)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-KM-001 | Lessons learned repository — searchable knowledge base | New | 10 | Should | Pending |
| REQ-KM-002 | Lessons linked to evaluation findings and learning plans | New | 10 | Should | Pending |
| REQ-KM-003 | Tagging by theme, sector, project | New | 10 | Should | Pending |
| REQ-KM-004 | Cross-project accessibility for institutional learning | New | 10 | Should | Pending |
| REQ-KM-005 | Knowledge base search and browse UI | New | 10 | Should | Pending |

### Partnership / Sub-grant Management (REQ-PART-MGT)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-PART-MGT-001 | Sub-grantee registry CRUD | New | 10 | Should | Pending |
| REQ-PART-MGT-002 | Disbursement schedule tracking | New | 10 | Should | Pending |
| REQ-PART-MGT-003 | Partner compliance monitoring | New | 10 | Should | Pending |
| REQ-PART-MGT-004 | Partner reporting obligations tracking | New | 10 | Should | Pending |
| REQ-PART-MGT-005 | Partnership dashboard | New | 10 | Should | Pending |

---

## Phase 11: Advanced Features & Mobile (Weeks 29-32)

### AI Integration (REQ-AI)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-AI-001 | Multi-provider AI configuration (Ollama default, OpenAI, Anthropic, Gemini) | A | 11 | Should | Pending |
| REQ-AI-002 | AI-assisted report writing (draft suggestions for narrative reports) | A | 11 | Should | Pending |
| REQ-AI-003 | AI data quality analysis (anomaly detection in indicator data) | A | 11 | Should | Pending |
| REQ-AI-004 | AI insights and briefings (project health summaries) | A | 11 | Should | Pending |
| REQ-AI-005 | AI conversation interface within the app | A | 11 | Could | Pending |
| REQ-AI-006 | Ollama self-hosted option for data sovereignty | A | 11 | Should | Pending |
| REQ-AI-007 | AI provider selection per organization (settings) | A | 11 | Should | Pending |
| REQ-AI-008 | AI-powered risk prediction from historical data | A | 11 | Could | Pending |

### Mobile App (REQ-MOB)

| REQ ID | Description | Source | Phase | Priority | Status |
|--------|-------------|--------|-------|----------|--------|
| REQ-MOB-001 | Flutter mobile app for Android and iOS | A+B | 11 | Must | Pending |
| REQ-MOB-002 | Mobile authentication with secure token storage | A+B | 11 | Must | Pending |
| REQ-MOB-003 | Offline-first architecture with Drift local DB and background sync | B | 11 | Must | Pending |
| REQ-MOB-004 | Mobile form filling with GPS, camera, and signature capture | B | 11 | Must | Pending |
| REQ-MOB-005 | Mobile training attendance recording | B | 11 | Must | Pending |
| REQ-MOB-006 | Mobile participant lookup and profile viewing | B | 11 | Must | Pending |
| REQ-MOB-007 | Mobile push notifications via FCM | A+B | 11 | Must | Pending |
| REQ-MOB-008 | Mobile chat with real-time messaging | B | 11 | Should | Pending |
| REQ-MOB-009 | Offline sync conflict resolution (last-write-wins with detection) | B | 11 | Must | Pending |
| REQ-MOB-010 | Mobile app bilingual support (EN/Amharic) | A+B | 11 | Must | Pending |

---

## Summary

| Phase | Module Count | REQ Count | Must | Should | Could |
|-------|-------------|-----------|------|--------|-------|
| 1 | 6 | 39 | 33 | 5 | 1 |
| 2 | 8 | 53 | 40 | 12 | 1 |
| 3 | 2 | 25 | 19 | 6 | 0 |
| 4 | 1 | 35 | 28 | 7 | 0 |
| 5 | 3 | 33 | 21 | 9 | 3 |
| 6 | 8 | 83 | 66 | 17 | 0 |
| 7 | 2 | 25 | 21 | 3 | 1 |
| 8 | 4 | 32 | 26 | 6 | 0 |
| 9 | 5 | 35 | 29 | 5 | 1 |
| 10 | 6 | 35 | 22 | 12 | 1 |
| 11 | 2 | 18 | 9 | 7 | 2 |
| **Total** | **47** | **413** | **314** | **89** | **10** |
