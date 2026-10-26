> **⚠ SUPERSEDED** — Replaced by `docs/plans/00-TECH-STACK.md`.

# SECTION 6: INFRASTRUCTURE & DEVOPS

---

## 6.1 Containerization

### Docker + Docker Compose
- **Purpose:** Containerize the API, Angular app, Redis/Valkey, and PostgreSQL for consistent development and deployment
- **License:** Apache 2.0 (Docker Engine is free); Docker Desktop is free for small businesses (<250 employees, <$10M revenue) — NGOs qualify.
- **Self-hosted:** Yes
- **Containers needed:**
  - `ngo-pms-api` — ASP.NET Core Web API
  - `ngo-pms-web` — Angular app served by Nginx
  - `postgres` — PostgreSQL 15+ (development only; production uses Supabase)
  - `valkey` — Cache + SignalR backplane (production only if scaling)
  - `hangfire-worker` — Background job processor (can be same container as API)
- **Recommendation:** **Required** — Docker Compose for local development; Docker images for deployment

---

## 6.2 Web Server / Reverse Proxy

### Nginx
- **Purpose:** Serve Angular static files, reverse proxy to ASP.NET Core API, SSL termination, WebSocket proxying for SignalR
- **License:** BSD-2-Clause (free, open-source)
- **Self-hosted:** Yes
- **Advantages:** High performance, low memory, proven at scale, excellent WebSocket support
- **Alternatives:** Caddy (auto-HTTPS, simpler config, but less ecosystem), Apache (heavier, older), YARP (ASP.NET Core built-in reverse proxy — good for .NET-to-.NET proxying)
- **Recommendation:** **Nginx** — serves the Angular SPA, proxies /api/* to ASP.NET Core, handles SSL

---

## 6.3 SSL / HTTPS

### Let's Encrypt + Certbot
- **Purpose:** Free SSL/TLS certificates for HTTPS
- **License:** Free (non-profit CA)
- **Self-hosted:** Yes (Certbot runs on your server)
- **Advantages:** Free, auto-renewable (90-day certificates with auto-renewal), widely trusted
- **Alternatives:** Cloudflare (free SSL proxy), paid certificates (unnecessary)
- **Recommendation:** **Let's Encrypt** — free, automatic, standard practice

---

## 6.4 CI/CD Pipeline

### GitHub Actions
- **Purpose:** Continuous Integration and Continuous Deployment
- **License:** Free for public repos; free tier for private repos (2,000 minutes/month)
- **Advantages:** Integrated with GitHub, YAML-based workflows, extensive marketplace of actions, supports .NET and Node.js
- **Pipeline stages:**
  1. Build & lint (backend + frontend)
  2. Run unit tests
  3. Run integration tests (with Testcontainers PostgreSQL)
  4. Build Docker images
  5. Deploy to staging
  6. Run E2E tests against staging
  7. Deploy to production (manual approval)
- **Alternatives:**
  - GitLab CI/CD — Free (400 minutes/month on gitlab.com), better if using GitLab
  - Azure DevOps — Free (1,800 minutes/month), good if using Azure
  - Jenkins — Free (self-hosted), but high maintenance overhead
- **Recommendation:** **GitHub Actions** — free tier is sufficient, widely used, good documentation. If the repo is on GitLab, use GitLab CI/CD instead.

---

## 6.5 Hosting / Deployment Options

### Option A: VPS (Recommended for Cost-Conscious NGO)

| Provider | Spec | Cost | Notes |
|----------|------|------|-------|
| **Hetzner Cloud** | CX31: 4 vCPU, 8GB RAM, 80GB SSD | ~€8.50/mo (~$9) | Best value; European data centers |
| **DigitalOcean** | Basic Droplet: 4 vCPU, 8GB RAM | $48/mo | US/EU/Asia data centers |
| **Contabo** | VPS M: 6 vCPU, 16GB RAM, 400GB | ~€9/mo (~$10) | Cheapest raw specs |
| **Oracle Cloud Free** | ARM: 4 OCPU, 24GB RAM | **Free forever** | Generous free tier, but limited availability |

**Total monthly cost (VPS route):** ~$9-50/mo (VPS) + $25/mo (Supabase Pro) = **$34-75/month**

### Option B: Cloud Platform (Higher cost, less management)

| Service | Purpose | Cost |
|---------|---------|------|
| Azure App Service (B1) | Host API | $13/mo |
| Azure Static Web Apps | Host Angular | Free |
| Supabase Pro | Database + Storage | $25/mo |
| **Total** | | **~$38/month** |

### Option C: Fully Self-Hosted (Maximum control, zero recurring cost beyond server)

Run everything on a single VPS or on-premise server:
- PostgreSQL (direct install, no Supabase)
- ASP.NET Core API (Kestrel behind Nginx)
- Angular (Nginx static files)
- Valkey (cache)
- MinIO (file storage instead of Supabase Storage)
- **Cost:** Server hardware/VPS only

**Recommendation:** **Option A (VPS + Supabase Pro)** — best balance of cost (~$34/mo), managed database with backups, and control over the application server. For an NGO, this is sustainable.

---

## 6.6 Domain & DNS

### Cloudflare (Free Plan)
- **Purpose:** DNS management, DDoS protection, CDN for static assets, free SSL proxy
- **License:** Free plan available
- **Advantages:** Free CDN, free DDoS protection, DNS management, page rules, analytics
- **Recommendation:** **Use Cloudflare free tier** — significant performance and security benefits at zero cost

---

## 6.7 Monitoring & Alerting (Production)

### Uptime Kuma
- **Purpose:** Self-hosted uptime monitoring with alerts
- **License:** MIT (free, open-source)
- **Self-hosted:** Yes (runs in Docker)
- **Advantages:** Monitors HTTP endpoints, WebSocket, database; alerts via email, Telegram, Slack, Discord; beautiful dashboard
- **Alternatives:** UptimeRobot (free tier: 50 monitors), Pingdom (paid), Betterstack (free tier)
- **Recommendation:** **Uptime Kuma** — self-hosted, free, comprehensive

### Grafana + Prometheus (Optional, for detailed metrics)
- **Purpose:** Application performance metrics, custom dashboards
- **License:** AGPL v3 (Grafana, free), Apache 2.0 (Prometheus, free)
- **Self-hosted:** Yes
- **Notes:** Only add if operational monitoring needs grow beyond basic uptime checks
- **Recommendation:** **Defer to Phase 8** — start with Uptime Kuma and Serilog structured logging; add Grafana/Prometheus when the team has bandwidth

---

# SECTION 7: DEVELOPMENT TOOLS

---

## 7.1 IDE & Editors

### Visual Studio 2022 Community Edition
- **Purpose:** Backend development (ASP.NET Core, C#)
- **License:** Free for individuals, open-source, education, and organizations with ≤5 users. NGOs typically qualify.
- **Alternatives:** JetBrains Rider ($149/yr, better refactoring), VS Code + C# Dev Kit (free, lighter)
- **Recommendation:** **VS 2022 Community** or **VS Code with C# Dev Kit** — both free

### Visual Studio Code
- **Purpose:** Frontend development (Angular, TypeScript), Flutter development
- **License:** MIT (free)
- **Extensions needed:** Angular Language Service, ESLint, Prettier, GitLens, Docker, Flutter, Dart
- **Recommendation:** **Use for frontend and Flutter** development

---

## 7.2 Source Control

### Git + GitHub (or GitLab)
- **Purpose:** Version control and collaboration
- **GitHub License:** Free for unlimited public/private repos; Teams ($4/user/mo) for advanced features
- **GitLab License:** Free tier includes CI/CD (400 min/mo), private repos
- **Recommendation:** **GitHub Free** — sufficient for the project; upgrade to Teams only if needed

---

## 7.3 Package Managers

### NuGet
- **Purpose:** .NET package management
- **License:** Free
- **Notes:** Standard for all .NET libraries listed in this document

### npm
- **Purpose:** JavaScript/TypeScript package management (Angular)
- **License:** Free
- **Notes:** Standard for all frontend libraries listed in this document

### pub (Dart/Flutter)
- **Purpose:** Flutter package management
- **License:** Free
- **Notes:** Standard for all Flutter packages listed in this document

---

# SECTION 8: EXTERNAL SERVICE INTEGRATIONS

---

## 8.1 KoboToolbox Integration

### KoboToolbox API
- **Purpose:** Sync field data collection forms and submissions
- **Modules:** Forms (KoboToolbox sync), Data Collection
- **License:** Open-source platform; free hosted service at kf.kobotoolbox.org (unlimited submissions for NGOs)
- **Self-hosted:** Yes — KoboToolbox can be self-hosted
- **Integration method:** REST API — pull form definitions and submissions, push form schemas
- **Notes:** Both existing systems integrate with KoboToolbox. The unified system should support bidirectional sync: push form definitions to Kobo, pull submissions back.
- **Recommendation:** **Continue integration** — KoboToolbox is the standard data collection tool for humanitarian organizations

---

## 8.2 AI Integration (Optional Module)

### AI Provider Options

| Provider | Free Tier | Cost | Self-Hosted | Notes |
|----------|-----------|------|-------------|-------|
| **Ollama** | Unlimited (local) | Free (self-hosted) | **Yes** | Run open-source models (Llama 3, Mistral) locally; no internet needed |
| **Google Gemini** | 60 req/min free | $0.075/1M tokens (Flash) | No | Good free tier; System A uses this |
| **OpenAI** | None | $0.15-$60/1M tokens | No | Best quality but expensive |
| **Anthropic Claude** | None | $3-$15/1M tokens | No | Strong reasoning |

- **Recommendation:** **Ollama as default (free, self-hosted, no data leaves the server)** with optional cloud providers (Gemini, OpenAI, Claude) configurable per organization. This respects data sensitivity (NGO participant data shouldn't go to external AI providers by default).

### Microsoft.Extensions.AI (Preview)
- **Purpose:** Unified .NET abstraction for AI providers
- **License:** MIT (free)
- **Notes:** Microsoft's new abstraction layer that provides a common interface for different AI providers. Allows swapping providers without changing application code.
- **Recommendation:** **Use if stable by implementation time** — otherwise build a simple provider abstraction interface

---

## 8.3 SMS Gateway (Optional, for future use)

Neither existing system uses SMS, but NGOs operating in areas with limited internet may need it for notifications to beneficiaries or staff.

| Provider | Free Tier | Cost | Self-Hosted | Notes |
|----------|-----------|------|-------------|-------|
| **Africa's Talking** | Free sandbox | ~$0.02/SMS (Ethiopia) | No | Best coverage in Africa |
| **Twilio** | Free trial ($15 credit) | ~$0.05/SMS (Ethiopia) | No | Most popular globally |
| **RapidPro** | Open-source | Free (self-hosted) | **Yes** | UNICEF-developed, designed for NGOs |

- **Recommendation:** **Defer to post-launch.** Design the notification service with an `ISmsService` interface so SMS can be added later. If needed, **RapidPro** (UNICEF's open-source platform, designed specifically for NGO communication) is the best fit.

---

# SECTION 9: COMPLETE DEPENDENCY SUMMARY

---

## 9.1 Backend NuGet Packages (all free/open-source)

```xml
<!-- Framework -->
Microsoft.AspNetCore.App (implicit, .NET 8)

<!-- Database -->
Microsoft.EntityFrameworkCore 8.x
Npgsql.EntityFrameworkCore.PostgreSQL 8.x
Dapper 2.x
DbUp-PostgreSQL 5.x
Finbuckle.MultiTenant 7.x (multi-tenancy resolution + per-tenant DbContext)

<!-- Architecture (v2 additions) -->
Audit.NET.EntityFrameworkCore 23.x (automatic audit trail)
Stateless 5.x (state machine workflows)
NodaMoney 3.x (financial arithmetic without float errors)
Microsoft.RulesEngine 5.x (dynamic business rules per org)
OpenFeature 2.x (CNCF per-tenant feature flags)
ArchUnitNET 0.11.x (architecture fitness tests in CI)

<!-- Auth -->
Microsoft.AspNetCore.Identity.EntityFrameworkCore 8.x
Microsoft.AspNetCore.Authentication.JwtBearer 8.x
System.IdentityModel.Tokens.Jwt 7.x
Microsoft.AspNetCore.Authentication.OpenIdConnect 8.x (optional SSO)

<!-- API -->
Microsoft.AspNetCore.SignalR 8.x (built-in)
Microsoft.AspNetCore.SignalR.StackExchangeRedis 8.x
Swashbuckle.AspNetCore 6.x

<!-- Application -->
MediatR 12.x
AutoMapper 13.x
FluentValidation.AspNetCore 11.x

<!-- Background Jobs -->
Hangfire.Core 1.8.x
Hangfire.AspNetCore 1.8.x
Hangfire.PostgreSql 1.x

<!-- Email -->
MailKit 4.x

<!-- Push Notifications -->
FirebaseAdmin 3.x

<!-- Document Generation -->
QuestPDF 2024.x (PDF)
ClosedXML 0.102.x (Excel)
MiniExcel 1.x (large Excel exports)
DocumentFormat.OpenXml 3.x (Word)

<!-- Caching -->
StackExchange.Redis 2.x (when scaling)

<!-- Logging -->
Serilog.AspNetCore 8.x
Serilog.Sinks.Console
Serilog.Sinks.File
Serilog.Sinks.PostgreSQL

<!-- Security -->
Microsoft.AspNetCore.RateLimiting (built-in)

<!-- Utilities -->
Humanizer 2.x
TimeZoneConverter 6.x
CsvHelper 31.x
SixLabors.ImageSharp 3.x
Polly 8.x

<!-- Testing -->
xUnit 2.x
NSubstitute 5.x
FluentAssertions 7.x
Microsoft.AspNetCore.Mvc.Testing 8.x
Testcontainers.PostgreSql 3.x
Bogus 35.x
Respawn 6.x
NBomber 5.x
```

## 9.2 Frontend npm Packages (all free/open-source)

```json
{
  "dependencies": {
    "@angular/core": "^18.0.0",
    "@angular/material": "^18.0.0",
    "@angular/cdk": "^18.0.0",
    "@ngrx/store": "^18.0.0",
    "@ngrx/effects": "^18.0.0",
    "@ngrx/entity": "^18.0.0",
    "@ngx-translate/core": "^15.0.0",
    "@ngx-translate/http-loader": "^8.0.0",
    "@microsoft/signalr": "^8.0.0",
    "ag-grid-angular": "^31.0.0",
    "ag-grid-community": "^31.0.0",
    "echarts": "^5.5.0",
    "ngx-echarts": "^18.0.0",
    "leaflet": "^1.9.0",
    "@asymmetrik/ngx-leaflet": "^18.0.0",
    "ngx-formly": "^6.0.0",
    "ngx-quill": "^24.0.0",
    "quill": "^2.0.0",
    "date-fns": "^3.0.0",
    "ethiopian-calendar-date-converter": "^1.0.0",
    "file-saver": "^2.0.0",
    "xlsx": "^0.18.0",
    "ngx-file-drop": "^16.0.0",
    "ngx-permissions": "^14.0.0",
    "ngx-toastr": "^18.0.0",
    "@ngneat/until-destroy": "^10.0.0",
    "jspdf": "^2.5.0",
    "jspdf-autotable": "^3.8.0"
  },
  "devDependencies": {
    "@angular/cli": "^18.0.0",
    "typescript": "~5.5.0",
    "jest": "^29.0.0",
    "@angular-builders/jest": "^18.0.0",
    "playwright": "^1.40.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

## 9.3 Flutter pub.dev Packages (all free/open-source)

```yaml
dependencies:
  flutter_riverpod: ^2.5.0
  dio: ^5.4.0
  drift: ^2.16.0
  drift_flutter: ^0.1.0
  connectivity_plus: ^6.0.0
  flutter_secure_storage: ^9.0.0
  geolocator: ^12.0.0
  camera: ^0.11.0
  image_picker: ^1.0.0
  mobile_scanner: ^5.0.0
  flutter_map: ^7.0.0
  latlong2: ^0.9.0
  firebase_messaging: ^15.0.0
  firebase_core: ^3.0.0
  flutter_local_notifications: ^17.0.0
  intl: ^0.19.0
  signature_pad: any
  path_provider: ^2.1.0
  json_annotation: ^4.9.0

dev_dependencies:
  flutter_test: sdk
  mockito: ^5.4.0
  build_runner: ^2.4.0
  drift_dev: ^2.16.0
  json_serializable: ^6.8.0
```

---

## 9.4 Infrastructure Cost Summary

### Minimum Viable Production (Single VPS + Supabase)

| Item | Monthly Cost |
|------|-------------|
| Hetzner VPS (CX31: 4 vCPU, 8GB RAM) | $9 |
| Supabase Pro (PostgreSQL + Storage) | $25 |
| Cloudflare (DNS, CDN, SSL) | Free |
| Let's Encrypt (SSL certificates) | Free |
| FCM Push Notifications | Free |
| Brevo Email (300/day) | Free |
| GitHub (source control + CI/CD) | Free |
| KoboToolbox (hosted) | Free for NGOs |
| Ollama AI (self-hosted on VPS) | Free |
| **Total** | **~$34/month** |

### Recommended Production (More headroom)

| Item | Monthly Cost |
|------|-------------|
| Hetzner VPS (CX41: 8 vCPU, 16GB RAM) | $16 |
| Supabase Pro | $25 |
| Brevo Starter (20K emails/mo) | $9 |
| Cloudflare Free | Free |
| Everything else | Free |
| **Total** | **~$50/month** |

### Fully Self-Hosted (No recurring cloud services)

| Item | Monthly Cost |
|------|-------------|
| Dedicated server or VPS | $10-50 |
| PostgreSQL (self-managed) | Free |
| MinIO (storage, self-hosted) | Free |
| Postal (email, self-hosted) | Free |
| Everything else | Free |
| **Total** | **$10-50/month** (server only) |

---

## 9.5 License Compliance Summary

**All recommended technologies are free for commercial/NGO use.** No paid licenses are required for the core system.

| License Type | Packages |
|---|---|
| **MIT** | ASP.NET Core, EF Core, Angular, Angular Material, SignalR, AutoMapper, ClosedXML, QuestPDF, MailKit, Serilog, most npm/NuGet packages |
| **Apache 2.0** | MediatR, FluentValidation, FirebaseAdmin, Supabase, ECharts, Polly, Playwright |
| **BSD** | PostgreSQL, Flutter, Dart, Leaflet, NSubstitute |
| **LGPL v3** | Hangfire Community (free for commercial use, must link dynamically — NuGet package reference satisfies this) |

**No AGPL, no GPL (except Grafana which is optional), no proprietary licenses in the core stack.**

---

## 9.6 Technology Decision Matrix

| Decision | Recommended | Runner-up | Why |
|----------|-------------|-----------|-----|
| ORM | EF Core + Dapper | EF Core only | Dapper for complex reporting queries |
| State Management | NgRx | Signals + Services | NgRx for large app with shared state |
| UI Components | Angular Material + AG Grid | PrimeNG | Material is official; AG Grid for data tables |
| Charts | Apache ECharts | Chart.js | ECharts covers all chart types needed |
| PDF Generation | QuestPDF | DinkToPdf | QuestPDF is MIT, no Chromium dependency |
| Excel Generation | ClosedXML + MiniExcel | EPPlus | ClosedXML is MIT; EPPlus requires license |
| Background Jobs | Hangfire | Quartz.NET | Hangfire has built-in dashboard |
| Cache | IMemoryCache → Valkey | Redis | Start simple, scale when needed |
| Email SMTP | Brevo free → Amazon SES | Postal (self-hosted) | Brevo free tier covers early needs |
| Maps | Leaflet + OSM | Mapbox | Completely free, no API key |
| E2E Tests | Playwright | Cypress | Multi-browser, faster, better for multi-user flows |
| API Testing | Bruno | Postman | Free, open-source, Git-friendly |
| Monitoring | Uptime Kuma | Better Stack | Self-hosted, free |
| AI | Ollama (local) | Gemini (cloud) | Free, data stays on-premises |
| Hosting | Hetzner VPS + Supabase | Azure | ~$34/mo vs $50+/mo |
