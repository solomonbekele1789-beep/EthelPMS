# EthelPMS -- Database Architecture Plan

**Version:** 1.0
**Date:** October 15, 2026
**Owner:** Developer A (Backend lead)
**Status:** Implementation-ready

> This document is the single source of truth for database design in EthelPMS.
> Referenced by: `00-MASTER-PLAN.md` (Phase 0A #7, Phase 0B #1-5, #11, #13-14)

---

## Requirements Covered

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| D11 | Schema-per-module isolation | Must | Pending |
| D14 | Immutable audit trail (INSERT-only role) | Must | Pending |
| Phase 0B #1 | Create per-module DbContexts with HasDefaultSchema() | Must | Pending |
| Phase 0B #2 | Create PostgreSQL schemas via DbUp | Must | Pending |
| Phase 0B #3 | Create PostgreSQL roles per schema with restricted GRANT/REVOKE | Must | Pending |
| Phase 0B #4 | Create immutable audit schema with INSERT-only role | Must | Pending |
| Phase 0B #5 | Create shared reference schema (currencies, geography, calendar) | Must | Pending |
| Phase 0B #11 | Implement Audit.NET with PostgreSQL provider | Must | Pending |
| Phase 0B #13 | Create EF Core initial migration (empty baseline) | Must | Pending |
| Phase 0B #14 | Create DbUp runner for PostgreSQL objects (RLS, functions, triggers) | Must | Pending |

---

## 1. Schema Layout

### 1.1 Schema Overview

EthelPMS uses **schema-per-module** isolation in a single Supabase PostgreSQL 16 database. Each module owns its tables within a dedicated PostgreSQL schema. Cross-module data access is forbidden at the SQL level and enforced by PostgreSQL `GRANT`/`REVOKE`.

**Total schemas: 22** (16 module + 2 deferred + 4 shared infrastructure)

### 1.2 Module Schemas (16)

| # | Schema | Module(s) | Phase | Key Tables |
|---|--------|-----------|-------|------------|
| 1 | `identity` | Identity (incl. OrgSetup) | 1 | `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `organizations`, `offices`, `office_levels`, `locations`, `refresh_tokens`, `password_reset_tokens` |
| 2 | `platform` | PlatformAdmin | 1 | `platform_tenants`, `subscription_packages`, `tenant_access_keys`, `module_toggles`, `role_templates` |
| 3 | `projects` | Projects, ResultsFramework, InterventionAreas | 2 | `projects`, `project_phases`, `outcomes`, `outputs`, `indicators`, `indicator_targets`, `intervention_areas`, `project_intervention_areas`, `project_team_members` |
| 4 | `planning` | Planning, DIP | 3 | `annual_plans`, `quarterly_plans`, `monthly_plans`, `weekly_plans`, `plan_activities`, `dip_items`, `dip_milestones` |
| 5 | `reporting` | Reporting | 4 | `report_templates`, `report_template_sections`, `reports`, `report_sections`, `report_data_entries`, `report_approvals`, `report_comments` |
| 6 | `meal` | MEAL | 5 | `meal_plans`, `meal_indicators`, `indicator_measurements`, `evaluations`, `evaluation_findings`, `gesi_assessments`, `lessons_learned` |
| 7 | `participants` | Participants, Graduation | 6 | `participants`, `household_members`, `participant_enrollments`, `participant_services`, `graduation_benchmarks`, `graduation_assessments`, `graduation_decisions` |
| 8 | `procurement` | Procurement | 7 | `suppliers`, `purchase_requests`, `purchase_request_items`, `rfqs`, `rfq_items`, `rfq_responses`, `purchase_orders`, `po_items`, `goods_received_notes`, `grn_items` |
| 9 | `fundacct` | FundAccounting | 7 | `chart_of_accounts`, `account_categories`, `fund_codes`, `fund_restrictions`, `journal_entries`, `journal_lines`, `budgets`, `budget_lines`, `budget_revisions` |
| 10 | `assets` | Assets | 7 | `asset_categories`, `assets`, `asset_assignments`, `asset_transfers`, `asset_disposals`, `asset_maintenance`, `stock_items`, `stock_movements` |
| 11 | `training` | Training | 8 | `training_programs`, `training_sessions`, `training_participants`, `trainers`, `training_materials`, `training_evaluations` |
| 12 | `tasks` | Tasks | 8 | `task_boards`, `task_lists`, `tasks`, `task_assignments`, `task_comments`, `task_attachments` |
| 13 | `risk` | Risk | 8 | `risk_categories`, `risks`, `risk_mitigations`, `risk_assessments` |
| 14 | `donors` | Donors | 8 | `donors`, `donor_contacts`, `grants`, `grant_conditions`, `grant_reports`, `donor_communications` |
| 15 | `collab` | Chat, Notifications | 9 | `chat_rooms`, `chat_participants`, `chat_messages`, `notification_templates`, `notifications`, `user_notification_preferences` |
| 16 | `content` | Documents, Feedback | 9 | `document_folders`, `documents`, `document_versions`, `feedback_categories`, `feedback_items`, `feedback_responses` |

**Why Chat+Notifications share `collab`:** Both are event-driven real-time messaging concerns with shared infrastructure (SignalR hub, delivery tracking). Table names are naturally distinct (`chat_*` vs `notification_*`).

**Why Documents+Feedback share `content`:** Both are content-submission-oriented with file attachments and threaded responses. Table names are naturally distinct (`document_*` vs `feedback_*`).

### 1.3 Deferred Module Schemas (Phase 10+)

| # | Schema | Module(s) | Phase | Key Tables |
|---|--------|-----------|-------|------------|
| 17 | `dashboards` | Dashboards, KnowledgeMgmt, Settings | 10 | `dashboard_configs`, `dashboard_widgets`, `saved_filters`, `kb_categories`, `kb_articles`, `system_settings`, `org_settings` |
| 18 | `ai` | AI | 11 | `ai_conversations`, `ai_messages`, `ai_prompts`, `ai_embeddings` |

### 1.4 Shared Infrastructure Schemas

These schemas are not owned by any module. They serve cross-cutting concerns.

| # | Schema | Purpose | Key Tables |
|---|--------|---------|------------|
| 19 | `reference` | Shared lookup data (not tenant-scoped) | `currencies`, `countries`, `regions`, `zones`, `woredas`, `kebeles`, `ethiopian_calendar` |
| 20 | `audit` | Immutable audit trail | `audit_logs` |
| 21 | `hangfire` | Background job persistence | (Hangfire-managed tables) |
| 22 | `outbox` | Transactional outbox + inbox | `outbox_messages`, `inbox_messages` |

### 1.5 Schema Dependency Rules

```
reference  <-- read by all module schemas (via IReferenceDataService + Dapper)
audit      <-- written by all module schemas (via Audit.NET interceptor)
outbox     <-- written by modules that publish integration events
hangfire   <-- managed by Hangfire library, no direct module access

Module schemas are isolated from each other:
  identity -/-> projects -/-> planning -/-> ...
  Cross-module data flows only through Contracts + Outbox events.
```

---

## 2. DbContext Strategy

### 2.1 Base DbContext

All module DbContexts inherit from `MultiTenantDbContext` in SharedKernel. This base class handles:

- Automatic `organization_id` filtering via Finbuckle global query filters
- Automatic `created_at` / `updated_at` timestamp population
- Soft delete query filters (`WHERE deleted_at IS NULL`)
- Domain event dispatch before `SaveChanges` completes

**File:** `src/Shared/NGO.PMS.SharedKernel/Persistence/MultiTenantDbContext.cs`

```csharp
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Entities;

namespace NGO.PMS.SharedKernel.Persistence;

/// <summary>
/// Base DbContext for all module DbContexts. Provides multi-tenant query filters,
/// auditable entity timestamp population, and soft delete filtering.
/// </summary>
public abstract class MultiTenantDbContext : DbContext
{
    private readonly IMultiTenantContextAccessor _tenantAccessor;

    protected MultiTenantDbContext(
        DbContextOptions options,
        IMultiTenantContextAccessor tenantAccessor)
        : base(options)
    {
        _tenantAccessor = tenantAccessor;
    }

    /// <summary>
    /// Returns the current tenant ID, or null if no tenant is resolved
    /// (e.g., platform admin context or design-time).
    /// </summary>
    protected Guid? CurrentTenantId
    {
        get
        {
            var id = _tenantAccessor.MultiTenantContext?.TenantInfo?.Id;
            return Guid.TryParse(id, out var parsed) ? parsed : null;
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply IEntityTypeConfiguration<T> from the derived DbContext's assembly
        modelBuilder.ApplyConfigurationsFromAssembly(GetType().Assembly);

        // Apply global query filters
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(IMultiTenant).IsAssignableFrom(entityType.ClrType))
            {
                // Multi-tenant filter: WHERE organization_id = @currentTenantId
                modelBuilder.Entity(entityType.ClrType)
                    .AddQueryFilter<IMultiTenant>(
                        e => CurrentTenantId == null
                          || e.OrganizationId == CurrentTenantId);
            }

            if (typeof(ISoftDeletable).IsAssignableFrom(entityType.ClrType))
            {
                // Soft delete filter: WHERE deleted_at IS NULL
                modelBuilder.Entity(entityType.ClrType)
                    .AddQueryFilter<ISoftDeletable>(
                        e => e.DeletedAt == null);
            }
        }
    }

    public override async Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        SetAuditableFields();
        return await base.SaveChangesAsync(
            acceptAllChangesOnSuccess, cancellationToken);
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        SetAuditableFields();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    private void SetAuditableFields()
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.SetCreatedAt(now);
                    entry.Entity.SetUpdatedAt(now);
                    break;
                case EntityState.Modified:
                    entry.Entity.SetUpdatedAt(now);
                    break;
            }
        }
    }
}
```

### 2.2 Per-Module DbContexts

Each of the 18 modules has exactly one DbContext. Two schemas are shared between two modules each: `collab` (Chat + Notifications) and `content` (Documents + Feedback).

| # | Module | DbContext Class | Target Schema | File Path |
|---|--------|----------------|---------------|-----------|
| 1 | Identity | `IdentityDbContext` | `identity` | `src/Modules/Identity/NGO.PMS.Identity.Infrastructure/Persistence/IdentityDbContext.cs` |
| 2 | PlatformAdmin | `PlatformAdminDbContext` | `platform` | `src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.Infrastructure/Persistence/PlatformAdminDbContext.cs` |
| 3 | Projects | `ProjectsDbContext` | `projects` | `src/Modules/Projects/NGO.PMS.Projects.Infrastructure/Persistence/ProjectsDbContext.cs` |
| 4 | Planning | `PlanningDbContext` | `planning` | `src/Modules/Planning/NGO.PMS.Planning.Infrastructure/Persistence/PlanningDbContext.cs` |
| 5 | Reporting | `ReportingDbContext` | `reporting` | `src/Modules/Reporting/NGO.PMS.Reporting.Infrastructure/Persistence/ReportingDbContext.cs` |
| 6 | MEAL | `MealDbContext` | `meal` | `src/Modules/MEAL/NGO.PMS.MEAL.Infrastructure/Persistence/MealDbContext.cs` |
| 7 | Participants | `ParticipantsDbContext` | `participants` | `src/Modules/Participants/NGO.PMS.Participants.Infrastructure/Persistence/ParticipantsDbContext.cs` |
| 8 | Procurement | `ProcurementDbContext` | `procurement` | `src/Modules/Procurement/NGO.PMS.Procurement.Infrastructure/Persistence/ProcurementDbContext.cs` |
| 9 | FundAccounting | `FundAcctDbContext` | `fundacct` | `src/Modules/FundAccounting/NGO.PMS.FundAccounting.Infrastructure/Persistence/FundAcctDbContext.cs` |
| 10 | Assets | `AssetsDbContext` | `assets` | `src/Modules/Assets/NGO.PMS.Assets.Infrastructure/Persistence/AssetsDbContext.cs` |
| 11 | Training | `TrainingDbContext` | `training` | `src/Modules/Training/NGO.PMS.Training.Infrastructure/Persistence/TrainingDbContext.cs` |
| 12 | Tasks | `TasksDbContext` | `tasks` | `src/Modules/Tasks/NGO.PMS.Tasks.Infrastructure/Persistence/TasksDbContext.cs` |
| 13 | Risk | `RiskDbContext` | `risk` | `src/Modules/Risk/NGO.PMS.Risk.Infrastructure/Persistence/RiskDbContext.cs` |
| 14 | Donors | `DonorsDbContext` | `donors` | `src/Modules/Donors/NGO.PMS.Donors.Infrastructure/Persistence/DonorsDbContext.cs` |
| 15 | Chat | `ChatDbContext` | `collab` | `src/Modules/Chat/NGO.PMS.Chat.Infrastructure/Persistence/ChatDbContext.cs` |
| 16 | Notifications | `NotificationsDbContext` | `collab` | `src/Modules/Notifications/NGO.PMS.Notifications.Infrastructure/Persistence/NotificationsDbContext.cs` |
| 17 | Documents | `DocumentsDbContext` | `content` | `src/Modules/Documents/NGO.PMS.Documents.Infrastructure/Persistence/DocumentsDbContext.cs` |
| 18 | Feedback | `FeedbackDbContext` | `content` | `src/Modules/Feedback/NGO.PMS.Feedback.Infrastructure/Persistence/FeedbackDbContext.cs` |

**Shared-schema note:** When two DbContexts target the same schema, each manages only its own entities. No table name collisions exist because each module prefixes tables naturally (chat tables are `chat_*`, notification tables are `notification_*`). Each DbContext stores its `__EFMigrationsHistory` in the shared schema with its own migration table name to prevent conflicts (see Section 2.4).

### 2.3 DbContext Configuration Pattern

Every module DbContext follows this exact pattern:

```csharp
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.Projects.Infrastructure.Persistence;

/// <summary>
/// DbContext for the Projects module. Targets the "projects" PostgreSQL schema.
/// Manages: projects, project_phases, outcomes, outputs, indicators,
/// indicator_targets, intervention_areas, project_intervention_areas,
/// project_team_members.
/// </summary>
public sealed class ProjectsDbContext : MultiTenantDbContext
{
    public ProjectsDbContext(
        DbContextOptions<ProjectsDbContext> options,
        IMultiTenantContextAccessor tenantAccessor)
        : base(options, tenantAccessor)
    {
    }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectPhase> ProjectPhases => Set<ProjectPhase>();
    public DbSet<Outcome> Outcomes => Set<Outcome>();
    public DbSet<Output> Outputs => Set<Output>();
    public DbSet<Indicator> Indicators => Set<Indicator>();
    public DbSet<IndicatorTarget> IndicatorTargets => Set<IndicatorTarget>();
    public DbSet<InterventionArea> InterventionAreas => Set<InterventionArea>();
    public DbSet<ProjectInterventionArea> ProjectInterventionAreas
        => Set<ProjectInterventionArea>();
    public DbSet<ProjectTeamMember> ProjectTeamMembers
        => Set<ProjectTeamMember>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // 1. Set the PostgreSQL schema for all tables in this DbContext
        modelBuilder.HasDefaultSchema("projects");

        // 2. Apply all IEntityTypeConfiguration<T> from this assembly
        //    (called by base.OnModelCreating via ApplyConfigurationsFromAssembly)
        base.OnModelCreating(modelBuilder);
    }
}
```

**Entity configuration file pattern:**

File: `src/Modules/Projects/NGO.PMS.Projects.Infrastructure/Persistence/Configurations/ProjectConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace NGO.PMS.Projects.Infrastructure.Persistence.Configurations;

public sealed class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("projects");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id)
            .HasColumnName("id")
            .HasDefaultValueSql("gen_random_uuid()");

        builder.Property(p => p.Name)
            .HasColumnName("name")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(p => p.Code)
            .HasColumnName("code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(p => p.OrganizationId)
            .HasColumnName("organization_id")
            .IsRequired();

        builder.Property(p => p.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(p => p.StartDate).HasColumnName("start_date");
        builder.Property(p => p.EndDate).HasColumnName("end_date");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at").IsRequired();
        builder.Property(p => p.DeletedAt).HasColumnName("deleted_at");

        // Indexes (see Section 4 for full index strategy)
        builder.HasIndex(p => p.OrganizationId)
            .HasDatabaseName("ix_projects_organization");
        builder.HasIndex(p => new { p.OrganizationId, p.Status })
            .HasDatabaseName("ix_projects_org_status");
        builder.HasIndex(p => new { p.Code, p.OrganizationId })
            .IsUnique()
            .HasDatabaseName("uq_projects_code_org");

        // Relationships
        builder.HasMany(p => p.Outcomes)
            .WithOne(o => o.Project)
            .HasForeignKey(o => o.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

### 2.4 IDesignTimeDbContextFactory

Each module needs a design-time factory for `dotnet ef migrations` to work, since the DbContext constructor requires `IMultiTenantContextAccessor` which is unavailable at design time.

File: `src/Modules/Projects/NGO.PMS.Projects.Infrastructure/Persistence/ProjectsDbContextFactory.cs`

```csharp
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace NGO.PMS.Projects.Infrastructure.Persistence;

/// <summary>
/// Design-time factory for dotnet ef migrations.
/// Used only by the CLI tool, never at runtime.
/// </summary>
public sealed class ProjectsDbContextFactory
    : IDesignTimeDbContextFactory<ProjectsDbContext>
{
    public ProjectsDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(
                Directory.GetCurrentDirectory(),
                "..", "..", "..", "Host", "NGO.PMS.API"))
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddUserSecrets<ProjectsDbContextFactory>(optional: true)
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<ProjectsDbContext>();
        optionsBuilder.UseNpgsql(
            configuration.GetConnectionString("DefaultConnection"),
            npgsql => npgsql.MigrationsHistoryTable(
                "__EFMigrationsHistory_Projects", "projects"));

        return new ProjectsDbContext(
            optionsBuilder.Options,
            new DesignTimeTenantAccessor());
    }
}

/// <summary>
/// No-op tenant accessor for design-time migration generation.
/// </summary>
internal sealed class DesignTimeTenantAccessor : IMultiTenantContextAccessor
{
    public IMultiTenantContext? MultiTenantContext => null;
}
```

**Critical detail:** Each module stores its EF migration history in its own schema under a module-specific table name. This prevents collision when two modules share a schema:

| Module | Migration History Table | Schema |
|--------|----------------------|--------|
| Identity | `__EFMigrationsHistory_Identity` | `identity` |
| PlatformAdmin | `__EFMigrationsHistory_PlatformAdmin` | `platform` |
| Projects | `__EFMigrationsHistory_Projects` | `projects` |
| Chat | `__EFMigrationsHistory_Chat` | `collab` |
| Notifications | `__EFMigrationsHistory_Notifications` | `collab` |
| Documents | `__EFMigrationsHistory_Documents` | `content` |
| Feedback | `__EFMigrationsHistory_Feedback` | `content` |

### 2.5 DI Registration

In each module's API extension method (per `00-CODING-STANDARDS.md` Section 5):

```csharp
// src/Modules/Projects/NGO.PMS.Projects.API/ProjectsModuleExtensions.cs

services.AddDbContext<ProjectsDbContext>((sp, options) =>
{
    options.UseNpgsql(
        configuration.GetConnectionString("DefaultConnection"),
        npgsql =>
        {
            npgsql.MigrationsAssembly(
                typeof(ProjectsDbContext).Assembly.GetName().Name);
            npgsql.MigrationsHistoryTable(
                "__EFMigrationsHistory_Projects", "projects");
        });
});
```

---

## 3. Migration Strategy

EthelPMS uses a **dual migration approach:**

| Tool | Scope | When to Use |
|------|-------|-------------|
| **EF Core Migrations** | Table structure (CREATE TABLE, ALTER TABLE, indexes, relationships) | Any entity or relationship change |
| **DbUp** | PostgreSQL-specific DDL (RLS policies, functions, triggers, custom types, seed data, schema/role creation) | Anything EF Core cannot express |

### 3.1 EF Core Migrations

**Migrations folder per module:**

```
src/Modules/Projects/NGO.PMS.Projects.Infrastructure/
  Persistence/
    ProjectsDbContext.cs
    ProjectsDbContextFactory.cs
    Configurations/
      ProjectConfiguration.cs
      OutcomeConfiguration.cs
      ...
    Migrations/
      20261020_001_InitialCreate.cs
      20261020_001_InitialCreate.Designer.cs
      20261105_002_AddProjectBudgetColumn.cs
      ProjectsDbContextModelSnapshot.cs
```

**Migration naming convention:** `{YYYYMMDD}_{seq}_{Description}`

| Example | Meaning |
|---------|---------|
| `20261020_001_InitialCreate` | First migration, Oct 20 2026 |
| `20261105_002_AddProjectBudgetColumn` | Second migration, Nov 5 2026 |
| `20261201_003_AddInterventionAreaTags` | Third migration, Dec 1 2026 |

**Commands to create and apply migrations:**

```bash
# ---------------------------------------------------------------
# CREATE a new migration for the Projects module
# ---------------------------------------------------------------
dotnet ef migrations add 20261020_001_InitialCreate \
  --project src/Modules/Projects/NGO.PMS.Projects.Infrastructure \
  --startup-project src/Host/NGO.PMS.API \
  --context ProjectsDbContext \
  --output-dir Persistence/Migrations

# ---------------------------------------------------------------
# APPLY pending migrations for the Projects module
# ---------------------------------------------------------------
dotnet ef database update \
  --project src/Modules/Projects/NGO.PMS.Projects.Infrastructure \
  --startup-project src/Host/NGO.PMS.API \
  --context ProjectsDbContext

# ---------------------------------------------------------------
# GENERATE idempotent SQL script (for staging/production review)
# ---------------------------------------------------------------
dotnet ef migrations script \
  --project src/Modules/Projects/NGO.PMS.Projects.Infrastructure \
  --startup-project src/Host/NGO.PMS.API \
  --context ProjectsDbContext \
  --idempotent \
  --output migrations/projects_latest.sql

# ---------------------------------------------------------------
# LIST all migrations and their applied status
# ---------------------------------------------------------------
dotnet ef migrations list \
  --project src/Modules/Projects/NGO.PMS.Projects.Infrastructure \
  --startup-project src/Host/NGO.PMS.API \
  --context ProjectsDbContext
```

**Auto-apply at startup (development only):**

```csharp
// src/Host/NGO.PMS.API/Program.cs -- DEVELOPMENT ONLY
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var sp = scope.ServiceProvider;

    // 1. Run DbUp scripts first (creates schemas, roles, functions)
    await sp.GetRequiredService<IDbUpRunner>().RunAsync();

    // 2. Apply EF Core migrations for each module
    await sp.GetRequiredService<IdentityDbContext>().Database.MigrateAsync();
    await sp.GetRequiredService<PlatformAdminDbContext>().Database.MigrateAsync();
    await sp.GetRequiredService<ProjectsDbContext>().Database.MigrateAsync();
    // ... repeat for each active module DbContext
}
```

### 3.2 DbUp Scripts

DbUp handles everything EF Core cannot express:

| Category | Examples |
|----------|---------|
| Schema creation | `CREATE SCHEMA IF NOT EXISTS projects;` |
| Database roles | `CREATE ROLE`, `GRANT`, `REVOKE` |
| RLS policies | `CREATE POLICY`, `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |
| Functions | `set_updated_at()` trigger function |
| Triggers | `trg_*_updated_at` on each auditable table |
| Extensions | `CREATE EXTENSION IF NOT EXISTS pg_trgm` |
| Custom types | `CREATE TYPE report_status AS ENUM (...)` |
| Seed data | Reference data, permissions, role templates |

**DbUp folder structure:**

```
src/Host/NGO.PMS.API/DbUp/
  Scripts/
    0001_create_schemas.sql
    0002_create_database_roles.sql
    0003_create_extensions.sql
    0004_create_reference_tables.sql
    0005_create_audit_schema.sql
    0006_create_outbox_schema.sql
    0007_create_updated_at_trigger_function.sql
    0008_identity_rls_policies.sql
    0009_projects_rls_policies.sql
    0010_planning_rls_policies.sql
    ... (one RLS script per module schema)
  SeedData/
    1001_seed_currencies.sql
    1002_seed_countries.sql
    1003_seed_ethiopian_regions.sql
    1004_seed_ethiopian_zones_woredas.sql
    1005_seed_ethiopian_calendar.sql
    1006_seed_permissions.sql
    1007_seed_role_templates.sql
  DbUpRunner.cs
```

**DbUp naming convention:** `{NNNN}_{description}.sql`

| Range | Purpose |
|-------|---------|
| `0001-0099` | Schema and role creation |
| `0100-0199` | Extensions, shared functions, triggers |
| `0200-0299` | RLS policies (one per module schema) |
| `0300-0399` | Reserved for future infrastructure |
| `1001-1999` | Seed data scripts |
| `2001-2999` | Maintenance and migration scripts |

### 3.3 Key DbUp Scripts

#### `0001_create_schemas.sql`

```sql
-- Create all application schemas.
-- DbUp tracks execution in its own schemaversions table.

CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS projects;
CREATE SCHEMA IF NOT EXISTS planning;
CREATE SCHEMA IF NOT EXISTS reporting;
CREATE SCHEMA IF NOT EXISTS meal;
CREATE SCHEMA IF NOT EXISTS participants;
CREATE SCHEMA IF NOT EXISTS procurement;
CREATE SCHEMA IF NOT EXISTS fundacct;
CREATE SCHEMA IF NOT EXISTS assets;
CREATE SCHEMA IF NOT EXISTS training;
CREATE SCHEMA IF NOT EXISTS tasks;
CREATE SCHEMA IF NOT EXISTS risk;
CREATE SCHEMA IF NOT EXISTS donors;
CREATE SCHEMA IF NOT EXISTS collab;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS reference;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS outbox;
-- hangfire schema is created by Hangfire.PostgreSql automatically
```

#### `0002_create_database_roles.sql`

```sql
-- Database roles for defense-in-depth schema isolation.
-- The application connects as the Supabase 'postgres' user
-- and is granted these roles for restricted access.

-- Read-only role for reference data
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ethelpms_reference_reader') THEN
    CREATE ROLE ethelpms_reference_reader;
  END IF;
END $$;

GRANT USAGE ON SCHEMA reference TO ethelpms_reference_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA reference TO ethelpms_reference_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA reference
    GRANT SELECT ON TABLES TO ethelpms_reference_reader;

-- INSERT-only role for audit schema (immutable audit trail, per Decision D14)
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ethelpms_audit_writer') THEN
    CREATE ROLE ethelpms_audit_writer;
  END IF;
END $$;

GRANT USAGE ON SCHEMA audit TO ethelpms_audit_writer;
GRANT INSERT ON ALL TABLES IN SCHEMA audit TO ethelpms_audit_writer;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA audit TO ethelpms_audit_writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit
    GRANT INSERT ON TABLES TO ethelpms_audit_writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit
    GRANT USAGE, SELECT ON SEQUENCES TO ethelpms_audit_writer;
-- Explicitly deny UPDATE and DELETE
REVOKE UPDATE, DELETE ON ALL TABLES IN SCHEMA audit FROM ethelpms_audit_writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit
    REVOKE UPDATE, DELETE ON TABLES FROM ethelpms_audit_writer;

-- Grant roles to the Supabase app user
GRANT ethelpms_reference_reader TO postgres;
GRANT ethelpms_audit_writer TO postgres;
```

#### `0003_create_extensions.sql`

```sql
-- PostgreSQL extensions used by EthelPMS
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Trigram similarity for fuzzy search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation (backup for gen_random_uuid)
```

#### `0007_create_updated_at_trigger_function.sql`

```sql
-- Shared trigger function: auto-set updated_at on UPDATE.
-- Applied to every auditable table via per-table triggers.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### `0008_identity_rls_policies.sql`

```sql
-- Row-Level Security for the identity schema.
-- Uses current_setting('app.current_org_id') set by TenantContextMiddleware.

ALTER TABLE identity.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.office_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_tenant_isolation ON identity.users
    USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY roles_tenant_isolation ON identity.roles
    USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY user_roles_tenant_isolation ON identity.user_roles
    USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY offices_tenant_isolation ON identity.offices
    USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY office_levels_tenant_isolation ON identity.office_levels
    USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY locations_tenant_isolation ON identity.locations
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- Tables NOT under RLS (shared or platform-level):
-- identity.permissions        (global, not tenant-scoped)
-- identity.organizations      (filtered at app level; each org sees itself)
-- identity.refresh_tokens     (filtered by user_id, not org)
-- identity.password_reset_tokens (filtered by token_hash)
-- platform.*                  (SuperAdmin only, no RLS)
-- reference.*                 (shared lookup data)

-- Apply updated_at triggers
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON identity.users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON identity.roles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_offices_updated_at
    BEFORE UPDATE ON identity.offices
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_locations_updated_at
    BEFORE UPDATE ON identity.locations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

#### `0009_projects_rls_policies.sql` (pattern for all module schemas)

```sql
-- RLS for the projects schema. Same pattern applies to all module schemas.

ALTER TABLE projects.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.indicator_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.intervention_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.project_intervention_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects.project_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_tenant ON projects.projects
    USING (organization_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY project_phases_tenant ON projects.project_phases
    USING (organization_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY outcomes_tenant ON projects.outcomes
    USING (organization_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY outputs_tenant ON projects.outputs
    USING (organization_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY indicators_tenant ON projects.indicators
    USING (organization_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY indicator_targets_tenant ON projects.indicator_targets
    USING (organization_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY intervention_areas_tenant ON projects.intervention_areas
    USING (organization_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY project_intervention_areas_tenant ON projects.project_intervention_areas
    USING (organization_id = current_setting('app.current_org_id')::uuid);
CREATE POLICY project_team_members_tenant ON projects.project_team_members
    USING (organization_id = current_setting('app.current_org_id')::uuid);

-- updated_at triggers
CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects.projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_outcomes_updated_at
    BEFORE UPDATE ON projects.outcomes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_outputs_updated_at
    BEFORE UPDATE ON projects.outputs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_indicators_updated_at
    BEFORE UPDATE ON projects.indicators
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### 3.4 DbUp Runner

File: `src/Host/NGO.PMS.API/DbUp/DbUpRunner.cs`

```csharp
using DbUp;

namespace NGO.PMS.API.DbUp;

public interface IDbUpRunner
{
    Task RunAsync();
}

public sealed class DbUpRunner(
    IConfiguration configuration,
    ILogger<DbUpRunner> logger) : IDbUpRunner
{
    public Task RunAsync()
    {
        var connectionString = configuration
            .GetConnectionString("DefaultConnection")!;

        // Infrastructure scripts (schemas, roles, RLS, functions)
        var infraResult = DeployChanges.To
            .PostgresqlDatabase(connectionString)
            .WithScriptsFromFileSystem(
                Path.Combine(AppContext.BaseDirectory, "DbUp", "Scripts"))
            .WithTransactionPerScript()
            .LogToConsole()
            .Build()
            .PerformUpgrade();

        if (!infraResult.Successful)
            throw new InvalidOperationException(
                $"DbUp infrastructure failed: {infraResult.Error}",
                infraResult.Error);

        // Seed data scripts
        var seedResult = DeployChanges.To
            .PostgresqlDatabase(connectionString)
            .WithScriptsFromFileSystem(
                Path.Combine(AppContext.BaseDirectory, "DbUp", "SeedData"))
            .WithTransactionPerScript()
            .LogToConsole()
            .Build()
            .PerformUpgrade();

        if (!seedResult.Successful)
            throw new InvalidOperationException(
                $"DbUp seed data failed: {seedResult.Error}",
                seedResult.Error);

        logger.LogInformation("All DbUp scripts applied successfully");
        return Task.CompletedTask;
    }
}
```

---

## 4. Indexing Strategy

### 4.1 Universal Index Rules

Every table in EthelPMS follows these rules:

| Rule | Index Type | Applies To |
|------|-----------|------------|
| **R1** | PK (btree) on `id` | Every table |
| **R2** | btree on `organization_id` | Every tenant-scoped table |
| **R3** | Partial index `WHERE deleted_at IS NULL` | Every `ISoftDeletable` entity |
| **R4** | btree on every FK column | All foreign key columns |
| **R5** | Unique composite with `organization_id` | Business-unique fields (codes, names, emails) |
| **R6** | Composite `(organization_id, status)` | Tables with status-based workflows |

### 4.2 Recommended Indexes Per Key Table

#### `identity` Schema

| Table | Index Name | Columns | Type | Purpose |
|-------|-----------|---------|------|---------|
| `users` | `pk_users` | `id` | PK | Primary key |
| `users` | `uq_users_email_org` | `normalized_email, organization_id` | Unique | Email unique per org |
| `users` | `ix_users_organization` | `organization_id` | btree | RLS, tenant queries |
| `users` | `ix_users_email` | `normalized_email` | btree | Login lookup |
| `users` | `ix_users_active` | `organization_id, is_active` | btree partial `WHERE deleted_at IS NULL` | Active user listing |
| `roles` | `uq_roles_name_org` | `name, organization_id` | Unique | Role name unique per org |
| `roles` | `ix_roles_organization` | `organization_id` | btree | Tenant filter |
| `user_roles` | `uq_user_roles` | `user_id, role_id` | Unique | No duplicate assignments |
| `offices` | `ix_offices_organization` | `organization_id` | btree | Tenant filter |
| `offices` | `ix_offices_parent` | `parent_office_id` | btree | Hierarchy traversal |
| `refresh_tokens` | `ix_refresh_tokens_hash` | `token_hash` | btree | Token lookup on refresh |
| `refresh_tokens` | `ix_refresh_tokens_user` | `user_id` | btree | User's active tokens |

#### `projects` Schema

| Table | Index Name | Columns | Type | Purpose |
|-------|-----------|---------|------|---------|
| `projects` | `ix_projects_organization` | `organization_id` | btree | RLS, tenant queries |
| `projects` | `ix_projects_org_status` | `organization_id, status` | btree | Listing by status |
| `projects` | `uq_projects_code_org` | `code, organization_id` | Unique | Code unique per org |
| `projects` | `ix_projects_active` | `organization_id` | btree partial `WHERE deleted_at IS NULL` | Active projects |
| `projects` | `ix_projects_search` | `name` | GIN (pg_trgm) | Full-text search |
| `outcomes` | `ix_outcomes_project` | `project_id` | btree | FK lookup |
| `outcomes` | `ix_outcomes_organization` | `organization_id` | btree | RLS |
| `outputs` | `ix_outputs_outcome` | `outcome_id` | btree | FK lookup |
| `indicators` | `ix_indicators_output` | `output_id` | btree | FK lookup |
| `indicators` | `ix_indicators_project` | `project_id` | btree | All indicators for project |
| `indicator_targets` | `ix_targets_indicator` | `indicator_id` | btree | FK lookup |
| `project_team_members` | `uq_project_team` | `project_id, user_id` | Unique | No duplicates |

#### `fundacct` Schema

| Table | Index Name | Columns | Type | Purpose |
|-------|-----------|---------|------|---------|
| `journal_entries` | `ix_journal_org` | `organization_id` | btree | RLS |
| `journal_entries` | `ix_journal_date` | `organization_id, entry_date` | btree | Date range queries |
| `journal_entries` | `ix_journal_status` | `organization_id, status` | btree | Posted vs pending |
| `journal_entries` | `ix_journal_project` | `project_id` | btree | Project financial view |
| `journal_lines` | `ix_jlines_entry` | `journal_entry_id` | btree | FK lookup |
| `journal_lines` | `ix_jlines_account` | `account_id` | btree | Account ledger |
| `budgets` | `ix_budgets_project` | `project_id` | btree | Project budgets |
| `budgets` | `ix_budgets_org_fiscal` | `organization_id, fiscal_year` | btree | Fiscal year filter |

#### `procurement` Schema

| Table | Index Name | Columns | Type | Purpose |
|-------|-----------|---------|------|---------|
| `purchase_requests` | `ix_pr_org` | `organization_id` | btree | RLS |
| `purchase_requests` | `ix_pr_org_status` | `organization_id, status` | btree | Status filter |
| `purchase_requests` | `ix_pr_project` | `project_id` | btree | Project requests |
| `purchase_orders` | `ix_po_supplier` | `supplier_id` | btree | Supplier orders |
| `suppliers` | `uq_suppliers_tin_org` | `tax_id, organization_id` | Unique partial `WHERE tax_id IS NOT NULL` | TIN unique per org |

#### `participants` Schema

| Table | Index Name | Columns | Type | Purpose |
|-------|-----------|---------|------|---------|
| `participants` | `ix_participants_org` | `organization_id` | btree | RLS |
| `participants` | `ix_participants_search` | `full_name` | GIN (pg_trgm) | Name search |
| `participants` | `uq_participants_idnum_org` | `id_number, organization_id` | Unique partial `WHERE id_number IS NOT NULL` | ID number unique per org |
| `participant_enrollments` | `ix_enrollments_participant` | `participant_id` | btree | FK lookup |
| `participant_enrollments` | `ix_enrollments_project` | `project_id` | btree | Project participants |
| `graduation_assessments` | `ix_grad_participant` | `participant_id` | btree | Graduation history |

### 4.3 Full-Text Search Indexes

Searchable fields use the `pg_trgm` extension with GIN indexes (created via DbUp script `0003_create_extensions.sql`):

```sql
-- Project name search
CREATE INDEX ix_projects_search
    ON projects.projects USING GIN (name gin_trgm_ops);

-- Participant name search
CREATE INDEX ix_participants_search
    ON participants.participants USING GIN (full_name gin_trgm_ops);

-- Document title search
CREATE INDEX ix_documents_search
    ON content.documents USING GIN (title gin_trgm_ops);

-- Donor name search
CREATE INDEX ix_donors_search
    ON donors.donors USING GIN (name gin_trgm_ops);
```

**Query pattern for trigram similarity search:**

```sql
SELECT id, name, similarity(name, 'water sanitation') AS score
FROM projects.projects
WHERE name % 'water sanitation'
ORDER BY score DESC
LIMIT 20;
```

---

## 5. Audit Trail

### 5.1 Audit Schema Table

#### `audit.audit_logs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `bigint` | PK, GENERATED ALWAYS AS IDENTITY | Auto-incrementing (faster than UUID for high-write) |
| `table_name` | `varchar(128)` | NOT NULL | e.g., `users`, `projects` |
| `schema_name` | `varchar(64)` | NOT NULL | e.g., `identity`, `projects` |
| `entity_id` | `varchar(64)` | NOT NULL | Primary key of the audited entity |
| `operation` | `varchar(10)` | NOT NULL | `INSERT`, `UPDATE`, `DELETE` |
| `old_values` | `jsonb` | NULL | Previous state (NULL for INSERT) |
| `new_values` | `jsonb` | NULL | New state (NULL for DELETE) |
| `changed_columns` | `text[]` | NULL | Array of changed column names (UPDATE only) |
| `user_id` | `uuid` | NULL | User who made the change |
| `user_email` | `varchar(256)` | NULL | Email snapshot (denormalized for audit independence) |
| `organization_id` | `uuid` | NULL | Tenant context at time of change |
| `correlation_id` | `varchar(64)` | NULL | HTTP request correlation ID |
| `ip_address` | `varchar(45)` | NULL | Client IP address |
| `user_agent` | `varchar(512)` | NULL | Client User-Agent string |
| `timestamp` | `timestamptz` | NOT NULL, DEFAULT `now()` | When the change occurred |

**SQL (created by DbUp `0005_create_audit_schema.sql`):**

```sql
CREATE TABLE audit.audit_logs (
    id                bigint          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    table_name        varchar(128)    NOT NULL,
    schema_name       varchar(64)     NOT NULL,
    entity_id         varchar(64)     NOT NULL,
    operation         varchar(10)     NOT NULL,
    old_values        jsonb,
    new_values        jsonb,
    changed_columns   text[],
    user_id           uuid,
    user_email        varchar(256),
    organization_id   uuid,
    correlation_id    varchar(64),
    ip_address        varchar(45),
    user_agent        varchar(512),
    timestamp         timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX ix_audit_logs_entity
    ON audit.audit_logs (schema_name, table_name, entity_id);
CREATE INDEX ix_audit_logs_user
    ON audit.audit_logs (user_id);
CREATE INDEX ix_audit_logs_org
    ON audit.audit_logs (organization_id);
CREATE INDEX ix_audit_logs_timestamp
    ON audit.audit_logs (timestamp);
CREATE INDEX ix_audit_logs_correlation
    ON audit.audit_logs (correlation_id);
```

### 5.2 Audit.NET Configuration

File: `src/Host/NGO.PMS.API/Configuration/AuditConfiguration.cs`

```csharp
using Audit.Core;
using Audit.EntityFramework;

namespace NGO.PMS.API.Configuration;

public static class AuditConfiguration
{
    public static void Configure(IServiceProvider sp)
    {
        Audit.Core.Configuration.Setup()
            .UseEntityFramework(ef => ef
                .UseDbContext<AuditDbContext>()
                .AuditTypeExplicitMapper(m => m
                    .Map<AuditLog>((ev, entry, entity) =>
                    {
                        var currentUser = sp.GetService<ICurrentUserService>();
                        var httpCtx = sp.GetService<IHttpContextAccessor>()?
                            .HttpContext;

                        entity.TableName = entry.Table;
                        entity.SchemaName = entry.Schema;
                        entity.EntityId = entry.PrimaryKey.Values
                            .FirstOrDefault()?.ToString() ?? "";
                        entity.Operation = entry.Action;
                        entity.OldValues = entry.Action != "Insert"
                            ? JsonSerializer.Serialize(
                                entry.Changes?.ToDictionary(
                                    c => c.ColumnName, c => c.OriginalValue))
                            : null;
                        entity.NewValues = entry.Action != "Delete"
                            ? JsonSerializer.Serialize(entry.ColumnValues)
                            : null;
                        entity.ChangedColumns = entry.Changes?
                            .Select(c => c.ColumnName).ToArray();
                        entity.UserId = currentUser?.UserId;
                        entity.UserEmail = currentUser?.Email;
                        entity.OrganizationId = currentUser?.OrganizationId;
                        entity.CorrelationId = httpCtx?.TraceIdentifier;
                        entity.IpAddress = httpCtx?.Connection
                            .RemoteIpAddress?.ToString();
                        entity.UserAgent = httpCtx?.Request
                            .Headers.UserAgent.ToString();
                        entity.Timestamp = DateTimeOffset.UtcNow;
                        return entity;
                    })
                )
            );

        // Opt-in: only audit AuditableEntity subclasses
        Audit.EntityFramework.Configuration.Setup()
            .ForAnyContext(config => config
                .IncludeEntityObjects()
                .AuditEventType("{context}:{database}"))
            .UseOptIn()
            .Include<AuditableEntity>();

        // Exclude high-volume and sensitive entities
        Audit.EntityFramework.Configuration.Setup()
            .ForAnyContext(config => config
                .Exclude<RefreshToken>()
                .Exclude<PasswordResetToken>()
                .Exclude<AuditLog>()
                .Exclude<OutboxMessage>()
                .Exclude<InboxMessage>());
    }
}
```

### 5.3 Immutable Audit Role

The `ethelpms_audit_writer` role (created in DbUp `0002`) can only INSERT into `audit.*`. Even if the application is compromised, audit records cannot be modified or deleted.

**Verification (run as superuser):**

```sql
-- These MUST fail:
SET ROLE ethelpms_audit_writer;
UPDATE audit.audit_logs SET operation = 'TAMPERED' WHERE id = 1;
-- ERROR: permission denied for table audit_logs
DELETE FROM audit.audit_logs WHERE id = 1;
-- ERROR: permission denied for table audit_logs
RESET ROLE;
```

### 5.4 Audit Query Patterns

**Entity history (show all changes to a specific record):**

```sql
SELECT operation, old_values, new_values, changed_columns,
       user_email, timestamp
FROM audit.audit_logs
WHERE schema_name = 'projects'
  AND table_name = 'projects'
  AND entity_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY timestamp DESC;
```

**User activity audit (all changes by a user in a date range):**

```sql
SELECT schema_name, table_name, entity_id, operation, timestamp
FROM audit.audit_logs
WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'
  AND timestamp BETWEEN '2026-10-01' AND '2026-10-31'
ORDER BY timestamp DESC;
```

**Request correlation (all changes in a single HTTP request):**

```sql
SELECT schema_name, table_name, operation, entity_id, timestamp
FROM audit.audit_logs
WHERE correlation_id = 'abc-123-request-id'
ORDER BY timestamp ASC;
```

**Organization recent activity (admin dashboard):**

```sql
SELECT table_name, operation, entity_id, user_email, timestamp
FROM audit.audit_logs
WHERE organization_id = '550e8400-e29b-41d4-a716-446655440002'
ORDER BY timestamp DESC
LIMIT 50;
```

---

## 6. Connection Management

### 6.1 Connection String

All modules share a **single connection string** to the Supabase PostgreSQL instance.

**`appsettings.json` (template -- credentials stored in secrets):**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.xxxxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=STORED_IN_SECRETS;SSL Mode=Require;Trust Server Certificate=true;Minimum Pool Size=2;Maximum Pool Size=20;Connection Idle Lifetime=300;Keepalive=30;Include Error Detail=true"
  }
}
```

### 6.2 Secrets Management

| Environment | Mechanism | How |
|-------------|-----------|-----|
| **Development** | `dotnet user-secrets` | `dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=..."` |
| **CI/CD** | GitHub Actions secrets | `${{ secrets.DATABASE_URL }}` injected as env var |
| **Staging/Production** | Environment variables | `ConnectionStrings__DefaultConnection` |

**Developer setup (run once):**

```bash
cd src/Host/NGO.PMS.API
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Host=db.xxxxx.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true;Include Error Detail=true"
dotnet user-secrets set "Jwt:Secret" \
  "your-256-bit-secret-key-here-must-be-at-least-32-characters-long"
```

### 6.3 Connection Pooling via Npgsql

Npgsql manages connection pooling automatically. Key parameters:

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `Minimum Pool Size` | 2 | Keep 2 warm connections |
| `Maximum Pool Size` | 20 (Pro) / 10 (Free) | Leave headroom for Supabase internals |
| `Connection Idle Lifetime` | 300 (seconds) | Close idle connections after 5 min |
| `Keepalive` | 30 (seconds) | Prevent firewall timeouts |

**Pool sizing by Supabase tier:**

| Supabase Tier | Max DB Connections | Recommended Pool Size | Concurrent Users |
|---------------|-------------------|-----------------------|------------------|
| Free | 60 | 10 | ~30 |
| Pro ($25/mo) | 200 | 20 | ~100 |
| Team ($599/mo) | 300+ | 50 | ~300 |

**Rationale:** Each HTTP request holds one connection for its duration. With 20 pool connections and 100ms average request time, throughput is ~200 req/sec -- far exceeding the <50 user target.

### 6.4 RLS Tenant Context

On every HTTP request, the tenant context middleware sets `app.current_org_id` so that PostgreSQL RLS policies filter rows automatically.

File: `src/Host/NGO.PMS.API/Middleware/TenantContextMiddleware.cs`

```csharp
using Finbuckle.MultiTenant.Abstractions;
using Npgsql;

namespace NGO.PMS.API.Middleware;

/// <summary>
/// Sets PostgreSQL session variable 'app.current_org_id' from the resolved tenant.
/// Uses SET LOCAL so the variable is scoped to the current transaction only.
/// </summary>
public sealed class TenantContextMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(
        HttpContext context,
        IMultiTenantContextAccessor tenantAccessor,
        IdentityDbContext dbContext)
    {
        var tenantInfo = tenantAccessor.MultiTenantContext?.TenantInfo;

        if (tenantInfo?.Id is not null)
        {
            var connection = dbContext.Database
                .GetDbConnection() as NpgsqlConnection;

            if (connection is not null)
            {
                if (connection.State != System.Data.ConnectionState.Open)
                    await connection.OpenAsync();

                await using var cmd = connection.CreateCommand();
                // SET LOCAL scopes to current transaction.
                // Automatically cleared when the transaction ends.
                cmd.CommandText =
                    "SET LOCAL app.current_org_id = @orgId";
                cmd.Parameters.AddWithValue("orgId", tenantInfo.Id);
                await cmd.ExecuteNonQueryAsync();
            }
        }

        await next(context);
    }
}
```

**Register in `Program.cs`:**

```csharp
app.UseAuthentication();
app.UseMultiTenant();                         // Finbuckle resolves tenant
app.UseMiddleware<TenantContextMiddleware>();  // Sets RLS variable
app.UseAuthorization();
```

**Important:** `SET LOCAL` scopes the variable to the current transaction. When the connection returns to the pool, the variable is cleared. This prevents tenant data leakage between requests.

---

## 7. Data Seeding

### 7.1 Seed Data Strategy

| Data Type | Mechanism | When | Idempotent |
|-----------|-----------|------|------------|
| Schemas, roles, functions, RLS | DbUp infrastructure scripts | App startup | Yes (`IF NOT EXISTS`, `OR REPLACE`) |
| Reference data (currencies, countries, calendar) | DbUp seed scripts | App startup | Yes (`ON CONFLICT DO NOTHING`) |
| Permissions (~200) | DbUp seed script | App startup | Yes (`ON CONFLICT DO NOTHING`) |
| Role templates (7) | DbUp seed script | App startup | Yes (`ON CONFLICT DO NOTHING`) |
| Per-tenant defaults | Application code (C#) | Tenant provisioning | Yes (check-then-insert) |

### 7.2 Idempotent Seed Script Examples

#### `1001_seed_currencies.sql`

```sql
INSERT INTO reference.currencies (code, name, symbol, decimal_places, is_active)
VALUES
    ('ETB', 'Ethiopian Birr', 'Br', 2, true),
    ('USD', 'US Dollar', '$', 2, true),
    ('EUR', 'Euro', '€', 2, true),
    ('GBP', 'British Pound', '£', 2, true),
    ('CHF', 'Swiss Franc', 'CHF', 2, true),
    ('SEK', 'Swedish Krona', 'kr', 2, true),
    ('NOK', 'Norwegian Krone', 'kr', 2, true),
    ('DKK', 'Danish Krone', 'kr', 2, true),
    ('CAD', 'Canadian Dollar', 'CA$', 2, true),
    ('AUD', 'Australian Dollar', 'A$', 2, true),
    ('JPY', 'Japanese Yen', '¥', 0, true),
    ('CNY', 'Chinese Yuan', '¥', 2, true),
    ('KES', 'Kenyan Shilling', 'KSh', 2, true),
    ('UGX', 'Ugandan Shilling', 'USh', 0, true),
    ('TZS', 'Tanzanian Shilling', 'TSh', 2, true),
    ('ZAR', 'South African Rand', 'R', 2, true),
    ('NGN', 'Nigerian Naira', '₦', 2, true),
    ('GHS', 'Ghanaian Cedi', 'GH₵', 2, true),
    ('SDG', 'Sudanese Pound', 'SDG', 2, true),
    ('SSP', 'South Sudanese Pound', 'SSP', 2, true)
ON CONFLICT (code) DO NOTHING;
```

#### `1006_seed_permissions.sql`

```sql
-- Seed application permissions (~100 shown, ~200 total)
-- Grouped by module for readability.

INSERT INTO identity.permissions (id, code, module, description, created_at)
VALUES
    -- Identity (format: {module}.{resource}.{action})
    (gen_random_uuid(), 'identity.users.create',      'identity', 'Create new users', now()),
    (gen_random_uuid(), 'identity.users.read',        'identity', 'View user profiles', now()),
    (gen_random_uuid(), 'identity.users.update',      'identity', 'Edit user profiles', now()),
    (gen_random_uuid(), 'identity.users.delete',      'identity', 'Delete/deactivate users', now()),
    (gen_random_uuid(), 'identity.users.manage',      'identity', 'Assign roles to users', now()),
    (gen_random_uuid(), 'identity.roles.create',      'identity', 'Create custom roles', now()),
    (gen_random_uuid(), 'identity.roles.read',        'identity', 'View roles', now()),
    (gen_random_uuid(), 'identity.roles.update',      'identity', 'Edit role permissions', now()),
    (gen_random_uuid(), 'identity.roles.delete',      'identity', 'Delete custom roles', now()),
    (gen_random_uuid(), 'identity.offices.create',    'identity', 'Create offices', now()),
    (gen_random_uuid(), 'identity.offices.read',      'identity', 'View offices', now()),
    (gen_random_uuid(), 'identity.offices.update',    'identity', 'Edit offices', now()),
    (gen_random_uuid(), 'identity.offices.delete',    'identity', 'Delete offices', now()),
    (gen_random_uuid(), 'orgsetup.organization.read', 'orgsetup', 'View organization settings', now()),
    (gen_random_uuid(), 'orgsetup.organization.update','orgsetup','Edit organization settings', now()),

    -- Projects
    (gen_random_uuid(), 'projects.projects.create',   'projects', 'Create projects', now()),
    (gen_random_uuid(), 'projects.projects.read',     'projects', 'View projects', now()),
    (gen_random_uuid(), 'projects.projects.update',   'projects', 'Edit projects', now()),
    (gen_random_uuid(), 'projects.projects.delete',   'projects', 'Delete projects', now()),
    (gen_random_uuid(), 'projects.projects.approve',  'projects', 'Approve projects', now()),
    (gen_random_uuid(), 'results.outcomes.create',    'results',  'Create results framework entries', now()),
    (gen_random_uuid(), 'results.outcomes.read',      'results',  'View results framework', now()),
    (gen_random_uuid(), 'results.outcomes.update',    'results',  'Edit results framework', now()),
    (gen_random_uuid(), 'results.indicators.create',  'results',  'Create indicators', now()),
    (gen_random_uuid(), 'results.indicators.read',    'results',  'View indicators', now()),
    (gen_random_uuid(), 'results.indicators.update',  'results',  'Edit indicators', now()),

    -- Planning
    (gen_random_uuid(), 'planning.annual.create',     'planning', 'Create plans', now()),
    (gen_random_uuid(), 'planning.annual.read',       'planning', 'View plans', now()),
    (gen_random_uuid(), 'planning.annual.update',     'planning', 'Edit plans', now()),
    (gen_random_uuid(), 'planning.annual.approve',    'planning', 'Approve plans', now()),
    (gen_random_uuid(), 'dip.entries.create',        'dip', 'Create DIP items', now()),
    (gen_random_uuid(), 'dip.entries.read',          'dip', 'View DIP', now()),
    (gen_random_uuid(), 'dip.entries.update',        'dip', 'Edit DIP items', now()),

    -- Reporting
    (gen_random_uuid(), 'reporting.reports.create',    'reporting', 'Create reports', now()),
    (gen_random_uuid(), 'reporting.reports.read',      'reporting', 'View reports', now()),
    (gen_random_uuid(), 'reporting.reports.update',    'reporting', 'Edit reports', now()),
    (gen_random_uuid(), 'reporting.reports.submit',    'reporting', 'Submit reports for approval', now()),
    (gen_random_uuid(), 'reporting.reports.approve',   'reporting', 'Approve/reject reports', now()),
    (gen_random_uuid(), 'reporting.reports.export',    'reporting', 'Export reports to PDF/Excel', now()),

    -- MEAL
    (gen_random_uuid(), 'meal.plans.create',       'meal', 'Create MEAL plans', now()),
    (gen_random_uuid(), 'meal.plans.read',         'meal', 'View MEAL data', now()),
    (gen_random_uuid(), 'meal.plans.update',       'meal', 'Edit MEAL plans', now()),
    (gen_random_uuid(), 'meal.evaluations.create', 'meal', 'Create evaluations', now()),
    (gen_random_uuid(), 'meal.evaluations.read',   'meal', 'View evaluations', now()),

    -- Participants
    (gen_random_uuid(), 'participants.profiles.create','participants', 'Register participants', now()),
    (gen_random_uuid(), 'participants.profiles.read', 'participants', 'View participants', now()),
    (gen_random_uuid(), 'participants.profiles.update','participants', 'Edit participant profiles', now()),
    (gen_random_uuid(), 'participants.profiles.delete','participants', 'Remove participants', now()),
    (gen_random_uuid(), 'graduation.tracking.manage', 'graduation', 'Conduct graduation assessments', now()),
    (gen_random_uuid(), 'graduation.tracking.approve','graduation', 'Approve graduation decisions', now()),

    -- Procurement
    (gen_random_uuid(), 'procurement.requests.create','procurement', 'Create purchase requests', now()),
    (gen_random_uuid(), 'procurement.requests.read',  'procurement', 'View procurement data', now()),
    (gen_random_uuid(), 'procurement.requests.approve','procurement', 'Approve purchase requests', now()),
    (gen_random_uuid(), 'procurement.pos.create',    'procurement', 'Create purchase orders', now()),
    (gen_random_uuid(), 'procurement.pos.approve',   'procurement', 'Record goods received', now()),

    -- Fund Accounting
    (gen_random_uuid(), 'fundacct.journals.create',   'fundacct', 'Create journal entries', now()),
    (gen_random_uuid(), 'fundacct.journals.read',     'fundacct', 'View financial data', now()),
    (gen_random_uuid(), 'fundacct.journals.approve',  'fundacct', 'Approve journal entries', now()),
    (gen_random_uuid(), 'fundacct.budgets.create',    'fundacct', 'Create budgets', now()),
    (gen_random_uuid(), 'fundacct.budgets.read',      'fundacct', 'View budgets', now()),
    (gen_random_uuid(), 'fundacct.budgets.approve',   'fundacct', 'Approve budget revisions', now()),

    -- Assets
    (gen_random_uuid(), 'assets.register.create',     'assets', 'Register assets', now()),
    (gen_random_uuid(), 'assets.register.read',       'assets', 'View assets', now()),
    (gen_random_uuid(), 'assets.register.update',     'assets', 'Edit asset records', now()),
    (gen_random_uuid(), 'assets.register.dispose',    'assets', 'Dispose of assets', now()),
    (gen_random_uuid(), 'assets.maintenance.manage',  'assets', 'Manage asset maintenance', now()),

    -- Training
    (gen_random_uuid(), 'training.programs.create',   'training', 'Create training programs', now()),
    (gen_random_uuid(), 'training.programs.read',     'training', 'View training data', now()),
    (gen_random_uuid(), 'training.programs.update',   'training', 'Edit training programs', now()),

    -- Tasks
    (gen_random_uuid(), 'tasks.tasks.create',      'tasks', 'Create tasks', now()),
    (gen_random_uuid(), 'tasks.tasks.read',        'tasks', 'View tasks', now()),
    (gen_random_uuid(), 'tasks.tasks.update',      'tasks', 'Edit tasks', now()),
    (gen_random_uuid(), 'tasks.tasks.assign',      'tasks', 'Assign tasks to users', now()),

    -- Risk
    (gen_random_uuid(), 'risk.risks.create',      'risk', 'Create risk entries', now()),
    (gen_random_uuid(), 'risk.risks.read',        'risk', 'View risk register', now()),
    (gen_random_uuid(), 'risk.risks.update',      'risk', 'Edit risk entries', now()),

    -- Donors
    (gen_random_uuid(), 'donors.donors.create',     'donors', 'Create donor records', now()),
    (gen_random_uuid(), 'donors.donors.read',       'donors', 'View donor information', now()),
    (gen_random_uuid(), 'donors.donors.update',     'donors', 'Edit donor records', now()),
    (gen_random_uuid(), 'donors.grants.create',     'donors', 'Create grant records', now()),
    (gen_random_uuid(), 'donors.grants.read',       'donors', 'View grants', now()),

    -- Collaboration
    (gen_random_uuid(), 'chat.messages.send',        'collab', 'Send chat messages', now()),
    (gen_random_uuid(), 'chat.channels.create',      'collab', 'Create chat rooms', now()),
    (gen_random_uuid(), 'notifications.manage',      'collab', 'Manage notification templates', now()),

    -- Content
    (gen_random_uuid(), 'documents.upload',  'content', 'Upload documents', now()),
    (gen_random_uuid(), 'documents.read',    'content', 'View documents', now()),
    (gen_random_uuid(), 'documents.delete',  'content', 'Delete documents', now()),
    (gen_random_uuid(), 'feedback.submit',   'content', 'Submit feedback', now()),
    (gen_random_uuid(), 'feedback.read',     'content', 'View feedback items', now()),
    (gen_random_uuid(), 'feedback.manage',   'content', 'Respond to feedback', now()),

    -- Analytics (Phase 10+)
    (gen_random_uuid(), 'dashboards.read',   'dashboards', 'View dashboards', now()),
    (gen_random_uuid(), 'dashboards.create', 'dashboards', 'Configure dashboard widgets', now()),
    (gen_random_uuid(), 'settings.system.manage', 'settings', 'View system settings', now()),
    (gen_random_uuid(), 'settings.audit.read',    'settings', 'View audit logs', now()),

    -- Platform (SuperAdmin only)
    (gen_random_uuid(), 'platform.tenants.create', 'platform', 'Provision new tenants', now()),
    (gen_random_uuid(), 'platform.tenants.read',   'platform', 'View all tenants', now()),
    (gen_random_uuid(), 'platform.tenants.update',  'platform', 'Edit tenant settings', now()),
    (gen_random_uuid(), 'platform.tenants.suspend', 'platform', 'Suspend tenants', now()),
    (gen_random_uuid(), 'platform.modules.toggle',  'platform', 'Toggle modules per tenant', now())
ON CONFLICT (code) DO NOTHING;
```

#### `1007_seed_role_templates.sql`

```sql
-- Default role templates cloned into each new tenant during provisioning.
-- Stored in the platform schema (not tenant-scoped).

INSERT INTO platform.role_templates (id, name, description, permissions, created_at)
VALUES
    (gen_random_uuid(), 'Organization Admin',
     'Full access to all modules within the organization',
     ARRAY[
       'identity.users.create','identity.users.read','identity.users.update','identity.users.delete','identity.users.manage',
       'identity.roles.create','identity.roles.read','identity.roles.update','identity.roles.delete',
       'identity.offices.create','identity.offices.read','identity.offices.update','identity.offices.delete',
       'orgsetup.organization.read','orgsetup.organization.update',
       'projects.projects.create','projects.projects.read','projects.projects.update','projects.projects.delete','projects.projects.approve',
       'results.outcomes.create','results.outcomes.read','results.outcomes.update',
       'planning.annual.create','planning.annual.read','planning.annual.update','planning.annual.approve',
       'reporting.reports.create','reporting.reports.read','reporting.reports.update','reporting.reports.submit','reporting.reports.approve','reporting.reports.export',
       'finance.journal','finance.read','finance.approve',
       'budgets.create','budgets.read','budgets.approve',
       'settings.read','settings.update','dashboards.read','dashboards.configure'],
     now()),

    (gen_random_uuid(), 'Project Manager',
     'Manages projects, plans, reports, and team members',
     ARRAY[
       'projects.projects.create','projects.projects.read','projects.projects.update',
       'results.outcomes.create','results.outcomes.read','results.outcomes.update',
       'results.indicators.create','results.indicators.read','results.indicators.update',
       'planning.annual.create','planning.annual.read','planning.annual.update',
       'dip.entries.create','dip.entries.read','dip.entries.update',
       'reporting.reports.create','reporting.reports.read','reporting.reports.update','reporting.reports.submit',
       'tasks.tasks.create','tasks.tasks.read','tasks.tasks.update','tasks.tasks.assign',
       'risk.risks.create','risk.risks.read','risk.risks.update',
       'donors.donors.read','donors.grants.read',
       'dashboards.read'],
     now()),

    (gen_random_uuid(), 'MEAL Officer',
     'Monitors indicators, conducts evaluations, tracks participants',
     ARRAY[
       'projects.projects.read','results.indicators.read','results.indicators.update',
       'meal.plans.create','meal.plans.read','meal.plans.update',
       'meal.evaluations.create','meal.evaluations.read',
       'participants.profiles.create','participants.profiles.read','participants.profiles.update',
       'graduation.tracking.manage',
       'reporting.reports.read','dashboards.read'],
     now()),

    (gen_random_uuid(), 'Finance Officer',
     'Manages budgets, journal entries, and financial reports',
     ARRAY[
       'fundacct.journals.create','fundacct.journals.read',
       'fundacct.budgets.create','fundacct.budgets.read',
       'procurement.requests.read','procurement.requests.approve',
       'assets.register.read','assets.register.create','assets.register.update',
       'reporting.reports.read','dashboards.read'],
     now()),

    (gen_random_uuid(), 'Procurement Officer',
     'Manages procurement lifecycle',
     ARRAY[
       'procurement.requests.create','procurement.requests.read','procurement.pos.create','procurement.pos.approve',
       'assets.register.create','assets.register.read',
       'dashboards.read'],
     now()),

    (gen_random_uuid(), 'Field Officer',
     'Data entry for plans, reports, and participant tracking',
     ARRAY[
       'projects.projects.read','planning.annual.read',
       'reporting.reports.create','reporting.reports.read','reporting.reports.update',
       'participants.profiles.create','participants.profiles.read','participants.profiles.update',
       'training.programs.read',
       'tasks.tasks.read','tasks.tasks.update',
       'feedback.submit','feedback.read',
       'documents.upload','documents.read',
       'chat.messages.send'],
     now()),

    (gen_random_uuid(), 'Viewer',
     'Read-only access to projects, reports, and dashboards',
     ARRAY[
       'projects.projects.read','planning.annual.read','reporting.reports.read',
       'results.indicators.read','meal.plans.read','participants.profiles.read',
       'dashboards.read','documents.read'],
     now())
ON CONFLICT (name) DO NOTHING;
```

### 7.3 Per-Tenant Seeding

When a new tenant is provisioned, the `TenantProvisioningService` runs:

1. Create `identity.organizations` record
2. Clone role templates into `identity.roles` for the new org
3. Map permissions to cloned roles via `identity.role_permissions`
4. Create the admin user (with password setup email)
5. Create default Head Office

```csharp
// src/Modules/PlatformAdmin/NGO.PMS.PlatformAdmin.Infrastructure/
// Services/TenantProvisioningService.cs

public async Task ProvisionTenantAsync(
    string tenantName,
    string adminEmail,
    string adminFirstName,
    string adminLastName,
    CancellationToken ct)
{
    // 1. Create organization
    var org = Organization.Create(tenantName);
    await orgRepo.AddAsync(org, ct);

    // 2. Clone role templates into org-specific roles
    var templates = await roleTemplateRepo.GetAllAsync(ct);
    foreach (var template in templates)
    {
        var role = Role.CreateFromTemplate(
            template.Name, template.Description, org.Id, template.Permissions);
        await roleRepo.AddAsync(role, ct);
    }

    // 3. Create admin user with OrgAdmin role
    var admin = User.Create(adminEmail, adminFirstName, adminLastName, org.Id);
    await userRepo.AddAsync(admin, ct);

    var adminRole = await roleRepo.GetByNameAsync("Organization Admin", org.Id, ct);
    await userRoleRepo.AssignAsync(admin.Id, adminRole!.Id, ct);

    // 4. Create default Head Office
    var headOffice = Office.CreateHeadOffice(org.Id, tenantName);
    await officeRepo.AddAsync(headOffice, ct);

    // 5. Send password setup email (via domain event)
    await mediator.Publish(
        new TenantProvisionedEvent(org.Id, admin.Id), ct);
}
```

---

## 8. Shared Reference Data

### 8.1 Reference Schema Tables

All reference tables are **not tenant-scoped** (no `organization_id`, no RLS). They are shared across all tenants and treated as read-only by the application.

#### `reference.currencies`

```sql
CREATE TABLE reference.currencies (
    code            varchar(3)      PRIMARY KEY,  -- ISO 4217
    name            varchar(100)    NOT NULL,
    symbol          varchar(10)     NOT NULL,
    decimal_places  smallint        NOT NULL DEFAULT 2,
    is_active       boolean         NOT NULL DEFAULT true
);
```

#### `reference.countries`

```sql
CREATE TABLE reference.countries (
    code            varchar(3)      PRIMARY KEY,  -- ISO 3166-1 alpha-3
    name            varchar(100)    NOT NULL,
    alpha2          varchar(2)      NOT NULL,     -- ISO 3166-1 alpha-2
    phone_code      varchar(10),
    is_active       boolean         NOT NULL DEFAULT true
);

CREATE INDEX ix_countries_name ON reference.countries (name);
```

#### `reference.regions`

```sql
CREATE TABLE reference.regions (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            varchar(100)    NOT NULL,
    name_am         varchar(100),                 -- Amharic name
    code            varchar(10)     NOT NULL UNIQUE,
    region_type     varchar(30)     NOT NULL,     -- 'regional_state','city_administration','council'
    is_active       boolean         NOT NULL DEFAULT true
);
```

#### `reference.zones`

```sql
CREATE TABLE reference.zones (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            varchar(100)    NOT NULL,
    name_am         varchar(100),
    code            varchar(20)     NOT NULL UNIQUE,
    region_id       uuid            NOT NULL REFERENCES reference.regions(id),
    is_active       boolean         NOT NULL DEFAULT true
);

CREATE INDEX ix_zones_region ON reference.zones (region_id);
```

#### `reference.woredas`

```sql
CREATE TABLE reference.woredas (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            varchar(100)    NOT NULL,
    name_am         varchar(100),
    code            varchar(30)     NOT NULL UNIQUE,
    zone_id         uuid            NOT NULL REFERENCES reference.zones(id),
    is_active       boolean         NOT NULL DEFAULT true
);

CREATE INDEX ix_woredas_zone ON reference.woredas (zone_id);
```

#### `reference.kebeles`

```sql
CREATE TABLE reference.kebeles (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            varchar(100)    NOT NULL,
    name_am         varchar(100),
    code            varchar(40)     UNIQUE,
    woreda_id       uuid            NOT NULL REFERENCES reference.woredas(id),
    is_active       boolean         NOT NULL DEFAULT true
);

CREATE INDEX ix_kebeles_woreda ON reference.kebeles (woreda_id);
```

#### `reference.ethiopian_calendar`

Precomputed lookup table for Ethiopian-to-Gregorian date conversion, covering 1990-2050 EC (1997-2057 GC).

```sql
CREATE TABLE reference.ethiopian_calendar (
    ethiopian_date  date            PRIMARY KEY,
    gregorian_date  date            NOT NULL,
    ethiopian_year  smallint        NOT NULL,
    ethiopian_month smallint        NOT NULL,     -- 1-13 (Pagume = 13)
    ethiopian_day   smallint        NOT NULL,
    day_of_week     smallint        NOT NULL,     -- 0=Sunday, 6=Saturday
    is_holiday      boolean         NOT NULL DEFAULT false,
    holiday_name    varchar(100)
);

CREATE INDEX ix_ethcal_gregorian
    ON reference.ethiopian_calendar (gregorian_date);
CREATE INDEX ix_ethcal_year_month
    ON reference.ethiopian_calendar (ethiopian_year, ethiopian_month);
```

### 8.2 Accessing Reference Data from Modules

Module DbContexts do NOT map reference tables. Modules query reference data through a shared `IReferenceDataService` backed by Dapper:

```csharp
// src/Shared/NGO.PMS.SharedKernel/Services/IReferenceDataService.cs

public interface IReferenceDataService
{
    Task<CurrencyDto[]> GetCurrenciesAsync(CancellationToken ct = default);
    Task<CountryDto[]> GetCountriesAsync(CancellationToken ct = default);
    Task<RegionDto[]> GetRegionsAsync(CancellationToken ct = default);
    Task<ZoneDto[]> GetZonesByRegionAsync(Guid regionId, CancellationToken ct = default);
    Task<WoredaDto[]> GetWoredasByZoneAsync(Guid zoneId, CancellationToken ct = default);
    Task<KebeleDto[]> GetKebelesByWoredaAsync(Guid woredaId, CancellationToken ct = default);
    Task<DateTime> ToGregorianAsync(DateTime ethiopianDate, CancellationToken ct = default);
    Task<DateTime> ToEthiopianAsync(DateTime gregorianDate, CancellationToken ct = default);
}
```

Implementation uses Dapper for raw SQL queries against the `reference` schema. Results are cached in-memory with 1-hour TTL since reference data changes rarely.

---

## 9. Outbox Schema

### 9.1 Transactional Outbox Tables

The outbox pattern ensures reliable cross-module event delivery. The outbox write occurs in the same database transaction as the domain write (safe because both schemas are in the same PostgreSQL database).

#### `outbox.outbox_messages`

```sql
CREATE TABLE outbox.outbox_messages (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      varchar(256)    NOT NULL,     -- e.g. 'NGO.PMS.Contracts.ProjectCreatedEvent'
    source_module   varchar(64)     NOT NULL,     -- e.g. 'projects'
    payload         jsonb           NOT NULL,     -- Serialized event data
    correlation_id  varchar(64),
    organization_id uuid,
    created_at      timestamptz     NOT NULL DEFAULT now(),
    processed_at    timestamptz                   -- NULL = not yet relayed
);

CREATE INDEX ix_outbox_unprocessed
    ON outbox.outbox_messages (created_at)
    WHERE processed_at IS NULL;
CREATE INDEX ix_outbox_event_type
    ON outbox.outbox_messages (event_type);
```

#### `outbox.inbox_messages`

```sql
CREATE TABLE outbox.inbox_messages (
    id              uuid            PRIMARY KEY,  -- Same ID as the outbox message
    consumer_module varchar(64)     NOT NULL,     -- e.g. 'planning'
    event_type      varchar(256)    NOT NULL,
    processed_at    timestamptz     NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_inbox_consumer
    ON outbox.inbox_messages (id, consumer_module);
```

The Hangfire relay job polls `outbox_messages WHERE processed_at IS NULL`, dispatches each event via MediatR notifications, and marks them processed. The inbox table prevents duplicate processing if the relay retries.

---

## 10. Performance & Maintenance

### 10.1 VACUUM and ANALYZE

Supabase runs auto-vacuum by default. For high-write tables, configure more aggressive thresholds:

```sql
ALTER TABLE audit.audit_logs
    SET (autovacuum_vacuum_scale_factor = 0.05,
         autovacuum_analyze_scale_factor = 0.02);

ALTER TABLE outbox.outbox_messages
    SET (autovacuum_vacuum_scale_factor = 0.05,
         autovacuum_analyze_scale_factor = 0.02);

ALTER TABLE collab.chat_messages
    SET (autovacuum_vacuum_scale_factor = 0.1,
         autovacuum_analyze_scale_factor = 0.05);
```

**Hangfire maintenance jobs:**

| Job | Schedule | SQL |
|-----|----------|-----|
| Purge expired refresh tokens | Daily 02:00 UTC | `DELETE FROM identity.refresh_tokens WHERE expires_at < now() - interval '30 days'` |
| Purge processed outbox messages | Daily 03:00 UTC | `DELETE FROM outbox.outbox_messages WHERE processed_at < now() - interval '7 days'` |
| Purge processed inbox messages | Daily 03:00 UTC | `DELETE FROM outbox.inbox_messages WHERE processed_at < now() - interval '7 days'` |
| ANALYZE high-traffic tables | Weekly Sun 04:00 UTC | `ANALYZE identity.users; ANALYZE projects.projects; ANALYZE audit.audit_logs;` |

### 10.2 Table Partitioning Candidates

Do **not** implement partitioning until data volume warrants it. For EthelPMS's expected scale (<50 users, <100 projects), standard tables with proper indexes are sufficient for the first 1-2 years.

When thresholds are reached, partition these tables:

| Table | Partition Key | Threshold | Strategy |
|-------|--------------|-----------|----------|
| `audit.audit_logs` | `timestamp` | >1M rows | Monthly range partitions |
| `outbox.outbox_messages` | `created_at` | >500K rows | Monthly range partitions |
| `collab.chat_messages` | `created_at` | >1M rows | Monthly range partitions |

**Example partitioning (when needed):**

```sql
-- 1. Rename existing table
ALTER TABLE audit.audit_logs RENAME TO audit_logs_old;

-- 2. Create partitioned table with same structure
CREATE TABLE audit.audit_logs (
    LIKE audit.audit_logs_old INCLUDING ALL
) PARTITION BY RANGE (timestamp);

-- 3. Create partitions
CREATE TABLE audit.audit_logs_2026_10
    PARTITION OF audit.audit_logs
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE audit.audit_logs_2026_11
    PARTITION OF audit.audit_logs
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

-- 4. Migrate existing data
INSERT INTO audit.audit_logs SELECT * FROM audit.audit_logs_old;

-- 5. Drop old table after verification
DROP TABLE audit.audit_logs_old;

-- 6. Create a Hangfire job to auto-create next month's partition
```

### 10.3 Connection Pool Sizing

| Metric | Free Tier | Pro Tier |
|--------|-----------|----------|
| Supabase max connections | 60 | 200 |
| Reserved for Supabase internal | ~15 | ~30 |
| Available for application | ~45 | ~170 |
| Recommended Npgsql pool size | 10 | 20 |
| Concurrent users supported | ~30 | ~100 |
| Requests/sec capacity | ~100 | ~200 |

### 10.4 Backup Strategy

| Aspect | Strategy |
|--------|----------|
| **Automated backups** | Supabase managed: daily, 7-day retention (Free), 30 days (Pro) |
| **Point-in-time recovery** | Available on Pro tier via Supabase dashboard |
| **Pre-migration backup** | Always `pg_dump` before applying migrations in staging/production |
| **Audit data** | Never deleted. Partitioned when large. Archive to cold storage after 2 years. |

**Manual backup command (run before production migrations):**

```bash
pg_dump "postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file=backup_$(date +%Y%m%d_%H%M%S).dump
```

---

## 11. Implementation Checklist (Phase 0B)

Execute in this order during Phase 0B (Week 2):

| Step | Action | Tool | Verify |
|------|--------|------|--------|
| 1 | Move connection string to user-secrets | `dotnet user-secrets` | `appsettings.json` has no credentials |
| 2 | Create `DbUpRunner` and script folder structure | C# + SQL | Folder exists, runner compiles |
| 3 | Run `0001_create_schemas.sql` | DbUp | `\dn` in psql shows all 19 schemas |
| 4 | Run `0002_create_database_roles.sql` | DbUp | Roles visible in `pg_roles` |
| 5 | Run `0003_create_extensions.sql` | DbUp | `pg_trgm` available |
| 6 | Create `MultiTenantDbContext` base class | C# | SharedKernel builds |
| 7 | Create `IdentityDbContext` with entity configs | C# | `dotnet build` succeeds |
| 8 | Create `IdentityDbContextFactory` | C# | `dotnet ef migrations list` runs |
| 9 | Generate initial migration for Identity | `dotnet ef migrations add` | Migration files created |
| 10 | Apply Identity migration | `dotnet ef database update` | Tables visible in Supabase |
| 11 | Run `0005_create_audit_schema.sql` | DbUp | `audit.audit_logs` created |
| 12 | Run `0006_create_outbox_schema.sql` | DbUp | Outbox tables created |
| 13 | Run `0007_create_updated_at_trigger_function.sql` | DbUp | Function exists |
| 14 | Run `0008_identity_rls_policies.sql` | DbUp | RLS enabled, policies active |
| 15 | Configure Audit.NET | C# | INSERT into `audit.audit_logs` on entity change |
| 16 | Run `0004_create_reference_tables.sql` | DbUp | Reference tables exist |
| 17 | Run seed scripts (1001-1007) | DbUp | Currencies, permissions, role templates seeded |
| 18 | Create `TenantContextMiddleware` | C# | `app.current_org_id` set on requests |
| 19 | Create `PlatformAdminDbContext` + migration | C# + EF | Platform tables created |
| 20 | Verify: two test tenants isolated via RLS | Manual test | Tenant A cannot see Tenant B data |

Modules in Phases 2-12 follow the same pattern: create DbContext, generate migration, apply, add RLS script, add `updated_at` triggers.
