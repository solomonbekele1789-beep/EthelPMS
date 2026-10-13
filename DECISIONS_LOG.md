# EthelPMS — Confirmed Decisions & Resolved Questions
Date: 2026-10-12 (v2 — merged Nati team architectural improvements)

## Architectural Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **Office hierarchy: Configurable** — default 3-level (Head/Area/Branch), orgs can add levels | System A had fixed 3-level, System B had flexible groups. Configurable satisfies both without over-engineering. |
| D2 | **Beneficiary tracking: Both modes** — aggregate counts AND individual participant profiles, selectable per project | System A used aggregate only, System B had individual tracking. Development programs need aggregate; humanitarian/graduation programs need individual. |
| D3 | **Report approval: Configurable per report type** — each report type defines its own approval chain | System A had configurable multi-level, System B had single approver. Per-type configuration gives orgs flexibility without complexity. |
| D4 | **Graduation model: Optional module** — activated per project type | Not present in System A (development focus); core in System B (refugee/humanitarian). Making it optional lets the system serve both program types. |
| D5 | **Planning granularity: Configurable** — org chooses which planning levels to use (annual through daily) | System A had 5 levels down to daily, System B was task-based only. Configurable avoids forcing unnecessary granularity on orgs that don't need it. |
| D6 | **AI integration: Phase 11** — after core web system is complete | System A had multi-provider AI; System B had none. Deferring to Phase 11 keeps focus on core functionality first. |
| D7 | **Mobile app: Phase 11** — Flutter, both Android and iOS | Both systems planned Flutter. Deferring to Phase 11 ensures the API is stable before building mobile clients. |
| D8 | **No vendor self-service portal** — staff manage vendors internally | System B had public token-based proforma submission. Excluded to reduce scope; most NGOs handle vendor communication via email. |
| D9 | **Dual calendar: Configurable per org** — default ON for Ethiopian orgs, can be disabled | System A did not prominently feature it; System B made it mandatory. Configurable respects both Ethiopian and international org needs. |
| D10 | **Payroll module: Excluded** — use dedicated HR/payroll software | System B had basic budgeted vs actual per user/month. Most NGOs already use separate payroll systems; duplicating this adds risk without value. |

## Resolved Questions

| # | Question | Answer |
|---|----------|--------|
| Q1 | Multi-org from day one? | Yes — full SaaS multi-tenancy with org-level RLS isolation from Phase 1. |
| Q2 | Deployment platform? | Deferred — code is platform-agnostic (Docker). Options: Hetzner VPS + Supabase (~$34/mo), Azure (~$38/mo), or fully self-hosted. |
| Q3 | Data migration from existing systems? | Start fresh — no data migration. Old systems remain accessible for reference. |
| Q4 | Donor-specific reporting formats? | Handled in Phase 4 (Reporting) via an extensible report template system. |
| Q5 | MVP priority? | Follows the 12-phase implementation plan. AI and Mobile are Phase 11 (non-MVP). |
| Q6 | Mobile platforms? | Both Android and iOS via Flutter. |
| Q7 | Data privacy compliance? | GDPR + Ethiopian data law compliance required — affects encryption, consent tracking, data residency. |
| Q8 | Scale expectations? | Small scale: <50 concurrent users, <10K beneficiaries, <100 projects. Single VPS sufficient. |
| Q9 | AI provider strategy? | Multi-provider with Ollama as default (self-hosted, free, data stays on-premises). |
| Q10 | Frontend component library? | Angular Material + AG Grid — confirmed in technology stack document. |

## v2 Architectural Decisions (Merged from Nati Team Plan)

| # | Decision | Rationale |
|---|----------|-----------|
| D11 | **Modular Monolith with schema-per-module** — each module gets its own PostgreSQL schema and DbContext | Prevents accidental coupling, enables future module extraction, defense-in-depth at DB level. |
| D12 | **Finbuckle.MultiTenant** for tenant resolution | Purpose-built .NET multi-tenancy library. Handles subdomain/header/JWT → connection string. Supports future Tier 2/3 isolation. |
| D13 | **Transactional Outbox Pattern** for cross-module events | Guarantees event delivery between modules in same ACID transaction. Prevents data inconsistency. |
| D14 | **Immutable audit trail** — INSERT-only PostgreSQL role on `audit` schema + Audit.NET | Tamper-proof even with compromised app credentials. Required for donor audits. |
| D15 | **ArchUnitNET** fitness tests in CI | Enforces no cross-module dependency violations. Especially important with AI agents writing code. |
| D16 | **Nx monorepo** with separate SuperAdmin app | Clean separation: `apps/web` (tenant), `apps/platform-console` (platform). Module libraries enforce boundaries. |
| D17 | **OpenAPI-generated typed client** (openapi-typescript + openapi-fetch) | Eliminates manual API client code, ensures frontend/backend stay in sync. |
| D18 | **Fund Accounting module** (simplified FASB ASC 958) | NGOs must track fund restrictions for donor audits. Without it, they still need separate accounting software. |
| D19 | **Asset & Supply Chain module** | Donors require asset tracking. Vehicles, equipment, and supplies are major cost categories for NGOs. |
| D20 | **Stateless** state machine library for multi-step workflows | Cleaner than if/else chains for procurement/graduation/tenant lifecycles. MIT licensed, proven. |
| D21 | **NodaMoney** for all financial arithmetic | Prevents floating-point rounding errors in donor reports. Zero risk. |
| D22 | **Microsoft.RulesEngine** for dynamic business policies | Makes approval thresholds, budget ceilings, indirect cost rules configurable per org without redeployment. |
| D23 | **OpenFeature** (CNCF) for per-tenant feature flags | Essential for SaaS — different orgs need different feature sets. |
| D24 | **SuperAdmin Control Plane** as separate platform app | Tenant lifecycle management, module toggles, onboarding — required for true SaaS multi-tenancy. |

## Key Constraints
- GDPR + Ethiopian data law compliance
- Small scale (<50 users)
- Multi-org SaaS from day one
- Both Android and iOS for mobile
- Hosting: deferred (Docker-based, platform-agnostic)
- No vendor portal, no payroll module
- Start fresh (no data migration)
- Modular monolith with schema-per-module isolation
- All monetary calculations via NodaMoney (never float/double)
- Cross-module communication only via Contracts + Outbox (no direct references)
