# EthelPMS — Cross-Module Events Plan

**Version:** 1.0
**Date:** October 16, 2026
**Owner:** Developer A (Backend lead)

> Modules communicate via integration events through the Transactional Outbox pattern.
> No module may directly reference another module's domain or infrastructure.
> All cross-module communication goes through the Contracts project + outbox relay.

---

## 1. Architecture Overview

```
Module A                           Module B
┌──────────────┐                   ┌──────────────┐
│  Command      │                   │  Event Handler│
│  Handler      │                   │  (Consumer)   │
│       │       │                   │       ▲       │
│       ▼       │                   │       │       │
│  Save Entity  │                   │  Read Inbox   │
│  + Outbox Msg │                   │  (idempotent) │
│  (1 txn)      │                   │               │
└──────┬───────┘                   └──────┬───────┘
       │                                   ▲
       ▼                                   │
  ┌─────────┐    Hangfire Relay    ┌─────────┐
  │ Outbox   │ ──────────────────► │  Inbox   │
  │ Table    │    (polls every     │  Table   │
  └─────────┘     10 seconds)      └─────────┘
```

**Key principles:**
- Producer writes outbox message in the SAME transaction as the domain change (atomicity).
- Hangfire relay polls outbox, dispatches to consumers via MediatR.
- Consumer records message ID in inbox table BEFORE processing (idempotency).
- If consumer already processed the message (ID exists in inbox), it skips silently.
- At-least-once delivery: consumer must be idempotent.

---

## 2. Database Schema

### 2.1 Outbox Table (per module schema)

```sql
-- Each module has its own outbox table in its schema
CREATE TABLE {schema}.outbox_messages (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      varchar(200) NOT NULL,   -- 'UserCreatedIntegrationEvent'
    payload         jsonb        NOT NULL,    -- serialized event data
    organization_id uuid         NOT NULL,
    created_at      timestamptz  NOT NULL DEFAULT now(),
    processed_at    timestamptz,              -- NULL = not yet relayed
    error           text                      -- last relay error, if any
);

CREATE INDEX ix_outbox_unprocessed ON {schema}.outbox_messages (created_at)
    WHERE processed_at IS NULL;
```

### 2.2 Inbox Table (shared in outbox schema)

```sql
CREATE SCHEMA IF NOT EXISTS outbox;

CREATE TABLE outbox.inbox_messages (
    id              uuid PRIMARY KEY,         -- same ID as the outbox message
    event_type      varchar(200) NOT NULL,
    consumer_name   varchar(200) NOT NULL,    -- handler class name
    processed_at    timestamptz  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_inbox_consumer ON outbox.inbox_messages (id, consumer_name);
```

---

## 3. Contracts Project — Integration Events

**File:** `src/Shared/NGO.PMS.Contracts/IntegrationEvents/`

All integration events are defined in the Contracts project, which any module can reference.

```csharp
namespace NGO.PMS.Contracts.IntegrationEvents;

public interface IIntegrationEvent
{
    Guid Id { get; }
    Guid OrganizationId { get; }
    DateTime OccurredOn { get; }
}

public abstract record IntegrationEvent : IIntegrationEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid OrganizationId { get; init; }
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}
```

---

## 4. Integration Event Catalog

### Identity Module Events (Producer)

| Event | Trigger | Payload | Consumers |
|-------|---------|---------|-----------|
| `UserCreatedIntegrationEvent` | New user created | UserId, Email, FirstName, LastName, OrganizationId | Notifications (welcome), Audit |
| `UserDeactivatedIntegrationEvent` | User deactivated | UserId, OrganizationId | Tasks (reassign), Chat (remove sessions) |
| `RoleChangedIntegrationEvent` | User role assigned/removed | UserId, RoleNames[], OrganizationId | Audit |
| `OrganizationUpdatedIntegrationEvent` | Org settings changed | OrganizationId, Name, Settings | All modules (cache refresh) |

### Projects Module Events (Producer)

| Event | Trigger | Payload | Consumers |
|-------|---------|---------|-----------|
| `ProjectCreatedIntegrationEvent` | New project | ProjectId, Code, Name, OrganizationId | ResultsFramework (auto-scaffold), FundAcct (create budget), Dashboards |
| `ProjectApprovedIntegrationEvent` | Project approved | ProjectId, ApprovedBy, OrganizationId | Planning (enable DIP), Notifications (inform team) |
| `ProjectClosedIntegrationEvent` | Project closed | ProjectId, ClosedBy, Reason, OrganizationId | FundAcct (freeze budgets), Procurement (block new POs), Assets (lock) |
| `ProjectMemberAddedIntegrationEvent` | Team member assigned | ProjectId, UserId, Role, OrganizationId | Notifications (inform user), Tasks (enable assignment) |

### Planning Module Events

| Event | Trigger | Payload | Consumers |
|-------|---------|---------|-----------|
| `AnnualPlanApprovedIntegrationEvent` | Annual plan approved | PlanId, ProjectId, FiscalYear, OrganizationId | DIP (enable DIP creation), Reporting |
| `QuarterlyPlanApprovedIntegrationEvent` | Quarterly plan approved | PlanId, ProjectId, Quarter, OrganizationId | DIP, Reporting |

### Reporting Module Events

| Event | Trigger | Payload | Consumers |
|-------|---------|---------|-----------|
| `ReportSubmittedIntegrationEvent` | Report submitted for approval | ReportId, ReportType, ProjectId, OrganizationId | Notifications (notify approvers) |
| `ReportApprovedIntegrationEvent` | Report approved | ReportId, ApprovedBy, OrganizationId | Dashboards (update metrics), Donors (auto-share if configured) |

### Procurement Module Events

| Event | Trigger | Payload | Consumers |
|-------|---------|---------|-----------|
| `PurchaseOrderApprovedIntegrationEvent` | PO approved | POId, Amount, Currency, ProjectId, OrganizationId | FundAcct (create commitment), Assets (if asset purchase) |
| `ContractSignedIntegrationEvent` | Contract executed | ContractId, VendorName, Amount, OrganizationId | FundAcct (create obligation) |

### Fund Accounting Module Events

| Event | Trigger | Payload | Consumers |
|-------|---------|---------|-----------|
| `JournalEntryPostedIntegrationEvent` | Journal posted | EntryId, Amount, Currency, ProjectId, OrganizationId | Dashboards (update financial data), Reporting |
| `BudgetExceededIntegrationEvent` | Spending > budget line | ProjectId, BudgetLineId, Amount, Limit, OrganizationId | Notifications (alert PM + finance), Procurement (block new POs) |

### Participants Module Events

| Event | Trigger | Payload | Consumers |
|-------|---------|---------|-----------|
| `ParticipantEnrolledIntegrationEvent` | Participant enrolled | ParticipantId, ProjectId, OrganizationId | MEAL (update indicator counts), Dashboards |
| `ParticipantGraduatedIntegrationEvent` | Graduation approved | ParticipantId, ProjectId, CriteriaId, OrganizationId | MEAL, Reporting, Dashboards |

### MEAL Module Events

| Event | Trigger | Payload | Consumers |
|-------|---------|---------|-----------|
| `IndicatorValueRecordedIntegrationEvent` | Indicator data entered | IndicatorId, Value, Period, ProjectId, OrganizationId | Dashboards, Reporting |
| `EvaluationCompletedIntegrationEvent` | Evaluation finished | EvaluationId, ProjectId, Findings, OrganizationId | Reporting, KnowledgeMgmt |

**Total: 17 integration event flows**

---

## 5. Backend Implementation

### 5.1 Outbox Writer

**File:** `src/Shared/NGO.PMS.SharedKernel/Outbox/IOutboxWriter.cs`

```csharp
namespace NGO.PMS.SharedKernel.Outbox;

public interface IOutboxWriter
{
    void Add(IIntegrationEvent @event);
}
```

**File:** `src/Shared/NGO.PMS.SharedKernel/Outbox/OutboxMessage.cs`

```csharp
namespace NGO.PMS.SharedKernel.Outbox;

public class OutboxMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string EventType { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public Guid OrganizationId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedAt { get; set; }
    public string? Error { get; set; }
}
```

**File:** `src/Shared/NGO.PMS.SharedKernel/Outbox/OutboxWriter.cs`

```csharp
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace NGO.PMS.SharedKernel.Outbox;

public class OutboxWriter : IOutboxWriter
{
    private readonly DbContext _dbContext;

    public OutboxWriter(DbContext dbContext) => _dbContext = dbContext;

    public void Add(IIntegrationEvent @event)
    {
        var message = new OutboxMessage
        {
            Id = @event.Id,
            EventType = @event.GetType().AssemblyQualifiedName!,
            Payload = JsonSerializer.Serialize(@event, @event.GetType()),
            OrganizationId = @event.OrganizationId
        };

        _dbContext.Set<OutboxMessage>().Add(message);
        // Will be saved in the same transaction as the domain change
    }
}
```

### 5.2 Usage in Command Handler

```csharp
public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, Guid>
{
    private readonly ProjectsDbContext _db;
    private readonly IOutboxWriter _outbox;
    private readonly ICurrentUserService _currentUser;

    public CreateProjectCommandHandler(
        ProjectsDbContext db, IOutboxWriter outbox, ICurrentUserService currentUser)
    {
        _db = db;
        _outbox = outbox;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken ct)
    {
        var project = new Project
        {
            Code = request.Code,
            Name = request.Name,
            // ... other properties
        };

        _db.Projects.Add(project);

        // Add integration event to outbox (same transaction)
        _outbox.Add(new ProjectCreatedIntegrationEvent
        {
            OrganizationId = _currentUser.OrganizationId,
            ProjectId = project.Id,
            Code = project.Code,
            Name = project.Name
        });

        await _db.SaveChangesAsync(ct);  // both project AND outbox message saved atomically
        return project.Id;
    }
}
```

### 5.3 Hangfire Outbox Relay

**File:** `src/Host/NGO.PMS.API/Jobs/OutboxRelayJob.cs`

```csharp
using System.Text.Json;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace NGO.PMS.API.Jobs;

public class OutboxRelayJob
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OutboxRelayJob> _logger;

    public OutboxRelayJob(IServiceScopeFactory scopeFactory, ILogger<OutboxRelayJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    [AutomaticRetry(Attempts = 3)]
    public async Task ProcessOutboxAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        // Query all module outbox tables for unprocessed messages
        // In practice, each module's DbContext has its own outbox table
        var dbContextTypes = new[]
        {
            typeof(IdentityDbContext),
            typeof(ProjectsDbContext),
            typeof(PlanningDbContext),
            // ... all module DbContexts
        };

        foreach (var dbContextType in dbContextTypes)
        {
            var dbContext = (DbContext)scope.ServiceProvider.GetRequiredService(dbContextType);
            var messages = await dbContext.Set<OutboxMessage>()
                .Where(m => m.ProcessedAt == null)
                .OrderBy(m => m.CreatedAt)
                .Take(50)
                .ToListAsync();

            foreach (var message in messages)
            {
                try
                {
                    var eventType = Type.GetType(message.EventType);
                    if (eventType is null)
                    {
                        _logger.LogWarning("Unknown event type: {Type}", message.EventType);
                        message.Error = $"Unknown type: {message.EventType}";
                        message.ProcessedAt = DateTime.UtcNow;
                        continue;
                    }

                    var @event = (IIntegrationEvent)JsonSerializer.Deserialize(
                        message.Payload, eventType)!;

                    // Dispatch via MediatR — all registered INotificationHandlers receive it
                    await mediator.Publish(@event);

                    message.ProcessedAt = DateTime.UtcNow;
                    message.Error = null;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to process outbox message {Id}", message.Id);
                    message.Error = ex.Message;
                    // Will be retried on next poll
                }
            }

            await dbContext.SaveChangesAsync();
        }
    }
}
```

### 5.4 Hangfire Registration

```csharp
// In Program.cs:
builder.Services.AddHangfire(config => config
    .UsePostgreSqlStorage(options =>
        options.UseNpgsqlConnection(connectionString)));
builder.Services.AddHangfireServer();

// After app.Build():
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireAuthFilter() }
});

// Register recurring job — every 10 seconds
RecurringJob.AddOrUpdate<OutboxRelayJob>(
    "outbox-relay",
    job => job.ProcessOutboxAsync(),
    "*/10 * * * * *");  // Cron: every 10 seconds
```

### 5.5 Inbox — Idempotent Consumer

**File:** `src/Shared/NGO.PMS.SharedKernel/Outbox/InboxMessage.cs`

```csharp
namespace NGO.PMS.SharedKernel.Outbox;

public class InboxMessage
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string ConsumerName { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
}
```

**File:** `src/Shared/NGO.PMS.SharedKernel/Outbox/IdempotentEventHandler.cs`

```csharp
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace NGO.PMS.SharedKernel.Outbox;

public abstract class IdempotentEventHandler<TEvent> : INotificationHandler<TEvent>
    where TEvent : IIntegrationEvent
{
    private readonly DbContext _db;

    protected IdempotentEventHandler(DbContext db) => _db = db;

    public async Task Handle(TEvent notification, CancellationToken ct)
    {
        var consumerName = GetType().FullName!;

        // Check if already processed
        var exists = await _db.Set<InboxMessage>()
            .AnyAsync(i => i.Id == notification.Id && i.ConsumerName == consumerName, ct);

        if (exists) return;  // Already processed — skip

        // Record in inbox FIRST
        _db.Set<InboxMessage>().Add(new InboxMessage
        {
            Id = notification.Id,
            EventType = typeof(TEvent).Name,
            ConsumerName = consumerName
        });

        // Process the event
        await HandleEvent(notification, ct);

        await _db.SaveChangesAsync(ct);
    }

    protected abstract Task HandleEvent(TEvent notification, CancellationToken ct);
}
```

### 5.6 Example Consumer

**File:** `src/Modules/FundAccounting/NGO.PMS.FundAccounting.Application/EventHandlers/ProjectCreatedHandler.cs`

```csharp
using NGO.PMS.Contracts.IntegrationEvents;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.FundAccounting.Application.EventHandlers;

public class ProjectCreatedHandler : IdempotentEventHandler<ProjectCreatedIntegrationEvent>
{
    private readonly FundAccountingDbContext _db;

    public ProjectCreatedHandler(FundAccountingDbContext db) : base(db)
    {
        _db = db;
    }

    protected override async Task HandleEvent(
        ProjectCreatedIntegrationEvent notification, CancellationToken ct)
    {
        // Auto-create a budget shell for the new project
        var budget = new Budget
        {
            ProjectId = notification.ProjectId,
            Name = $"{notification.Code} - Budget",
            OrganizationId = notification.OrganizationId,
            Status = BudgetStatus.Draft
        };

        _db.Budgets.Add(budget);
        // SaveChangesAsync is called by the base class
    }
}
```

---

## 6. Integration Event Definitions

### Identity Events

```csharp
// File: src/Shared/NGO.PMS.Contracts/IntegrationEvents/Identity/
public record UserCreatedIntegrationEvent : IntegrationEvent
{
    public Guid UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
}

public record UserDeactivatedIntegrationEvent : IntegrationEvent
{
    public Guid UserId { get; init; }
}

public record RoleChangedIntegrationEvent : IntegrationEvent
{
    public Guid UserId { get; init; }
    public List<string> RoleNames { get; init; } = [];
    public string ChangeType { get; init; } = string.Empty; // "assigned" or "removed"
}
```

### Project Events

```csharp
// File: src/Shared/NGO.PMS.Contracts/IntegrationEvents/Projects/
public record ProjectCreatedIntegrationEvent : IntegrationEvent
{
    public Guid ProjectId { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
}

public record ProjectApprovedIntegrationEvent : IntegrationEvent
{
    public Guid ProjectId { get; init; }
    public Guid ApprovedBy { get; init; }
}

public record ProjectClosedIntegrationEvent : IntegrationEvent
{
    public Guid ProjectId { get; init; }
    public Guid ClosedBy { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record ProjectMemberAddedIntegrationEvent : IntegrationEvent
{
    public Guid ProjectId { get; init; }
    public Guid UserId { get; init; }
    public string Role { get; init; } = string.Empty;
}
```

### Financial Events

```csharp
// File: src/Shared/NGO.PMS.Contracts/IntegrationEvents/Finance/
public record PurchaseOrderApprovedIntegrationEvent : IntegrationEvent
{
    public Guid PurchaseOrderId { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "ETB";
    public Guid ProjectId { get; init; }
}

public record JournalEntryPostedIntegrationEvent : IntegrationEvent
{
    public Guid EntryId { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "ETB";
    public Guid ProjectId { get; init; }
}

public record BudgetExceededIntegrationEvent : IntegrationEvent
{
    public Guid ProjectId { get; init; }
    public Guid BudgetLineId { get; init; }
    public decimal SpentAmount { get; init; }
    public decimal BudgetLimit { get; init; }
    public string Currency { get; init; } = "ETB";
}
```

### MEAL & Participant Events

```csharp
// File: src/Shared/NGO.PMS.Contracts/IntegrationEvents/MEAL/
public record ParticipantEnrolledIntegrationEvent : IntegrationEvent
{
    public Guid ParticipantId { get; init; }
    public Guid ProjectId { get; init; }
}

public record ParticipantGraduatedIntegrationEvent : IntegrationEvent
{
    public Guid ParticipantId { get; init; }
    public Guid ProjectId { get; init; }
    public Guid CriteriaId { get; init; }
}

public record IndicatorValueRecordedIntegrationEvent : IntegrationEvent
{
    public Guid IndicatorId { get; init; }
    public decimal Value { get; init; }
    public string Period { get; init; } = string.Empty;
    public Guid ProjectId { get; init; }
}
```

---

## 7. Event Flow Diagrams

### Flow 1: Project Creation Cascade

```
[Projects] CreateProject
    │
    ├── ProjectCreatedIntegrationEvent
    │
    ├──► [ResultsFramework] → Scaffold empty results framework
    ├──► [FundAccounting]   → Create draft budget
    └──► [Dashboards]       → Add to project dashboard
```

### Flow 2: Budget Exceeded Alert

```
[FundAccounting] PostJournalEntry
    │
    ├── Check: spending > budget line?
    │   └── YES → BudgetExceededIntegrationEvent
    │
    ├──► [Notifications] → Alert project manager + finance officer
    └──► [Procurement]   → Block new PO creation for this project/line
```

### Flow 3: Report Approval

```
[Reporting] SubmitReport
    │
    ├── ReportSubmittedIntegrationEvent
    ├──► [Notifications] → Notify approvers
    │
[Reporting] ApproveReport
    │
    ├── ReportApprovedIntegrationEvent
    ├──► [Dashboards] → Update KPI metrics
    └──► [Donors]     → Queue for donor portal (if auto-share)
```

---

## 8. Monitoring & Troubleshooting

### Hangfire Dashboard

Access at `/hangfire` (SuperAdmin only). Shows:
- Recurring jobs (outbox-relay)
- Failed jobs with error details
- Processing history

### Dead Letter Handling

Messages that fail 3 times (Hangfire retry) stay in outbox with `error` field populated. Create a Hangfire job to move permanently failed messages to a dead letter log:

```sql
-- Query failed messages
SELECT * FROM {schema}.outbox_messages
WHERE processed_at IS NULL AND error IS NOT NULL
ORDER BY created_at;
```

### Maintenance Job

```csharp
// Purge processed outbox messages older than 7 days
RecurringJob.AddOrUpdate<OutboxCleanupJob>(
    "outbox-cleanup",
    job => job.PurgeProcessedAsync(TimeSpan.FromDays(7)),
    Cron.Daily(2, 0));  // 2:00 AM daily
```

---

## 9. Testing

### Unit Tests

- `OutboxWriter_ShouldAddMessage_WhenEventPublished`
- `IdempotentEventHandler_ShouldSkip_WhenAlreadyProcessed`
- `IdempotentEventHandler_ShouldProcess_WhenNew`
- `OutboxRelayJob_ShouldMarkProcessed_WhenSuccessful`
- `OutboxRelayJob_ShouldRecordError_WhenHandlerFails`

### Integration Tests

- Publish `ProjectCreatedIntegrationEvent` → verify budget created in FundAccounting
- Publish same event twice → verify only one budget created (idempotency)
- Publish `BudgetExceededIntegrationEvent` → verify notification created

---

## 10. File Index

| File | Action |
|------|--------|
| `src/Shared/NGO.PMS.Contracts/IntegrationEvents/IIntegrationEvent.cs` | Create |
| `src/Shared/NGO.PMS.Contracts/IntegrationEvents/IntegrationEvent.cs` | Create |
| `src/Shared/NGO.PMS.Contracts/IntegrationEvents/Identity/*.cs` (3 events) | Create |
| `src/Shared/NGO.PMS.Contracts/IntegrationEvents/Projects/*.cs` (4 events) | Create |
| `src/Shared/NGO.PMS.Contracts/IntegrationEvents/Planning/*.cs` (2 events) | Create |
| `src/Shared/NGO.PMS.Contracts/IntegrationEvents/Reporting/*.cs` (2 events) | Create |
| `src/Shared/NGO.PMS.Contracts/IntegrationEvents/Finance/*.cs` (3 events) | Create |
| `src/Shared/NGO.PMS.Contracts/IntegrationEvents/MEAL/*.cs` (3 events) | Create |
| `src/Shared/NGO.PMS.SharedKernel/Outbox/IOutboxWriter.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Outbox/OutboxMessage.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Outbox/OutboxWriter.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Outbox/InboxMessage.cs` | Create |
| `src/Shared/NGO.PMS.SharedKernel/Outbox/IdempotentEventHandler.cs` | Create |
| `src/Host/NGO.PMS.API/Jobs/OutboxRelayJob.cs` | Create |
| `src/Host/NGO.PMS.API/Jobs/OutboxCleanupJob.cs` | Create |
| `src/Host/NGO.PMS.API/Program.cs` | Modify — Hangfire + outbox registration |
| Per-module `*DbContext.cs` | Modify — add `DbSet<OutboxMessage>` |
| DbUp: `0007_outbox_tables.sql` | Create — outbox tables per schema |
| DbUp: `0008_inbox_table.sql` | Create — shared inbox table |

---

## Dependencies

| This plan depends on | For |
|---------------------|-----|
| `shared/DATABASE-ARCHITECTURE.md` | Outbox schema, DbUp strategy |
| `shared/MULTI-TENANCY.md` | OrganizationId on events |
| `00-TECH-STACK.md` | Hangfire, MediatR versions |
| `00-CODING-STANDARDS.md` | Naming conventions for events |
