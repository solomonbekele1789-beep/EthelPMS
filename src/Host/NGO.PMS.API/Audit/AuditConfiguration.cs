using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using NGO.PMS.SharedKernel.Audit;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.API.Audit;

/// <summary>
/// Configures the EF Core SaveChanges interceptor for audit logging.
/// Captures entity changes and writes them to the audit.audit_logs table.
/// This is a lightweight custom implementation since Audit.NET's EF Core provider
/// requires a compatible version; we use direct EF Core change tracking instead.
/// </summary>
public sealed class AuditSaveChangesInterceptor : Microsoft.EntityFrameworkCore.Diagnostics.SaveChangesInterceptor
{
    private readonly IServiceProvider _serviceProvider;
    private List<AuditEntry>? _auditEntries;

    public AuditSaveChangesInterceptor(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken ct = default)
    {
        if (eventData.Context is null)
            return base.SavingChangesAsync(eventData, result, ct);

        // Skip audit for the AuditDbContext itself (prevent infinite loop)
        if (eventData.Context is AuditDbContext)
            return base.SavingChangesAsync(eventData, result, ct);

        _auditEntries = CollectAuditEntries(eventData.Context);
        return base.SavingChangesAsync(eventData, result, ct);
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken ct = default)
    {
        if (_auditEntries is { Count: > 0 })
        {
            await WriteAuditLogs(_auditEntries, ct);
            _auditEntries = null;
        }

        return await base.SavedChangesAsync(eventData, result, ct);
    }

    private List<AuditEntry> CollectAuditEntries(DbContext context)
    {
        var entries = new List<AuditEntry>();

        foreach (var entry in context.ChangeTracker.Entries())
        {
            // Only audit AuditableEntity subclasses
            if (entry.Entity is not AuditableEntity)
                continue;

            // Skip unchanged and detached entities
            if (entry.State is EntityState.Unchanged or EntityState.Detached)
                continue;

            var auditEntry = new AuditEntry
            {
                SchemaName = entry.Metadata.GetSchema() ?? "unknown",
                TableName = entry.Metadata.GetTableName() ?? "unknown",
                EntityId = entry.Properties
                    .FirstOrDefault(p => p.Metadata.IsPrimaryKey())?.CurrentValue?.ToString() ?? "",
                Operation = entry.State switch
                {
                    EntityState.Added => "INSERT",
                    EntityState.Modified => "UPDATE",
                    EntityState.Deleted => "DELETE",
                    _ => "UNKNOWN"
                }
            };

            switch (entry.State)
            {
                case EntityState.Added:
                    auditEntry.NewValues = entry.Properties
                        .Where(p => p.CurrentValue is not null)
                        .ToDictionary(p => p.Metadata.GetColumnName(), p => p.CurrentValue);
                    break;

                case EntityState.Modified:
                    auditEntry.OldValues = entry.Properties
                        .Where(p => p.IsModified)
                        .ToDictionary(p => p.Metadata.GetColumnName(), p => p.OriginalValue);
                    auditEntry.NewValues = entry.Properties
                        .Where(p => p.IsModified)
                        .ToDictionary(p => p.Metadata.GetColumnName(), p => p.CurrentValue);
                    auditEntry.ChangedColumns = entry.Properties
                        .Where(p => p.IsModified)
                        .Select(p => p.Metadata.GetColumnName())
                        .ToArray();
                    break;

                case EntityState.Deleted:
                    auditEntry.OldValues = entry.Properties
                        .ToDictionary(p => p.Metadata.GetColumnName(), p => p.OriginalValue);
                    break;
            }

            entries.Add(auditEntry);
        }

        return entries;
    }

    private async Task WriteAuditLogs(List<AuditEntry> entries, CancellationToken ct)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var auditDb = scope.ServiceProvider.GetRequiredService<AuditDbContext>();
            var currentUser = scope.ServiceProvider.GetService<ICurrentUserService>();
            var httpContextAccessor = scope.ServiceProvider
                .GetService<Microsoft.AspNetCore.Http.IHttpContextAccessor>();
            var httpContext = httpContextAccessor?.HttpContext;

            foreach (var entry in entries)
            {
                auditDb.AuditLogs.Add(new AuditLog
                {
                    TableName = entry.TableName,
                    SchemaName = entry.SchemaName,
                    EntityId = entry.EntityId,
                    Operation = entry.Operation,
                    OldValues = entry.OldValues is not null
                        ? JsonSerializer.Serialize(entry.OldValues)
                        : null,
                    NewValues = entry.NewValues is not null
                        ? JsonSerializer.Serialize(entry.NewValues)
                        : null,
                    ChangedColumns = entry.ChangedColumns,
                    UserId = currentUser?.UserId,
                    UserEmail = currentUser?.Email,
                    OrganizationId = currentUser?.OrganizationId,
                    CorrelationId = httpContext?.TraceIdentifier,
                    IpAddress = httpContext?.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = httpContext?.Request.Headers.UserAgent.ToString(),
                    Timestamp = DateTimeOffset.UtcNow
                });
            }

            await auditDb.SaveChangesAsync(ct);
        }
        catch (Exception)
        {
            // Audit failures should not break the main operation.
            // In production, this would be logged via Serilog.
        }
    }

    private sealed class AuditEntry
    {
        public string SchemaName { get; set; } = string.Empty;
        public string TableName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string Operation { get; set; } = string.Empty;
        public Dictionary<string, object?>? OldValues { get; set; }
        public Dictionary<string, object?>? NewValues { get; set; }
        public string[]? ChangedColumns { get; set; }
    }
}
