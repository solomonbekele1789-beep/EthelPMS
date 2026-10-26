# EthelPMS — Backend Architecture Overview

**Version:** 1.0
**Date:** October 17, 2026
**Owner:** Developer A (Backend lead)

> This is the single guide for how the .NET backend is structured.
> Read this before touching any backend code. Module-specific plans are in `backend/{module}/`.

---

## 1. Solution Structure

```
EthelPMS.sln
├── src/
│   ├── Shared/
│   │   ├── NGO.PMS.SharedKernel/          ← Base entities, interfaces, behaviors, outbox
│   │   └── NGO.PMS.Contracts/             ← Integration events, public DTOs
│   │
│   ├── Modules/
│   │   ├── Identity/
│   │   │   ├── NGO.PMS.Identity.Domain/
│   │   │   ├── NGO.PMS.Identity.Application/
│   │   │   ├── NGO.PMS.Identity.Infrastructure/
│   │   │   └── NGO.PMS.Identity.API/
│   │   ├── PlatformAdmin/  (same 4-layer)
│   │   ├── OrgSetup/
│   │   ├── Projects/
│   │   ├── ResultsFramework/
│   │   ├── InterventionAreas/
│   │   ├── Planning/
│   │   ├── DIP/
│   │   ├── Reporting/
│   │   ├── MEAL/
│   │   ├── Participants/
│   │   ├── Graduation/
│   │   ├── Procurement/
│   │   ├── FundAccounting/
│   │   ├── Assets/
│   │   ├── Training/
│   │   ├── Tasks/
│   │   └── Risk/
│   │
│   └── Host/
│       └── NGO.PMS.API/                    ← Composition root
│
└── tests/
    ├── NGO.PMS.Identity.Tests/
    ├── NGO.PMS.Projects.Tests/
    ├── NGO.PMS.API.Tests/                  ← Integration tests
    └── NGO.PMS.Architecture.Tests/         ← ArchUnitNET
```

**Total projects:** ~75 src + ~20 test = ~95 projects

---

## 2. Layer Responsibilities

### Domain Layer (`NGO.PMS.{Module}.Domain`)

- Entities, value objects, enums, domain events
- NO dependencies on infrastructure (no EF Core, no HttpClient)
- Only references: `NGO.PMS.SharedKernel`
- All business invariants enforced here

```csharp
// Example: src/Modules/Projects/NGO.PMS.Projects.Domain/Entities/Project.cs
namespace NGO.PMS.Projects.Domain.Entities;

public class Project : AuditableEntity, IMultiTenant, ISoftDeletable
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public ProjectStatus Status { get; private set; } = ProjectStatus.Draft;
    public Guid OrganizationId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }

    // Factory method enforces invariants
    public static Project Create(string code, string name, Guid orgId)
    {
        if (string.IsNullOrWhiteSpace(code)) throw new ArgumentException("Code is required");
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required");
        return new Project { Code = code, Name = name, OrganizationId = orgId };
    }

    public void Approve(Guid approvedBy)
    {
        if (Status != ProjectStatus.Draft)
            throw new BusinessRuleException("Only draft projects can be approved.");
        Status = ProjectStatus.Active;
        AddDomainEvent(new ProjectApprovedEvent(Id, approvedBy));
    }
}
```

### Application Layer (`NGO.PMS.{Module}.Application`)

- Commands, queries (CQRS via MediatR)
- Handlers, validators (FluentValidation), DTOs, mapping profiles (AutoMapper)
- References: own Domain + `NGO.PMS.Contracts`
- NO direct infrastructure dependencies (uses interfaces from Domain)

```
Application/
├── Projects/
│   ├── Commands/
│   │   ├── CreateProject/
│   │   │   ├── CreateProjectCommand.cs
│   │   │   ├── CreateProjectCommandHandler.cs
│   │   │   └── CreateProjectCommandValidator.cs
│   │   ├── UpdateProject/
│   │   └── ApproveProject/
│   ├── Queries/
│   │   ├── GetProject/
│   │   └── ListProjects/
│   ├── DTOs/
│   │   ├── ProjectDto.cs
│   │   └── CreateProjectRequest.cs
│   └── Mappings/
│       └── ProjectMappingProfile.cs
```

### Infrastructure Layer (`NGO.PMS.{Module}.Infrastructure`)

- DbContext, repository implementations, external service adapters
- References: own Application layer
- EF Core entity configurations, migrations

```csharp
// Example DbContext
namespace NGO.PMS.Projects.Infrastructure.Persistence;

public class ProjectsDbContext : MultiTenantDbContext
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Milestone> Milestones => Set<Milestone>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public ProjectsDbContext(DbContextOptions<ProjectsDbContext> options, ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema("projects");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ProjectsDbContext).Assembly);
    }
}
```

### API Layer (`NGO.PMS.{Module}.API`)

- Controllers (thin — delegate to MediatR)
- Module DI registration extension method
- References: own Application + own Infrastructure

```csharp
// Module registration
namespace NGO.PMS.Projects.API;

public static class ProjectsModuleExtensions
{
    public static IServiceCollection AddProjectsModule(
        this IServiceCollection services, IConfiguration configuration)
    {
        // Application
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(
            typeof(CreateProjectCommandHandler).Assembly));
        services.AddValidatorsFromAssembly(typeof(CreateProjectCommandValidator).Assembly);
        services.AddAutoMapper(typeof(ProjectMappingProfile).Assembly);

        // Infrastructure
        services.AddDbContext<ProjectsDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
        services.AddScoped<IProjectRepository, ProjectRepository>();

        return services;
    }
}
```

### Host (`NGO.PMS.API`)

- `Program.cs` — composition root, middleware pipeline
- References all Module.API projects
- Does NOT reference Module.Infrastructure directly

---

## 3. MediatR Pipeline

Request flow through the pipeline:

```
Controller → MediatR.Send(command)
    → LoggingBehavior (logs request/response)
    → ValidationBehavior (FluentValidation — throws if invalid)
    → AuthorizationBehavior (checks permissions if [RequirePermission] present)
    → Handler (business logic)
    → Response
```

### Pipeline Behaviors

**File:** `src/Shared/NGO.PMS.SharedKernel/Behaviors/`

| Behavior | Order | Purpose |
|----------|-------|---------|
| `LoggingBehavior<TRequest, TResponse>` | 1 | Logs request type, duration, errors |
| `ValidationBehavior<TRequest, TResponse>` | 2 | Runs FluentValidation, throws `ValidationException` |
| `PerformanceBehavior<TRequest, TResponse>` | 3 | Warns if request takes > 500ms |

```csharp
// Registration in Program.cs
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(PerformanceBehavior<,>));
});
```

### Command/Query Pattern

```csharp
// Command — returns created entity ID
public record CreateProjectCommand(string Code, string Name, string Description)
    : IRequest<Guid>;

// Query — returns DTO
public record GetProjectQuery(Guid Id) : IRequest<ProjectDto>;

// Paginated query — returns paged response
public record ListProjectsQuery(int Page = 1, int PageSize = 20, string? Search = null,
    string? Status = null) : IRequest<PagedResponse<ProjectListItemDto>>;
```

---

## 4. AutoMapper Configuration

Each module registers its own mapping profiles.

```csharp
// Example: src/Modules/Projects/NGO.PMS.Projects.Application/Mappings/ProjectMappingProfile.cs
namespace NGO.PMS.Projects.Application.Mappings;

public class ProjectMappingProfile : Profile
{
    public ProjectMappingProfile()
    {
        CreateMap<Project, ProjectDto>();
        CreateMap<Project, ProjectListItemDto>();
        CreateMap<CreateProjectRequest, CreateProjectCommand>();
    }
}
```

**Rule:** Never map FROM DTO TO Entity in AutoMapper. Entity creation goes through factory methods or constructors to enforce invariants.

---

## 5. Repository Pattern

Repositories are optional — use when query logic is complex or reused. For simple CRUD, handlers can use DbContext directly.

```csharp
// Interface in Domain layer
namespace NGO.PMS.Projects.Domain.Repositories;

public interface IProjectRepository
{
    Task<Project?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> CodeExistsAsync(string code, Guid organizationId, CancellationToken ct = default);
    void Add(Project project);
}

// Implementation in Infrastructure layer
namespace NGO.PMS.Projects.Infrastructure.Persistence.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly ProjectsDbContext _db;
    public ProjectRepository(ProjectsDbContext db) => _db = db;

    public async Task<Project?> GetByIdAsync(Guid id, CancellationToken ct)
        => await _db.Projects.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<bool> CodeExistsAsync(string code, Guid orgId, CancellationToken ct)
        => await _db.Projects.AnyAsync(p => p.Code == code && p.OrganizationId == orgId, ct);

    public void Add(Project project) => _db.Projects.Add(project);
}
```

---

## 6. Controller Pattern

Controllers are thin — validate route params, send command/query, return response.

```csharp
[ApiController]
[Route("api/v1/projects")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly ISender _mediator;
    public ProjectsController(ISender mediator) => _mediator = mediator;

    /// <summary>List projects with pagination and filters</summary>
    [HttpGet]
    [RequirePermission("projects.projects.read")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<ProjectListItemDto>>), 200)]
    public async Task<IActionResult> List([FromQuery] ListProjectsQuery query)
        => Ok(ApiResponse<PagedResponse<ProjectListItemDto>>.Ok(await _mediator.Send(query)));

    /// <summary>Get project by ID</summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("projects.projects.read")]
    [ProducesResponseType(typeof(ApiResponse<ProjectDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Get(Guid id)
        => Ok(ApiResponse<ProjectDto>.Ok(await _mediator.Send(new GetProjectQuery(id))));

    /// <summary>Create a new project</summary>
    [HttpPost]
    [RequirePermission("projects.projects.create")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), 201)]
    public async Task<IActionResult> Create([FromBody] CreateProjectCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(Get), new { id }, ApiResponse<Guid>.Ok(id));
    }

    /// <summary>Approve a project</summary>
    [HttpPost("{id:guid}/approve")]
    [RequirePermission("projects.projects.approve")]
    [ProducesResponseType(204)]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _mediator.Send(new ApproveProjectCommand(id));
        return NoContent();
    }
}
```

---

## 7. EF Core Interceptors

Registered globally in Program.cs, applied to all DbContexts:

| Interceptor | Purpose | File |
|-------------|---------|------|
| `AuditableEntityInterceptor` | Sets CreatedAt/UpdatedAt/CreatedBy/UpdatedBy | SharedKernel/Persistence/ |
| `SoftDeleteInterceptor` | Converts Delete to Update with IsDeleted=true | SharedKernel/Persistence/ |
| `TenantConnectionInterceptor` | Sets `app.current_org_id` for RLS | SharedKernel/Persistence/ |
| `DomainEventDispatchInterceptor` | Dispatches domain events after SaveChanges | SharedKernel/Persistence/ |

```csharp
// Domain event dispatcher
public class DomainEventDispatchInterceptor : SaveChangesInterceptor
{
    private readonly IMediator _mediator;

    public DomainEventDispatchInterceptor(IMediator mediator) => _mediator = mediator;

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData, int result, CancellationToken ct = default)
    {
        var dbContext = eventData.Context;
        if (dbContext is null) return result;

        var entities = dbContext.ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.Entity.DomainEvents.Any())
            .Select(e => e.Entity)
            .ToList();

        var domainEvents = entities.SelectMany(e => e.DomainEvents).ToList();
        entities.ForEach(e => e.ClearDomainEvents());

        foreach (var domainEvent in domainEvents)
        {
            await _mediator.Publish(domainEvent, ct);
        }

        return result;
    }
}
```

---

## 8. Program.cs Blueprint

```csharp
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// ── Logging ──
builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .Enrich.WithCorrelationId()
    .WriteTo.Console()
    .WriteTo.File("logs/ethelpms-.log", rollingInterval: RollingInterval.Day));

// ── Shared Services ──
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks().AddNpgSql(connectionString);

// MediatR pipeline
builder.Services.AddMediatR(cfg => { /* behaviors */ });

// AutoMapper (scans all module assemblies)
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// FluentValidation
builder.Services.AddValidatorsFromAssemblies(AppDomain.CurrentDomain.GetAssemblies());

// ── Authentication ──
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* see AUTHENTICATION.md */ });
builder.Services.AddAntiforgery();

// ── Authorization ──
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
builder.Services.AddAuthorization();

// ── Multi-Tenancy ──
builder.Services.AddMultiTenant<EthelTenantInfo>()
    .WithClaimStrategy("tenant_id")
    .WithEFCoreStore<PlatformDbContext, EthelTenantInfo>();

// ── Rate Limiting ──
builder.Services.AddRateLimiter(/* see API-CONVENTIONS.md */);

// ── Hangfire ──
builder.Services.AddHangfire(config => config.UsePostgreSqlStorage(connectionString));
builder.Services.AddHangfireServer();

// ── Module Registration (one line per module) ──
builder.Services.AddIdentityModule(builder.Configuration);
builder.Services.AddPlatformAdminModule(builder.Configuration);
builder.Services.AddOrgSetupModule(builder.Configuration);
builder.Services.AddProjectsModule(builder.Configuration);
builder.Services.AddResultsFrameworkModule(builder.Configuration);
// ... all 18 modules

// ── Global Services ──
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ── CORS ──
builder.Services.AddCors(options => options.AddPolicy("default", policy =>
    policy.WithOrigins("http://localhost:4200", "http://localhost:4201")
          .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

var app = builder.Build();

// ── Middleware Pipeline (order matters!) ──
app.UseExceptionHandler();
app.UseSerilogRequestLogging();
app.UseMiddleware<CorrelationIdMiddleware>();

if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }

app.UseCors("default");
app.UseRateLimiter();
app.UseAuthentication();
app.UseMultiTenant();
app.UseMiddleware<ModuleAccessMiddleware>();
app.UseAuthorization();
app.UseAntiforgery();

app.MapControllers();
app.MapHealthChecks("/health");
app.UseHangfireDashboard("/hangfire");

// ── DbUp Migrations ──
DbUpRunner.Run(connectionString);

// ── Hangfire Jobs ──
RecurringJob.AddOrUpdate<OutboxRelayJob>("outbox-relay", j => j.ProcessOutboxAsync(), "*/10 * * * * *");

app.Run();
```

---

## 9. Testing Strategy

### Unit Tests (per module)

```
tests/NGO.PMS.Identity.Tests/
├── Domain/
│   └── UserTests.cs                    ← Entity invariant tests
├── Application/
│   ├── CreateUserCommandHandlerTests.cs
│   ├── CreateUserCommandValidatorTests.cs
│   └── LoginCommandHandlerTests.cs
└── TestFixtures/
    └── IdentityTestFixture.cs          ← Shared test setup
```

**Testing pattern:**
```csharp
public class CreateProjectCommandHandlerTests
{
    private readonly ProjectsDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly CreateProjectCommandHandler _handler;

    public CreateProjectCommandHandlerTests()
    {
        _db = TestDbContextFactory.Create<ProjectsDbContext>("projects");
        _currentUser = Substitute.For<ICurrentUserService>();
        _currentUser.OrganizationId.Returns(Guid.NewGuid());
        _currentUser.UserId.Returns(Guid.NewGuid());
        _handler = new CreateProjectCommandHandler(_db, _currentUser);
    }

    [Fact]
    public async Task Handle_ShouldCreateProject_WhenValidRequest()
    {
        var command = new CreateProjectCommand("PRJ-001", "Test Project", "Description");
        var result = await _handler.Handle(command, CancellationToken.None);
        result.Should().NotBeEmpty();
        var project = await _db.Projects.FindAsync(result);
        project.Should().NotBeNull();
        project!.Code.Should().Be("PRJ-001");
    }
}
```

### Integration Tests

```
tests/NGO.PMS.API.Tests/
├── AuthEndpointTests.cs
├── ProjectEndpointTests.cs
└── CustomWebApplicationFactory.cs
```

Uses `WebApplicationFactory<Program>` with Testcontainers.PostgreSql for a real database.

### Architecture Tests

```csharp
// tests/NGO.PMS.Architecture.Tests/
[Fact]
public void Domain_ShouldNotReference_Infrastructure()
{
    var domainAssemblies = Types.InAssemblies(GetDomainAssemblies());
    domainAssemblies.Should()
        .NotDependOnAny("Microsoft.EntityFrameworkCore")
        .Because("Domain must be infrastructure-independent");
}

[Fact]
public void Modules_ShouldNotCrossReference()
{
    // Identity.Domain should NOT reference Projects.Domain
    Types.InAssembly(typeof(User).Assembly)
        .Should().NotDependOnAny(typeof(Project).Assembly.GetName().Name!)
        .Because("Modules communicate via Contracts, not direct references");
}
```

---

## 10. Shared Service Interfaces

| Interface | Location | Implementation |
|-----------|----------|---------------|
| `ICurrentUserService` | SharedKernel | Identity.Infrastructure |
| `IPermissionService` | SharedKernel | Identity.Infrastructure |
| `IOutboxWriter` | SharedKernel | SharedKernel (generic) |
| `IEmailService` | SharedKernel | Identity.Infrastructure (MailKit) |
| `IReferenceDataService` | SharedKernel | OrgSetup.Infrastructure |

```csharp
// ICurrentUserService — used by all modules
public interface ICurrentUserService
{
    Guid UserId { get; }
    Guid OrganizationId { get; }
    string Email { get; }
    IReadOnlyList<string> Permissions { get; }
    IReadOnlyList<string> Roles { get; }
}
```

---

## 11. File Index — Phase 0A/0B Backend Files

| File | Phase | Description |
|------|-------|-------------|
| `EthelPMS.sln` | 0A | Solution with all projects |
| `global.json` | 0A | Pin .NET 10 SDK |
| `Directory.Build.props` | 0A | Shared build properties |
| `src/Shared/NGO.PMS.SharedKernel/Domain/BaseEntity.cs` | 0A | Already exists |
| `src/Shared/NGO.PMS.SharedKernel/Domain/AuditableEntity.cs` | 0A | Already exists |
| `src/Shared/NGO.PMS.SharedKernel/Domain/ValueObject.cs` | 0A | Already exists |
| `src/Shared/NGO.PMS.SharedKernel/Domain/IDomainEvent.cs` | 0A | Already exists |
| `src/Shared/NGO.PMS.SharedKernel/Domain/IMultiTenant.cs` | 0A | Already exists |
| `src/Shared/NGO.PMS.SharedKernel/Domain/ISoftDeletable.cs` | 0A | Already exists |
| `src/Shared/NGO.PMS.SharedKernel/Api/ApiResponse.cs` | 0A | Already exists |
| `src/Shared/NGO.PMS.SharedKernel/Api/PaginatedQuery.cs` | 0B | Create |
| `src/Shared/NGO.PMS.SharedKernel/Api/PaginationExtensions.cs` | 0B | Create |
| `src/Shared/NGO.PMS.SharedKernel/Api/FilteredQuery.cs` | 0B | Create |
| `src/Shared/NGO.PMS.SharedKernel/Behaviors/ValidationBehavior.cs` | 0B | Create |
| `src/Shared/NGO.PMS.SharedKernel/Behaviors/LoggingBehavior.cs` | 0B | Create |
| `src/Shared/NGO.PMS.SharedKernel/Behaviors/PerformanceBehavior.cs` | 0B | Create |
| `src/Shared/NGO.PMS.SharedKernel/Persistence/MultiTenantDbContext.cs` | 0B | Create |
| `src/Shared/NGO.PMS.SharedKernel/Persistence/AuditableEntityInterceptor.cs` | 0A | Already exists |
| `src/Shared/NGO.PMS.SharedKernel/Persistence/SoftDeleteInterceptor.cs` | 0A | Already exists |
| `src/Shared/NGO.PMS.SharedKernel/Persistence/TenantConnectionInterceptor.cs` | 0B | Create |
| `src/Shared/NGO.PMS.SharedKernel/Persistence/DomainEventDispatchInterceptor.cs` | 0B | Create |
| `src/Shared/NGO.PMS.SharedKernel/Authorization/*` | 0B | 5 files (see AUTHORIZATION-RBAC.md) |
| `src/Shared/NGO.PMS.SharedKernel/Outbox/*` | 0B | 5 files (see CROSS-MODULE-EVENTS.md) |
| `src/Shared/NGO.PMS.SharedKernel/Exceptions/*` | 0B | 3 files (see API-CONVENTIONS.md) |
| `src/Shared/NGO.PMS.Contracts/IntegrationEvents/*` | 0B | Base + Identity events |
| `src/Host/NGO.PMS.API/Program.cs` | 0A-0B | Composition root |
| `src/Host/NGO.PMS.API/Middleware/*` | 0B | 4 middleware classes |
| `src/Host/NGO.PMS.API/Jobs/*` | 0B | Outbox relay + cleanup |
| `src/Host/NGO.PMS.API/DbUp/*` | 0B | Schema creation scripts |
| `tests/NGO.PMS.Architecture.Tests/*` | 0B | ArchUnitNET fitness tests |

---

## Dependencies

| This plan depends on | For |
|---------------------|-----|
| `00-CODING-STANDARDS.md` | Naming, file structure, vertical slice |
| `00-TECH-STACK.md` | Package versions |
| `shared/DATABASE-ARCHITECTURE.md` | DbContext base, migration strategy |
| `shared/API-CONVENTIONS.md` | Response envelope, error handling |
| `shared/CROSS-MODULE-EVENTS.md` | Outbox pattern |
| `shared/AUTHENTICATION.md` | JWT setup in Program.cs |
| `shared/AUTHORIZATION-RBAC.md` | Permission handler setup |
| `shared/MULTI-TENANCY.md` | Finbuckle setup |
