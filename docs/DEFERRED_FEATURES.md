# EthelPMS — Deferred / Post-Launch Features
**Version:** 1.0
**Date:** 2026-10-12
**Purpose:** Features evaluated and intentionally deferred from the initial release. These can be added incrementally after launch without architectural changes.

> **Rule:** Do NOT implement any feature from this list during initial development (Phases 0-12) unless explicitly approved. This list exists so nothing is forgotten — not as a backlog to pull from.

---

## A. Faith-Based Organization (FBO) Modules

### A1. Zakat & Waqf Module (Islamic Finance)
**Source:** Nati team plan (ZakatWaqf bounded context)
**What it does:** Full Zakat calculation with live Nisab rates from gold/silver spot prices, 8-category Quranic distribution enforcement, Hijri Hawl cycle tracking. Waqf endowment with principal lock (endowment principal cannot be spent, only returns).
**Benefit:** Enables the platform to serve Islamic faith-based organizations. Ethiopia has a significant Muslim population and Islamic relief organizations.
**Complexity:** Medium — requires Hijri calendar (NodaTime supports it), Nisab rate API integration, fund accounting integration.
**When to add:** When an Islamic FBO becomes a tenant and requests it. Design as an optional module with OpenFeature flag.

### A2. Tithing & Church Giving Module
**Source:** Nati team plan (TithingChurch bounded context)
**What it does:** Tithe tracking, offering management, household giving rollup, liturgical calendar integration, dual-signoff batch counting for cash offerings.
**Benefit:** Enables the platform to serve churches and Christian FBOs that manage tithes/offerings alongside development programs.
**Complexity:** Low-Medium — straightforward CRUD with household grouping and calendar integration.
**When to add:** When a church-based organization becomes a tenant. Design as optional module.

### A3. Pastoral Care Module (Confidential/Firewalled)
**Source:** Nati team plan (Pastoral bounded context)
**What it does:** Pastoral visits, hospital visits, counseling notes — all under cryptographic confidentiality firewall. No cross-module events. Only designated pastoral staff can access.
**Benefit:** Serves church-based organizations that provide pastoral care alongside development programs.
**Complexity:** Medium — requires field-level encryption (envelope encryption with KMS), strict access controls.
**When to add:** Only if a church/FBO tenant specifically requests pastoral care tracking.

---

## B. CRM & Revenue Modules

### B1. Fundraising CRM
**Source:** Nati team plan (FundraisingCRM bounded context)
**What it does:** Donor prospect pipeline with moves management stages, recurring gift tracking with dunning, P2P/crowdfunding campaigns, matching gifts, planned/legacy giving, grant prospect tracking.
**Benefit:** Helps NGOs actively fundraise and manage donor relationships. Critical for long-term sustainability.
**Complexity:** High — full CRM with pipeline stages, recurring payments, campaign management.
**When to add:** Post-launch when orgs express need for donor cultivation (vs just donor compliance which we already have). Consider whether existing CRM tools (Salesforce Nonprofit, HubSpot) serve the need better.

### B2. Subscription & Billing Management
**Source:** Nati team plan (SubscriptionPackage entity)
**What it does:** Self-service subscription management for tenants — plan selection, payment processing, auto-renewal, invoicing. Integration with Stripe or Chapa/SantimPay (Ethiopian payment gateway).
**Benefit:** Monetization of the platform if offered as paid SaaS.
**Complexity:** Medium — requires payment gateway integration, invoice generation, subscription state management.
**When to add:** When the platform has paying tenants. Current plan tracks packages/subscriptions in SuperAdmin but billing is manual.

---

## C. Governance & Compliance Modules

### C1. Governance & Board Management
**Source:** Nati team plan (Governance bounded context)
**What it does:** Board resolution tracking, committee structure, COI (Conflict of Interest) declarations with auto-cross-check against vendors/donors, policy lifecycle with acknowledgment tracking, AGM/quorum tracking, e-signatures via OpenSign, member voting.
**Benefit:** Strengthens organizational accountability and compliance — important for NGOs under regulatory scrutiny or seeking accreditation.
**Complexity:** Medium — mostly CRUD with workflow, plus e-signature integration.
**When to add:** When orgs need formal governance tracking for regulatory compliance or accreditation.

### C2. Sanctions Screening (OFAC/UN/EU)
**Source:** Nati team plan (Compliance bounded context)
**What it does:** Automated ingestion of OFAC/UN/EU sanctions lists, fuzzy name matching against vendors, donors, and partners. Statutory filing calendar (IRS 990, UK Charity Commission, India FCRA, EU registers).
**Benefit:** Required for NGOs receiving US government or EU funding — vendors and partners must be screened against sanctions lists.
**Complexity:** Medium — requires periodic list download, fuzzy matching (FuzzySharp already in consideration), alert workflow.
**When to add:** When an international NGO tenant receives USAID/EU funding with sanctions screening requirements. Can be added as a background job that scans vendor/donor tables against downloaded lists.

---

## D. Security & Access Enhancements

### D1. Cryptographic Confidentiality Firewalls
**Source:** Nati team plan (Safeguarding/Pastoral firewalled contexts)
**What it does:** Field-level envelope encryption for safeguarding cases, protection data, biometric templates, and pastoral notes. Tenant Master Keys stored in KMS (Azure Key Vault or HashiCorp Vault). Only designated roles can decrypt. DBAs and backup leaks cannot expose cleartext.
**Benefit:** GDPR and CHS require strong protection for sensitive data (GBV cases, child protection, medical records). Goes beyond database-level encryption.
**Complexity:** High — requires KMS setup, envelope encryption implementation, key rotation, role-gated decryption.
**When to add:** Phase 12 (security hardening) or post-launch. Priority increases if tenants handle GBV/child protection cases at scale.

### D2. Biometric Deduplication for Beneficiaries
**Source:** Nati team plan (BeneficiaryAid context — SourceAFIS + FuzzySharp)
**What it does:** SourceAFIS fingerprint minutiae matching + FuzzySharp Levenshtein + Double Metaphone phonetic matching for beneficiary deduplication. Templates stored as irreversible hashes.
**Benefit:** Prevents double-registration of aid recipients — a major fraud risk in humanitarian programs. Phonetic matching handles Amharic name variations.
**Complexity:** Medium (phonetic matching) to High (biometric). FuzzySharp is easy; SourceAFIS requires fingerprint scanner hardware.
**When to add:** FuzzySharp phonetic matching — add during Phase 6 (Participants) if time allows. SourceAFIS biometric — post-launch when a tenant procures fingerprint scanners.

### D3. Break-Glass Emergency Access
**Source:** Nati team plan (Tenant Admin Console)
**What it does:** Dual-witness emergency access — two authorized users must both approve to unlock restricted access in emergencies (e.g., safeguarding focal point unavailable but urgent case needs review).
**Benefit:** Important for safeguarding data access in emergencies while maintaining audit trail.
**Complexity:** Low — two-approval workflow with time-boxing and audit logging.
**When to add:** When safeguarding module is actively used. Can be added as an enhancement to existing RBAC.

### D4. IP Allow-Listing for Admin Access
**Source:** Nati team plan (Security hardening)
**What it does:** SuperAdmin and sensitive roles can be restricted to specific IP ranges.
**Benefit:** Prevents unauthorized access from unknown networks.
**Complexity:** Low — middleware check against stored IP ranges per role.
**When to add:** Post-launch security hardening.

### D5. Support Impersonation with Audit
**Source:** Nati team plan (SuperAdmin Control Plane)
**What it does:** Platform support can "view as tenant" (read-only by default), with optional time-boxed write access that's fully audited with before/after diff and disclosed to the tenant on next login.
**Benefit:** Essential for SaaS support operations — diagnose tenant issues without asking for their credentials.
**Complexity:** Medium — requires session context switching, audit trail, disclosure UI.
**When to add:** When there are enough tenants that support operations need this capability (5+ active tenants).

---

## E. Web Platform Enhancements

### E1. PWA Offline for Web App
**Source:** Nati team plan (Frontend Architecture — Dexie.js + Service Worker)
**What it does:** Angular Service Worker + Dexie.js IndexedDB mutation queue with conflict resolution UI (keep mine / keep server's / merge). Web app works offline for key workflows.
**Benefit:** Web app works offline too — useful for field offices with unreliable internet. Currently only Flutter mobile has offline capability.
**Complexity:** High — requires IndexedDB schema mirroring, sync engine, conflict resolution UI.
**When to add:** Post-launch. Flutter mobile already covers offline field needs. Add PWA offline only if web-only field use emerges.

### E2. Splashscreen Health Handshake
**Source:** Nati team plan (Frontend Architecture)
**What it does:** 4-state boot sequence (healthy+session, healthy+no-session, degraded, critical failure) checking API health before showing the app. Graceful degradation to "work offline" mode with correlation ID.
**Benefit:** Better UX when API is down or degraded. Users see a clear status instead of cryptic errors.
**Complexity:** Low — health check on app init, conditional routing.
**When to add:** Nice UX polish for later phases. Low effort, can be added anytime.

### E3. Keycloak Migration Path
**Source:** Nati team plan (recommends Keycloak for OIDC/SAML SSO)
**What it does:** Replace custom JWT auth with Keycloak as external identity provider. Enables SAML SSO, MFA management, social login, and federated identity across multiple systems.
**Benefit:** Enterprise-grade identity management. Important if tenants need SSO with their existing identity providers (Azure AD, Google Workspace, etc.).
**Complexity:** Medium — our auth already uses JWT; adding OIDC compatibility makes Keycloak a drop-in replacement later.
**When to add:** When a tenant requires SSO with their corporate identity provider. Current custom JWT is sufficient for <50 users.

---

## F. Advanced Analytics & Integrations

### F1. DuckDB for Lightweight OLAP
**Source:** Nati team plan (optional DuckDB for analytics)
**What it does:** Embedded analytical database for complex aggregation queries without impacting transactional performance.
**Benefit:** Fast analytical queries on large datasets without a separate data warehouse.
**Complexity:** Low — DuckDB runs in-process, reads from PostgreSQL or Parquet files.
**When to add:** Only if materialized views + Dapper become insufficient for reporting performance. Unlikely at <50 users.

### F2. YARP Reverse Proxy (API Gateway)
**Source:** Nati team plan
**What it does:** .NET-native reverse proxy for rate limiting, API versioning, and future module extraction into microservices.
**Benefit:** Enables per-module rate limiting and API versioning at the gateway level.
**Complexity:** Low-Medium — YARP is well-documented and integrates natively with ASP.NET Core.
**When to add:** Only if extracting modules into separate services becomes necessary. Nginx already handles reverse proxy for the monolith.

### F3. Accounting System Connectors
**Source:** Nati team plan (Integrations section)
**What it does:** QuickBooks, Xero, Sage, NetSuite connectors for syncing financial data.
**Benefit:** NGOs already using external accounting systems can sync data bidirectionally.
**Complexity:** Medium per connector — each has its own API and data model.
**When to add:** Post-launch, driven by tenant demand. Fund Accounting module reduces the need but doesn't eliminate it for orgs with established accounting systems.

### F4. Mobile Money Payment Rails
**Source:** Nati team plan (Integrations — M-Pesa, MTN, bKash)
**What it does:** Integration with mobile money platforms for beneficiary cash transfers and donor payments.
**Benefit:** Direct cash transfer to beneficiaries via mobile money — common in humanitarian programs.
**Complexity:** Medium — requires payment gateway integration, reconciliation, and compliance.
**When to add:** When a tenant runs cash transfer programs. Design the `IPaymentService` interface early so integration is straightforward.

---

## Summary Table

| # | Feature | Priority | Complexity | Trigger to Add |
|---|---------|----------|------------|----------------|
| A1 | Zakat & Waqf | Low | Medium | Islamic FBO tenant requests it |
| A2 | Tithing & Church | Low | Low-Med | Church FBO tenant requests it |
| A3 | Pastoral Care | Low | Medium | Church FBO needs pastoral tracking |
| B1 | Fundraising CRM | Medium | High | Orgs need donor cultivation pipeline |
| B2 | Subscription Billing | Medium | Medium | Platform has paying tenants |
| C1 | Governance & Board | Low-Med | Medium | Regulatory/accreditation requirement |
| C2 | Sanctions Screening | Medium | Medium | Tenant receives USAID/EU funding |
| D1 | Crypto Firewalls | Medium-High | High | GBV/child protection at scale |
| D2 | Biometric Dedup | Medium | Med-High | Tenant procures fingerprint scanners |
| D3 | Break-Glass Access | Low-Med | Low | Safeguarding module actively used |
| D4 | IP Allow-Listing | Low | Low | Security hardening round |
| D5 | Support Impersonation | Medium | Medium | 5+ active tenants |
| E1 | PWA Offline (Web) | Low | High | Web-only field use emerges |
| E2 | Splashscreen Health | Low | Low | UX polish round |
| E3 | Keycloak SSO | Low-Med | Medium | Tenant needs corporate SSO |
| F1 | DuckDB OLAP | Low | Low | Reporting performance issues |
| F2 | YARP API Gateway | Low | Low-Med | Module extraction needed |
| F3 | Accounting Connectors | Medium | Medium | Tenant uses QuickBooks/Xero |
| F4 | Mobile Money | Medium | Medium | Cash transfer programs |
