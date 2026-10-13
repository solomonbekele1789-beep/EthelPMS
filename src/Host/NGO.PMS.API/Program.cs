using Serilog;

var builder = WebApplication.CreateBuilder(args);

// ── Serilog ──────────────────────────────────────────────
builder.Host.UseSerilog((context, config) => config
    .ReadFrom.Configuration(context.Configuration)
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day));

// ── Controllers & Swagger ────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "EthelPMS API", Version = "v1" });
});

// ── CORS (Angular dev server) ────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ── Health Checks ────────────────────────────────────────
builder.Services.AddHealthChecks();

// ── MediatR (scan all module assemblies) ─────────────────
// TODO: Register MediatR with module assemblies once handlers exist

// ── FluentValidation pipeline ────────────────────────────
// TODO: Add FluentValidation pipeline behavior

// ── AutoMapper ───────────────────────────────────────────
// TODO: Register AutoMapper profiles from modules

// ── EF Core + Npgsql ─────────────────────────────────────
// TODO: Register per-module DbContexts with Npgsql

// ── Finbuckle MultiTenant ────────────────────────────────
// TODO: Configure tenant resolution strategy

var app = builder.Build();

// ── Middleware pipeline ──────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "EthelPMS API v1"));
}

app.UseSerilogRequestLogging();
app.UseCors("AllowAngular");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
