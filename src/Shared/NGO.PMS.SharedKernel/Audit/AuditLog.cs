namespace NGO.PMS.SharedKernel.Audit;

/// <summary>
/// Represents a single audit trail entry in the audit.audit_logs table.
/// Immutable by design — only INSERT is allowed at the database level.
/// </summary>
public class AuditLog
{
    public long Id { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string SchemaName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Operation { get; set; } = string.Empty;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string[]? ChangedColumns { get; set; }
    public Guid? UserId { get; set; }
    public string? UserEmail { get; set; }
    public Guid? OrganizationId { get; set; }
    public string? CorrelationId { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
}
