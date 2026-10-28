> **⚠ SUPERSEDED** — Replaced by `docs/plans/00-TECH-STACK.md` which has pinned, verified versions.
> This file contains speculative "verify on Day 1" ranges that are now outdated.

# EthelPMS — Recommended Technology Versions
**Date:** 2026-10-13
**Rule:** ~~Verify ALL package compatibility on Day 1 of Phase 0 before locking versions.~~ See `docs/plans/00-TECH-STACK.md` for locked versions.

---

## Core Framework Versions

| Technology | Recommended Version | Type | Support Until | Notes |
|---|---|---|---|---|
| **.NET** | **10.0** | LTS | Nov 2028 | Latest LTS. All first-party packages release together. |
| **ASP.NET Core** | **10.0** | LTS | Nov 2028 | Matches .NET version |
| **EF Core** | **10.0** | LTS | Nov 2028 | Matches .NET version |
| **C#** | **13** | — | — | Ships with .NET 10 |
| **Angular** | **19 or 20** | LTS | — | Use the latest version with LTS status at dev start. Angular 19 (Nov 2025) or 20 (mid-2026) likely LTS. Verify Angular Material + AG Grid support. |
| **TypeScript** | **5.7 or 5.8** | — | — | Must match Angular CLI requirement |
| **Node.js** | **22.x LTS** | LTS | Apr 2027 | Verify Angular CLI supports it. Do NOT use odd-numbered Node (23, 25). |
| **npm** | **10.x** | — | — | Ships with Node 22. Use whatever comes with your Node LTS. |
| **PostgreSQL** | **16 or 17** | — | Nov 2028/2029 | Use whatever Supabase Pro provides. If self-hosting, 17 is safe. Version 18 is too new — fewer community resources, risk of bugs. |
| **Flutter** | **3.24 or 3.27 LTS** | Stable | — | Use latest stable at Phase 11 start (not Phase 0). Check that Drift, Riverpod, and all 15 packages compile. Avoid x.47 if it's <6 months old. |
| **Dart** | **3.5 or 3.6** | — | — | Matches Flutter version |

---

## Backend NuGet Packages (Recommended Versions)

### Microsoft First-Party (safe — release with .NET 10)
| Package | Version | License |
|---|---|---|
| Microsoft.EntityFrameworkCore | 10.x | MIT |
| Npgsql.EntityFrameworkCore.PostgreSQL | 10.x | PostgreSQL |
| Microsoft.AspNetCore.Identity.EntityFrameworkCore | 10.x | MIT |
| Microsoft.AspNetCore.Authentication.JwtBearer | 10.x | MIT |
| Microsoft.AspNetCore.SignalR | 10.x (built-in) | MIT |
| Microsoft.AspNetCore.SignalR.StackExchangeRedis | 10.x | MIT |
| Swashbuckle.AspNetCore | 7.x | MIT |
| Microsoft.AspNetCore.RateLimiting | 10.x (built-in) | MIT |
| Microsoft.AspNetCore.Mvc.Testing | 10.x | MIT |

### Third-Party — Core Architecture
| Package | Recommended | Latest Known | Risk Level | Notes |
|---|---|---|---|---|
| MediatR | 12.x or 13.x | — | Low | Stable, infrequent breaking changes |
| AutoMapper | 13.x or 14.x | — | Low | Mature library |
| FluentValidation.AspNetCore | 11.x or 12.x | — | Low | Stable |
| Dapper | 2.x | — | Very Low | Rarely changes API |
| DbUp-PostgreSQL | 5.x or 6.x | — | Low | Simple tool |
| Finbuckle.MultiTenant | 7.x or 8.x | — | Low | Active development, good .NET support |
| Hangfire.Core + Hangfire.PostgreSql | 1.8.x or 2.x | — | Low | Very mature |
| MailKit | 4.x or 5.x | — | Very Low | Stable |
| FirebaseAdmin | 3.x or 4.x | — | Low | Google-maintained |
| Polly | 8.x or 9.x | — | Low | Microsoft-endorsed |
| Serilog.AspNetCore | 8.x or 9.x | — | Very Low | Mature ecosystem |

### Third-Party — v2 Architecture Additions
| Package | Recommended | Latest Known | Risk Level | Notes |
|---|---|---|---|---|
| Stateless | 5.x or 6.x | — | Very Low | Tiny library, stable API, rarely changes |
| NodaMoney | 3.x | — | Very Low | Small, focused, no dependencies |
| Audit.NET.EntityFrameworkCore | 23.x or 24.x | — | Low | Active, good EF Core integration |
| Microsoft.RulesEngine | 5.x or 6.x | — | Low | Microsoft-maintained |
| OpenFeature | 2.x or 3.x | — | Low | CNCF standard, growing ecosystem |
| ArchUnitNET | 0.11.x or 1.x | — | Low | Test-only, doesn't ship to production |

### Third-Party — Document Generation
| Package | Recommended | Latest Known | Risk Level | Notes |
|---|---|---|---|---|
| QuestPDF | 2025.x or 2026.x | — | Low | Active, year-based versioning |
| ClosedXML | 0.103.x or 0.104.x | — | Low | MIT, active |
| MiniExcel | 1.x | — | Very Low | Lightweight |
| DocumentFormat.OpenXml | 3.x or 4.x | — | Low | Microsoft-maintained |

### Third-Party — Utilities
| Package | Recommended | Latest Known | Risk Level | Notes |
|---|---|---|---|---|
| Humanizer | 2.x | — | Very Low | Stable |
| TimeZoneConverter | 6.x or 7.x | — | Very Low | Small |
| CsvHelper | 31.x or 33.x | — | Low | Active |
| SixLabors.ImageSharp | 3.x or 4.x | — | Low | Apache 2.0 |
| StackExchange.Redis | 2.x or 3.x | — | Low | Very mature |

### Testing
| Package | Recommended | Latest Known | Risk Level | Notes |
|---|---|---|---|---|
| xUnit | 2.x or 3.x | — | Low | xUnit 3 may be out by now — check API changes |
| NSubstitute | 5.x or 6.x | — | Very Low | Stable |
| FluentAssertions | 7.x or 8.x | — | Low | Active |
| Testcontainers.PostgreSql | 3.x or 4.x | — | Low | .NET version must match |
| Bogus | 35.x or 36.x | — | Very Low | Stable |
| Respawn | 6.x or 7.x | — | Very Low | Small |
| NBomber | 5.x or 6.x | — | Low | Performance testing |

---

## Frontend npm Packages (Recommended Versions)

### Angular Ecosystem (must match Angular version)
| Package | If Angular 19 | If Angular 20 | Notes |
|---|---|---|---|
| @angular/core | ^19.0.0 | ^20.0.0 | Must match CLI |
| @angular/material | ^19.0.0 | ^20.0.0 | Must match core |
| @angular/cdk | ^19.0.0 | ^20.0.0 | Must match core |
| @ngrx/store | ^19.0.0 | ^20.0.0 | Must match Angular major |
| @ngrx/effects | ^19.0.0 | ^20.0.0 | Must match Angular major |
| @ngrx/entity | ^19.0.0 | ^20.0.0 | Must match Angular major |

### Third-Party Frontend
| Package | Recommended | Risk Level | Notes |
|---|---|---|---|
| @ngx-translate/core | ^16.0.0 or ^17.0.0 | Low | Check Angular compatibility |
| @microsoft/signalr | ^10.0.0 | Very Low | Matches .NET version |
| ag-grid-angular | ^32.0.0 or ^33.0.0 | Low | Check Angular version support |
| ag-grid-community | ^32.0.0 or ^33.0.0 | Low | Must match ag-grid-angular |
| echarts | ^5.5.0 or ^5.6.0 | Very Low | Stable, framework-independent |
| ngx-echarts | ^19.0.0 or ^20.0.0 | Low | Must match Angular |
| leaflet | ^1.9.0 or ^1.10.0 | Very Low | Very stable |
| ngx-formly | ^6.0.0 or ^7.0.0 | Low | Check Angular compatibility |
| date-fns | ^3.0.0 or ^4.0.0 | Low | Stable utility |
| ngx-quill | ^25.0.0 or ^26.0.0 | Low | Check Angular compatibility |
| file-saver | ^2.0.0 | Very Low | Tiny, stable |

### Build Tools
| Package | Recommended | Notes |
|---|---|---|
| @nx/angular | Match Angular version | Nx workspace — critical for monorepo |
| typescript | Match Angular CLI requirement | Do NOT pick independently |
| jest | ^29.0.0 or ^30.0.0 | Stable |
| playwright | ^1.45.0 or ^1.50.0 | Active, frequent releases |
| eslint | ^9.0.0 or ^10.0.0 | Check Angular schematic support |
| prettier | ^3.0.0 or ^4.0.0 | Stable |

---

## Flutter pub.dev Packages (Verify at Phase 11 Start)

| Package | Recommended | Risk Level | Notes |
|---|---|---|---|
| flutter_riverpod | ^2.6.0 or ^3.0.0 | Medium | Riverpod 3 may have breaking changes — check |
| dio | ^5.5.0 or ^6.0.0 | Low | HTTP client, stable |
| drift | ^2.18.0 or ^3.0.0 | Medium | Major version = migration needed |
| connectivity_plus | ^6.0.0 or ^7.0.0 | Low | Simple plugin |
| flutter_secure_storage | ^9.0.0 or ^10.0.0 | Low | Platform-specific, usually stable |
| geolocator | ^12.0.0 or ^13.0.0 | Low | Mature |
| camera | ^0.11.0 or ^0.12.0 | Medium | Platform-specific, can break |
| firebase_messaging | ^15.0.0 or ^16.0.0 | Low | Google-maintained |
| flutter_map | ^7.0.0 or ^8.0.0 | Low | Active |

---

## Infrastructure

| Technology | Recommended | Notes |
|---|---|---|
| Docker Engine | Latest stable | Always use latest |
| Docker Compose | v2 (built into Docker) | Already standard |
| Nginx | 1.26.x or 1.28.x | Stable branch, not mainline |
| Let's Encrypt / Certbot | Latest | Always use latest |
| Supabase | Pro plan | Use whatever PostgreSQL version they provide |
| Redis / Valkey | 7.x or 8.x | Valkey is the open-source fork |
| GitHub Actions | Latest runners | Auto-updated |

---

## Phase 0 Verification Checklist

On Day 1, before writing any code:

1. [ ] Create empty .NET 10 solution → add ALL NuGet packages from list above → `dotnet build` must succeed
2. [ ] Create Angular project with Nx → add ALL npm packages → `ng build` must succeed
3. [ ] Verify Supabase PostgreSQL version → document it
4. [ ] Verify AG Grid supports chosen Angular version
5. [ ] Verify ngx-translate supports chosen Angular version
6. [ ] Verify Finbuckle supports .NET 10
7. [ ] Verify Audit.NET supports EF Core 10
8. [ ] Document all locked versions in `package.json`, `.csproj` files, and this document
9. [ ] If any package fails, find alternative or pin to last compatible version

**Time estimate:** 2-3 hours. Prevents weeks of debugging.
