> **⚠ SUPERSEDED** — Replaced by `docs/plans/00-TECH-STACK.md`. This file references .NET 8 / Angular 18 (outdated).
> The authoritative version reference is `docs/plans/00-TECH-STACK.md` (.NET 10 / Angular 22).

# Unified NGO PMS — Complete Technology Stack & Dependency Plan

**Date:** October 12, 2026
**Purpose:** Identify every technology, library, service, and tool required to build, test, deploy, and maintain the unified NGO Project Management System before writing any code.

---

# SECTION 1: BACKEND TECHNOLOGIES (.NET / ASP.NET Core)

---

## 1.1 Runtime & Framework

### ASP.NET Core 8 (LTS)
- **Purpose:** Primary backend framework for the Web API
- **Modules:** All backend modules
- **License:** MIT (fully open-source, free)
- **Self-hosted:** Yes — runs on Linux, Windows, macOS, Docker
- **Why this version:** .NET 8 is the current Long-Term Support release (supported until November 2026). .NET 9 is available but is Standard Term Support (shorter lifecycle). For a production NGO system, LTS stability is preferred.
- **Alternatives:** .NET 9 (latest but shorter support), .NET 6 (older LTS, end-of-life November 2024 — avoid)
- **Recommendation:** **.NET 8 LTS** — stable, well-documented, long support window

### C# 12
- **Purpose:** Primary backend programming language
- **License:** MIT (open-source)
- **Notes:** Ships with .NET 8. No separate installation.

---

## 1.2 ORM & Database Access

### Entity Framework Core 8 (EF Core)
- **Purpose:** Object-Relational Mapper for PostgreSQL database access
- **Modules:** All modules requiring database interaction (every module)
- **License:** MIT (free, open-source)
- **Self-hosted:** N/A (library, not a service)
- **Advantages:** Code-first migrations, LINQ queries, change tracking, interceptors for audit logging, excellent PostgreSQL support
- **Limitations:** Complex aggregation queries may need raw SQL or Dapper fallback; N+1 query risk if not careful with includes
- **Alternatives:** Dapper (micro-ORM, faster for raw queries but no migrations/change tracking), NHibernate (heavier, less community momentum)
- **Recommendation:** **EF Core 8 as primary ORM + Dapper for complex reporting queries** — best of both worlds

### Npgsql.EntityFrameworkCore.PostgreSQL 8.x
- **Purpose:** PostgreSQL provider for EF Core
- **Modules:** All (database layer)
- **License:** PostgreSQL License (permissive, free)
- **Self-hosted:** N/A (library)
- **Notes:** Enables EF Core to work with PostgreSQL. Supports JSONB columns, PostgreSQL enums, arrays, full-text search, and other PostgreSQL-specific features.
- **Recommendation:** **Required** — no alternative for EF Core + PostgreSQL

### Dapper 2.x
- **Purpose:** Lightweight micro-ORM for complex reporting queries and performance-critical reads
- **Modules:** Reporting (aggregation queries), Dashboard (KPI calculations), System Reports
- **License:** Apache 2.0 (free, open-source)
- **Self-hosted:** N/A (library)
- **Advantages:** Near-raw-SQL performance, maps directly to DTOs, excellent for complex JOINs and aggregations
- **Limitations:** No change tracking, no migrations, manual SQL
- **Recommendation:** **Use alongside EF Core** for read-heavy reporting queries

---

## 1.3 Authentication & Authorization

### ASP.NET Core Identity
- **Purpose:** User management, password hashing, account lockout, token generation
- **Modules:** Auth, User Management
- **License:** MIT (part of ASP.NET Core, free)
- **Self-hosted:** Yes
- **Advantages:** Built-in password hashing (PBKDF2), account confirmation, two-factor support, integrates seamlessly with EF Core
- **Limitations:** Default UI is Razor-based (not needed since we use Angular)
- **Recommendation:** **Use** — industry standard for .NET auth

### Microsoft.AspNetCore.Authentication.JwtBearer
- **Purpose:** JWT token validation middleware
- **Modules:** Auth (every authenticated endpoint)
- **License:** MIT (free)
- **Notes:** Validates JWT tokens from cookies or Authorization headers. Configurable token lifetime, issuer, audience validation.
- **Recommendation:** **Required**

### System.IdentityModel.Tokens.Jwt
- **Purpose:** JWT token generation and signing
- **Modules:** Auth
- **License:** MIT (free)
- **Recommendation:** **Required** — paired with JwtBearer for token creation

### Microsoft.AspNetCore.Authentication.OpenIdConnect
- **Purpose:** Optional SSO integration (Auth0, Entra ID, Okta, Google Workspace)
- **Modules:** Auth (optional SSO)
- **License:** MIT (free)
- **Self-hosted:** N/A (library; SSO providers are external)
- **Advantages:** Supports any OpenID Connect provider; organizations choose their own
- **Limitations:** Requires the external IdP to be configured; adds login complexity
- **Alternatives:** Provider-specific SDKs (more coupling, less flexible)
- **Recommendation:** **Include** — configurable per organization, not forced

---

## 1.4 API & Communication

### ASP.NET Core Minimal APIs + Controllers
- **Purpose:** RESTful API endpoints (250+ endpoints)
- **Modules:** All
- **License:** MIT (part of ASP.NET Core)
- **Notes:** Use Controllers for complex modules (Procurement, Reporting), Minimal APIs for simple CRUD (Config, Locations)
- **Recommendation:** **Controllers as primary** — better for complex business logic; Minimal APIs for lightweight endpoints

### Microsoft.AspNetCore.SignalR
- **Purpose:** Real-time WebSocket communication
- **Modules:** Chat (real-time messaging), Notifications (real-time push), Dashboard (live updates)
- **License:** MIT (part of ASP.NET Core, free)
- **Self-hosted:** Yes
- **Advantages:** Built into ASP.NET Core, supports WebSocket with automatic fallback to Server-Sent Events / Long Polling, hub-based architecture, group management for rooms/channels
- **Limitations:** Needs Redis backplane for horizontal scaling (multiple server instances)
- **Alternatives:** Raw WebSockets (more work, less features), third-party services like Pusher/Ably (paid)
- **Recommendation:** **Use SignalR** — free, built-in, production-proven

### Microsoft.AspNetCore.SignalR.StackExchangeRedis
- **Purpose:** Redis backplane for SignalR when running multiple API instances
- **Modules:** Chat, Notifications (scaling only)
- **License:** MIT (free)
- **Notes:** Only needed if running 2+ API server instances. Routes SignalR messages through Redis pub/sub so all instances see all messages.
- **Recommendation:** **Include for production** — essential for horizontal scaling

### Swashbuckle.AspNetCore (Swagger / OpenAPI)
- **Purpose:** Auto-generate API documentation from controllers
- **Modules:** All API endpoints
- **License:** MIT (free)
- **Advantages:** Interactive API explorer, generates OpenAPI 3.0 spec, supports auth headers
- **Alternatives:** NSwag (also generates client code), Microsoft.AspNetCore.OpenApi (newer, less mature)
- **Recommendation:** **Swashbuckle** — most mature and widely used

---

## 1.5 Validation & Mapping

### FluentValidation 11.x
- **Purpose:** Request DTO validation with expressive rules
- **Modules:** All (every API endpoint with input)
- **License:** Apache 2.0 (free, open-source)
- **Advantages:** Strongly-typed validation rules, conditional validation, custom validators, integrates with ASP.NET Core pipeline via MediatR behavior
- **Limitations:** Slightly more code than Data Annotations, but much more powerful
- **Alternatives:** Data Annotations (simpler but limited), manual validation (error-prone)
- **Recommendation:** **Use FluentValidation** — essential for complex business rules like "DIP budget cannot exceed activity budget" and "monthly plan dates must fall within quarterly plan dates"

### AutoMapper 13.x
- **Purpose:** Object-to-object mapping (Entity <-> DTO)
- **Modules:** All (mapping between domain entities and API DTOs)
- **License:** MIT (free)
- **Advantages:** Convention-based mapping reduces boilerplate, profile-based configuration
- **Limitations:** Can hide mapping bugs; debugging mapping issues can be tricky
- **Alternatives:** Mapster (faster, less popular), manual mapping (more control, more code)
- **Recommendation:** **AutoMapper** — proven at scale; use explicit profiles, avoid deep nesting

### MediatR 12.x
- **Purpose:** In-process mediator for CQRS (Command Query Responsibility Segregation)
- **Modules:** All (separates command/query handlers from controllers)
- **License:** Apache 2.0 (free)
- **Advantages:** Clean separation of concerns, pipeline behaviors for cross-cutting concerns (validation, logging, caching), testable handlers
- **Limitations:** Adds indirection; overkill for simple CRUD
- **Alternatives:** Direct service injection (simpler but couples controllers to business logic)
- **Recommendation:** **Use MediatR** — fits Clean Architecture pattern, enables validation and logging pipelines

---

## 1.6 Background Jobs & Scheduling

### Hangfire 1.8.x (Community Edition)
- **Purpose:** Background job processing and scheduled tasks
- **Modules:** Risk Management (automated risk evaluation), Procurement (contract expiry checks), Reporting (scheduled report generation), Notifications (batch email sending), KoboToolbox sync, Data exports
- **License:** LGPL v3 — Community Edition is **free** for commercial use. Pro edition ($500+/yr) adds batches and continuations.
- **Self-hosted:** Yes — uses PostgreSQL as job storage (no extra infrastructure)
- **Advantages:** Dashboard UI for monitoring jobs, retry on failure, cron-based scheduling, PostgreSQL storage (no Redis needed for basic use), fire-and-forget / delayed / recurring job types
- **Limitations:** Community edition lacks batch jobs and continuations; dashboard is read-only in some hosting scenarios
- **Alternatives evaluated:**
  - **Quartz.NET** — Free, more mature scheduler, but no built-in dashboard, more configuration overhead
  - **Coravel** — Lightweight, .NET-native, but less mature for production workloads
  - **Azure Functions / AWS Lambda** — Serverless, but adds cloud vendor lock-in and cost
- **Recommendation:** **Hangfire Community Edition** — free, self-hosted, PostgreSQL storage, built-in dashboard. Sufficient for our job types (risk evaluation runs, contract expiry checks, report generation, notification dispatch). If batch jobs become needed later, upgrade to Pro.

### Hangfire.PostgreSql
- **Purpose:** PostgreSQL storage provider for Hangfire
- **License:** MIT (free)
- **Notes:** Stores job state in the same Supabase PostgreSQL database — no additional infrastructure.
- **Recommendation:** **Required** if using Hangfire

---

## 1.7 Email Sending

### MailKit 4.x + MimeKit
- **Purpose:** Send transactional emails (password reset, account setup, notifications, approval alerts, procurement notifications, report submission alerts)
- **Modules:** Auth (password reset/setup), Notifications (email channel), Procurement (PO emails), Reporting (submission alerts), Feedback (reply notifications)
- **License:** MIT (free, open-source)
- **Self-hosted:** N/A (library; connects to an SMTP server)
- **Advantages:** Full MIME support, HTML emails with templates, attachments, async sending, robust error handling, supports all SMTP providers
- **Limitations:** You need an SMTP server/service to actually deliver emails
- **Alternatives:** FluentEmail (higher-level wrapper around MailKit, adds Razor templating), System.Net.Mail (built-in but deprecated for new projects)
- **Recommendation:** **MailKit** — industry standard for .NET email

### SMTP Service Options (for actual email delivery)

| Service | Free Tier | Cost Beyond Free | Self-Hosted | Notes |
|---------|-----------|------------------|-------------|-------|
| **Brevo (Sendinblue)** | 300 emails/day | $9/mo for 5K/mo | No | System B already uses this; good deliverability |
| **Mailgun** | 100 emails/day (trial) | $0.80/1000 emails | No | Great API, good deliverability |
| **Amazon SES** | 62K/mo if from EC2 | $0.10/1000 emails | No | Cheapest at scale, requires AWS |
| **Postal** | Unlimited (self-hosted) | Free | **Yes** | Open-source mail server; requires own server + DNS config |
| **Mailtrap** | 100 emails/mo | $10/mo for 10K/mo | No | Excellent for testing (email sandbox) |
| **SMTP2GO** | 1000 emails/mo | $10/mo for 10K/mo | No | Simple setup |

- **Recommendation for development:** **Mailtrap** free tier (email sandbox, see emails without sending to real addresses)
- **Recommendation for production:** **Brevo** free tier (300/day = ~9000/month, likely sufficient for a single NGO). If volume grows, **Amazon SES** ($0.10/1000) is the cheapest option. If the NGO wants full control and has server admin capacity, **Postal** (self-hosted, open-source) is the zero-cost option.

---

## 1.8 Push Notifications (FCM)

### FirebaseAdmin 3.x (.NET)
- **Purpose:** Send push notifications to mobile (Flutter) and web browsers via Firebase Cloud Messaging
- **Modules:** Notifications (push channel), Chat (new message alerts), Tasks (assignment alerts), Graduation (ready-to-graduate alerts)
- **License:** Apache 2.0 (free)
- **Self-hosted:** No — FCM is a Google service
- **Service cost:** **Free** — FCM has no per-message cost and no usage limits for standard messaging
- **Advantages:** Free unlimited push notifications, supports Android + iOS + Web, topic-based and device-based targeting
- **Limitations:** Requires Google account; depends on Google infrastructure; no guaranteed delivery SLA; messages can be delayed on battery-optimized devices
- **Alternatives evaluated:**
  - **OneSignal** — Free tier (10K subscribers), simpler setup, but adds a middleman
  - **Ntfy** — Open-source, self-hosted push notifications, but no iOS support without additional setup
  - **UnifiedPush** — Open-source standard, but fragmented ecosystem
  - **Web Push (VAPID)** — Free, self-hosted, browser-only (no mobile native support)
- **Recommendation:** **FCM via FirebaseAdmin** — free, unlimited, proven, supports all platforms. System B already uses Firebase, so infrastructure exists. For web-only notifications, SignalR handles real-time; FCM covers mobile push and web push when the app is closed.

---

## 1.9 File Storage

### Supabase Storage
- **Purpose:** Store uploaded files: documents, photos, attachments, profile pictures, procurement documents, report attachments, training photos
- **Modules:** Documents, Participants (photos), Procurement (contract files, PO attachments), Reporting (report attachments), Chat (file attachments), Forms (camera/file uploads)
- **License:** Apache 2.0 (Supabase is open-source)
- **Self-hosted:** Yes — Supabase can be self-hosted; Storage uses S3-compatible backend
- **Service cost:** Supabase free tier includes 1GB storage; Pro plan ($25/mo) includes 100GB. Self-hosted: cost of your own S3-compatible storage.
- **Advantages:** Integrated with Supabase auth and RLS, S3-compatible API, CDN delivery, image transformations, access policies per bucket
- **Limitations:** Vendor-specific API (though S3-compatible); 50MB file size limit on free tier
- **Alternatives evaluated:**
  - **AWS S3** — $0.023/GB/mo, unlimited, industry standard, but requires AWS account (System B uses this)
  - **MinIO** — Open-source S3-compatible object storage, **fully self-hosted**, free
  - **Azure Blob Storage** — $0.018/GB/mo, good if using Azure
  - **Local filesystem** — Free but not scalable, no CDN, backup complexity
- **Recommendation:** **Supabase Storage** as primary (already using Supabase for DB). Implement the storage service behind an interface (`IStorageService`) so it can be swapped to MinIO (self-hosted) or AWS S3 later without code changes.

---

## 1.10 Document Generation (PDF, Excel, Word)

### QuestPDF 2024.x
- **Purpose:** Generate PDF reports, export reports to PDF, generate PDF procurement documents (PO, GRN, invoices)
- **Modules:** Reporting (all 7 types + system reports), Procurement (PO, invoices), MEAL (evaluation reports), Beneficiary (export), Finance (budget reports)
- **License:** **MIT** (free for any use since 2024.3+; earlier versions had a Community License with revenue limits)
- **Self-hosted:** N/A (library)
- **Advantages:** Fluent C# API (no HTML-to-PDF conversion needed), pixel-perfect layouts, tables, images, page headers/footers, automatic pagination, fast generation
- **Limitations:** Learning curve for complex layouts; no HTML template support (purely code-driven)
- **Alternatives evaluated:**
  - **DinkToPdf / Puppeteer Sharp** — HTML-to-PDF via headless Chromium. More flexible for HTML templates but heavy dependency (Chromium binary), slower, memory-intensive.
  - **iTextSharp / iText 7** — Powerful but **AGPL license** (requires open-sourcing your code or buying commercial license at ~$2,500/yr). Not suitable.
  - **Rotativa** — Wraps wkhtmltopdf, aging, limited maintenance
  - **PdfSharp** — Low-level, no high-level layout API, more work
- **Recommendation:** **QuestPDF** — free (MIT), fast, fluent API, actively maintained. Best option for .NET PDF generation.

### ClosedXML 0.102+
- **Purpose:** Generate Excel (XLSX) files for report exports, data exports, budget reports, beneficiary exports, procurement reports, import templates
- **Modules:** Reporting (Excel export), Import/Export, Budget, Beneficiary, Procurement
- **License:** MIT (free, open-source)
- **Self-hosted:** N/A (library)
- **Advantages:** Simple API, supports formatting, formulas, charts, multiple sheets, auto-filter, freeze panes, cell styles
- **Limitations:** Large files (100K+ rows) can be memory-intensive; no streaming write mode
- **Alternatives evaluated:**
  - **EPPlus 7** — More features (pivot tables, charts), but **Polyform Noncommercial License** for free use (commercial use requires license at ~$300/yr). Earlier EPPlus 5 was LGPL.
  - **NPOI** — Port of Apache POI, supports XLS and XLSX, free (Apache 2.0), but API is less intuitive
  - **OpenXML SDK** — Microsoft's low-level SDK, free, but very verbose (you're writing raw XML)
  - **MiniExcel** — Lightweight, streaming, great for large files, MIT license
- **Recommendation:** **ClosedXML** for standard reports (simple API, covers 90% of needs). **MiniExcel** as supplement for large data exports (100K+ rows) where streaming is needed. Both are MIT/free.

### DocumentFormat.OpenXml (Open XML SDK) 3.x
- **Purpose:** Generate Word (DOCX) documents for report exports
- **Modules:** Reporting (Word export for donor reports)
- **License:** MIT (free, Microsoft open-source)
- **Self-hosted:** N/A (library)
- **Advantages:** Full control over DOCX structure, supports headers/footers/tables/styles/images
- **Limitations:** Verbose API — generating a simple document requires significant code
- **Alternatives:** None better for free DOCX generation in .NET. TemplateEngine.Docx (template-based, simpler for mail-merge style documents, MIT license) can supplement.
- **Recommendation:** **Open XML SDK** for complex documents + **TemplateEngine.Docx** for template-based reports

---

## 1.11 Caching

### StackExchange.Redis 2.x
- **Purpose:** Distributed caching for frequently accessed data (dropdown lists, configuration, exchange rates, permission lookups, dashboard KPIs)
- **Modules:** All (performance optimization), Dashboard (cached KPIs), RBAC (cached permissions), Config (cached settings)
- **License:** MIT (free)
- **Self-hosted:** N/A (library; connects to a Redis server)

### Redis Server
- **Purpose:** In-memory cache store + SignalR backplane + Hangfire performance (optional)
- **License:** **Redis Source Available License (RSALv2)** since Redis 7.4 — free to use, cannot sell Redis-as-a-service. For our purposes (internal cache), this is functionally free.
- **Self-hosted:** Yes — runs on Linux (Docker recommended)
- **Service cost:** Self-hosted = free. Managed: Upstash (free tier 10K commands/day), Redis Cloud (free tier 30MB), AWS ElastiCache ($13+/mo)
- **Alternatives evaluated:**
  - **Valkey** — Fork of Redis 7.2, fully open-source (BSD), community-maintained by Linux Foundation. Drop-in replacement for Redis.
  - **Dragonfly** — Redis-compatible, 25x faster, BSL license (free for use, cannot compete with Dragonfly)
  - **Garnet** — Microsoft's Redis-compatible cache, MIT license, very new
  - **In-memory cache (IMemoryCache)** — Built into ASP.NET Core, zero dependencies, but single-server only (no sharing across instances)
- **Recommendation:** **Start with IMemoryCache** (zero cost, zero infra) for single-server deployment. **Add Valkey or Redis** when scaling to multiple API instances. Valkey is recommended over Redis for its fully open-source BSD license.

---

## 1.12 Logging & Monitoring

### Serilog 4.x
- **Purpose:** Structured logging for the entire backend
- **Modules:** All (application logging, error tracking, audit trail)
- **License:** Apache 2.0 (free)
- **Advantages:** Structured logging (JSON), multiple sinks (console, file, database, Seq, Elasticsearch), enrichers for request context, correlation IDs
- **Recommendation:** **Use Serilog** — industry standard for .NET logging

### Serilog Sinks (all free/open-source)
- **Serilog.Sinks.Console** — Development logging
- **Serilog.Sinks.File** — File-based logging for production
- **Serilog.Sinks.PostgreSQL** — Log to the same Supabase PostgreSQL (for audit logs and system logs)
- **Serilog.Sinks.Seq** — (Optional) Log aggregation UI

### Seq (Optional)
- **Purpose:** Log aggregation, search, and visualization dashboard
- **License:** Free for single user; $140/yr for teams
- **Self-hosted:** Yes
- **Alternatives:** ELK Stack (Elasticsearch + Logstash + Kibana) — free but heavy infrastructure; Grafana Loki — free, lighter
- **Recommendation:** **Seq free tier** for development. For production, **Grafana Loki + Grafana** (both free/open-source) if you want a dashboard, or just **file logging** if budget is constrained.

### Health Checks (Microsoft.AspNetCore.Diagnostics.HealthChecks)
- **Purpose:** Endpoint health monitoring (/health) for DB, Redis, external services
- **License:** MIT (free)
- **Recommendation:** **Include** — standard practice for production APIs

---

## 1.13 Security Libraries

### Microsoft.AspNetCore.RateLimiting
- **Purpose:** Rate limiting on authentication endpoints, public endpoints
- **Modules:** Auth (prevent brute force), Public endpoints (vendor portal, feedback)
- **License:** MIT (free, built into ASP.NET Core 8)
- **Recommendation:** **Use** — no separate package needed

### Microsoft.AspNetCore.Cors
- **Purpose:** Cross-Origin Resource Sharing configuration
- **License:** MIT (built into ASP.NET Core)
- **Recommendation:** **Required** — Angular frontend runs on different origin

### Microsoft.AspNetCore.DataProtection
- **Purpose:** Encrypt sensitive data at rest (cookie protection, token encryption)
- **License:** MIT (built into ASP.NET Core)
- **Recommendation:** **Required**

---

## 1.14 Other Backend Libraries

### Humanizer 2.x
- **Purpose:** Human-readable strings (time ago, file sizes, pluralization)
- **License:** MIT (free)
- **Modules:** Notifications (message formatting), UI display

### TimeZoneConverter 6.x
- **Purpose:** Cross-platform timezone handling (Ethiopian timezone)
- **License:** MIT (free)
- **Modules:** All date/time handling

### CsvHelper 31.x
- **Purpose:** CSV parsing and generation
- **License:** MS-PL / Apache 2.0 (free)
- **Modules:** Import/Export (CSV import/export)

### SixLabors.ImageSharp 3.x
- **Purpose:** Image processing (resize, crop, format conversion for uploads)
- **License:** Apache 2.0 (free for use; Six Labors Commercial License for SaaS resale)
- **Modules:** Participants (photo processing), Documents (image thumbnails)
- **Recommendation:** **Use** — free for our use case (internal system, not reselling image processing)

### Polly 8.x
- **Purpose:** Resilience and retry policies for external service calls
- **License:** BSD 3-Clause (free)
- **Modules:** Email sending (retry), FCM (retry), KoboToolbox API (retry), AI providers (retry with fallback)
- **Recommendation:** **Use** — essential for reliable external service integration
