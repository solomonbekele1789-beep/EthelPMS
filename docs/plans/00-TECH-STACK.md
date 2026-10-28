# EthelPMS — Authoritative Technology Stack Reference

**Version:** 1.0
**Date:** October 15, 2026
**Status:** This file is the single source of truth for all versions and packages.

> **Rule:** If any other document in this repository references a different version, THIS FILE wins. All older Technology Stack documents (Parts 1-3, TECHNOLOGY_VERSIONS.md) are superseded by this file for version numbers.

---

## Core Frameworks

| Technology | Version | Notes |
|-----------|---------|-------|
| **.NET** | 10.0 (Preview → GA Nov 2026) | Pin with `global.json` |
| **C#** | 13 | Matches .NET 10 SDK |
| **ASP.NET Core** | 10.0 | Web API, SignalR, Identity |
| **Angular** | 22.1.x | Actual version installed in workspace |
| **TypeScript** | 6.0.x | Matches Angular 22 |
| **Node.js** | 22.x LTS | Required for Angular CLI |
| **PostgreSQL** | 16+ | Supabase managed |
| **Nx** | 23.3.x | Angular monorepo tooling |

---

## Backend NuGet Packages

### Microsoft First-Party

| Package | Version | Purpose |
|---------|---------|---------|
| Microsoft.EntityFrameworkCore | **10.0.12** | ORM (use this version everywhere, not preview) |
| Npgsql.EntityFrameworkCore.PostgreSQL | 10.0.3 | PostgreSQL EF provider |
| Microsoft.AspNetCore.Identity.EntityFrameworkCore | 10.0.12 | User/role management |
| Microsoft.AspNetCore.Authentication.JwtBearer | 10.0.12 | JWT authentication |
| Microsoft.AspNetCore.OpenApi | 10.0.12 | OpenAPI support |
| Microsoft.AspNetCore.SignalR | (built-in) | Real-time communication |
| Microsoft.Extensions.Caching.StackExchangeRedis | 10.0.x | Distributed caching (Phase 10+) |

### Core Third-Party

| Package | Version | Purpose | Install Where |
|---------|---------|---------|--------------|
| MediatR | 14.2.0 | CQRS command/query dispatch | Each Module.Application |
| MediatR.Contracts | 2.0.1 | INotification interface | SharedKernel |
| FluentValidation | 12.2.0 | Request validation | Each Module.Application |
| FluentValidation.DependencyInjectionExtensions | 12.2.0 | DI integration | Host API |
| AutoMapper | 16.2.0 | Object mapping | Each Module.Application |
| Serilog.AspNetCore | 10.0.0 | Structured logging | Host API |
| Serilog.Sinks.Console | 6.1.1 | Console output | Host API |
| Serilog.Sinks.File | 7.0.0 | File output | Host API |
| Swashbuckle.AspNetCore | 10.3.0 | Swagger UI | Host API |
| Dapper | 2.1.89 | Raw SQL queries (read models) | Modules that need it |
| Polly | 8.8.0 | Resilience/retry policies | Host API, Infrastructure |
| NodaMoney | 2.9.0 | Financial arithmetic | SharedKernel |

### Architecture & Multi-Tenancy

| Package | Version | Purpose | Install Where |
|---------|---------|---------|--------------|
| Finbuckle.MultiTenant | 10.1.4 | Tenant resolution | Host API |
| Hangfire.AspNetCore | 1.8.25 | Background jobs | Host API |
| Hangfire.PostgreSql | 1.21.1 | Hangfire storage | Host API |
| Stateless | 5.20.1 | State machine workflows | Modules with workflows |
| dbup-postgresql | 7.0.1 | PostgreSQL DDL migrations | Host API |

### Audit & Compliance

| Package | Version | Purpose | Install Where |
|---------|---------|---------|--------------|
| Audit.NET.EntityFrameworkCore | 23.x | Automatic audit trail | SharedKernel or Host |
| ArchUnitNET.xUnit | 0.11.x | Architecture fitness tests | Test project |

### Document Generation (Phase 4+)

| Package | Version | Purpose |
|---------|---------|---------|
| QuestPDF | 2024.x | PDF generation |
| ClosedXML | 0.102+ | Excel generation |
| DocumentFormat.OpenXml | 3.x | Word documents |

### Email & Notifications (Phase 1+)

| Package | Version | Purpose |
|---------|---------|---------|
| MailKit | 4.x | SMTP email sending |
| FirebaseAdmin | 3.x | Push notifications (Phase 11) |

### Testing

| Package | Version | Purpose |
|---------|---------|---------|
| xunit | 2.9.3 | Test framework |
| xunit.runner.visualstudio | 2.8.x | VS test runner |
| FluentAssertions | 8.11.0 | Assertion library |
| NSubstitute | 6.2.0 | Mocking |
| Bogus | 35.6.5 | Test data generation |
| Testcontainers.PostgreSql | 3.x | Integration test DB |
| Microsoft.AspNetCore.Mvc.Testing | 10.0.x | API integration tests |
| coverlet.collector | 6.0.4 | Code coverage |
| NBomber | 5.x | Load testing (Phase 12) |

### Deferred Packages (Install When Needed)

| Package | Version | When | Purpose |
|---------|---------|------|---------|
| Microsoft.RulesEngine | 5.x | Phase 1 (when first business rule needed) | Dynamic business rules |
| OpenFeature | 2.x | Phase 1 (when feature flags needed) | Feature flags |
| StackExchange.Redis | 2.x | Phase 10+ (when multi-instance) | Distributed cache |
| SixLabors.ImageSharp | 3.x | Phase 6 (participant photos) | Image processing |

---

## Frontend npm Packages

### Angular Ecosystem (Installed)

| Package | Version | Purpose |
|---------|---------|---------|
| @angular/core | ~22.1.0 | Framework |
| @angular/material | ^22.2.2 | UI component library |
| @angular/cdk | ^22.2.2 | Component Dev Kit |
| @ngrx/store | ^22.0.1 | State management |
| @ngrx/effects | ^22.0.1 | Side effects |
| @ngrx/entity | ^22.0.1 | Entity state adapter |
| @ngrx/store-devtools | ^22.0.1 | Dev tools |
| @ngx-translate/core | ^18.0.0 | i18n |
| @ngx-translate/http-loader | ^18.0.0 | i18n JSON loader |
| rxjs | ~7.8.0 | Reactive programming |

### Third-Party (Install Per Phase)

| Package | Version | When | Purpose |
|---------|---------|------|---------|
| @microsoft/signalr | ^8.x | Phase 9 | Real-time (chat, notifications) |
| ag-grid-angular | ^31.x | Phase 1 | Data grids |
| ag-grid-community | ^31.x | Phase 1 | Data grid core |
| echarts | ^5.5 | Phase 2 | Charts |
| ngx-echarts | ^18.x | Phase 2 | Angular ECharts wrapper |
| leaflet | ^1.9 | Phase 6 | Maps |
| @asymmetrik/ngx-leaflet | ^18.x | Phase 6 | Angular Leaflet wrapper |
| ngx-formly | ^6.x | Phase 6 | Dynamic forms |
| ngx-quill | ^24.x | Phase 4 | Rich text editor |
| quill | ^2.x | Phase 4 | Quill core |
| date-fns | ^3.x | Phase 1 | Date utilities |
| ethiopian-calendar-date-converter | ^1.x | Phase 1 | Ethiopian calendar |
| file-saver | ^2.x | Phase 4 | File downloads |

### Dev Dependencies (Installed)

| Package | Version | Purpose |
|---------|---------|---------|
| @nx/angular | 23.3.0 | Nx Angular plugin |
| nx | 23.3.0 | Build system |
| typescript | ~6.0.3 | Language |
| vitest | ^4.0.8 | Unit test runner |
| @playwright/test | ^1.37.0 | E2E testing |
| eslint | ^9.8.0 | Linting |
| prettier | ~3.6.2 | Formatting |

---

## Infrastructure

| Component | Version/Service | Purpose |
|-----------|----------------|---------|
| **Database** | Supabase PostgreSQL 16 (Free → Pro) | Primary data store |
| **File Storage** | Supabase Storage | Document/file uploads |
| **Docker** | Docker Compose v2 | Local development (when available) |
| **CI/CD** | GitHub Actions | Build, test, deploy |
| **Reverse Proxy** | Nginx 1.25+ | SSL termination, static files (production) |
| **SSL** | Let's Encrypt | HTTPS certificates (production) |
| **Monitoring** | Uptime Kuma | Health monitoring (production) |
| **DNS** | Cloudflare | DNS + CDN (production) |

---

## Version Pinning Files

### global.json

```json
{
  "sdk": {
    "version": "10.0.100",
    "rollForward": "latestPatch"
  }
}
```

### Directory.Build.props

```xml
<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>
```

---

## Compatibility Verification Checklist

Before locking versions for Phase 1, verify:

- [ ] All NuGet packages restore without version conflicts
- [ ] `dotnet build` produces zero warnings
- [ ] Angular Material 22 components render correctly
- [ ] NgRx 22 devtools connect in browser
- [ ] ag-grid-angular works with Angular 22 (check compatibility matrix)
- [ ] ngx-translate works with Angular 22
- [ ] Vitest runs Angular component tests successfully
- [ ] Playwright E2E tests execute against the running dev server
