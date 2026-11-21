using NGO.PMS.API.Services;
using NGO.PMS.SharedKernel.Audit;
using NGO.PMS.SharedKernel.Services;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using System.Text;
using FluentValidation;
using Hangfire;
using Hangfire.PostgreSql;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using NGO.PMS.API.Audit;
using NGO.PMS.API.DbUp;
using NGO.PMS.API.HealthChecks;
using NGO.PMS.API.Jobs;
using NGO.PMS.API.Middleware;
using NGO.PMS.Identity.API;
using NGO.PMS.PlatformAdmin.API;
using NGO.PMS.Projects.API;
using NGO.PMS.Planning.API;
using NGO.PMS.Reporting.API;
using NGO.PMS.MEAL.API;
using NGO.PMS.Participants.API;
using NGO.PMS.Procurement.API;
using NGO.PMS.FundAccounting.API;
using NGO.PMS.Assets.API;
using NGO.PMS.Training.API;
using NGO.PMS.Tasks.API;
using NGO.PMS.Risk.API;
using NGO.PMS.Donors.API;
using NGO.PMS.Chat.API;
using NGO.PMS.Notifications.API;
using NGO.PMS.Documents.API;
using NGO.PMS.Feedback.API;
using NGO.PMS.Dashboards.API;
using NGO.PMS.Settings.API;
using NGO.PMS.KnowledgeMgmt.API;
using NGO.PMS.Partnerships.API;
using NGO.PMS.SystemReports.API;
using NGO.PMS.ImportExport.API;
using NGO.PMS.SharedKernel.Authorization;
using NGO.PMS.SharedKernel.Behaviors;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.MultiTenancy;
using NGO.PMS.SharedKernel.Persistence;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("DefaultConnection not configured.");

// ── Serilog ──────────────────────────────────────────────
builder.Host.UseSerilog((context, config) => config
    .ReadFrom.Configuration(context.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/ethelpms-.log", rollingInterval: RollingInterval.Day));

// ── Controllers & Swagger ────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.Converters.Add(new NGO.PMS.SharedKernel.Api.FlexibleGuidJsonConverter());
        options.JsonSerializerOptions.Converters.Add(new NGO.PMS.SharedKernel.Api.NullableGuidJsonConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "EthelPMS API", Version = "v1" });
});

// ── CORS ─────────────────────────────────────────────────
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:4200", "http://localhost:4201"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("default", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ── Health Checks ────────────────────────────────────────
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database", tags: ["ready"])
    .AddNpgSql(connectionString, name: "postgresql", tags: ["ready"]);

// ── MediatR + Pipeline Behaviors ─────────────────────────
builder.Services.AddMediatR(cfg =>
{
    // Scan all loaded module assemblies for handlers
    cfg.RegisterServicesFromAssemblies(
        AppDomain.CurrentDomain.GetAssemblies()
            .Where(a => a.FullName?.StartsWith("NGO.PMS.", StringComparison.Ordinal) == true)
            .ToArray());

    // Pipeline order: Logging → Validation → Performance → Handler
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(PerformanceBehavior<,>));
});

// ── FluentValidation ─────────────────────────────────────
builder.Services.AddValidatorsFromAssemblies(
    AppDomain.CurrentDomain.GetAssemblies()
        .Where(a => a.FullName?.StartsWith("NGO.PMS.", StringComparison.Ordinal) == true)
        .ToArray());

// ── AutoMapper ───────────────────────────────────────────
var mapperAssemblies = AppDomain.CurrentDomain.GetAssemblies()
    .Where(a => a.FullName?.StartsWith("NGO.PMS.", StringComparison.Ordinal) == true)
    .ToArray();
builder.Services.AddAutoMapper(cfg => cfg.AddMaps(mapperAssemblies));

// ── Multi-Tenancy (Custom) ───────────────────────────────
// Scoped accessor holds the resolved tenant for the current request.
// TenantResolutionMiddleware resolves tenant from JWT claims + configuration.
builder.Services.AddScoped<ITenantContextAccessor, TenantContextAccessor>();

// ── EF Core Interceptors (global, applied to all DbContexts) ──
builder.Services.AddScoped<AuditableEntityInterceptor>();
builder.Services.AddScoped<SoftDeleteInterceptor>();
builder.Services.AddScoped<TenantConnectionInterceptor>();
builder.Services.AddScoped<DomainEventDispatchInterceptor>();

// ── Audit Trail DbContext ────────────────────────────────
builder.Services.AddDbContext<AuditDbContext>(options =>
    options.UseNpgsql(connectionString, npgsql =>
        npgsql.MigrationsHistoryTable("__EFMigrationsHistory_Audit", "audit"))
    .UseSnakeCaseNamingConvention());
builder.Services.AddScoped<AuditSaveChangesInterceptor>();
builder.Services.AddScoped<IAuditInterceptor>(sp => sp.GetRequiredService<AuditSaveChangesInterceptor>());
builder.Services.AddMemoryCache();
builder.Services.AddScoped<IReferenceDataService, ReferenceDataService>();


// ── Rate Limiting (Global 100 req/min, Auth 10 req/min per IP) ──
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.Headers["Retry-After"] = "60";
        context.HttpContext.Response.Headers["X-RateLimit-Remaining"] = "0";
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            success = false,
            code = "RATE_LIMITED",
            message = "Too many requests. Please try again later.",
            detail = "Too many requests. Please try again later."
        }, cancellationToken);
    };

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));
});

// ── Antiforgery (XSRF token for HttpOnly cookie auth) ───
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN";
    options.Cookie.Name = "XSRF-TOKEN";
    options.Cookie.HttpOnly = false;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});

// ── Global Services ──────────────────────────────────────
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddHttpContextAccessor();

// ── Authentication (JWT Bearer) ─────────────────────────
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // CRITICAL: Disable default claim type mapping so JWT claim names
        // ("sub", "roles", "permissions", "email", "tenant_id") are preserved as-is.
        // Without this, .NET maps "sub" → long URI, breaking FindFirstValue("sub")
        // in PermissionAuthorizationHandler, CurrentUserService, TenantResolutionMiddleware, etc.
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!)),
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = "roles",
            NameClaimType = "name",
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (string.IsNullOrEmpty(context.Token) &&
                    context.Request.Cookies.TryGetValue("__Host-access-token", out var cookieToken))
                {
                    context.Token = cookieToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// ── Authorization (Hybrid RBAC + ABAC) ──────────────────
builder.Services.AddAuthorization();
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

// ── DbUp Runner ──────────────────────────────────────────
builder.Services.AddScoped<IDbUpRunner, DbUpRunner>();

// ── Module Registration (one call per module) ────────────
builder.Services.AddIdentityModule(builder.Configuration);
builder.Services.AddPlatformAdminModule(builder.Configuration);

// Phase 2 — Projects + ResultsFramework + InterventionAreas
builder.Services.AddProjectsModule(builder.Configuration);
builder.Services.AddPlanningModule(builder.Configuration);
builder.Services.AddReportingModule(builder.Configuration);
builder.Services.AddMealModule(builder.Configuration);
builder.Services.AddParticipantsModule(builder.Configuration);
builder.Services.AddProcurementModule(builder.Configuration);
builder.Services.AddFundAccountingModule(builder.Configuration);
builder.Services.AddAssetsModule(builder.Configuration);
builder.Services.AddTrainingModule(builder.Configuration);
builder.Services.AddTasksModule(builder.Configuration);
builder.Services.AddRiskModule(builder.Configuration);
builder.Services.AddDonorsModule(builder.Configuration);
builder.Services.AddChatModule(builder.Configuration);
builder.Services.AddNotificationsModule(builder.Configuration);
builder.Services.AddDocumentsModule(builder.Configuration);
builder.Services.AddFeedbackModule(builder.Configuration);
builder.Services.AddDashboardsModule(builder.Configuration);
builder.Services.AddSettingsModule(builder.Configuration);
builder.Services.AddKnowledgeMgmtModule(builder.Configuration);
builder.Services.AddPartnershipsModule(builder.Configuration);
builder.Services.AddSystemReportsModule(builder.Configuration);
builder.Services.AddImportExportModule(builder.Configuration);

// ── Hangfire ─────────────────────────────────────────────
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(options =>
        options.UseNpgsqlConnection(connectionString)));
builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = builder.Configuration.GetValue("Hangfire:WorkerCount", 2);
});

var app = builder.Build();

// ── Development: Run DbUp + Migrations ───────────────────
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var sp = scope.ServiceProvider;
    var startupLogger = sp.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

    try
    {
    var dbUpRunner = sp.GetRequiredService<IDbUpRunner>();

    // ── Phase 1: DbUp infrastructure (schemas, roles, extensions, functions) ──
    startupLogger.LogInformation("Phase 1: Running DbUp infrastructure scripts...");
    await dbUpRunner.RunInfrastructureAsync();

    // ── Phase 2: EF Core — create tables from DbContext models ──
    // No migration files exist. EnsureCreatedAsync is a no-op when any tables exist,
    // so we use CreateTablesAsync via the IRelationalDatabaseCreator directly.
    startupLogger.LogInformation("Phase 2: Creating module tables via EF Core...");

    async Task CreateModuleTables<TInterface>(IServiceProvider s, Microsoft.Extensions.Logging.ILogger log) where TInterface : notnull
    {
        var ctx = s.GetRequiredService<TInterface>();
        if (ctx is DbContext db)
        {
            try
            {
                var creator = db.Database
                    .GetService<Microsoft.EntityFrameworkCore.Storage.IRelationalDatabaseCreator>();
                await creator.CreateTablesAsync();
                log.LogInformation("Created tables for {Context}", typeof(TInterface).Name);
            }
            catch (Npgsql.PostgresException ex) when (ex.SqlState is "42P07" or "42710")
            {
                log.LogDebug("Tables for {Context} already exist, skipping", typeof(TInterface).Name);
            }
        }
    }

    await CreateModuleTables<NGO.PMS.Identity.Application.IIdentityDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.PlatformAdmin.Application.IPlatformDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Projects.Application.IProjectsDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Planning.Application.IPlanningDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Reporting.Application.Abstractions.IReportingDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.MEAL.Application.Abstractions.IMealDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Participants.Application.Abstractions.IParticipantsDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Procurement.Application.Abstractions.IProcurementDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.FundAccounting.Application.Abstractions.IFundAccountingDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Assets.Application.Abstractions.IAssetsDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Training.Application.Abstractions.ITrainingDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Tasks.Application.Abstractions.ITasksDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Risk.Application.Abstractions.IRiskDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Donors.Application.Abstractions.IDonorsDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Chat.Application.Abstractions.IChatDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Notifications.Application.Abstractions.INotificationsDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Documents.Application.Abstractions.IDocumentsDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Feedback.Application.Abstractions.IFeedbackDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Dashboards.Application.Abstractions.IDashboardsDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Settings.Application.Abstractions.ISettingsDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.KnowledgeMgmt.Application.Abstractions.IKnowledgeMgmtDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.Partnerships.Application.Abstractions.IPartnershipsDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.SystemReports.Application.Abstractions.ISystemReportsDbContext>(sp, startupLogger);
    await CreateModuleTables<NGO.PMS.ImportExport.Application.Abstractions.IImportExportDbContext>(sp, startupLogger);

    // Audit context — tables may already exist from DbUp script 0005
    try { await sp.GetRequiredService<AuditDbContext>().Database
        .GetService<Microsoft.EntityFrameworkCore.Storage.IRelationalDatabaseCreator>()
        .CreateTablesAsync(); }
    catch (Npgsql.PostgresException ex) when (ex.SqlState is "42P07" or "42710") { }

    // ── Phase 3: DbUp RLS policies + seed data (tables now exist) ──
    startupLogger.LogInformation("Phase 3: Running DbUp RLS policies and seed data...");
    await dbUpRunner.RunPostMigrationAsync();

    // ── Phase 4: Development data seed (admin user) ──
    if (app.Environment.IsDevelopment())
    {
        startupLogger.LogInformation("Phase 4: Seeding development data...");
        await NGO.PMS.API.DevelopmentDataSeeder.SeedAsync(sp, startupLogger);
    }

    startupLogger.LogInformation("All database initialization completed successfully");
    }
    catch (Exception ex) when (ex is Npgsql.NpgsqlException or Npgsql.PostgresException or System.Net.Sockets.SocketException or InvalidOperationException)
    {
        startupLogger.LogWarning(ex, "Database initialization failed — skipping. The API will start without full database setup. Fix the issue and restart.");
    }
}

// ── Middleware Pipeline (order matters!) ──────────────────
app.UseExceptionHandler();
app.UseSerilogRequestLogging();
app.UseMiddleware<CorrelationIdMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "EthelPMS API v1"));
}

app.UseCors("default");
app.UseRateLimiter();
app.UseAuthentication();
app.UseMiddleware<TenantResolutionMiddleware>();   // Resolves tenant from JWT claim + DB
app.UseMiddleware<TenantContextMiddleware>();      // Sets PostgreSQL RLS session variable
app.UseMiddleware<ModuleAccessMiddleware>();       // Checks tenant module access before authorization
app.UseAuthorization();

// ── Hangfire Dashboard ───────────────────────────────────
app.UseHangfireDashboard(
    builder.Configuration.GetValue("Hangfire:DashboardPath", "/hangfire"),
    new DashboardOptions
    {
        Authorization = [new HangfireAuthFilter()]
    });

// Register recurring outbox relay (every 10 seconds) and daily cleanup jobs
try
{
    RecurringJob.AddOrUpdate<OutboxRelayJob>(
        "outbox-relay",
        job => job.ProcessOutboxAsync(),
        "*/10 * * * * *");

    RecurringJob.AddOrUpdate<OutboxCleanupJob>(
        "outbox-cleanup",
        job => job.CleanupAsync(),
        Cron.Daily(2));

    RecurringJob.AddOrUpdate<DatabaseMaintenanceJob>(
        "db-purge-expired-tokens",
        job => job.PurgeExpiredTokensAsync(),
        Cron.Daily(3));

    RecurringJob.AddOrUpdate<DatabaseMaintenanceJob>(
        "db-weekly-analyze",
        job => job.RunAnalyzeAsync(),
        Cron.Weekly(DayOfWeek.Sunday, 4));
}
catch (Hangfire.PostgreSql.PostgreSqlDistributedLockException ex)
{
    Log.Warning(ex, "Could not register outbox-relay recurring job (stale lock). It will be retried on next startup.");
}

app.MapControllers();
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.Run();

// Make Program class accessible for integration tests (WebApplicationFactory)
#pragma warning disable CA1050
public partial class Program { }
#pragma warning restore CA1050
