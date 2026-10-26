> **⚠ ARCHIVED** — This comparison has been completed. All accepted recommendations are now
> incorporated into `docs/plans/00-MASTER-PLAN.md` and recorded in `DECISIONS_LOG.md` (D11-D24).
> This document is historical reference only — do not treat its recommendations as open items.

# EthelPMS vs Nati Team Plan — Comparison Report
**Date:** 2026-10-12
**Purpose:** Identify new functionalities, missing features, improvements, and recommended additions from the Nati team's plan that are NOT in our current EthelPMS plan.
**Status:** ~~For review — nothing has been merged yet.~~ **COMPLETED — decisions captured in DECISIONS_LOG.md**

> **Note:** 2 of 9 Nati files (.docx) could not be read due to VM unavailability. Those are: Enhancement Addendum v1.0 and Module Specification & Dependency Map v3.0. Findings below are based on the other 7 files.

---

## Summary

Our EthelPMS plan and the Nati plan share the same target stack (.NET 8 + Angular 18 + Supabase PostgreSQL) and largely the same module list. However, the Nati plan goes significantly deeper in several areas — particularly **multi-tenancy architecture**, **faith-based organization support**, **financial management**, **security hardening**, **compliance**, and **platform operations**. Below are all differences organized by category.

---

## CATEGORY A: Entirely New Modules (Not in Our Plan at All)

### A1. Fund Accounting Module
**Nati:** Full FASB ASC 958 / IFRS-compliant fund accounting with restriction tracking (temporarily restricted, permanently restricted, unrestricted), restriction release lifecycle, chart of accounts seeded per org archetype, journal entries, multi-entity consolidation, in-kind valuation, indirect cost allocation, and statutory financial statements (Balance Sheet, Statement of Activities, Statement of Cash Flows, Statement of Functional Expenses, Form 990).
**Ours:** We have budget management and finance dashboard but NO fund accounting. Our system tracks budget lines and spend but doesn't do double-entry accounting or fund restriction tracking.
**Benefit:** NGOs receiving restricted grants MUST track fund restrictions — this is an audit requirement for most donors. Without it, NGOs still need separate accounting software (QuickBooks, etc.).
**Recommendation:** ⭐ **HIGH VALUE** — Add as a new module. Even a simplified version (chart of accounts + journal entries + fund restrictions) would be significant.

### A2. Zakat & Waqf Module (Islamic Finance)
**Nati:** Full Zakat calculation with live Nisab rates from gold/silver spot prices, 8-category Quranic distribution enforcement, Hijri Hawl cycle tracking. Waqf endowment with principal lock (endowment principal cannot be spent, only returns).
**Ours:** Not present.
**Benefit:** Enables the platform to serve Islamic faith-based organizations (FBOs). Ethiopia has a significant Muslim population and Islamic relief organizations.
**Recommendation:** ⭐ **MEDIUM** — Only needed if targeting Islamic FBOs. Add as optional module.

### A3. Tithing & Church Giving Module
**Nati:** Tithe tracking, offering management, household giving rollup, liturgical calendar integration, dual-signoff batch counting for cash offerings.
**Ours:** Not present.
**Benefit:** Enables the platform to serve churches and Christian FBOs that manage tithes/offerings alongside development programs.
**Recommendation:** ⭐ **MEDIUM** — Only needed if targeting churches/FBOs. Add as optional module.

### A4. Fundraising CRM Module
**Nati:** Donor prospect pipeline, moves management stages, recurring gift dunning, P2P/crowdfunding campaigns, matching gifts, planned/legacy giving, grant prospect tracking.
**Ours:** We have Donor Compliance & Agreements but NO fundraising CRM. Our system tracks existing donors, not prospective ones.
**Benefit:** Helps NGOs actively fundraise and manage donor relationships — critical for sustainability.
**Recommendation:** ⭐ **MEDIUM-HIGH** — Valuable addition, especially the recurring gift and donor pipeline features.

### A5. Asset & Supply Chain Module
**Nati:** Fixed asset register with depreciation schedules, vehicle/fleet management, warehouse management with batch/lot/expiry tracking, stock ledger, framework procurement agreements, donor-compliant asset disposal.
**Ours:** Not present as a standalone module. We have procurement but no asset tracking post-purchase.
**Benefit:** NGOs must track assets for donor audits. Vehicles, equipment, and supplies are major cost categories.
**Recommendation:** ⭐ **HIGH VALUE** — Add asset register + vehicle tracking at minimum.

### A6. Governance & Board Management Module
**Nati:** Board resolution tracking, committee structure, COI (Conflict of Interest) declarations with auto-cross-check against vendors/donors, risk register at governance level, policy lifecycle with acknowledgment tracking, AGM/quorum tracking, e-signatures via OpenSign, member voting.
**Ours:** We have Risk Management but NO governance/board module.
**Benefit:** Strengthens organizational accountability and compliance — important for NGOs under regulatory scrutiny.
**Recommendation:** ⭐ **LOW-MEDIUM** — Nice to have but not critical for core PMS operations. Defer to post-launch.

### A7. Pastoral Care Module (Confidential/Firewalled)
**Nati:** Pastoral visits, hospital visits, counseling notes — all under cryptographic confidentiality firewall. No cross-module events. Only designated pastoral staff can access.
**Ours:** Not present.
**Benefit:** Serves church-based organizations that provide pastoral care alongside development programs.
**Recommendation:** ⭐ **LOW** — Only relevant for church/FBO archetype. Defer.

### A8. Sanctions Screening / Compliance Module
**Nati:** Automated ingestion of OFAC/UN/EU sanctions lists, fuzzy name matching against vendors and donors, statutory filing calendar (IRS 990, UK Charity Commission, India FCRA, EU registers).
**Ours:** Not present.
**Benefit:** Required for NGOs receiving US government or EU funding — vendors/partners must be screened against sanctions lists.
**Recommendation:** ⭐ **MEDIUM** — Important for international NGOs. Add vendor/donor screening as a feature within procurement/donor modules.

---

## CATEGORY B: Architectural Improvements (Our Plan Has the Module but Nati's Is Better)

### B1. Multi-Tenancy — 3-Tier Model vs Our Single-Tier RLS
**Nati:** Three isolation tiers driven by ComplianceProfile:
- Tier 1: Shared DB with RLS (small orgs) — same as ours
- Tier 2: Dedicated schema per tenant (mid-size orgs)
- Tier 3: Dedicated database per tenant (international/conflict-zone orgs with data residency requirements)
Tenant tier auto-selected based on compliance profile. Uses Finbuckle.MultiTenant library.
**Ours:** Single-tier RLS only.
**Benefit:** Data residency compliance (GDPR Article 44+) may require physical database isolation for certain countries. Tier 2/3 gives flexibility without rebuilding.
**Recommendation:** ⭐ **HIGH VALUE** — Use Finbuckle.MultiTenant from the start. Default to Tier 1 (RLS) but design the connection-string resolution to support Tier 2/3 later.

### B2. Modular Monolith with Schema-per-Module
**Nati:** Each bounded context (module) gets its own PostgreSQL schema (e.g., `fundacct.*`, `grants.*`, `beneficiary.*`), its own DbContext with `HasDefaultSchema()`, and its own Postgres role with restricted GRANT/REVOKE. No cross-module database joins allowed — enforced by ArchUnitNET tests in CI.
**Ours:** Single schema, single DbContext implied.
**Benefit:** Prevents accidental coupling between modules, makes it possible to extract modules into microservices later, and provides defense-in-depth at the database level.
**Recommendation:** ⭐ **HIGH VALUE** — Adopt schema-per-module from Phase 0. This is a foundational architecture choice that's very hard to retrofit.

### B3. Transactional Outbox Pattern
**Nati:** Business writes and integration events in the same ACID transaction. Outbox table polled by Quartz.NET, relayed to consumers. Inbox tracking for idempotent consumers. Dead-letter monitoring.
**Ours:** Not mentioned. We use MediatR for in-process but no outbox pattern.
**Benefit:** Guarantees event delivery between modules even if the consumer is temporarily down. Prevents data inconsistency in cross-module workflows (e.g., "training attendance recorded" must always reach graduation scoring).
**Recommendation:** ⭐ **HIGH VALUE** — Add outbox pattern. Critical for reliable cross-module integration.

### B4. Cryptographic Confidentiality Firewalls
**Nati:** Field-level envelope encryption for safeguarding cases, protection data, biometric templates, and pastoral notes. Tenant Master Keys in KMS (Azure Key Vault or HashiCorp Vault). Only designated roles can decrypt. DBAs and backup leaks cannot expose cleartext.
**Ours:** We have sensitive access logging (REQ-DP-005) but NO field-level encryption.
**Benefit:** GDPR and CHS require strong protection for sensitive data (GBV cases, child protection, medical records). Encryption at rest via Supabase is not enough — field-level encryption means even DBAs can't read sensitive data.
**Recommendation:** ⭐ **HIGH VALUE** for safeguarding/protection data — Add for protection cases, GBV records, medical data at minimum.

### B5. Biometric Deduplication for Beneficiaries
**Nati:** SourceAFIS fingerprint minutiae matching + FuzzySharp Levenshtein + Double Metaphone phonetic matching for beneficiary deduplication. Biometric templates stored as irreversible hashes.
**Ours:** We have duplicate detection on Excel import but NO biometric dedup.
**Benefit:** Prevents double-registration of aid recipients — a major fraud risk in humanitarian programs. Phonetic matching handles Amharic name variations.
**Recommendation:** ⭐ **MEDIUM** — Add FuzzySharp phonetic matching (easy). Biometric (SourceAFIS) is valuable but adds hardware dependency — make it optional.

### B6. SuperAdmin Control Plane (Separate App)
**Nati:** Dedicated platform admin console as a separate Nx app with: tenant lifecycle state machine (7 states), one-time access-key onboarding, subscription/package management, per-tenant module toggles, telemetry/health monitoring, cross-tenant analytics, support impersonation (read-only by default, write requires time-box + audit), 4 platform-level RBAC roles.
**Ours:** We have organization management but NO separate platform admin console. Our "Super Admin" is just another role within the same app.
**Benefit:** Clean separation between platform operations and tenant operations. Essential for true SaaS multi-tenancy. Prevents accidental exposure of cross-tenant data.
**Recommendation:** ⭐ **HIGH VALUE** — Since you chose multi-org from day one, a proper SuperAdmin control plane is important. Doesn't need all features immediately, but the separation should be architectural from Phase 0.

### B7. Tenant Onboarding with Cryptographic Access Keys
**Nati:** SuperAdmin creates tenant shell → system generates crypto-random one-time activation key (hash-only storage) → tenant admin redeems via public URL → guided wizard (ComplianceProfile, branding, first admin + MFA).
**Ours:** We have OrganizationOnboardingService but no access-key mechanism or guided wizard.
**Benefit:** Secure, self-service tenant activation without sharing passwords. Professional onboarding experience.
**Recommendation:** ⭐ **MEDIUM-HIGH** — Adopt the access-key pattern for tenant activation.

### B8. Subscription & Package Management
**Nati:** Package types (Monthly/Quarterly/Annual/Custom), auto-expiration with configurable reminders, renewal flow, per-tenant module toggles tied to subscription tier.
**Ours:** Not present. We assumed the platform is internally deployed.
**Benefit:** If this is truly SaaS multi-org, you need subscription management for billing/access control.
**Recommendation:** ⭐ **MEDIUM** — Add basic subscription tracking. Billing integration (Stripe/Chapa) can be deferred.

---

## CATEGORY C: Technology & Library Improvements

### C1. Finbuckle.MultiTenant
**Nati uses, we don't.** Purpose: tenant resolution pipeline (subdomain/header/JWT → cached ITenantInfo → connection string). Handles all three isolation tiers.
**Recommendation:** ⭐ Adopt — well-maintained, purpose-built for .NET multi-tenancy.

### C2. ArchUnitNET (Architecture Fitness Tests)
**Nati uses, we don't.** Purpose: CI-enforced rules like "no cross-module DB joins", "domain layer has no infrastructure references."
**Recommendation:** ⭐ Adopt — prevents architectural drift, especially with AI agents writing code.

### C3. Stateless (State Machine Library)
**Nati uses, we don't.** Purpose: state machines for procurement lifecycle, tenant lifecycle, graduation pipeline.
**Recommendation:** ⭐ Adopt — cleaner than if/else chains for multi-step workflows.

### C4. NodaTime + NodaMoney
**Nati uses, we don't.** Purpose: proper timezone/calendar handling (including Hijri) and money arithmetic without floating-point errors.
**Recommendation:** ⭐ Adopt NodaMoney at minimum — financial calculations must avoid float precision issues.

### C5. Audit.NET
**Nati uses, we don't.** Purpose: automatic audit trail with INSERT-only Postgres role (tamper-proof even with compromised app credentials).
**Recommendation:** ⭐ Adopt — stronger audit trail than our current approach.

### C6. Microsoft.RulesEngine
**Nati uses, we don't.** Purpose: dynamic business rules (budget ceilings, COI cross-checks, approval thresholds) configurable per org without code changes.
**Recommendation:** ⭐ **HIGH VALUE** — makes approval thresholds, budget limits, and business policies configurable per org without redeployment.

### C7. OpenFeature (CNCF Feature Flags)
**Nati uses, we don't.** Purpose: per-tenant feature flags for sub-feature toggles (e.g., enable biometric dedup for Org A but not Org B).
**Recommendation:** ⭐ Adopt — essential for SaaS where different orgs have different feature sets.

### C8. Keycloak vs Our Custom JWT
**Nati recommends Keycloak** (open-source identity provider) for OIDC/SAML SSO, with Supabase Auth as alternative.
**Ours:** Custom JWT implementation with ASP.NET Core Identity.
**Recommendation:** ⚠️ **Consider carefully** — Keycloak is powerful but adds operational complexity (another service to deploy/maintain). Our custom JWT is simpler for <50 users. Keep our approach but ensure OIDC compatibility for future Keycloak migration.

### C9. YARP Reverse Proxy (API Gateway)
**Nati uses, we don't.** Purpose: rate limiting, API versioning, future module extraction.
**Recommendation:** ⭐ **LOW** — Nginx already handles reverse proxy. YARP adds value only if extracting modules into separate services later.

### C10. DuckDB for Lightweight OLAP
**Nati mentions, we don't.** Purpose: analytical queries without a separate data warehouse.
**Recommendation:** ⭐ **LOW** — Materialized views + Dapper are sufficient for our scale (<50 users).

---

## CATEGORY D: Frontend Architecture Improvements

### D1. Separate Nx Workspace with Module Libraries
**Nati:** Nx monorepo with 1:1 mapping of Angular library projects to backend bounded contexts. Separate apps for tenant console vs platform console.
**Ours:** Single Angular app implied.
**Recommendation:** ⭐ **HIGH VALUE** — Nx workspace enables code sharing, enforces module boundaries, and supports the separate SuperAdmin app.

### D2. spartan/ui Component Library
**Nati uses spartan/ui,** we use Angular Material.
**Recommendation:** ⚠️ Keep Angular Material — it's more mature and better documented. spartan/ui is newer with a smaller community.

### D3. @ngrx/signals (SignalStore) vs NgRx Store
**Nati uses SignalStore,** we use traditional NgRx Store.
**Recommendation:** ⚠️ **Consider** — SignalStore is lighter and Angular's direction. But NgRx Store is more battle-tested for large apps. Either works.

### D4. Offline-First with Dexie.js + Service Worker
**Nati:** Angular Service Worker + Dexie.js IndexedDB mutation queue with conflict resolution UI (keep mine / keep server's / merge).
**Ours:** Offline only in Flutter mobile app (Drift).
**Benefit:** Web app works offline too — useful for field offices with unreliable internet.
**Recommendation:** ⭐ **MEDIUM** — Add PWA offline capability for key workflows (data entry, form submission). Defer full conflict resolution UI.

### D5. Splashscreen Health Handshake
**Nati:** 4-state boot sequence checking API health before showing the app. Graceful degradation to "work offline" mode.
**Recommendation:** ⭐ **LOW-MEDIUM** — Nice UX polish. Add in later phases.

### D6. OpenAPI-Generated Typed Client
**Nati:** Auto-generate Angular HTTP client from OpenAPI spec using openapi-typescript + openapi-fetch.
**Recommendation:** ⭐ **HIGH VALUE** — Eliminates manual API client code and ensures frontend/backend stay in sync.

---

## CATEGORY E: Security & Compliance Improvements

### E1. Immutable Audit Trail (INSERT-only DB Role)
**Nati:** Dedicated `audit` Postgres schema with INSERT-only role. Application cannot UPDATE or DELETE audit records even if compromised.
**Ours:** Audit logging exists but no DB-level immutability.
**Recommendation:** ⭐ **HIGH VALUE** — Simple to implement (just a Postgres role), dramatically improves audit integrity.

### E2. Break-Glass Emergency Access
**Nati:** Dual-witness emergency access — two authorized users must approve to unlock restricted access in emergencies.
**Ours:** Not present.
**Recommendation:** ⭐ **LOW-MEDIUM** — Important for safeguarding data access in emergencies but defer to later phase.

### E3. IP Allow-Listing for Admin Access
**Nati:** SuperAdmin and sensitive roles can be restricted to specific IP ranges.
**Ours:** Not present.
**Recommendation:** ⭐ **LOW** — Good security hardening, easy to add later.

### E4. Support Impersonation with Audit
**Nati:** Platform support can "view as tenant" (read-only), with optional time-boxed write access that's fully audited and disclosed to the tenant.
**Ours:** Not present.
**Recommendation:** ⭐ **MEDIUM** — Essential for SaaS support operations. Add when SuperAdmin console is built.

---

## CATEGORY F: Features in Our Plan but NOT in Nati's

These are areas where **our plan is stronger**:

1. **4-Pillar Graduation System** — Both plans have it, but ours has more detail (pillar scoring formulas, 85% threshold, irreversible graduation)
2. **5-Level Planning Cascade** — Our configurable Annual→Weekly planning is more detailed
3. **Theory of Change visual editor** — We have this; Nati mentions logframes but not ToC specifically
4. **GESI with IASC Gender+Age Marker** — We have detailed GESI mainstreaming; Nati mentions it briefly
5. **CHS-aligned CFM with 24h auto-acknowledge** — Both have it, ours has more SLA detail
6. **Knowledge Management / Lessons Learned** — We have this; not prominent in Nati's plan
7. **KoboToolbox integration** — We have detailed sync; Nati doesn't mention it

---

## PRIORITY SUMMARY — Recommended Additions

### Must Add (architectural, hard to retrofit later):
| # | Item | Category | Impact |
|---|------|----------|--------|
| 1 | Schema-per-module (PostgreSQL schemas per bounded context) | B2 | Architecture foundation |
| 2 | Finbuckle.MultiTenant | C1 | Multi-tenancy foundation |
| 3 | Separate SuperAdmin Control Plane (Nx app) | B6 | SaaS architecture |
| 4 | Transactional Outbox Pattern | B3 | Data consistency |
| 5 | Immutable audit trail (INSERT-only DB role) | E1 | Compliance |
| 6 | ArchUnitNET fitness tests | C2 | Prevents AI agent architectural drift |
| 7 | OpenAPI-generated typed client | D6 | Dev productivity |
| 8 | Nx monorepo workspace | D1 | Frontend architecture |

### Should Add (high value, can be introduced per-phase):
| # | Item | Category | Impact |
|---|------|----------|--------|
| 9 | Fund Accounting (simplified) | A1 | Core NGO need |
| 10 | Asset & Supply Chain module | A5 | Donor audit requirement |
| 11 | Cryptographic firewalls for protection data | B4 | GDPR/CHS compliance |
| 12 | Microsoft.RulesEngine for dynamic policies | C6 | Configurability |
| 13 | OpenFeature for per-tenant feature flags | C7 | SaaS flexibility |
| 14 | Stateless state machine library | C3 | Cleaner workflows |
| 15 | NodaMoney for financial arithmetic | C4 | Correctness |
| 16 | Audit.NET | C5 | Better audit trail |
| 17 | Tenant onboarding with access keys | B7 | Professional SaaS |
| 18 | Sanctions screening (OFAC/UN/EU) | A8 | International compliance |
| 19 | FuzzySharp phonetic matching for dedup | B5 | Fraud prevention |

### Could Add (valuable but deferrable to post-launch):
| # | Item | Category | Impact |
|---|------|----------|--------|
| 20 | Fundraising CRM | A4 | Revenue sustainability |
| 21 | Zakat & Waqf module | A2 | Islamic FBO support |
| 22 | Tithing & Church module | A3 | Christian FBO support |
| 23 | Governance & Board module | A6 | Organizational compliance |
| 24 | Subscription/package management | B8 | SaaS billing |
| 25 | PWA offline for web app | D4 | Field office resilience |
| 26 | Pastoral Care module | A7 | FBO-specific |
| 27 | Keycloak migration path | C8 | Enterprise SSO |

---

## UNREAD FILES

The following 2 Nati files could not be read (DOCX, VM unavailable):
1. `NGO_FBO_Platform_Enhancement_Addendum_v1.0 (1).docx`
2. `NGO_FBO_Platform_Module_Specification_and_Dependency_Map_v3_0.docx`

These may contain additional features not captured above. Recommend reading them when VM is available or converting to PDF/text.

---

**NEXT STEP:** Review this comparison and tell me which items (by number) you want to adopt. I will then merge them into our existing plan documents.
