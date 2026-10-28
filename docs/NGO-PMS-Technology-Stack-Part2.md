> **⚠ SUPERSEDED** — Replaced by `docs/plans/00-TECH-STACK.md`. This file references Angular 18 (outdated).
> The authoritative version reference is `docs/plans/00-TECH-STACK.md` (Angular 22).

# SECTION 2: FRONTEND TECHNOLOGIES (Angular)

---

## 2.1 Core Framework

### Angular 18 (LTS)
- **Purpose:** Primary frontend framework for the Single Page Application
- **Modules:** All frontend modules (25+ feature modules)
- **License:** MIT (free, open-source)
- **Self-hosted:** N/A (builds to static files served by any web server)
- **Advantages:** Strong typing (TypeScript), modular architecture with lazy loading, built-in dependency injection, reactive forms, HTTP client, router, mature ecosystem
- **Limitations:** Steeper learning curve than React; larger initial bundle (mitigated by lazy loading)
- **Alternatives:** React (used by System B — more flexible but less opinionated), Vue (simpler but smaller enterprise ecosystem)
- **Recommendation:** **Angular 18** — matches requirements (specified by user), excellent for large enterprise applications with many modules

### TypeScript 5.5+
- **Purpose:** Type-safe JavaScript for frontend development
- **License:** Apache 2.0 (free)
- **Notes:** Ships with Angular. Provides compile-time type checking, interfaces for API contracts, and better IDE support.

### Angular CLI
- **Purpose:** Project scaffolding, build tooling, code generation
- **License:** MIT (free)
- **Recommendation:** **Required** — standard Angular development tool

---

## 2.2 State Management

### NgRx 18.x (Store + Effects + Entity)
- **Purpose:** Centralized state management for complex application state
- **Modules:** Auth state, UI preferences (theme, sidebar), Dashboard cache, Chat (message state), Notifications (unread count)
- **License:** MIT (free)
- **Advantages:** Redux pattern with RxJS, strong typing, dev tools for debugging, entity adapter for normalized collections
- **Limitations:** Boilerplate-heavy; overkill for simple state
- **Alternatives evaluated:**
  - **NgRx SignalStore** — Newer, simpler, signal-based. Less boilerplate but less ecosystem support.
  - **Akita** — Simpler state management, but maintenance has slowed
  - **RxJS BehaviorSubjects** — Manual, lightweight, but no dev tools or patterns
- **Recommendation:** **NgRx Store** for global state (auth, UI, notifications) + **Angular Signals** for local component state. This balances power with simplicity.

---

## 2.3 UI Component Library

### Angular Material 18.x (MDC-based)
- **Purpose:** Base UI component library (buttons, inputs, tables, dialogs, menus, tabs, date pickers, snackbars, tooltips, expansion panels)
- **Modules:** All frontend modules
- **License:** MIT (free)
- **Advantages:** Official Angular library, Material Design 3, well-tested accessibility (WCAG 2.1 AA), consistent look, CDK (Component Dev Kit) for custom components
- **Limitations:** Material Design aesthetic may feel generic; customization requires theme overrides
- **Alternatives evaluated:**
  - **PrimeNG** — Rich component set (100+ components), free Community edition. Better data table, but heavier bundle.
  - **Taiga UI** — Modern, well-designed, but smaller community
  - **ng-zorro-antd** — Ant Design for Angular, excellent for enterprise, but documentation sometimes lacking in English
- **Recommendation:** **Angular Material** as base + **Angular CDK** for custom components. If the data table needs exceed Material's mat-table (which is likely for complex procurement and reporting grids), supplement with **AG Grid Community Edition** (see below).

### AG Grid Community Edition
- **Purpose:** Advanced data grids with sorting, filtering, grouping, pagination, column pinning, Excel export
- **Modules:** Reporting (report lists), Procurement (item lists), Budget (budget lines), Participants (participant registry), Planning (plan tables)
- **License:** MIT (Community Edition is free). Enterprise Edition ($1,250+/dev) adds pivot tables, tree data, charts.
- **Advantages:** Best-in-class data grid performance, virtual scrolling for large datasets, built-in column filtering
- **Limitations:** Community edition lacks some features (row grouping, clipboard, status bar). Enterprise is expensive.
- **Recommendation:** **AG Grid Community** — free, covers 90% of grid needs. The missing enterprise features can be worked around with custom implementations if needed.

---

## 2.4 Charts & Visualization

### ngx-echarts (Apache ECharts wrapper)
- **Purpose:** All charts and data visualization — dashboards, risk matrix, budget analysis, graduation pipeline, indicator progress, financial charts, geographic maps
- **Modules:** Dashboard (8+ dashboard types), Risk (risk matrix), Budget (budget vs actual), Graduation (pipeline funnel), MEAL (indicator charts), Finance (burn rate)
- **License:** Apache 2.0 (free, open-source)
- **Advantages:** Extremely rich chart types (line, bar, pie, scatter, radar, treemap, sankey, funnel, heatmap, geographic maps), interactive, performant with large datasets, responsive, dark mode support, animation
- **Limitations:** Larger bundle than Chart.js (~800KB); learning curve for advanced configurations
- **Alternatives evaluated:**
  - **Chart.js / ng2-charts** — Simpler, lighter (~200KB), but fewer chart types (no sankey, no geographic maps, no treemap)
  - **D3.js** — Maximum flexibility, but very low-level (not a charting library, it's a visualization framework)
  - **Highcharts** — Excellent, but commercial license required ($590+/developer)
  - **Plotly** — Good for scientific charts, but heavier and less customizable for dashboards
- **Recommendation:** **Apache ECharts via ngx-echarts** — free, supports every chart type we need (including the risk heatmap, graduation funnel, budget Sankey diagram from System B, and geographic maps for risk dashboard), excellent documentation

---

## 2.5 Forms & Validation

### Angular Reactive Forms (built-in)
- **Purpose:** All form handling with validation
- **Modules:** All modules with forms
- **License:** MIT (part of Angular)
- **Recommendation:** **Use Reactive Forms** (not Template-driven) for complex forms with dynamic validation

### ngx-formly 6.x (Optional)
- **Purpose:** Dynamic form rendering from JSON schema — powers the Dynamic Form Builder feature
- **Modules:** Forms (dynamic form builder and renderer)
- **License:** MIT (free)
- **Advantages:** Render forms from JSON configuration, supports custom field types, validation, conditional fields, repeating sections — exactly what the dynamic form builder needs
- **Limitations:** Learning curve; less control than hand-coded forms
- **Alternatives:** Custom dynamic form renderer (more control but significant development effort)
- **Recommendation:** **Use ngx-formly** for the dynamic form builder module; use standard Reactive Forms for all other fixed-structure forms (project creation, report submission, etc.)

---

## 2.6 Date & Calendar

### ethiopian-calendar-date-converter (npm)
- **Purpose:** Ethiopian/Gregorian calendar conversion
- **Modules:** All date-related features throughout the system
- **License:** MIT (free)
- **Notes:** System B already uses this library. Converts between Ethiopian (Ge'ez) calendar and Gregorian calendar.
- **Recommendation:** **Use** — proven in System B, essential for Ethiopian context

### date-fns 3.x
- **Purpose:** Date manipulation and formatting
- **License:** MIT (free)
- **Advantages:** Tree-shakeable (only import what you use), immutable, comprehensive
- **Alternatives:** Luxon (heavier, full ICU support), Day.js (lighter but fewer features), Moment.js (deprecated)
- **Recommendation:** **date-fns** — lightweight, tree-shakeable, modern

### Custom Dual Calendar Date Picker
- **Purpose:** A date picker component that shows both Ethiopian and Gregorian calendars
- **Notes:** Neither Angular Material's date picker nor any off-the-shelf component supports Ethiopian calendar. This must be a custom component built on top of Angular CDK's overlay and calendar primitives + ethiopian-calendar-date-converter.
- **Recommendation:** **Build custom** — no alternative exists. This is a critical shared component to build early (Phase 1).

---

## 2.7 Internationalization (i18n)

### @ngx-translate/core + @ngx-translate/http-loader
- **Purpose:** Runtime language switching (English ↔ Amharic, extensible to other languages)
- **Modules:** All (entire UI)
- **License:** MIT (free)
- **Advantages:** Runtime translation (no rebuild needed), JSON translation files, lazy loading per module, pluralization support, parameterized translations
- **Limitations:** Manual translation file maintenance; no built-in extraction tool (use ngx-translate-extract)
- **Alternatives:**
  - **Angular built-in i18n** — Compile-time (requires separate build per language), better performance but less flexible
  - **Transloco** — More modern, better DX, lazy loading — strong alternative
- **Recommendation:** **@ngx-translate** — proven, runtime switching (essential for bilingual users who switch languages without page reload), widely used. If starting fresh, **Transloco** is also excellent.

---

## 2.8 HTTP & API Communication

### Angular HttpClient (built-in)
- **Purpose:** All API calls to the ASP.NET Core backend
- **License:** MIT (part of Angular)
- **Notes:** Supports interceptors for JWT attachment, error handling, request/response transformation

### @microsoft/signalr (npm)
- **Purpose:** SignalR client for real-time WebSocket connections
- **Modules:** Chat (real-time messages), Notifications (real-time alerts), Dashboard (live updates)
- **License:** MIT (free)
- **Notes:** Official Microsoft SignalR JavaScript client. Handles connection management, reconnection, hub invocation.
- **Recommendation:** **Required** — pairs with ASP.NET Core SignalR server

---

## 2.9 Map & Geolocation

### Leaflet 1.9.x + @asymmetrik/ngx-leaflet
- **Purpose:** Interactive maps for geofence visualization, participant locations, geographic risk dashboard, project locations
- **Modules:** Geofence (submission map, alert map), Risk (geographic dashboard), Participants (location map), Dashboard
- **License:** BSD-2-Clause (free, open-source)
- **Advantages:** Lightweight (~40KB), free tile providers (OpenStreetMap), extensive plugin ecosystem, mobile-friendly
- **Limitations:** Less performant than Mapbox GL for very large datasets (10K+ markers); no built-in 3D
- **Alternatives evaluated:**
  - **Mapbox GL JS** — Better performance, vector tiles, 3D, but **$0.60/1000 map loads** beyond 50K free/month
  - **Google Maps** — $7/1000 loads, expensive at scale
  - **OpenLayers** — Powerful, free, but heavier and more complex API
- **Recommendation:** **Leaflet with OpenStreetMap tiles** — completely free, no API key needed, sufficient for NGO mapping needs. Use marker clustering plugin for large datasets.

---

## 2.10 File Handling

### ngx-file-drop 16.x
- **Purpose:** Drag-and-drop file upload component
- **Modules:** Documents, Chat (attachments), Procurement (document uploads), Reports (attachments), Participants (photo upload)
- **License:** MIT (free)

### file-saver 2.x
- **Purpose:** Client-side file download trigger (for generated PDFs, Excel exports)
- **License:** MIT (free)

### xlsx (SheetJS Community Edition)
- **Purpose:** Client-side Excel file parsing for import preview
- **Modules:** Import/Export (preview uploaded Excel files before server-side processing)
- **License:** Apache 2.0 (Community Edition is free)

---

## 2.11 Other Frontend Libraries

### @ngneat/until-destroy 10.x
- **Purpose:** Automatic RxJS subscription cleanup in components
- **License:** MIT (free)

### ngx-permissions 14.x
- **Purpose:** Template-based permission checking (*ngxPermissionsOnly directive)
- **License:** MIT (free)
- **Modules:** All (show/hide UI elements based on user permissions)

### ngx-toastr 18.x
- **Purpose:** Toast notifications for user feedback (success, error, warning, info)
- **License:** MIT (free)

### @angular/cdk/drag-drop
- **Purpose:** Drag-and-drop for form builder (reorder questions), kanban board (task management)
- **License:** MIT (part of Angular CDK, free)

### jspdf + jspdf-autotable
- **Purpose:** Client-side PDF generation for quick exports (lightweight alternative to server-side PDF for simple tables)
- **License:** MIT (free)
- **Notes:** Use for simple client-side exports. Complex reports should use server-side QuestPDF.

### quill / ngx-quill 24.x
- **Purpose:** Rich text editor for report narrative fields, document editing, chat messages
- **Modules:** Reporting (narrative sections), MEAL (evaluation findings), Documents
- **License:** BSD-3-Clause (free)
- **Alternatives:** TinyMCE (free Community, but commercial license for some plugins), CKEditor 5 (GPL + commercial)
- **Recommendation:** **Quill via ngx-quill** — fully free, good features, lightweight

---

# SECTION 3: DATABASE TECHNOLOGIES

---

## 3.1 Primary Database

### Supabase PostgreSQL (PostgreSQL 15+)
- **Purpose:** Primary relational database for the entire system (120+ tables)
- **Modules:** All
- **License:** Apache 2.0 (Supabase is open-source); PostgreSQL itself is PostgreSQL License (permissive, free)
- **Self-hosted:** Yes — Supabase can be fully self-hosted via Docker
- **Service cost:**
  - Free tier: 500MB database, 1GB storage, 2 projects
  - Pro: $25/month — 8GB database, 100GB storage, daily backups, no project limit
  - Self-hosted: cost of your own server only
- **Advantages:** Managed PostgreSQL with dashboard, built-in Auth (we use custom JWT but can leverage for RLS), Row-Level Security, real-time subscriptions, storage, edge functions, automatic backups (Pro), connection pooling via Supavisor
- **Limitations:** Free tier limited to 500MB (sufficient for development only); Supabase-specific features (Realtime, Edge Functions) add some vendor coupling
- **Alternatives evaluated:**
  - **Plain PostgreSQL on a VPS** — Cheapest ($5-10/mo for a DigitalOcean/Hetzner VPS), full control, but you manage backups, updates, monitoring yourself
  - **Neon** — Serverless PostgreSQL, free tier (512MB), auto-scaling, branching. Excellent for development.
  - **AWS RDS PostgreSQL** — $15+/mo, managed, but AWS ecosystem complexity
  - **Azure Database for PostgreSQL** — $13+/mo, managed, good if using Azure
- **Recommendation:** **Supabase Pro ($25/mo)** for production — good balance of managed service, features (RLS, Storage, Dashboard), and cost. **Supabase Free** for development. Implement database access through EF Core (not Supabase client libraries) so you can migrate to plain PostgreSQL later if needed.

### PostgreSQL-Specific Features We'll Use

| Feature | Purpose | Module |
|---------|---------|--------|
| **JSONB columns** | Form schemas, custom data, disaggregation, flexible fields | Forms, Participants, Configuration |
| **Row-Level Security (RLS)** | Multi-tenant data isolation, office-based scoping | All |
| **Full-text search** | Search across projects, participants, documents | Search functionality |
| **Materialized views** | Pre-computed report aggregations, dashboard KPIs | Reporting, Dashboard |
| **PostgreSQL enums** | Type-safe status fields (project_status, report_status, etc.) | All |
| **UUID generation (gen_random_uuid)** | Primary keys | All tables |
| **Triggers** | Audit log auto-population, updated_at timestamps | All tables |
| **Database functions** | Pillar stage calculation, risk score computation, Haversine distance | Graduation, Risk, Geofence |
| **Partial indexes** | Index only active records for faster queries | Participants (active only), Projects (non-archived) |
| **Array columns** | Multi-value fields (intervention_area_ids, settlement lists) | Projects, Cohorts |

---

## 3.2 Connection Pooling

### Supavisor (included with Supabase)
- **Purpose:** Connection pooling to handle many concurrent database connections efficiently
- **Notes:** Supabase includes Supavisor (their Elixir-based pooler). If self-hosting PostgreSQL, use PgBouncer instead.

### PgBouncer (if self-hosting)
- **Purpose:** Connection pooler for self-hosted PostgreSQL
- **License:** ISC (free, open-source)
- **Self-hosted:** Yes
- **Recommendation:** Only needed if self-hosting PostgreSQL without Supabase

---

## 3.3 Database Migration & Management

### EF Core Migrations
- **Purpose:** Version-controlled database schema changes
- **Notes:** Code-first migrations from C# entity configurations. Applied via `dotnet ef database update` or at application startup.
- **Recommendation:** **Use EF Core Migrations** — keeps schema in sync with code, supports rollback

### DbUp (optional supplement)
- **Purpose:** Run raw SQL migration scripts for complex database objects (functions, triggers, materialized views, RLS policies, seed data)
- **License:** MIT (free)
- **Notes:** EF Core migrations handle table/column changes well but are awkward for PostgreSQL-specific objects (functions, triggers, RLS policies). DbUp runs plain SQL scripts in order.
- **Recommendation:** **EF Core for schema + DbUp for PostgreSQL-specific objects** (functions, RLS policies, materialized views, triggers)

---

# SECTION 4: MOBILE TECHNOLOGIES (Flutter)

---

## 4.1 Core

### Flutter 3.x SDK
- **Purpose:** Cross-platform mobile app (iOS + Android) for field operations
- **License:** BSD-3-Clause (free, open-source)
- **Advantages:** Single codebase for iOS + Android, excellent performance, rich widget library
- **Recommendation:** **Use** — specified in requirements; System B already has Flutter foundation

### Dart SDK 3.x
- **Purpose:** Programming language for Flutter
- **License:** BSD-3-Clause (free)

## 4.2 Key Flutter Packages (all free/open-source)

| Package | Purpose | Module |
|---------|---------|--------|
| **flutter_riverpod** | State management | All |
| **dio** | HTTP client for API calls | All |
| **drift + drift_flutter** | Local SQLite database for offline mode | Offline sync |
| **connectivity_plus** | Network status detection | Offline sync |
| **flutter_secure_storage** | Secure credential storage | Auth |
| **geolocator** | GPS location capture | Forms, Geofence |
| **camera** | Photo capture | Forms, Training, Participants |
| **image_picker** | Image selection from gallery | Participants, Documents |
| **mobile_scanner** | QR/barcode scanning | Participant lookup |
| **flutter_map + latlong2** | Maps (Leaflet-based) | Geofence, Participants |
| **firebase_messaging** | FCM push notifications | Notifications |
| **intl** | Localization (EN/Amharic) | All |
| **signature_pad** | Signature capture on forms | Forms |
| **path_provider** | File system access | Documents, Offline |
| **flutter_local_notifications** | Local notification display | Notifications |

All packages above are published on pub.dev under permissive licenses (MIT, BSD, Apache 2.0).

---

# SECTION 5: TESTING TECHNOLOGIES

---

## 5.1 Backend Testing

### xUnit 2.x
- **Purpose:** Unit test framework for .NET
- **License:** Apache 2.0 (free)
- **Recommendation:** **Use** — standard for .NET (Microsoft uses xUnit internally)

### Moq 4.x or NSubstitute 5.x
- **Purpose:** Mocking framework for unit tests
- **License:** BSD-3-Clause (Moq), BSD-3-Clause (NSubstitute) — both free
- **Recommendation:** **NSubstitute** — cleaner syntax, no Moq SponsorLink controversy

### FluentAssertions 7.x
- **Purpose:** Expressive assertion library
- **License:** Apache 2.0 (free)
- **Recommendation:** **Use** — much more readable than Assert.Equal

### Microsoft.AspNetCore.Mvc.Testing
- **Purpose:** Integration testing with in-memory test server
- **License:** MIT (free, part of ASP.NET Core)
- **Recommendation:** **Required** for API integration tests

### Testcontainers 3.x
- **Purpose:** Spin up real PostgreSQL containers for integration tests
- **License:** MIT (free)
- **Advantages:** Tests run against real PostgreSQL (not in-memory SQLite), catches DB-specific issues
- **Recommendation:** **Use** — essential for testing RLS policies, triggers, and PostgreSQL-specific features

### Bogus 35.x
- **Purpose:** Fake data generation for tests
- **License:** MIT (free)
- **Recommendation:** **Use** — generates realistic test data for projects, participants, reports

### Respawn 6.x
- **Purpose:** Reset database state between integration tests
- **License:** Apache 2.0 (free)
- **Recommendation:** **Use** with Testcontainers for clean test isolation

---

## 5.2 Frontend Testing

### Karma + Jasmine (Angular default)
- **Purpose:** Unit testing for Angular components and services
- **License:** MIT (both free)
- **Notes:** Bundled with Angular CLI. Run with `ng test`.

### Jest 29.x + @angular-builders/jest (alternative)
- **Purpose:** Faster unit test runner (alternative to Karma)
- **License:** MIT (free)
- **Advantages:** Faster execution, snapshot testing, better watch mode, no browser needed
- **Recommendation:** **Replace Karma with Jest** — significantly faster test execution

### Cypress 13.x or Playwright 1.x
- **Purpose:** End-to-end (E2E) testing for critical workflows
- **Modules:** Project creation > approval flow, Procurement lifecycle, Graduation pipeline, Report submission > approval
- **License:** MIT (Cypress Free), Apache 2.0 (Playwright free)
- **Comparison:**
  - Cypress: Better DX, time-travel debugging, component testing, but single-browser-tab only, Chrome-centric
  - Playwright: Multi-browser (Chrome, Firefox, Safari), multi-tab support, faster, Microsoft-backed
- **Recommendation:** **Playwright** — multi-browser support, better for complex workflows (approval flows that involve multiple users/roles), faster parallel execution, free

---

## 5.3 Mobile Testing

### flutter_test (built-in)
- **Purpose:** Widget and unit tests for Flutter
- **License:** BSD-3-Clause (free)

### integration_test (built-in)
- **Purpose:** Integration tests running on real devices/emulators
- **License:** BSD-3-Clause (free)

### mockito (Dart)
- **Purpose:** Mocking for Dart unit tests
- **License:** Apache 2.0 (free)

---

## 5.4 API Testing & Documentation

### Postman / Bruno
- **Purpose:** Manual API testing and collection sharing
- **Postman License:** Free tier (limited), paid for teams ($12/user/mo)
- **Bruno:** MIT (free, open-source, offline-first, Git-friendly)
- **Recommendation:** **Bruno** — free, open-source, stores collections as files in your repo (version-controlled)

### NBomber 5.x
- **Purpose:** Load testing and performance testing
- **License:** Apache 2.0 (free)
- **Modules:** Reporting API (aggregation performance), Dashboard (concurrent access), Auth (rate limit validation)
- **Recommendation:** **Use** for pre-production performance validation
